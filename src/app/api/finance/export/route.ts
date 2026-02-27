// API Route — export des données financières en CSV
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { Payment, Lease } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Paramètres optionnels de filtre
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('payments')
      .select('*, lease:leases(*, property:properties(name), tenant:tenants(first_name, last_name))')
      .order('period_start', { ascending: false });

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('period_start', from);
    if (to) query = query.lte('period_end', to);

    const { data: payments, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Génération CSV
    const header = 'Locataire,Bien,Période début,Période fin,Montant attendu,Montant payé,Statut,Date paiement\n';
    const rows = (payments as (Payment & { lease: Lease })[])
      .map((p) => {
        const lease = p.lease;
        const tenant = lease?.tenant;
        const property = lease?.property;
        return [
          tenant ? `${tenant.first_name} ${tenant.last_name}` : '',
          property?.name || '',
          formatDate(p.period_start),
          formatDate(p.period_end),
          p.amount_expected.toString(),
          p.amount_paid.toString(),
          p.status,
          p.payment_date ? formatDate(p.payment_date) : '',
        ].join(',');
      })
      .join('\n');

    const csv = header + rows;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=finances_${new Date().toISOString().slice(0, 10)}.csv`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
