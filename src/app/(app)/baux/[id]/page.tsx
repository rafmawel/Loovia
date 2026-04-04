// Page détail d'un bail — affiche toutes les données du wizard
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import LeaseDetailActions from '@/components/leases/LeaseDetailActions';
import IrlRevisionLoader from '@/components/leases/IrlRevisionLoader';
import { ArrowLeft, FileText, PenTool, Calendar, Building2, User, Shield, Thermometer, Scale } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Lease, Property, Tenant, Payment } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

interface LeaseData {
  landlord_type?: string;
  landlord_name?: string;
  landlord_address?: string;
  location_type?: string;
  charges_mode?: string;
  deposit_amount?: number;
  duration_years?: number;
  duration_months?: number;
  is_mobility_lease?: boolean;
  tacit_renewal?: boolean;
  irl_enabled?: boolean;
  irl_quarter?: string;
  irl_year?: number;
  construction_year?: number | null;
  diag_dpe?: boolean;
  diag_erp?: boolean;
  diag_crep?: boolean;
  diag_amiante?: boolean;
  diag_electricite?: boolean;
  diag_gaz?: boolean;
  diag_carrez?: boolean;
  insurance_required?: boolean;
  solidarity_clause?: boolean;
  special_clauses?: string;
  has_cotenants?: boolean;
  cotenants?: { first_name: string; last_name: string; date_of_birth?: string }[];
  property_surface?: number;
  property_rooms?: number;
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
  const property = lease.property as Property;
  const tenant = lease.tenant as Tenant;
  const payments = (paymentsRes.data as Payment[]) || [];
  const d = (lease.data || {}) as LeaseData;

  const diagLabels: [string, boolean | undefined][] = [
    ['DPE', d.diag_dpe],
    ['ERP', d.diag_erp],
    ['CREP (Plomb)', d.diag_crep],
    ['Amiante', d.diag_amiante],
    ['Électricité', d.diag_electricite],
    ['Gaz', d.diag_gaz],
    ['Loi Carrez', d.diag_carrez],
  ];

  const durationLabel = d.is_mobility_lease
    ? `${d.duration_months} mois (Bail mobilité)`
    : d.duration_years
      ? `${d.duration_years} an${(d.duration_years ?? 0) > 1 ? 's' : ''}`
      : '—';

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
        description={lease.tenant ? fullName(lease.tenant.first_name, lease.tenant.last_name) : undefined}
      >
        <StatusBadge variant="lease" status={lease.status} />
        {property && tenant && (
          <LeaseDetailActions lease={lease} property={property} tenant={tenant} />
        )}
      </PageHeader>

      {/* Alerte révision IRL */}
      {d.irl_enabled && ['active', 'signed'].includes(lease.status) && (
        <div className="mb-6">
          <IrlRevisionLoader leaseId={lease.id} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conditions financières */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-terracotta" />
              Conditions financières
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500">Loyer mensuel HC</p>
                <p className="text-lg font-bold tabular-nums text-slate-900">{formatCurrency(lease.monthly_rent)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Charges</p>
                <p className="text-lg font-bold tabular-nums text-slate-900">{formatCurrency(lease.charges_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Total mensuel CC</p>
                <p className="text-lg font-bold tabular-nums text-terracotta">
                  {formatCurrency(lease.monthly_rent + lease.charges_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Dépôt de garantie</p>
                <p className="text-lg font-bold tabular-nums text-slate-900">
                  {d.deposit_amount != null ? formatCurrency(d.deposit_amount) : '—'}
                </p>
              </div>
              {d.charges_mode && (
                <div className="col-span-2">
                  <p className="text-xs text-stone-500">Mode de charges</p>
                  <p className="text-sm font-medium text-slate-900">{d.charges_mode}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Durée et dates */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-terracotta" />
              Durée du bail
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-stone-500">Date de début</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(lease.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Date de fin</p>
                <p className="text-sm font-medium text-slate-900">{lease.end_date ? formatDate(lease.end_date) : 'Indéterminée'}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Durée</p>
                <p className="text-sm font-medium text-slate-900">{durationLabel}</p>
              </div>
            </div>
            {d.tacit_renewal && (
              <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5 mt-3 inline-block">
                Renouvellement par tacite reconduction
              </p>
            )}
            {d.location_type && (
              <p className="text-xs text-stone-500 mt-2">
                Type : <span className="font-medium text-slate-900">{d.location_type}</span>
              </p>
            )}
          </Card>

          {/* Indexation IRL */}
          {d.irl_enabled && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-terracotta" />
                Clause d'indexation IRL
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-500">Trimestre de référence</p>
                  <p className="text-sm font-medium text-slate-900">{d.irl_quarter}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Année de référence</p>
                  <p className="text-sm font-medium text-slate-900">{d.irl_year}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Diagnostics */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-terracotta" />
              Diagnostics techniques
            </h2>
            <div className="flex flex-wrap gap-2">
              {diagLabels.map(([label, active]) =>
                active ? (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {label}
                  </span>
                ) : null
              )}
            </div>
            {d.construction_year && (
              <p className="text-xs text-stone-500 mt-3">
                Année de construction : <span className="font-medium">{d.construction_year}</span>
              </p>
            )}
            {d.insurance_required && (
              <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5 mt-3 inline-block">
                Assurance habitation obligatoire
              </p>
            )}
            {d.solidarity_clause && (
              <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5 mt-3 ml-2 inline-block">
                Clause de solidarité
              </p>
            )}
            {d.special_clauses && (
              <div className="mt-4 pt-3 border-t border-stone-100">
                <p className="text-xs text-stone-500 mb-1">Clauses particulières</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{d.special_clauses}</p>
              </div>
            )}
          </Card>

          {/* Signature */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PenTool className="h-5 w-5 text-terracotta" />
              Signature
            </h2>

            {/* Badge statut signature */}
            {lease.status === 'pending_signature' && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                En attente de signatures
              </div>
            )}
            {lease.status === 'signed' && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Toutes les signatures reçues
              </div>
            )}
            {lease.status === 'active' && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Bail actif
              </div>
            )}

            {lease.sent_for_signature_at && (
              <p className="text-xs text-stone-500 mb-3">
                Envoyé pour signature le {formatDate(lease.sent_for_signature_at)}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${lease.signature_landlord_status === 'signed' ? 'bg-emerald-50' : 'bg-stone-50'}`}>
                <p className="text-xs text-stone-500 mb-1">Propriétaire</p>
                <p className={`text-sm font-medium capitalize ${lease.signature_landlord_status === 'signed' ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {lease.signature_landlord_status === 'signed' ? '✅ Signé' : lease.signature_landlord_status === 'pending' ? '⏳ En attente' : lease.signature_landlord_status}
                </p>
                {lease.signature_landlord_date && (
                  <p className="text-xs text-stone-500 mt-1">Signé le {formatDate(lease.signature_landlord_date)}</p>
                )}
              </div>
              <div className={`p-4 rounded-xl ${lease.signature_tenant_status === 'signed' ? 'bg-emerald-50' : 'bg-stone-50'}`}>
                <p className="text-xs text-stone-500 mb-1">Locataire</p>
                <p className={`text-sm font-medium capitalize ${lease.signature_tenant_status === 'signed' ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {lease.signature_tenant_status === 'signed' ? '✅ Signé' : lease.signature_tenant_status === 'pending' ? '⏳ En attente' : lease.signature_tenant_status}
                </p>
                {lease.signature_tenant_date && (
                  <p className="text-xs text-stone-500 mt-1">Signé le {formatDate(lease.signature_tenant_date)}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Paiements */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Paiements</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun paiement enregistré pour ce bail.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                    <p className="text-sm font-medium text-slate-900">
                      {formatDate(payment.period_start)} — {formatDate(payment.period_end)}
                    </p>
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
          {/* Bailleur */}
          {d.landlord_name && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-terracotta" />
                Bailleur
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-stone-500">Structure</p>
                  <p className="text-sm font-medium text-slate-900">{d.landlord_type}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Nom</p>
                  <p className="text-sm font-medium text-slate-900">{d.landlord_name}</p>
                </div>
                {d.landlord_address && (
                  <div>
                    <p className="text-xs text-stone-500">Adresse</p>
                    <p className="text-sm text-slate-900">{d.landlord_address}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

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
                {d.property_surface ? (
                  <p className="text-xs text-stone-400 mt-1">
                    {d.property_surface} m² — {d.property_rooms} pièces
                  </p>
                ) : null}
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

              {d.has_cotenants && d.cotenants && d.cotenants.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                  <p className="text-xs font-medium text-stone-500">Co-locataires</p>
                  {d.cotenants.map((co, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-900">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold">
                        {co.first_name.charAt(0)}{co.last_name.charAt(0)}
                      </div>
                      {co.first_name} {co.last_name}
                    </div>
                  ))}
                </div>
              )}
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
