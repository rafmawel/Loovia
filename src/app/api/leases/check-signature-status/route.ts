// API Route — vérifier le statut de signature d'un bail via Firma.dev
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSigningStatus } from '@/lib/api/firma';

export async function POST(request: NextRequest) {
  try {
    const { leaseId } = await request.json();

    if (!leaseId) {
      return NextResponse.json({ error: 'leaseId requis' }, { status: 400 });
    }

    // Vérifier l'authentification
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le bail
    const { data: lease, error } = await supabase
      .from('leases')
      .select('id, firma_request_id')
      .eq('id', leaseId)
      .single();

    if (error || !lease) {
      return NextResponse.json({ error: 'Bail non trouvé' }, { status: 404 });
    }

    if (!lease.firma_request_id) {
      return NextResponse.json(
        { error: 'Ce bail n\'a pas été envoyé pour signature' },
        { status: 400 },
      );
    }

    // Interroger Firma pour le statut à jour
    const signingStatus = await getSigningStatus(lease.firma_request_id);

    // Mettre à jour le bail avec les données fraîches
    const admin = createAdminClient();
    const updates: Record<string, unknown> = {
      firma_status: signingStatus.status,
    };

    if (signingStatus.recipients) {
      for (const recipient of signingStatus.recipients) {
        // order 1 = Bailleur, order 2 = Locataire
        if (recipient.order === 1) {
          updates.signature_landlord_status = recipient.status;
          if (recipient.signed_at) {
            updates.signature_landlord_date = recipient.signed_at;
          }
        }
        if (recipient.order === 2) {
          updates.signature_tenant_status = recipient.status;
          if (recipient.signed_at) {
            updates.signature_tenant_date = recipient.signed_at;
          }
        }
      }
    }

    if (signingStatus.status === 'completed') {
      updates.status = 'signed';
    }

    await admin.from('leases').update(updates).eq('id', lease.id);

    return NextResponse.json({
      success: true,
      status: signingStatus.status,
      recipients: signingStatus.recipients,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la vérification du statut' }, { status: 500 });
  }
}
