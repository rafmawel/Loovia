// API Route — envoi d'une quittance de loyer par email
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReceiptEmail } from '@/lib/api/resend';
import { generateReceiptPdf } from '@/lib/pdf/generate-receipt';
import { formatMonthYear } from '@/lib/utils';
import type { Payment, Lease, Property, Tenant } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId requis' }, { status: 400 });
    }

    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le paiement avec les relations
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*, property:properties(*), tenant:tenants(*))')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    const typedPayment = payment as Payment & { lease: Lease & { property: Property; tenant: Tenant } };
    const { property, tenant } = typedPayment.lease;

    // Nom du propriétaire
    const landlordName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Propriétaire';

    // Générer le PDF
    const pdfDataUri = generateReceiptPdf(typedPayment, property, tenant, landlordName);
    // Extraire le base64 du data URI
    const pdfBase64 = pdfDataUri.split(',')[1];

    // Envoyer par email
    const period = formatMonthYear(typedPayment.period_start);
    await sendReceiptEmail(
      tenant.email,
      `${tenant.first_name} ${tenant.last_name}`,
      period,
      pdfBase64,
    );

    // Mettre à jour la date d'envoi
    await supabase
      .from('payments')
      .update({ sent_receipt_at: new Date().toISOString() })
      .eq('id', paymentId);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
