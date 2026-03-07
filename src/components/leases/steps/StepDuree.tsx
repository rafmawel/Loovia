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
  // Revenir au dernier jour du mois si on a dépassé
  return d.toISOString().split('T')[0];
}

export default function StepDuree({ data, errors, onChange }: Props) {
  const isMeuble = data.location_type === 'Location meublée';
  const isMobilite = data.location_type === 'Bail mobilité';
  const isPersonneMorale = PERSONNES_MORALES.includes(data.landlord_type);
  const isVide = data.location_type === 'Location vide';

  // Calcul automatique de la durée selon les règles
  useEffect(() => {
    let years = 3;
    let months = 0;
    let mobility = false;
    let tacit = true;

    if (isMobilite) {
      years = 0;
      months = data.duration_months || 1; // Saisie libre, entre 1 et 10
      mobility = true;
      tacit = false;
    } else if (isMeuble) {
      years = 1;
      months = 0;
    } else if (isVide) {
      if (isPersonneMorale) {
        years = 6;
      } else {
        years = 3;
      }
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
  }, [data.landlord_type, data.location_type, data.start_date, isMobilite && data.duration_months]);

  // Label de durée calculée
  const durationLabel = isMobilite
    ? `${data.duration_months} mois`
    : isMeuble
      ? '1 an'
      : isPersonneMorale && isVide
        ? '6 ans'
        : '3 ans';

  const durationReason = isMobilite
    ? 'Bail mobilité — durée libre (1 à 10 mois)'
    : isMeuble
      ? 'Location meublée — 1 an'
      : isPersonneMorale && isVide
        ? `${data.landlord_type} + Location vide — 6 ans`
        : `${data.landlord_type} + Location vide — 3 ans`;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-opacity-70">
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
        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs text-stone-500 mb-1">Durée du bail</p>
          <p className="text-lg font-bold text-slate-900">{durationLabel}</p>
          <p className="text-xs text-stone-400 mt-1">{durationReason}</p>
        </div>
      )}

      {/* Dates récapitulatives */}
      {data.start_date && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-stone-200 p-4">
          <div>
            <p className="text-xs text-stone-500">Début</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(data.start_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Fin</p>
            <p className="text-sm font-semibold text-slate-900">
              {data.end_date ? formatDate(data.end_date) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Tacite reconduction */}
      {!isMobilite && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-emerald-800">
            Renouvellement par tacite reconduction
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
