// API Route — vérifier le statut de signature d'un bail via Firma.dev
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSigningStatus, parseFirmaStatus } from '@/lib/api/firma';

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
    const firmaStatus = parseFirmaStatus(signingStatus.status);
    const updates: Record<string, unknown> = {
      firma_status: firmaStatus,
    };

    // Extraire les recipients — supporter plusieurs formats de réponse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = signingStatus as any;
    const recipients = signingStatus.recipients || raw.signers || [];

    if (recipients && recipients.length > 0) {
      for (const recipient of recipients) {
        const status = recipient.status;
        const signedAt = recipient.signed_at || recipient.signedAt;

        // order 1 = Bailleur, order 2 = Locataire
        if (recipient.order === 1) {
          updates.signature_landlord_status = status;
          if (signedAt) {
            updates.signature_landlord_date = signedAt;
          }
        }
        if (recipient.order === 2) {
          updates.signature_tenant_status = status;
          if (signedAt) {
            updates.signature_tenant_date = signedAt;
          }
        }
      }
    }

    // Si le statut global est "completed", "finished" ou "signed", marquer comme signé
    const globalStatus = firmaStatus.toLowerCase();
    if (globalStatus === 'completed' || globalStatus === 'signed' || globalStatus === 'finished') {
      updates.status = 'signed';
      // Si pas de recipients détaillés mais le statut global est completé,
      // marquer les deux parties comme signées
      if (!updates.signature_landlord_status) {
        updates.signature_landlord_status = 'signed';
      }
      if (!updates.signature_tenant_status) {
        updates.signature_tenant_status = 'signed';
      }
    }

    await admin.from('leases').update(updates).eq('id', lease.id);

    return NextResponse.json({
      success: true,
      status: firmaStatus,
      recipients,
      updates,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur vérification statut signature:', message);
    return NextResponse.json({ error: `Erreur lors de la vérification : ${message}` }, { status: 500 });
  }
}
