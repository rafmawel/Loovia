'use client';

// Page Finances — vue d'ensemble des paiements et transactions
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Wallet, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import type { Payment, Lease } from '@/types';

type FilterStatus = 'all' | 'paid' | 'pending' | 'late' | 'partial';

export default function FinancesPage() {
  const [payments, setPayments] = useState<(Payment & { lease?: Lease })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const supabase = createClient();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('payments')
      .select('*, lease:leases(*, property:properties(name), tenant:tenants(first_name, last_name))')
      .order('period_start', { ascending: false });

    setPayments((data as (Payment & { lease?: Lease })[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Calcul des KPIs
  const totalExpected = payments.reduce((s, p) => s + p.amount_expected, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount_paid, 0);
  const latePayments = payments.filter((p) => p.status === 'late');
  const lateTotal = latePayments.reduce((s, p) => s + (p.amount_expected - p.amount_paid), 0);
  const recoveryRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

  // Filtrage
  const filteredPayments = filter === 'all' ? payments : payments.filter((p) => p.status === filter);

  const filterButtons: { label: string; value: FilterStatus }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Payés', value: 'paid' },
    { label: 'En attente', value: 'pending' },
    { label: 'En retard', value: 'late' },
    { label: 'Partiels', value: 'partial' },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader title="Finances" description="Suivi des paiements et revenus" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-terracotta" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Finances" description="Suivi des paiements et revenus" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Wallet}
          label="Total attendu"
          value={formatCurrency(totalExpected)}
        />
        <StatCard
          icon={CheckCircle}
          label="Total reçu"
          value={formatCurrency(totalPaid)}
        />
        <StatCard
          icon={AlertTriangle}
          label="En retard"
          value={formatCurrency(lateTotal)}
        />
        <StatCard
          icon={TrendingUp}
          label="Taux de recouvrement"
          value={`${recoveryRate}%`}
        />
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 mb-6">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              filter === btn.value
                ? 'bg-terracotta text-white'
                : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Liste des paiements */}
      {filteredPayments.length === 0 ? (
        <Card>
          <EmptyState
            icon={Clock}
            title="Aucun paiement"
            description="Les paiements apparaîtront ici une fois que vous aurez créé des baux."
          />
        </Card>
      ) : (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Locataire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Bien</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Attendu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Reçu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const lease = payment.lease as Lease | undefined;
                  const tenant = lease?.tenant;
                  const property = lease?.property;

                  return (
                    <tr key={payment.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {tenant ? fullName(tenant.first_name, tenant.last_name) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        {property?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        {formatDate(payment.period_start)} — {formatDate(payment.period_end)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium tabular-nums text-slate-900">
                        {formatCurrency(payment.amount_expected)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium tabular-nums text-slate-900">
                        {formatCurrency(payment.amount_paid)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge variant="payment" status={payment.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
