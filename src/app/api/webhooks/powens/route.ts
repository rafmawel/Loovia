// Webhook Powens — réception des événements de synchronisation bancaire
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    const supabase = createAdminClient();

    switch (event.type) {
      case 'CONNECTION_SYNCED': {
        // Une connexion bancaire a été synchronisée avec succès
        const connectionId = event.id_connection;
        if (connectionId) {
          // Marquer la connexion comme synchronisée dans notre DB
          await supabase
            .from('bank_connections')
            .update({ cursor: new Date().toISOString() })
            .eq('item_id', String(connectionId));
        }
        break;
      }

      case 'ACCOUNTS_FETCHED': {
        // Les comptes ont été récupérés — on peut enregistrer les noms des banques
        break;
      }

      case 'TRANSACTIONS_CLUSTERED': {
        // Les transactions sont prêtes à être récupérées
        // On pourrait déclencher un sync automatique ici
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erreur webhook Powens:', err);
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 500 });
  }
}
