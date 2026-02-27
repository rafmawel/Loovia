// Page détail d'un locataire
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import TenantDetailActions from '@/components/tenants/TenantDetailActions';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Building2, Wallet,
  Globe, Briefcase, CreditCard, Users, FileText,
} from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Tenant, Property, Payment, Lease } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LocataireDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [tenantRes, propertyRes, paymentsRes] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', id).single(),
    supabase.from('properties').select('*'),
    supabase
      .from('payments')
      .select('*, lease:leases(*)')
      .order('period_start', { ascending: false }),
  ]);

  if (tenantRes.error || !tenantRes.data) {
    notFound();
  }

  const tenant = tenantRes.data as Tenant;
  const properties = (propertyRes.data as Property[]) || [];
  const property = tenant.property_id ? properties.find((p) => p.id === tenant.property_id) : null;

  // Paiements liés au locataire via les baux
  const allPayments = (paymentsRes.data || []) as (Payment & { lease: Lease })[];
  const tenantPayments = allPayments.filter((p) => p.lease?.tenant_id === tenant.id);

  const isActive = !tenant.end_date;

  return (
    <div>
      <Link
        href="/locataires"
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux locataires
      </Link>

      <PageHeader
        title={fullName(tenant.first_name, tenant.last_name)}
        description={
          isActive
            ? `Locataire depuis le ${formatDate(tenant.start_date)}`
            : `Ancien locataire — bail terminé le ${tenant.end_date ? formatDate(tenant.end_date) : ''}`
        }
      >
        <TenantDetailActions tenant={tenant} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-terracotta" />
              Informations personnelles
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-xs text-stone-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-xs text-stone-500">Téléphone</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-xs text-stone-500">Date de naissance</p>
                  <p className="text-sm font-medium text-slate-900">
                    {tenant.date_of_birth ? formatDate(tenant.date_of_birth) : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-xs text-stone-500">Nationalité</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.nationality || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-xs text-stone-500">Profession</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.profession || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-xs text-stone-500">IBAN connu</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">
                    {tenant.last_known_iban || '—'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Co-locataires */}
          {tenant.co_tenants && tenant.co_tenants.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-terracotta" />
                Co-locataires
              </h2>
              <div className="space-y-3">
                {tenant.co_tenants.map((co, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold shrink-0">
                      {co.first_name.charAt(0)}{co.last_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {co.first_name} {co.last_name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        {co.relationship_type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 text-xs">
                            {co.relationship_type}
                          </span>
                        )}
                        {co.date_of_birth && <span>Né(e) le {formatDate(co.date_of_birth)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Historique des paiements */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-terracotta" />
              Historique des paiements
            </h2>
            {tenantPayments.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun paiement enregistré.</p>
            ) : (
              <div className="space-y-3">
                {tenantPayments.slice(0, 12).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(payment.period_start)} — {formatDate(payment.period_end)}
                      </p>
                      <p className="text-xs text-stone-500">
                        {payment.payment_date ? `Payé le ${formatDate(payment.payment_date)}` : 'Non payé'}
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
          {/* Avatar, statut et loyer */}
          <Card>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-terracotta text-white text-xl font-bold mx-auto mb-3">
                {tenant.first_name.charAt(0)}{tenant.last_name.charAt(0)}
              </div>
              <StatusBadge variant="payment" status={tenant.payment_status} className="mb-2" />
              {!isActive && (
                <p className="text-xs text-stone-400 mt-1">Bail terminé</p>
              )}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-500">Loyer mensuel</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {formatCurrency(tenant.rent_amount)}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-stone-500">Entrée</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(tenant.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Sortie</p>
                  <p className="text-sm font-medium text-slate-900">
                    {tenant.end_date ? formatDate(tenant.end_date) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Bien associé */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-terracotta" />
              Bien occupé
            </h2>
            {property ? (
              <Link href={`/biens/${property.id}`} className="block p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                <p className="text-sm font-medium text-slate-900 group-hover:text-terracotta transition-colors">{property.name}</p>
                <p className="text-xs text-stone-500">{property.address}, {property.postal_code} {property.city}</p>
                {property.surface && (
                  <p className="text-xs text-stone-400 mt-1">{property.surface} m² — {property.property_type}</p>
                )}
              </Link>
            ) : (
              <p className="text-sm text-stone-500">Aucun bien associé.</p>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-terracotta" />
              Documents
            </h2>
            <Link
              href="/documents"
              className="block text-sm text-terracotta hover:underline"
            >
              Voir les documents demandés
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
