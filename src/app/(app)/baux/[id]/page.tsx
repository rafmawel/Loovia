// Page détail d'un bail
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowLeft, FileText, PenTool, Calendar, Building2, User } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Lease, Payment } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BailDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [leaseRes, paymentsRes] = await Promise.all([
    supabase
      .from('leases')
      .select('*, property:properties(*), tenant:tenants(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('payments')
      .select('*')
      .eq('lease_id', id)
      .order('period_start', { ascending: false }),
  ]);

  if (leaseRes.error || !leaseRes.data) {
    notFound();
  }

  const lease = leaseRes.data as Lease;
  const payments = (paymentsRes.data as Payment[]) || [];

  return (
    <div>
      <Link
        href="/baux"
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux baux
      </Link>

      <PageHeader
        title={`Bail — ${lease.property?.name || 'Bien'}`}
        description={lease.tenant ? `${fullName(lease.tenant.first_name, lease.tenant.last_name)}` : undefined}
      >
        <StatusBadge variant="lease" status={lease.status} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du bail */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-terracotta" />
              Détails du bail
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500">Loyer mensuel</p>
                <p className="text-lg font-bold tabular-nums text-slate-900">{formatCurrency(lease.monthly_rent)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Charges</p>
                <p className="text-lg font-bold tabular-nums text-slate-900">{formatCurrency(lease.charges_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Date de début</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(lease.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Date de fin</p>
                <p className="text-sm font-medium text-slate-900">{lease.end_date ? formatDate(lease.end_date) : 'Indéterminée'}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Total mensuel</p>
                <p className="text-lg font-bold tabular-nums text-terracotta">
                  {formatCurrency(lease.monthly_rent + lease.charges_amount)}
                </p>
              </div>
            </div>
          </Card>

          {/* Statut de signature */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PenTool className="h-5 w-5 text-terracotta" />
              Signature
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-stone-50">
                <p className="text-xs text-stone-500 mb-1">Propriétaire</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{lease.signature_landlord_status}</p>
                {lease.signature_landlord_date && (
                  <p className="text-xs text-stone-500 mt-1">Signé le {formatDate(lease.signature_landlord_date)}</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-stone-50">
                <p className="text-xs text-stone-500 mb-1">Locataire</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{lease.signature_tenant_status}</p>
                {lease.signature_tenant_date && (
                  <p className="text-xs text-stone-500 mt-1">Signé le {formatDate(lease.signature_tenant_date)}</p>
                )}
              </div>
            </div>
            {lease.sent_for_signature_at && (
              <p className="text-xs text-stone-500 mt-3">
                Envoyé pour signature le {formatDate(lease.sent_for_signature_at)}
              </p>
            )}
          </Card>

          {/* Paiements associés */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Paiements</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun paiement enregistré pour ce bail.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(payment.period_start)} — {formatDate(payment.period_end)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold tabular-nums text-slate-900">
                        {formatCurrency(payment.amount_paid)} / {formatCurrency(payment.amount_expected)}
                      </span>
                      <StatusBadge variant="payment" status={payment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Bien associé */}
          {lease.property && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-terracotta" />
                Bien
              </h2>
              <Link
                href={`/biens/${lease.property.id}`}
                className="block p-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-900">{lease.property.name}</p>
                <p className="text-xs text-stone-500">{lease.property.address}, {lease.property.city}</p>
              </Link>
            </Card>
          )}

          {/* Locataire */}
          {lease.tenant && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-terracotta" />
                Locataire
              </h2>
              <Link
                href={`/locataires/${lease.tenant.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold shrink-0">
                  {lease.tenant.first_name.charAt(0)}{lease.tenant.last_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {fullName(lease.tenant.first_name, lease.tenant.last_name)}
                  </p>
                  <p className="text-xs text-stone-500">{lease.tenant.email}</p>
                </div>
              </Link>
            </Card>
          )}

          {/* Dates clés */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-terracotta" />
              Dates
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-stone-500">Créé le</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(lease.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Dernière mise à jour</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(lease.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
