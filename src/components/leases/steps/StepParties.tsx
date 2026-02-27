'use client';

import { useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import type { Tenant } from '@/types';
import type { LeaseWizardData } from '../LeaseWizard';
import { formatDate } from '@/lib/utils';

const LANDLORD_TYPES = [
  { value: 'Personne physique', label: 'Personne physique' },
  { value: 'SCI Familiale', label: 'SCI Familiale' },
  { value: 'SCI de gestion', label: 'SCI de gestion' },
  { value: 'SAS', label: 'SAS' },
  { value: 'SARL', label: 'SARL' },
  { value: 'Autre personne morale', label: 'Autre personne morale' },
];

interface Props {
  data: LeaseWizardData;
  errors: Record<string, string>;
  tenants: Tenant[];
  userMetadata?: { first_name?: string; last_name?: string; [key: string]: unknown };
  onChange: (partial: Partial<LeaseWizardData>) => void;
}

export default function StepParties({ data, errors, tenants, userMetadata, onChange }: Props) {
  // Auto-remplir le nom du bailleur si personne physique
  useEffect(() => {
    if (
      data.landlord_type === 'Personne physique' &&
      !data.landlord_name &&
      userMetadata?.first_name
    ) {
      const name = [userMetadata.first_name, userMetadata.last_name].filter(Boolean).join(' ');
      if (name) onChange({ landlord_name: name });
    }
  }, [data.landlord_type, data.landlord_name, userMetadata, onChange]);

  // Quand un locataire est sélectionné, auto-remplir ses infos
  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant) {
      const hasCo = tenant.co_tenants && tenant.co_tenants.length > 0;
      onChange({
        tenant_id: tenantId,
        tenant_first_name: tenant.first_name,
        tenant_last_name: tenant.last_name,
        tenant_date_of_birth: tenant.date_of_birth || '',
        has_cotenants: hasCo,
        cotenants: hasCo
          ? tenant.co_tenants.map((co) => ({
              first_name: co.first_name,
              last_name: co.last_name,
              date_of_birth: co.date_of_birth || undefined,
            }))
          : [],
      });
    }
  };

  const activeTenants = tenants.filter((t) => !t.end_date);
  const selectedTenant = tenants.find((t) => t.id === data.tenant_id);

  return (
    <div className="space-y-6">
      {/* Section Bailleur */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider text-opacity-70">
          Bailleur
        </h3>
        <div className="space-y-3">
          <Select
            label="Structure juridique"
            options={LANDLORD_TYPES}
            value={data.landlord_type}
            onChange={(e) => onChange({ landlord_type: e.target.value })}
          />
          <Input
            label="Nom / Dénomination sociale"
            value={data.landlord_name}
            onChange={(e) => onChange({ landlord_name: e.target.value })}
            error={errors.landlord_name}
            placeholder="Jean Dupont"
          />
          <Input
            label="Adresse du bailleur"
            value={data.landlord_address}
            onChange={(e) => onChange({ landlord_address: e.target.value })}
            error={errors.landlord_address}
            placeholder="12 rue des Lilas, 75001 Paris"
          />
        </div>
      </div>

      {/* Section Locataire */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider text-opacity-70">
          Locataire
        </h3>
        <div className="space-y-3">
          <Select
            label="Choisir un locataire"
            options={activeTenants.map((t) => ({
              value: t.id,
              label: `${t.first_name} ${t.last_name}`,
            }))}
            value={data.tenant_id}
            onChange={(e) => handleTenantChange(e.target.value)}
            placeholder="Sélectionner un locataire"
            error={errors.tenant_id}
          />

          {selectedTenant && (
            <div className="rounded-xl bg-stone-50 p-4 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-stone-500">Prénom</p>
                  <p className="text-sm font-medium text-slate-900">{data.tenant_first_name}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Nom</p>
                  <p className="text-sm font-medium text-slate-900">{data.tenant_last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Date de naissance</p>
                  <p className="text-sm font-medium text-slate-900">
                    {data.tenant_date_of_birth ? formatDate(data.tenant_date_of_birth) : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Co-locataires */}
          {data.has_cotenants && data.cotenants.length > 0 && (
            <div className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={data.has_cotenants}
                  readOnly
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta/30"
                />
                <span className="text-sm font-medium text-slate-900">
                  Plusieurs locataires (colocation)
                </span>
              </div>
              <div className="space-y-2">
                {data.cotenants.map((co, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-stone-50">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold">
                      {co.first_name.charAt(0)}{co.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {co.first_name} {co.last_name}
                      </p>
                      {co.date_of_birth && (
                        <p className="text-xs text-stone-500">
                          Né(e) le {formatDate(co.date_of_birth)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
