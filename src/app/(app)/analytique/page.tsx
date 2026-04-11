'use client';

// Page Analytique — tableaux de bord avancés (réservé aux abonnés Pro)
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, PieChart, Wallet, Building2,
  Crown, Lock, Calendar,
} from 'lucide-react';
import { formatCurrency, formatMonthYear } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { Payment, Lease, Property } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fmt = (fn: unknown) => fn as any;

// ── Types locaux ──────────────────────────────────────────────────

type PaymentWithLease = Payment & {
  lease?: Lease & {
    property?: Property;
    tenant?: { first_name: string; last_name: string };
  };
};

// ── Couleurs ──────────────────────────────────────────────────────

const COLORS = {
  terracotta: '#e2725b',
  terracottaLight: '#f0a899',
  emerald: '#059669',
  amber: '#d97706',
  red: '#dc2626',
  blue: '#2563eb',
  stone: '#78716c',
  purple: '#7c3aed',
};

const PIE_COLORS = [COLORS.emerald, COLORS.amber, COLORS.red, COLORS.stone];

// ── Page ──────────────────────────────────────────────────────────

export default function AnalytiquePage() {
  const { isPro } = useSubscription();
  const router = useRouter();
  const supabase = createClient();

  const [payments, setPayments] = useState<PaymentWithLease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [paymentsRes, propertiesRes, leasesRes] = await Promise.all([
        supabase
          .from('payments')
          .select('*, lease:leases(*, property:properties(*), tenant:tenants(first_name, last_name))')
          .order('period_start', { ascending: true }),
        supabase.from('properties').select('*'),
        supabase.from('leases').select('*, property:properties(*), tenant:tenants(first_name, last_name)'),
      ]);

      setPayments((paymentsRes.data as PaymentWithLease[]) || []);
      setProperties((propertiesRes.data as Property[]) || []);
      setLeases((leasesRes.data as Lease[]) || []);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  // ── Données calculées ─────────────────────────────────────────

  // Revenus par mois (12 derniers mois)
  const revenueByMonth = useMemo(() => {
    const now = new Date();
    const months: { month: string; attendu: number; recu: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = formatMonthYear(d.toISOString());

      let attendu = 0;
      let recu = 0;
      for (const p of payments) {
        const pMonth = p.period_start.slice(0, 7);
        if (pMonth === key) {
          attendu += p.amount_expected;
          recu += p.amount_paid;
        }
      }

      months.push({ month: label, attendu, recu });
    }
    return months;
  }, [payments]);

  // Taux de recouvrement global
  const collectionRate = useMemo(() => {
    const totalExpected = payments.reduce((s, p) => s + p.amount_expected, 0);
    const totalPaid = payments.reduce((s, p) => s + p.amount_paid, 0);
    return totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 100;
  }, [payments]);

  // Répartition des statuts de paiement
  const paymentStatusDistribution = useMemo(() => {
    const counts = { paid: 0, pending: 0, late: 0, partial: 0 };
    for (const p of payments) {
      if (p.status in counts) counts[p.status as keyof typeof counts]++;
    }
    return [
      { name: 'Payé', value: counts.paid },
      { name: 'En attente', value: counts.pending },
      { name: 'En retard', value: counts.late },
      { name: 'Partiel', value: counts.partial },
    ].filter((d) => d.value > 0);
  }, [payments]);

  // Rentabilité par bien
  const profitabilityByProperty = useMemo(() => {
    return properties.map((prop) => {
      const propPayments = payments.filter((p) => p.lease?.property?.id === prop.id);
      const totalReceived = propPayments.reduce((s, p) => s + p.amount_paid, 0);
      const monthlyLoanCost = prop.monthly_payment || 0;
      const propLeases = leases.filter((l) => l.property_id === prop.id && l.status === 'active');
      const monthlyRent = propLeases.reduce((s, l) => s + l.monthly_rent + l.charges_amount, 0);

      // Rendement brut annuel
      const annualRent = monthlyRent * 12;
      const rendementBrut = prop.purchase_price && prop.purchase_price > 0
        ? Math.round((annualRent / prop.purchase_price) * 1000) / 10
        : null;

      return {
        name: prop.name.length > 20 ? prop.name.slice(0, 20) + '…' : prop.name,
        loyer: monthlyRent,
        credit: monthlyLoanCost,
        cashflow: monthlyRent - monthlyLoanCost,
        totalRecu: totalReceived,
        rendement: rendementBrut,
      };
    }).filter((p) => p.loyer > 0 || p.credit > 0);
  }, [properties, payments, leases]);

  // Taux d'occupation par mois
  const occupancyByMonth = useMemo(() => {
    if (properties.length === 0) return [];
    const now = new Date();
    const months: { month: string; taux: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = formatMonthYear(d.toISOString());

      let occupied = 0;
      for (const lease of leases) {
        const start = new Date(lease.start_date);
        const end = lease.end_date ? new Date(lease.end_date) : new Date('2099-12-31');
        if (start <= endOfMonth && end >= d && ['active', 'signed'].includes(lease.status)) {
          occupied++;
        }
      }

      const taux = Math.round((Math.min(occupied, properties.length) / properties.length) * 100);
      months.push({ month: label, taux });
    }
    return months;
  }, [leases, properties]);

  // KPIs résumés
  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthRevenue = payments
      .filter((p) => p.period_start.slice(0, 7) === thisMonth)
      .reduce((s, p) => s + p.amount_paid, 0);

    const lastMonthRevenue = payments
      .filter((p) => p.period_start.slice(0, 7) === lastMonthKey)
      .reduce((s, p) => s + p.amount_paid, 0);

    const revenueTrend = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    const totalCashflow = profitabilityByProperty.reduce((s, p) => s + p.cashflow, 0);

    return { thisMonthRevenue, revenueTrend, totalCashflow, collectionRate };
  }, [payments, profitabilityByProperty, collectionRate]);

  // ── Gate Pro (désactivé temporairement pour tests) ───────────────

  // TODO: réactiver le gate Pro avant la mise en production
  // if (!isPro) {
  //   return (
  //     <div>
  //       <PageHeader title="Analytique" description="Tableaux de bord avancés" />
  //       <Card>
  //         <div className="flex flex-col items-center justify-center py-16 text-center">
  //           <div className="rounded-full bg-terracotta/10 p-4 mb-4">
  //             <Lock className="h-8 w-8 text-terracotta" />
  //           </div>
  //           <h2 className="text-lg font-bold text-text-primary mb-2">
  //             Fonctionnalité réservée au plan Premium
  //           </h2>
  //           <p className="text-sm text-text-secondary max-w-md mb-6">
  //             Accédez à des graphiques détaillés sur vos revenus, votre taux d&apos;occupation,
  //             la rentabilité de vos biens et le suivi de vos paiements.
  //           </p>
  //           <Button
  //             variant="primary"
  //             icon={<Crown className="h-4 w-4" />}
  //             onClick={() => router.push('/parametres')}
  //           >
  //             Passer au Premium
  //           </Button>
  //         </div>
  //       </Card>
  //     </div>
  //   );
  // }

  // ── Rendu ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytique" description="Tableaux de bord avancés" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border-light border-t-accent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytique" description="Tableaux de bord avancés" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Wallet}
          label="Revenus ce mois"
          value={formatCurrency(kpis.thisMonthRevenue)}
          trend={kpis.revenueTrend !== 0 ? { value: Math.abs(kpis.revenueTrend), positive: kpis.revenueTrend > 0 } : undefined}
        />
        <StatCard
          icon={TrendingUp}
          label="Cashflow mensuel net"
          value={formatCurrency(kpis.totalCashflow)}
        />
        <StatCard
          icon={BarChart3}
          label="Taux de recouvrement"
          value={`${kpis.collectionRate}%`}
        />
        <StatCard
          icon={Building2}
          label="Biens en portefeuille"
          value={properties.length}
        />
      </div>

      {/* Graphiques — ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenus mensuels */}
        <Card>
          <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-terracotta" />
            Revenus mensuels
          </h3>
          <p className="text-xs text-text-secondary mb-4">Attendu vs reçu — 12 derniers mois</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={fmt((v: number) => formatCurrency(v))}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="attendu" name="Attendu" fill={COLORS.stone} radius={[4, 4, 0, 0]} />
                <Bar dataKey="recu" name="Reçu" fill={COLORS.terracotta} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Taux d'occupation */}
        <Card>
          <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-terracotta" />
            Taux d&apos;occupation
          </h3>
          <p className="text-xs text-text-secondary mb-4">Évolution sur 12 mois</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={fmt((v: number) => `${v}%`)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e0', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="taux"
                  name="Occupation"
                  stroke={COLORS.terracotta}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.terracotta }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Graphiques — ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Répartition des paiements */}
        <Card>
          <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-terracotta" />
            Statut des paiements
          </h3>
          <p className="text-xs text-text-secondary mb-4">Répartition globale</p>
          <div className="h-[240px]">
            {paymentStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={paymentStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={fmt(({ name, percent }: { name: string; percent: number }) => `${name} ${Math.round(percent * 100)}%`)}
                    style={{ fontSize: 11 }}
                  >
                    {paymentStatusDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e0', fontSize: 12 }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-text-muted">
                Aucun paiement enregistré
              </div>
            )}
          </div>
        </Card>

        {/* Rentabilité par bien */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-terracotta" />
            Rentabilité par bien
          </h3>
          <p className="text-xs text-text-secondary mb-4">Cashflow mensuel (loyer - crédit)</p>
          {profitabilityByProperty.length > 0 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitabilityByProperty} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(v) => `${v}€`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} width={120} />
                  <Tooltip
                    formatter={fmt((v: number) => formatCurrency(v))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e0', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="loyer" name="Loyer" fill={COLORS.emerald} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="credit" name="Crédit" fill={COLORS.red} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-xs text-text-muted">
              Ajoutez des biens avec un loyer pour voir la rentabilité
            </div>
          )}
        </Card>
      </div>

      {/* Tableau de rendement */}
      {profitabilityByProperty.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-terracotta" />
            Détail par bien
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light text-left text-xs text-text-secondary">
                  <th className="pb-3 font-medium">Bien</th>
                  <th className="pb-3 font-medium text-right">Loyer mensuel</th>
                  <th className="pb-3 font-medium text-right">Crédit mensuel</th>
                  <th className="pb-3 font-medium text-right">Cashflow</th>
                  <th className="pb-3 font-medium text-right">Rendement brut</th>
                </tr>
              </thead>
              <tbody>
                {profitabilityByProperty.map((prop) => (
                  <tr key={prop.name} className="border-b border-border">
                    <td className="py-3 font-medium text-text-primary">{prop.name}</td>
                    <td className="py-3 text-right tabular-nums text-emerald-600">
                      {formatCurrency(prop.loyer)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-red-500">
                      {prop.credit > 0 ? formatCurrency(prop.credit) : '—'}
                    </td>
                    <td className={`py-3 text-right tabular-nums font-medium ${prop.cashflow >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(prop.cashflow)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-text-primary">
                      {prop.rendement !== null ? `${prop.rendement}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
