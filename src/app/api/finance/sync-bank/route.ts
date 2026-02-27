// API Route — synchronisation des transactions bancaires via Plaid
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncTransactions } from '@/lib/api/plaid';
import type { BankConnection } from '@/types';

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

    // Récupérer la connexion bancaire
    const { data: connection, error } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('id', connectionId)
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

      // Mettre à jour le curseur
      cursor = result.next_cursor;
      hasMore = result.has_more;
    }

    // Sauvegarder le curseur pour la prochaine synchronisation
    await supabase
      .from('bank_connections')
      .update({ cursor })
      .eq('id', connectionId);

    return NextResponse.json({ success: true, added: totalAdded });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
