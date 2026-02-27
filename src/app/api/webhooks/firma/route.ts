// Webhook Firma.dev — réception des événements de signature
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Structure attendue du webhook Firma
interface FirmaWebhookPayload {
  event: string;
  data: {
    id: string;
    status: string;
    signers?: {
      role: string;
      status: string;
      signed_at?: string;
    }[];
    metadata?: Record<string, string>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as FirmaWebhookPayload;
    const { event, data } = payload;

    const supabase = createAdminClient();

    // Trouver le bail associé via firma_request_id
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('*')
      .eq('firma_request_id', data.id)
      .single();

    if (leaseError || !lease) {
      return NextResponse.json(
        { error: 'Bail non trouvé pour cette demande de signature' },
        { status: 404 }
      );
    }

    // Mise à jour du statut selon l'événement
    const updates: Record<string, unknown> = {
      firma_status: data.status,
    };

    // Traitement des signatures individuelles
    if (data.signers) {
      for (const signer of data.signers) {
        if (signer.role === 'landlord') {
          updates.signature_landlord_status = signer.status;
          if (signer.signed_at) updates.signature_landlord_date = signer.signed_at;
        }
        if (signer.role === 'tenant') {
          updates.signature_tenant_status = signer.status;
          if (signer.signed_at) updates.signature_tenant_date = signer.signed_at;
        }
      }
    }

    // Si toutes les signatures sont complètes, activer le bail
    if (event === 'signing_completed' || data.status === 'completed') {
      updates.status = 'active';
    } else if (event === 'signing_started') {
      updates.status = 'pending_signature';
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
      { status: 500 }
    );
  }
}
