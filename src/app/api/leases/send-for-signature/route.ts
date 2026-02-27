// API Route — envoi d'un bail pour signature via Firma.dev
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSigningRequest } from '@/lib/api/firma';
import { generateLeasePdf } from '@/lib/pdf/generate-lease';
import type { Lease, Property, Tenant } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { leaseId } = await request.json();

    if (!leaseId) {
      return NextResponse.json({ error: 'leaseId requis' }, { status: 400 });
    }

    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

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
    const landlordName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || 'Propriétaire';

    // Générer le PDF du bail
    const pdfDoc = generateLeasePdf(typedLease, property, tenant);
    const pdfDataUri = pdfDoc.output('datauristring');

    // Envoyer pour signature via Firma
    const callbackUrl = `${request.nextUrl.origin}/api/webhooks/firma`;
    const signingResponse = await createSigningRequest({
      documentUrl: pdfDataUri,
      signers: [
        { name: landlordName, email: user.email!, role: 'landlord' },
        { name: `${tenant.first_name} ${tenant.last_name}`, email: tenant.email, role: 'tenant' },
      ],
      callbackUrl,
      metadata: { leaseId: typedLease.id },
    });

    // Mettre à jour le bail avec les informations Firma
    await supabase
      .from('leases')
      .update({
        status: 'pending_signature',
        firma_request_id: signingResponse.id,
        firma_status: signingResponse.status,
        sent_for_signature_at: new Date().toISOString(),
      })
      .eq('id', leaseId);

    return NextResponse.json({ success: true, signingUrl: signingResponse.signingUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
