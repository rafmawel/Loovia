// API Route — détecter et créer les notifications automatiques
// Appelé périodiquement (cron) ou à la connexion de l'utilisateur
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils';
import type { Payment, Lease } from '@/types';

type PaymentWithLease = Payment & {
  lease?: Lease & {
    property?: { name: string };
    tenant?: { first_name: string; last_name: string };
  };
};

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const admin = createAdminClient();

    // Récupérer les notifications existantes pour éviter les doublons
    const { data: existing } = await supabase
      .from('notifications')
      .select('data')
      .eq('user_id', user.id)
      .in('type', ['payment_received', 'payment_late']);

    const existingKeys = new Set(
      (existing || []).map((n) => {
        const d = n.data as Record<string, string>;
        return `${d.payment_id || d.lease_id}-${d.period}`;
      }),
    );

    // Récupérer les paiements avec relations
    const { data: payments } = await supabase
      .from('payments')
      .select('*, lease:leases(*, property:properties(name), tenant:tenants(first_name, last_name))')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!payments) return NextResponse.json({ created: 0 });

    const notifications: {
      user_id: string;
      type: string;
      title: string;
      message: string;
      link: string;
      data: Record<string, string>;
    }[] = [];

    const now = new Date();

    for (const payment of payments as PaymentWithLease[]) {
      const tenant = payment.lease?.tenant;
      const property = payment.lease?.property;
      const tenantName = tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Locataire';
      const propertyName = property?.name || 'Bien';
      const period = payment.period_start.slice(0, 7);
      const leaseId = payment.lease_id;

      // ── Paiement reçu (payé récemment, dans les 7 derniers jours) ──
      if (payment.status === 'paid' && payment.payment_date) {
        const paidDate = new Date(payment.payment_date);
        const daysSincePaid = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSincePaid <= 7) {
          const key = `${payment.id}-${period}`;
          if (!existingKeys.has(key)) {
            notifications.push({
              user_id: user.id,
              type: 'payment_received',
              title: `Loyer reçu — ${propertyName}`,
              message: `${tenantName} a payé ${formatCurrency(payment.amount_paid)} pour ${period}.`,
              link: `/finances`,
              data: { payment_id: payment.id, period, lease_id: leaseId },
            });
            existingKeys.add(key);
          }
        }
      }

      // ── Paiement en retard ──
      if (payment.status === 'late') {
        const key = `${leaseId}-${period}`;
        if (!existingKeys.has(key)) {
          const dueDate = new Date(payment.period_end);
          const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          notifications.push({
            user_id: user.id,
            type: 'payment_late',
            title: `Impayé — ${propertyName}`,
            message: `${tenantName} n'a pas payé son loyer de ${formatCurrency(payment.amount_expected)} (${daysLate > 0 ? `${daysLate}j de retard` : 'échéance dépassée'}).`,
            link: `/finances`,
            data: { payment_id: payment.id, period, lease_id: leaseId },
          });
          existingKeys.add(key);
        }
      }
    }

    // Insérer les nouvelles notifications
    if (notifications.length > 0) {
      await admin.from('notifications').insert(notifications);
    }

    return NextResponse.json({ created: notifications.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur';
    console.error('Erreur détection notifications:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
