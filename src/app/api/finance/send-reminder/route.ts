// API Route — envoi de rappel de loyer par email
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendRentReminder } from '@/lib/api/resend';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment, Lease, Tenant } from '@/types';

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

    // Récupérer le paiement avec le locataire
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*, tenant:tenants(*))')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    const typedPayment = payment as Payment & { lease: Lease & { tenant: Tenant } };
    const tenant = typedPayment.lease.tenant;

    // Envoyer le rappel
    await sendRentReminder(
      tenant.email,
      `${tenant.first_name} ${tenant.last_name}`,
      formatCurrency(typedPayment.amount_expected),
      formatDate(typedPayment.period_end),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
