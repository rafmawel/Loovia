// API Route — envoi de relance de loyer impayé par email
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendRentReminder } from '@/lib/api/resend';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment, Lease, Tenant, Property } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId requis' }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le paiement avec le locataire et le bien
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*, tenant:tenants(*), property:properties(*))')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    const typedPayment = payment as Payment & {
      lease: Lease & { tenant: Tenant; property: Property };
    };
    const tenant = typedPayment.lease.tenant;
    const property = typedPayment.lease.property;

    if (!tenant.email) {
      return NextResponse.json(
        { error: "Le locataire n'a pas d'adresse email" },
        { status: 400 },
      );
    }

    const landlordName =
      `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
      'Le propriétaire';

    // Envoyer la relance avec le template HTML enrichi
    await sendRentReminder(
      tenant.email,
      tenant.first_name,
      `${tenant.first_name} ${tenant.last_name}`,
      formatCurrency(typedPayment.amount_expected),
      formatDate(typedPayment.period_end),
      `${property.address}, ${property.postal_code} ${property.city}`,
      landlordName,
    );

    return NextResponse.json({ success: true, email: tenant.email });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
