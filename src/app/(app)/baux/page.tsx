// Page liste des baux
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { FileText, Plus } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import Link from 'next/link';
import type { Lease } from '@/types';

export default async function BauxPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('leases')
    .select('*, property:properties(name), tenant:tenants(first_name, last_name)')
    .order('created_at', { ascending: false });

  const leases = (data as Lease[]) || [];

  return (
    <div>
      <PageHeader title="Baux" description="Gérez vos contrats de location">
        <Link
          href="/baux?action=create"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-terracotta rounded-xl hover:bg-terracotta-dark hover:scale-[1.02] hover:shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          Nouveau bail
        </Link>
      </PageHeader>

      {leases.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="Aucun bail"
            description="Créez votre premier bail pour formaliser la relation avec vos locataires."
            action={
              <Link
                href="/baux?action=create"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nouveau bail
              </Link>
            }
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
