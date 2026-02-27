// Page Tableau de bord — Vue d'ensemble du patrimoine
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { Building2, Users, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import Link from 'next/link';
import type { Property, Tenant, Payment, Lease } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Chargement des données en parallèle
  const [propertiesRes, tenantsRes, paymentsRes, leasesRes] = await Promise.all([
    supabase.from('properties').select('*'),
    supabase.from('tenants').select('*'),
    supabase
      .from('payments')
      .select('*, lease:leases(*, property:properties(*), tenant:tenants(*))')
      .order('created_at', { ascending: false }),
    supabase
      .from('leases')
      .select('*, property:properties(*), tenant:tenants(*)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const properties = (propertiesRes.data as Property[]) || [];
  const tenants = (tenantsRes.data as Tenant[]) || [];
  const payments = (paymentsRes.data as Payment[]) || [];
  const recentLeases = (leasesRes.data as Lease[]) || [];

  // Calcul des KPIs
  const activeTenants = tenants.filter((t) => !t.end_date || new Date(t.end_date) > new Date());
  const monthlyRevenue = activeTenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0);
  const occupiedProperties = new Set(activeTenants.map((t) => t.property_id).filter(Boolean));
  const occupancyRate = properties.length > 0
    ? Math.round((occupiedProperties.size / properties.length) * 100)
    : 0;

  // Paiements en retard
  const latePayments = payments.filter((p) => p.status === 'late');
  const recentPayments = payments.filter((p) => p.status === 'paid').slice(0, 5);

  // État vide
  if (properties.length === 0) {
    return (
      <div>
        <PageHeader
          title="Tableau de bord"
          description="Vue d'ensemble de votre patrimoine"
        />
        <Card>
          <EmptyState
            icon={Building2}
            title="Bienvenue sur Loovia"
            description="Commencez par ajouter votre premier bien immobilier pour utiliser toutes les fonctionnalités."
            action={
              <Link
                href="/biens"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Ajouter un bien
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre patrimoine"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Building2}
          label="Biens"
          value={properties.length}
        />
        <StatCard
          icon={Users}
          label="Locataires actifs"
          value={activeTenants.length}
        />
        <StatCard
          icon={Wallet}
          label="Revenus mensuels"
          value={formatCurrency(monthlyRevenue)}
        />
        <StatCard
          icon={TrendingUp}
          label="Taux d'occupation"
          value={`${occupancyRate}%`}
        />
      </div>

      {/* Alertes — paiements en retard */}
      {latePayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-800">
              {latePayments.length} paiement{latePayments.length > 1 ? 's' : ''} en retard
            </h2>
          </div>
          <div className="space-y-3">
            {latePayments.slice(0, 5).map((payment) => {
              const lease = payment.lease as Lease | undefined;
              const tenant = lease?.tenant;
              const property = lease?.property;
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between bg-white rounded-xl p-4 border border-red-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {tenant ? fullName(tenant.first_name, tenant.last_name) : 'Locataire inconnu'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {property?.name || 'Bien inconnu'} — Échéance : {formatDate(payment.period_end)}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-red-700">
                    {formatCurrency(payment.amount_expected)}
                  </span>
                </div>
              );
            })}
          </div>
          {latePayments.length > 5 && (
            <Link
              href="/finances"
              className="inline-block mt-4 text-sm font-medium text-red-700 hover:text-red-800"
            >
              Voir tous les retards →
            </Link>
          )}
        </div>
      )}

      {/* Dernière activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers paiements reçus */}
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Derniers paiements</h2>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-stone-500">Aucun paiement reçu pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => {
                const lease = payment.lease as Lease | undefined;
                const tenant = lease?.tenant;
                return (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {tenant ? fullName(tenant.first_name, tenant.last_name) : '—'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {payment.payment_date ? formatDate(payment.payment_date) : '—'}
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-emerald-700">
                      +{formatCurrency(payment.amount_paid)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Derniers baux créés */}
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Derniers baux</h2>
          {recentLeases.length === 0 ? (
            <p className="text-sm text-stone-500">Aucun bail créé pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recentLeases.map((lease) => (
                <div key={lease.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {lease.property?.name || '—'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {lease.tenant
                        ? fullName(lease.tenant.first_name, lease.tenant.last_name)
                        : '—'}
                    </p>
                  </div>
                  <StatusBadge variant="lease" status={lease.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
