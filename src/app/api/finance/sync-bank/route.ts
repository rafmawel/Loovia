// API Route — synchronisation des transactions bancaires via Powens + matching
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listTransactions, listConnections } from '@/lib/api/powens';
import { matchTransactions } from '@/lib/matching';
import type { BankConnection, BankTransaction, Payment, Tenant, Lease } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId requis' }, { status: 400 });
    }

    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer la connexion bancaire (ownership via RLS + filtre explicite)
    const { data: connection, error } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (error || !connection) {
      return NextResponse.json({ error: 'Connexion bancaire non trouvée' }, { status: 404 });
    }

    const typedConnection = connection as BankConnection;
    const token = typedConnection.access_token;

    // Récupérer les infos de connexion Powens (nom de banque)
    let powensConnections: Awaited<ReturnType<typeof listConnections>> = [];
    try {
      powensConnections = await listConnections(token);
      console.log('Powens connections:', JSON.stringify(powensConnections));
    } catch (connErr) {
      console.error('Erreur listConnections:', connErr);
      powensConnections = [];
    }

    if (powensConnections.length > 0) {
      const bankName = powensConnections[0].connector?.name;
      if (bankName && bankName !== typedConnection.institution_name) {
        await supabase
          .from('bank_connections')
          .update({ institution_name: bankName })
          .eq('id', connectionId);
      }
    }

    // Déterminer la date de début de sync
    const lastSync = typedConnection.cursor;
    const minDate = lastSync
      ? new Date(lastSync).toISOString().split('T')[0]
      : undefined; // Pas de filtre date pour la première sync — tout récupérer

    // Récupérer les transactions via Powens (avec pagination)
    let offset = 0;
    const limit = 100;
    let totalAdded = 0;
    let hasMore = true;
    let debugInfo = { connectionsCount: powensConnections.length, minDate: minDate || 'none', rawFirstPage: null as unknown };

    while (hasMore) {
      let result;
      try {
        result = await listTransactions(token, { offset, limit, min_date: minDate });
        if (offset === 0) {
          debugInfo.rawFirstPage = {
            txCount: result.transactions?.length ?? 'undefined',
            total: result.total ?? 'undefined',
          };
        }
      } catch (txErr) {
        debugInfo.rawFirstPage = { error: txErr instanceof Error ? txErr.message : 'unknown' };
        break;
      }

      if (result.transactions && result.transactions.length > 0) {
        const transactions = result.transactions.map((tx) => ({
          user_id: user.id,
          connection_id: connectionId,
          amount: tx.value,
          date: tx.date,
          description: tx.simplified_wording || tx.original_wording || '',
          category: tx.category?.name || 'Autre',
          status: 'unmatched' as const,
          raw_data: tx as unknown as Record<string, unknown>,
        }));

        await supabase.from('bank_transactions').insert(transactions);
        totalAdded += result.transactions.length;
      }

      offset += limit;
      hasMore = result.transactions.length === limit && offset < result.total;
    }

    // Sauvegarder le timestamp de sync seulement si des transactions ont été trouvées
    if (totalAdded > 0) {
      await supabase
        .from('bank_connections')
        .update({ cursor: new Date().toISOString() })
        .eq('id', connectionId);
    }

    // ── Lancer le matching automatique ─────────────────────────────

    // Récupérer les transactions non matchées
    const { data: unmatchedTx } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'unmatched');

    // Récupérer les paiements en attente avec leases et tenants
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('*, lease:leases(*, tenant:tenants(*))')
      .eq('user_id', user.id)
      .in('status', ['pending', 'partial', 'late']);

    // Récupérer tous les tenants
    const { data: allTenants } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', user.id);

    let matched = 0;
    let suggestions = 0;

    if (unmatchedTx && pendingPayments && allTenants) {
      const results = matchTransactions(
        unmatchedTx as BankTransaction[],
        pendingPayments as (Payment & { lease?: Lease & { tenant?: Tenant } })[],
        allTenants as Tenant[],
      );

      // Appliquer les résultats
      for (const result of results) {
        if (result.status === 'matched' && result.paymentId) {
          await supabase
            .from('bank_transactions')
            .update({ status: 'matched', matched_payment_id: result.paymentId })
            .eq('id', result.transactionId);

          const tx = unmatchedTx.find((t) => (t as BankTransaction).id === result.transactionId) as BankTransaction | undefined;
          if (tx) {
            await supabase
              .from('payments')
              .update({
                status: 'paid',
                amount_paid: Math.abs(tx.amount),
                payment_date: tx.date,
              })
              .eq('id', result.paymentId);
          }

          matched++;
        } else if (result.status === 'suggestion' && result.paymentId) {
          await supabase
            .from('bank_transactions')
            .update({ status: 'suggestion', matched_payment_id: result.paymentId })
            .eq('id', result.transactionId);

          suggestions++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      added: totalAdded,
      matched,
      suggestions,
      debug: debugInfo,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Sync-bank error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
