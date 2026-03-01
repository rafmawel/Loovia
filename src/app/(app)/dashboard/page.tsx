// Page Tableau de bord — Vue d'ensemble du patrimoine
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { Building2, Users, Wallet, TrendingUp, AlertTriangle, Wrench } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import { priorityLabels, priorityColors } from '@/lib/design-system';
import Link from 'next/link';
import type { Property, Tenant, Payment, Lease, MaintenanceRequest } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Chargement des données en parallèle
  const [propertiesRes, tenantsRes, paymentsRes, leasesRes, maintenanceRes] = await Promise.all([
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
    supabase
      .from('maintenance_requests')
      .select('*, property:properties(name)')
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const properties = (propertiesRes.data as Property[]) || [];
  const tenants = (tenantsRes.data as Tenant[]) || [];
  const payments = (paymentsRes.data as Payment[]) || [];
  const recentLeases = (leasesRes.data as Lease[]) || [];
  const openMaintenance = (maintenanceRes.data as (MaintenanceRequest & { property?: { name: string } })[]) || [];

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

      {/* Alerte — demandes de travaux ouvertes */}
      {openMaintenance.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-800">
              {openMaintenance.length} demande{openMaintenance.length > 1 ? 's' : ''} de travaux en attente
            </h2>
          </div>
          <div className="space-y-3">
            {openMaintenance.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white rounded-xl p-4 border border-amber-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{req.title}</p>
                  <p className="text-xs text-stone-500">
                    {req.property?.name || '—'} — {formatDate(req.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      priorityColors[req.priority]?.bg || 'bg-stone-100'
                    } ${priorityColors[req.priority]?.text || 'text-stone-600'}`}
                  >
                    {priorityLabels[req.priority] || req.priority}
                  </span>
                  <StatusBadge variant="maintenance" status={req.status} />
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/maintenance"
            className="inline-block mt-4 text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            Voir toutes les demandes →
          </Link>
        </div>
      )}

      {/* Dernière activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers paiements reçus */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Derniers paiements</h2>
            <Link href="/finances" className="text-xs font-medium text-terracotta hover:text-terracotta/80">
              Voir tous →
            </Link>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Derniers baux</h2>
            <Link href="/baux" className="text-xs font-medium text-terracotta hover:text-terracotta/80">
              Voir tous →
            </Link>
          </div>
          {recentLeases.length === 0 ? (
            <p className="text-sm text-stone-500">Aucun bail créé pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recentLeases.map((lease) => (
                <Link key={lease.id} href={`/baux/${lease.id}`} className="flex items-center justify-between hover:bg-stone-50 rounded-lg p-1 -m-1 transition-colors">
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
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
