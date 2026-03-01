// Webhook Firma.dev — réception des événements de signature
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createHmac } from 'crypto';

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

const VALID_EVENTS = new Set([
  'recipient_signed',
  'signing_completed',
  'signing_expired',
  'signing_declined',
]);

// ── Vérification de signature HMAC ──────────────────────────────────

function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.FIRMA_WEBHOOK_SECRET;

  // Si pas de secret configuré, on vérifie via le token dans l'URL
  if (!secret) return true;
  if (!signature) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return signature === expected || signature === `sha256=${expected}`;
}

// ── Handler ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Vérification du token dans l'URL (fallback si pas de HMAC)
    const webhookToken = request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.FIRMA_WEBHOOK_TOKEN;

    if (expectedToken && webhookToken !== expectedToken) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 2. Vérification de la signature HMAC
    const rawBody = await request.text();
    const signature = request.headers.get('x-firma-signature') || request.headers.get('x-webhook-signature');

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 403 });
    }

    // 3. Parser et valider le payload
    let payload: FirmaWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as FirmaWebhookPayload;
    } catch {
      return NextResponse.json({ error: 'Payload JSON invalide' }, { status: 400 });
    }

    const { event, data } = payload;

    if (!event || !VALID_EVENTS.has(event)) {
      return NextResponse.json({ error: 'Événement inconnu' }, { status: 400 });
    }

    if (!data?.request_id && !data?.metadata?.lease_id) {
      return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 4. Identifier le bail via firma_request_id ou metadata.lease_id
    let leaseQuery = supabase.from('leases').select('*');

    if (data.request_id) {
      leaseQuery = leaseQuery.eq('firma_request_id', data.request_id);
    } else if (data.metadata?.lease_id) {
      leaseQuery = leaseQuery.eq('id', data.metadata.lease_id);
    }

    const { data: lease, error: leaseError } = await leaseQuery.single();

    if (leaseError || !lease) {
      return NextResponse.json(
        { error: 'Bail non trouvé' },
        { status: 404 },
      );
    }

    // 5. Idempotence — ne pas retraiter si le statut final est déjà atteint
    if (event === 'signing_completed' && lease.status === 'signed') {
      return NextResponse.json({ success: true, skipped: true });
    }
    if (event === 'signing_expired' && lease.firma_status === 'expired') {
      return NextResponse.json({ success: true, skipped: true });
    }
    if (event === 'signing_declined' && lease.firma_status === 'declined') {
      return NextResponse.json({ success: true, skipped: true });
    }

    // 6. Construire les mises à jour
    const updates: Record<string, unknown> = {
      firma_status: data.status,
    };

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

    switch (event) {
      case 'signing_completed': {
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
    }

    const { error: updateError } = await supabase
      .from('leases')
      .update(updates)
      .eq('id', lease.id);

    if (updateError) {
      return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 },
    );
  }
}
