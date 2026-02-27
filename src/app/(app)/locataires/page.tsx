// Page liste des locataires — Server Component
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import AddTenantButton from '@/components/tenants/AddTenantButton';
import TenantPageClient from '@/components/tenants/TenantPageClient';
import { Users, Wallet, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Tenant, Property } from '@/types';

export default async function LocatairesPage() {
  const supabase = await createClient();

  const [tenantsRes, propertiesRes] = await Promise.all([
    supabase.from('tenants').select('*').order('created_at', { ascending: false }),
    supabase.from('properties').select('id, name, address, city'),
  ]);

  const tenants = (tenantsRes.data as Tenant[]) || [];
  const properties = (propertiesRes.data as Pick<Property, 'id' | 'name' | 'address' | 'city'>[]) || [];

  // Map des biens pour enrichir les locataires
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  // Enrichir chaque locataire avec son bien
  const enriched = tenants.map((t) => ({
    ...t,
    property: t.property_id ? propertyMap.get(t.property_id) ?? null : null,
  }));

  // KPIs
  const activeTenants = tenants.filter((t) => !t.end_date);
  const activeCount = activeTenants.length;
  const monthlyRevenue = activeTenants.reduce((sum, t) => sum + t.rent_amount, 0);
  const lateCount = activeTenants.filter((t) => t.payment_status === 'late').length;

  return (
    <div>
      <PageHeader title="Mes Locataires" description="Gérez vos locataires et leurs baux">
        <AddTenantButton />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Locataires actifs"
          value={activeCount}
        />
        <StatCard
          icon={Wallet}
          label="Revenus mensuels totaux"
          value={formatCurrency(monthlyRevenue)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Locataires en retard"
          value={lateCount}
        />
      </div>

      {/* Liste interactive */}
      <TenantPageClient tenants={enriched} />
    </div>
  );
}
