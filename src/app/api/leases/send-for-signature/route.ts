// API Route — envoi d'un bail pour signature via Firma.dev
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createSigningRequest, type FirmaRecipient } from '@/lib/api/firma';
import { generateLeasePdf } from '@/lib/pdf/generate-lease';
import type { Lease, Property, Tenant } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { leaseId } = await request.json();

    if (!leaseId) {
      return NextResponse.json({ error: 'leaseId requis' }, { status: 400 });
    }

    // Client auth pour vérifier l'utilisateur
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Client admin pour les mises à jour (bypass RLS)
    const admin = createAdminClient();

    // Récupérer le bail avec les relations
    const { data: lease, error } = await supabase
      .from('leases')
      .select('*, property:properties(*), tenant:tenants(*)')
      .eq('id', leaseId)
      .single();

    if (error || !lease) {
      return NextResponse.json({ error: 'Bail non trouvé' }, { status: 404 });
    }

    const typedLease = lease as Lease;
    const property = typedLease.property as Property;
    const tenant = typedLease.tenant as Tenant;

    // Nom du propriétaire
    const landlordFirstName = (user.user_metadata?.first_name as string) || '';
    const landlordLastName = (user.user_metadata?.last_name as string) || '';
    const landlordName =
      `${landlordFirstName} ${landlordLastName}`.trim() || user.email || 'Propriétaire';

    // Générer le PDF du bail en Base64
    const pdfDoc = generateLeasePdf(typedLease, property, tenant);
    const pdfBase64 = pdfDoc.output('datauristring').split(',')[1]; // Retirer le préfixe data:…;base64,

    // Construire la liste des signataires
    const recipients: FirmaRecipient[] = [
      {
        email: user.email!,
        firstname: landlordFirstName || landlordName,
        lastname: landlordLastName || '',
        designation: 'Bailleur',
        order: 1,
      },
      {
        email: tenant.email,
        firstname: tenant.first_name,
        lastname: tenant.last_name,
        designation: 'Locataire',
        order: 2,
      },
    ];

    // Ajouter les co-locataires éventuels
    if (tenant.co_tenants && tenant.co_tenants.length > 0) {
      tenant.co_tenants.forEach((co, index) => {
        if (co.email) {
          recipients.push({
            email: co.email,
            firstname: co.first_name,
            lastname: co.last_name,
            designation: 'Locataire',
            order: 3 + index,
          });
        }
      });
    }

    // Envoyer pour signature via Firma
    const callbackUrl = `${request.nextUrl.origin}/api/webhooks/firma`;
    const signingResponse = await createSigningRequest({
      name: `Bail — ${property.name}`,
      description: `Contrat de location pour ${property.address}, ${property.city}`,
      document: pdfBase64,
      expiration_hours: 168,
      recipients,
      callback_url: callbackUrl,
      metadata: { lease_id: typedLease.id },
    });

    // Mettre à jour le bail avec les informations Firma (admin bypass RLS)
    await admin
      .from('leases')
      .update({
        status: 'pending_signature',
        firma_request_id: signingResponse.request_id,
        firma_status: signingResponse.status,
        sent_for_signature_at: new Date().toISOString(),
      })
      .eq('id', leaseId);

    return NextResponse.json({
      success: true,
      signingUrl: signingResponse.signing_url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur envoi signature:', message);
    return NextResponse.json({ error: `Erreur lors de l'envoi : ${message}` }, { status: 500 });
  }
}
