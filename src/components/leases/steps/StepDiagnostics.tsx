'use client';

import { useEffect } from 'react';
import Input from '@/components/ui/Input';
import type { LeaseWizardData } from '../LeaseWizard';

interface Props {
  data: LeaseWizardData;
  onChange: (partial: Partial<LeaseWizardData>) => void;
}

interface DiagItem {
  key: keyof LeaseWizardData;
  label: string;
  mandatory: boolean;
  reason?: string;
}

export default function StepDiagnostics({ data, onChange }: Props) {
  const constructionYear = data.construction_year;
  const electricalAge = data.electrical_age;
  const gasAge = data.gas_age;

  // Calcul automatique des diagnostics obligatoires
  useEffect(() => {
    const updates: Partial<LeaseWizardData> = {
      diag_dpe: true,
      diag_erp: true,
    };

    if (constructionYear !== null) {
      updates.diag_crep = constructionYear < 1949;
      updates.diag_amiante = constructionYear < 1997;
    }

    if (electricalAge !== null) {
      updates.diag_electricite = electricalAge > 15;
    }

    if (gasAge !== null) {
      updates.diag_gaz = gasAge > 15;
    }

    // Clause de solidarité si co-locataires
    if (data.has_cotenants && data.cotenants.length > 0) {
      updates.solidarity_clause = true;
    }

    onChange(updates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constructionYear, electricalAge, gasAge, data.has_cotenants, data.cotenants.length]);

  const diagnostics: DiagItem[] = [
    {
      key: 'diag_dpe',
      label: 'DPE (Diagnostic de Performance Énergétique)',
      mandatory: true,
      reason: 'Toujours obligatoire',
    },
    {
      key: 'diag_erp',
      label: 'ERP (État des Risques et Pollutions)',
      mandatory: true,
      reason: 'Toujours obligatoire',
    },
    {
      key: 'diag_crep',
      label: 'CREP (Plomb)',
      mandatory: constructionYear !== null && constructionYear < 1949,
      reason:
        constructionYear !== null
          ? constructionYear < 1949
            ? `Obligatoire — Construction avant 1949 (${constructionYear})`
            : `Non requis — Construction après 1948 (${constructionYear})`
          : 'Renseignez l\'année de construction',
    },
    {
      key: 'diag_amiante',
      label: 'Amiante',
      mandatory: constructionYear !== null && constructionYear < 1997,
      reason:
        constructionYear !== null
          ? constructionYear < 1997
            ? `Obligatoire — Construction avant 1997 (${constructionYear})`
            : `Non requis — Construction après 1996 (${constructionYear})`
          : 'Renseignez l\'année de construction',
    },
    {
      key: 'diag_electricite',
      label: 'Diagnostic Électricité',
      mandatory: electricalAge !== null && electricalAge > 15,
      reason:
        electricalAge !== null
          ? electricalAge > 15
            ? `Obligatoire — Installation > 15 ans (${electricalAge} ans)`
            : `Non requis — Installation ≤ 15 ans (${electricalAge} ans)`
          : 'Renseignez l\'âge de l\'installation',
    },
    {
      key: 'diag_gaz',
      label: 'Diagnostic Gaz',
      mandatory: gasAge !== null && gasAge > 15,
      reason:
        gasAge !== null
          ? gasAge > 15
            ? `Obligatoire — Installation > 15 ans (${gasAge} ans)`
            : `Non requis — Installation ≤ 15 ans (${gasAge} ans)`
          : 'Renseignez l\'âge de l\'installation',
    },
    {
      key: 'diag_carrez',
      label: 'Loi Carrez',
      mandatory: false,
      reason: 'Optionnel — À cocher manuellement si applicable',
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider text-opacity-70">
        Diagnostics techniques (DDT)
      </h3>

      {/* Données du bien */}
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Année de construction"
          type="number"
          min={1800}
          max={2030}
          value={data.construction_year ?? ''}
          onChange={(e) =>
            onChange({ construction_year: e.target.value ? parseInt(e.target.value) : null })
          }
          placeholder="ex: 1965"
        />
        <Input
          label="Âge élec. (années)"
          type="number"
          min={0}
          max={100}
          value={data.electrical_age ?? ''}
          onChange={(e) =>
            onChange({ electrical_age: e.target.value ? parseInt(e.target.value) : null })
          }
          placeholder="ex: 20"
        />
        <Input
          label="Âge gaz (années)"
          type="number"
          min={0}
          max={100}
          value={data.gas_age ?? ''}
          onChange={(e) =>
            onChange({ gas_age: e.target.value ? parseInt(e.target.value) : null })
          }
          placeholder="ex: 25"
        />
      </div>

      {/* Liste des diagnostics */}
      <div className="space-y-2">
        {diagnostics.map((diag) => {
          const checked = data[diag.key] as boolean;
          const isLocked = diag.key === 'diag_dpe' || diag.key === 'diag_erp';
          const isAutoMandatory = diag.mandatory && !isLocked;

          return (
            <label
              key={diag.key}
              className={[
                'flex items-start gap-3 p-3 rounded-xl border transition-colors',
                checked
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-border-light bg-bg-elevated',
                isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-bg-card',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  if (!isLocked && !isAutoMandatory) {
                    onChange({ [diag.key]: e.target.checked } as Partial<LeaseWizardData>);
                  }
                }}
                disabled={isLocked || isAutoMandatory}
                className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500/30 disabled:opacity-70"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{diag.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{diag.reason}</p>
              </div>
              {checked && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                  {isLocked || isAutoMandatory ? 'Obligatoire' : 'Inclus'}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Assurance habitation */}
      <label className="flex items-center gap-3 p-3 rounded-xl border border-border-light cursor-pointer hover:bg-bg-card transition-colors">
        <input
          type="checkbox"
          checked={data.insurance_required}
          onChange={(e) => onChange({ insurance_required: e.target.checked })}
          className="rounded border-stone-300 text-terracotta focus:ring-accent/30"
        />
        <div>
          <p className="text-sm font-medium text-text-primary">Assurance habitation obligatoire</p>
          <p className="text-xs text-text-secondary">Le locataire devra fournir une attestation</p>
        </div>
      </label>

      {/* Clause de solidarité */}
      {data.has_cotenants && data.cotenants.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
          <svg className="h-5 w-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">Clause de solidarité activée</p>
            <p className="text-xs text-blue-600">
              Colocation détectée — chaque colocataire est solidaire du paiement intégral du loyer
            </p>
          </div>
        </div>
      )}

      {/* Clauses particulières */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-primary">Clauses particulières</label>
        <textarea
          value={data.special_clauses}
          onChange={(e) => onChange({ special_clauses: e.target.value })}
          rows={4}
          placeholder="Saisissez ici les clauses spécifiques au contrat (optionnel)..."
          className="w-full rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
        />
      </div>
    </div>
  );
}
