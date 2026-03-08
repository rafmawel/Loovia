'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import type { Tenant } from '@/types';
import type { LeaseWizardData } from '../LeaseWizard';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

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
  const [mode, setMode] = useState<'existing' | 'new'>(
    data.tenant_id ? 'existing' : 'new'
  );

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

  // Quand un locataire existant est sélectionné
  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant) {
      const hasCo = tenant.co_tenants && tenant.co_tenants.length > 0;
      onChange({
        tenant_id: tenantId,
        tenant_first_name: tenant.first_name,
        tenant_last_name: tenant.last_name,
        tenant_date_of_birth: tenant.date_of_birth || '',
        tenant_email: tenant.email || '',
        tenant_phone: tenant.phone || '',
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

  // Passer en mode "nouveau locataire"
  const switchToNewTenant = () => {
    setMode('new');
    onChange({
      tenant_id: '',
      tenant_first_name: '',
      tenant_last_name: '',
      tenant_date_of_birth: '',
      tenant_email: '',
      tenant_phone: '',
      has_cotenants: false,
      cotenants: [],
    });
  };

  // Passer en mode "locataire existant"
  const switchToExisting = () => {
    setMode('existing');
    onChange({
      tenant_id: '',
      tenant_first_name: '',
      tenant_last_name: '',
      tenant_date_of_birth: '',
      tenant_email: '',
      tenant_phone: '',
      has_cotenants: false,
      cotenants: [],
    });
  };

  const activeTenants = tenants.filter((t) => !t.end_date);

  // Ajouter un co-locataire
  const addCotenant = () => {
    onChange({
      has_cotenants: true,
      cotenants: [...data.cotenants, { first_name: '', last_name: '' }],
    });
  };

  // Supprimer un co-locataire
  const removeCotenant = (index: number) => {
    const updated = data.cotenants.filter((_, i) => i !== index);
    onChange({
      cotenants: updated,
      has_cotenants: updated.length > 0,
    });
  };

  // Mettre à jour un co-locataire
  const updateCotenant = (index: number, field: string, value: string) => {
    const updated = data.cotenants.map((co, i) =>
      i === index ? { ...co, [field]: value } : co
    );
    onChange({ cotenants: updated });
  };

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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-opacity-70">
            Locataire
          </h3>
          {/* Toggle entre existant et nouveau */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={switchToExisting}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                mode === 'existing'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Existant
            </button>
            <button
              type="button"
              onClick={switchToNewTenant}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                mode === 'new'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Nouveau
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Mode : Locataire existant */}
          {mode === 'existing' && (
            <>
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

              {data.tenant_id && (
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

              {activeTenants.length === 0 && (
                <div className="rounded-xl bg-stone-50 p-4 text-center">
                  <p className="text-sm text-stone-500">Aucun locataire enregistré</p>
                  <button
                    type="button"
                    onClick={switchToNewTenant}
                    className="text-sm text-terracotta hover:underline mt-1"
                  >
                    Créer un nouveau locataire
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mode : Nouveau locataire (saisie directe) */}
          {mode === 'new' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Prénom *"
                  value={data.tenant_first_name}
                  onChange={(e) => onChange({ tenant_first_name: e.target.value })}
                  error={errors.tenant_first_name}
                  placeholder="Marie"
                />
                <Input
                  label="Nom *"
                  value={data.tenant_last_name}
                  onChange={(e) => onChange({ tenant_last_name: e.target.value })}
                  error={errors.tenant_last_name}
                  placeholder="Dupont"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email *"
                  type="email"
                  value={data.tenant_email || ''}
                  onChange={(e) => onChange({ tenant_email: e.target.value })}
                  error={errors.tenant_email}
                  placeholder="marie@email.com"
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={data.tenant_phone || ''}
                  onChange={(e) => onChange({ tenant_phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <Input
                label="Date de naissance"
                type="date"
                value={data.tenant_date_of_birth}
                onChange={(e) => onChange({ tenant_date_of_birth: e.target.value })}
              />

              {/* Co-locataires */}
              <div className="border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-900">Co-locataires</span>
                  <button
                    type="button"
                    onClick={addCotenant}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-terracotta hover:bg-terracotta/5 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter
                  </button>
                </div>

                {data.cotenants.length > 0 && (
                  <div className="space-y-3">
                    {data.cotenants.map((co, i) => (
                      <div key={i} className="p-3 rounded-xl bg-stone-50 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              label="Prénom"
                              value={co.first_name}
                              onChange={(e) => updateCotenant(i, 'first_name', e.target.value)}
                              placeholder="Prénom"
                            />
                            <Input
                              label="Nom"
                              value={co.last_name}
                              onChange={(e) => updateCotenant(i, 'last_name', e.target.value)}
                              placeholder="Nom"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCotenant(i)}
                            className="mt-7 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <Input
                          label="Email *"
                          type="email"
                          value={co.email || ''}
                          onChange={(e) => updateCotenant(i, 'email', e.target.value)}
                          placeholder="email@exemple.com"
                          helperText="Nécessaire pour la signature du bail"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Co-locataires en mode existant */}
          {mode === 'existing' && data.has_cotenants && data.cotenants.length > 0 && (
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
