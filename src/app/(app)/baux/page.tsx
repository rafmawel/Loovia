// Page liste des baux
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import BauxPageClient from '@/components/leases/BauxPageClient';
import { FileText } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import Link from 'next/link';
import type { Lease, Property, Tenant } from '@/types';

export default async function BauxPage() {
  const supabase = await createClient();

  const [leasesRes, tenantsRes, propertiesRes, userRes] = await Promise.all([
    supabase
      .from('leases')
      .select('*, property:properties(name), tenant:tenants(first_name, last_name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('tenants')
      .select('*')
      .order('first_name', { ascending: true }),
    supabase
      .from('properties')
      .select('*')
      .order('name', { ascending: true }),
    supabase.auth.getUser(),
  ]);

  const leases = (leasesRes.data as Lease[]) || [];
  const tenants = (tenantsRes.data as Tenant[]) || [];
  const properties = (propertiesRes.data as Property[]) || [];
  const userMetadata = userRes.data.user?.user_metadata as
    | { first_name?: string; last_name?: string; [key: string]: unknown }
    | undefined;

  return (
    <div>
      <PageHeader title="Baux" description="Gérez vos contrats de location">
        <BauxPageClient
          tenants={tenants}
          properties={properties}
          userMetadata={userMetadata}
        />
      </PageHeader>

      {leases.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="Aucun bail"
            description="Créez votre premier bail pour formaliser la relation avec vos locataires."
          />
        </Card>
      ) : (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Bien</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Locataire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Loyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Charges</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Début</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease) => (
                  <tr key={lease.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/baux/${lease.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-terracotta transition-colors"
                      >
                        {lease.property?.name || '—'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {lease.tenant ? fullName(lease.tenant.first_name, lease.tenant.last_name) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium tabular-nums text-slate-900">
                      {formatCurrency(lease.monthly_rent)}
                    </td>
                    <td className="px-6 py-4 text-sm tabular-nums text-stone-500">
                      {formatCurrency(lease.charges_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge variant="lease" status={lease.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {formatDate(lease.start_date)}
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
