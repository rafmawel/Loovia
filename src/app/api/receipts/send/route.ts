// API Route — génération et envoi de quittance de loyer par email
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReceiptBase64 } from '@/lib/pdf/generate-receipt';
import { sendReceiptEmail } from '@/lib/api/resend';
import { formatMonthYear } from '@/lib/utils';
import type { Payment, Lease, Property, Tenant } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentId = body.payment_id || body.paymentId;

    if (!paymentId) {
      return NextResponse.json({ error: 'payment_id requis' }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le paiement avec toutes les relations
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*, property:properties(*), tenant:tenants(*))')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    const typedPayment = payment as Payment & {
      lease: Lease & { property: Property; tenant: Tenant };
    };

    const lease = typedPayment.lease;
    const property = lease.property;
    const tenant = lease.tenant;

    if (!tenant.email) {
      return NextResponse.json(
        { error: "Le locataire n'a pas d'adresse email" },
        { status: 400 },
      );
    }

    const landlordName =
      `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
      'Le propriétaire';

    const period = formatMonthYear(typedPayment.period_start);

    // Générer le PDF en base64
    const pdfBase64 = generateReceiptBase64(
      typedPayment,
      lease,
      property,
      tenant,
      landlordName,
    );

    // Envoyer par email avec le PDF en pièce jointe
    await sendReceiptEmail(
      tenant.email,
      `${tenant.first_name} ${tenant.last_name}`,
      period,
      pdfBase64,
    );

    // Marquer la quittance comme envoyée
    await supabase
      .from('payments')
      .update({ sent_receipt_at: new Date().toISOString() })
      .eq('id', paymentId);

    return NextResponse.json({
      success: true,
      email: tenant.email,
      period,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la quittance' }, { status: 500 });
  }
}
