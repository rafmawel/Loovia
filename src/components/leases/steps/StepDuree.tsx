'use client';

import { useEffect } from 'react';
import Input from '@/components/ui/Input';
import type { LeaseWizardData } from '../LeaseWizard';
import { formatDate } from '@/lib/utils';

interface Props {
  data: LeaseWizardData;
  errors: Record<string, string>;
  onChange: (partial: Partial<LeaseWizardData>) => void;
}

// Structures juridiques considérées comme personnes morales
const PERSONNES_MORALES = ['SCI de gestion', 'SAS', 'SARL', 'Autre personne morale'];

function addYearsMonths(dateStr: string, years: number, months: number): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  d.setFullYear(d.getFullYear() + years);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export default function StepDuree({ data, errors, onChange }: Props) {
  const leaseType = data.lease_type;
  const isPersonneMorale = PERSONNES_MORALES.includes(data.landlord_type);
  const isMobilite = leaseType === 'mobilite';
  const isEtudiant = leaseType === 'etudiant';

  // Calcul automatique de la durée selon le type de bail
  useEffect(() => {
    let years = 3;
    let months = 0;
    let mobility = false;
    let tacit = true;

    switch (leaseType) {
      case 'vide':
        years = isPersonneMorale ? 6 : 3;
        months = 0;
        break;
      case 'meuble':
        years = 1;
        months = 0;
        break;
      case 'colocation':
        // Colocation meublée = 1 an, vide = 3 ans
        years = data.location_type === 'Location vide' ? (isPersonneMorale ? 6 : 3) : 1;
        months = 0;
        break;
      case 'etudiant':
        years = 0;
        months = 9;
        tacit = false;
        break;
      case 'mobilite':
        years = 0;
        months = data.duration_months || 1;
        mobility = true;
        tacit = false;
        break;
    }

    const endDate = addYearsMonths(data.start_date, years, months);

    onChange({
      duration_years: years,
      duration_months: months,
      end_date: endDate,
      is_mobility_lease: mobility,
      tacit_renewal: tacit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.landlord_type, leaseType, data.location_type, data.start_date, isMobilite && data.duration_months]);

  // Label de durée calculée
  const durationLabel = isMobilite
    ? `${data.duration_months} mois`
    : isEtudiant
      ? '9 mois'
      : leaseType === 'meuble'
        ? '1 an'
        : leaseType === 'colocation'
          ? data.location_type === 'Location vide'
            ? isPersonneMorale ? '6 ans' : '3 ans'
            : '1 an'
          : isPersonneMorale ? '6 ans' : '3 ans';

  const durationReason = isMobilite
    ? 'Bail mobilité — durée libre (1 à 10 mois)'
    : isEtudiant
      ? 'Bail étudiant — 9 mois, non renouvelable'
      : leaseType === 'meuble'
        ? 'Location meublée — 1 an'
        : leaseType === 'colocation'
          ? data.location_type === 'Location vide'
            ? `Colocation vide — ${isPersonneMorale ? '6 ans (personne morale)' : '3 ans'}`
            : 'Colocation meublée — 1 an'
          : isPersonneMorale
            ? `${data.landlord_type} + Location vide — 6 ans`
            : 'Location vide — 3 ans';

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider text-opacity-70">
        Durée du bail
      </h3>

      {/* Date de prise d'effet */}
      <Input
        label="Date de prise d'effet"
        type="date"
        value={data.start_date}
        onChange={(e) => onChange({ start_date: e.target.value })}
        error={errors.start_date}
      />

      {/* Durée calculée ou saisie libre (mobilité) */}
      {isMobilite ? (
        <Input
          label="Durée (en mois)"
          type="number"
          min={1}
          max={10}
          value={data.duration_months || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            const endDate = addYearsMonths(data.start_date, 0, val);
            onChange({ duration_months: val, end_date: endDate });
          }}
          error={errors.duration_months}
          helperText="Bail mobilité : entre 1 et 10 mois"
        />
      ) : (
        <div className="rounded-xl bg-bg-card p-4">
          <p className="text-xs text-text-secondary mb-1">Durée du bail</p>
          <p className="text-lg font-bold text-text-primary">{durationLabel}</p>
          <p className="text-xs text-text-muted mt-1">{durationReason}</p>
        </div>
      )}

      {/* Dates récapitulatives */}
      {data.start_date && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border-light p-4">
          <div>
            <p className="text-xs text-text-secondary">Début</p>
            <p className="text-sm font-semibold text-text-primary">
              {formatDate(data.start_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Fin</p>
            <p className="text-sm font-semibold text-text-primary">
              {data.end_date ? formatDate(data.end_date) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Tacite reconduction */}
      {!isMobilite && !isEtudiant && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-emerald-800">
            Renouvellement par tacite reconduction
          </p>
        </div>
      )}

      {isEtudiant && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
          <svg className="h-5 w-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
          </svg>
          <p className="text-sm text-blue-800">
            Bail étudiant — 9 mois, pas de tacite reconduction
          </p>
        </div>
      )}

      {isMobilite && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm text-amber-800">
            Pas de tacite reconduction — Bail mobilité
          </p>
        </div>
      )}
    </div>
  );
}
