// API Route — envoi d'un bail pour signature via Firma.dev
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAndSendSigningRequest, type FirmaRecipient, type FirmaField } from '@/lib/api/firma';
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
    const { doc: pdfDoc, signaturePositions } = generateLeasePdf(typedLease, property, tenant);
    const pdfBase64 = pdfDoc.output('datauristring').split(',')[1];

    // Construire la liste des signataires avec IDs temporaires
    const recipients: FirmaRecipient[] = [
      {
        id: 'temp_1',
        email: user.email!,
        first_name: landlordFirstName || landlordName,
        last_name: landlordLastName || '',
        designation: 'Signer',
        order: 1,
      },
      {
        id: 'temp_2',
        email: tenant.email,
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        designation: 'Signer',
        order: 2,
      },
    ];

    // Ajouter les co-locataires éventuels
    if (tenant.co_tenants && tenant.co_tenants.length > 0) {
      tenant.co_tenants.forEach((co, index) => {
        if (co.email) {
          recipients.push({
            id: `temp_${3 + index}`,
            email: co.email,
            first_name: co.first_name,
            last_name: co.last_name,
            designation: 'Signer',
            order: 3 + index,
          });
        }
      });
    }

    // Champs de signature — positionnés selon les emplacements calculés dans le PDF
    // Positions en pourcentage (0-100) comme requis par l'API Firma
    const fields: FirmaField[] = recipients.map((r) => {
      const pos = signaturePositions.find((sp) => sp.recipientId === r.id);
      return {
        type: 'signature' as const,
        position: {
          x: 5,
          y: pos ? pos.yPercent : 80,
          width: 40,
          height: 6,
        },
        page_number: pos ? pos.page : pdfDoc.getNumberOfPages(),
        recipient_id: r.id,
        required: true,
      };
    });

    // Créer et envoyer via Firma (endpoint atomique)
    const signingResponse = await createAndSendSigningRequest(
      {
        name: `Bail — ${property.name}`,
        document: pdfBase64,
        expiration_hours: 168,
        recipients,
        metadata: { lease_id: typedLease.id },
      },
      fields,
    );

    // Mettre à jour le bail avec les informations Firma (admin bypass RLS)
    await admin
      .from('leases')
      .update({
        status: 'pending_signature',
        firma_request_id: signingResponse.id,
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
