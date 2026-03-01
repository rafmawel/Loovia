// API Route — synchronisation des transactions bancaires via Plaid + matching
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncTransactions } from '@/lib/api/plaid';
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
    let hasMore = true;
    let cursor = typedConnection.cursor || undefined;
    let totalAdded = 0;

    // Boucle de synchronisation (Plaid peut paginer les résultats)
    while (hasMore) {
      const result = await syncTransactions(typedConnection.access_token, cursor);

      // Insérer les nouvelles transactions
      if (result.added.length > 0) {
        const transactions = result.added.map((tx) => ({
          user_id: user.id,
          connection_id: connectionId,
          amount: tx.amount,
          date: tx.date,
          description: tx.name || tx.merchant_name || '',
          category: tx.category?.[0] || 'Autre',
          status: 'unmatched' as const,
          raw_data: tx,
        }));

        await supabase.from('bank_transactions').insert(transactions);
        totalAdded += result.added.length;
      }

      cursor = result.next_cursor;
      hasMore = result.has_more;
    }

    // Sauvegarder le curseur
    await supabase
      .from('bank_connections')
      .update({ cursor })
      .eq('id', connectionId);

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
          // Match automatique → mettre à jour transaction ET paiement
          await supabase
            .from('bank_transactions')
            .update({ status: 'matched', matched_payment_id: result.paymentId })
            .eq('id', result.transactionId);

          // Trouver le montant de la transaction
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
          // Suggestion → mettre à jour transaction uniquement
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
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la synchronisation bancaire' }, { status: 500 });
  }
}
