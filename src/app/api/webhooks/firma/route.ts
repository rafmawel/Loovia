// Webhook Firma.dev — réception des événements de signature
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ── Types webhook Firma ──────────────────────────────────────────────

interface FirmaWebhookRecipient {
  email: string;
  firstname: string;
  lastname: string;
  designation: string;
  order: number;
  status: 'pending' | 'signed' | 'declined';
  signed_at?: string;
}

interface FirmaWebhookPayload {
  event: 'recipient_signed' | 'signing_completed' | 'signing_expired' | 'signing_declined';
  data: {
    request_id: string;
    status: string;
    recipients?: FirmaWebhookRecipient[];
    metadata?: Record<string, string>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as FirmaWebhookPayload;
    const { event, data } = payload;

    const supabase = createAdminClient();

    // Identifier le bail via firma_request_id ou metadata.lease_id
    let leaseQuery = supabase.from('leases').select('*');

    if (data.request_id) {
      leaseQuery = leaseQuery.eq('firma_request_id', data.request_id);
    } else if (data.metadata?.lease_id) {
      leaseQuery = leaseQuery.eq('id', data.metadata.lease_id);
    } else {
      return NextResponse.json(
        { error: 'Impossible d\'identifier le bail' },
        { status: 400 },
      );
    }

    const { data: lease, error: leaseError } = await leaseQuery.single();

    if (leaseError || !lease) {
      return NextResponse.json(
        { error: 'Bail non trouvé pour cette demande de signature' },
        { status: 404 },
      );
    }

    // Construire les mises à jour
    const updates: Record<string, unknown> = {
      firma_status: data.status,
    };

    // Mettre à jour les statuts par signataire
    if (data.recipients) {
      for (const recipient of data.recipients) {
        if (recipient.designation === 'Bailleur' && recipient.order === 1) {
          updates.signature_landlord_status = recipient.status;
          if (recipient.signed_at) {
            updates.signature_landlord_date = recipient.signed_at;
          }
        }

        if (recipient.designation === 'Locataire' && recipient.order === 2) {
          updates.signature_tenant_status = recipient.status;
          if (recipient.signed_at) {
            updates.signature_tenant_date = recipient.signed_at;
          }
        }
      }
    }

    // Déterminer le statut du bail selon l'événement
    switch (event) {
      case 'signing_completed': {
        // Toutes les signatures sont complètes → bail signé
        updates.status = 'signed';
        updates.firma_status = 'completed';
        break;
      }
      case 'signing_expired': {
        updates.firma_status = 'expired';
        break;
      }
      case 'signing_declined': {
        updates.firma_status = 'declined';
        break;
      }
      // recipient_signed → on met à jour le signataire individuel (déjà fait ci-dessus)
    }

    const { error: updateError } = await supabase
      .from('leases')
      .update(updates)
      .eq('id', lease.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 },
    );
  }
}
