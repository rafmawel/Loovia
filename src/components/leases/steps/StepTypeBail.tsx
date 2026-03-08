'use client';

import type { LeaseWizardData, LeaseType } from '../LeaseWizard';
import { Home, Sofa, Users, GraduationCap, Plane } from 'lucide-react';

interface Props {
  data: LeaseWizardData;
  onChange: (partial: Partial<LeaseWizardData>) => void;
}

const LEASE_TYPES: {
  value: LeaseType;
  label: string;
  description: string;
  icon: React.ElementType;
  duration: string;
}[] = [
  {
    value: 'vide',
    label: 'Bail vide (non meublé)',
    description: 'Location vide classique, loi du 6 juillet 1989. Le bail le plus courant pour une résidence principale.',
    icon: Home,
    duration: '3 ans (6 ans si personne morale)',
  },
  {
    value: 'meuble',
    label: 'Bail meublé',
    description: 'Location meublée classique. Le logement doit contenir le mobilier minimum défini par décret.',
    icon: Sofa,
    duration: '1 an (renouvelable)',
  },
  {
    value: 'colocation',
    label: 'Bail colocation',
    description: 'Bail unique avec clause de solidarité pour plusieurs colocataires. Chaque colocataire est responsable de la totalité du loyer.',
    icon: Users,
    duration: '1 an meublé / 3 ans vide',
  },
  {
    value: 'etudiant',
    label: 'Bail étudiant',
    description: 'Bail meublé réservé aux étudiants. Durée réduite à 9 mois sans reconduction tacite.',
    icon: GraduationCap,
    duration: '9 mois (non renouvelable)',
  },
  {
    value: 'mobilite',
    label: 'Bail mobilité',
    description: 'Bail meublé de courte durée pour personnes en formation, études, stage, mutation ou mission temporaire. Pas de dépôt de garantie.',
    icon: Plane,
    duration: '1 à 10 mois (non renouvelable)',
  },
];

export default function StepTypeBail({ data, onChange }: Props) {
  const handleSelect = (type: LeaseType) => {
    const updates: Partial<LeaseWizardData> = { lease_type: type };

    // Auto-set location_type and relevant defaults based on lease type
    switch (type) {
      case 'vide':
        updates.location_type = 'Location vide';
        updates.is_mobility_lease = false;
        updates.tacit_renewal = true;
        break;
      case 'meuble':
        updates.location_type = 'Location meublée';
        updates.is_mobility_lease = false;
        updates.tacit_renewal = true;
        break;
      case 'colocation':
        updates.location_type = 'Location meublée';
        updates.is_mobility_lease = false;
        updates.tacit_renewal = true;
        updates.has_cotenants = true;
        updates.solidarity_clause = true;
        if (!data.cotenants || data.cotenants.length === 0) {
          updates.cotenants = [{ first_name: '', last_name: '' }];
        }
        break;
      case 'etudiant':
        updates.location_type = 'Location meublée';
        updates.is_mobility_lease = false;
        updates.tacit_renewal = false;
        updates.duration_years = 0;
        updates.duration_months = 9;
        break;
      case 'mobilite':
        updates.location_type = 'Bail mobilité';
        updates.is_mobility_lease = true;
        updates.tacit_renewal = false;
        updates.deposit_amount = 0;
        break;
    }

    onChange(updates);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-opacity-70">
        Type de bail
      </h3>
      <p className="text-sm text-stone-500">
        Choisissez le type de bail adapté à votre situation. Les clauses, la durée et les conditions financières seront adaptées automatiquement.
      </p>

      <div className="space-y-2">
        {LEASE_TYPES.map((type) => {
          const Icon = type.icon;
          const selected = data.lease_type === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => handleSelect(type.value)}
              className={[
                'w-full text-left p-4 rounded-xl border-2 transition-all',
                selected
                  ? 'border-terracotta bg-terracotta/5'
                  : 'border-stone-200 hover:border-stone-300 bg-white',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    'flex items-center justify-center h-10 w-10 rounded-lg shrink-0',
                    selected ? 'bg-terracotta/10 text-terracotta' : 'bg-stone-100 text-stone-500',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${selected ? 'text-terracotta' : 'text-slate-900'}`}>
                      {type.label}
                    </p>
                    <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
                      {type.duration}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {type.description}
                  </p>
                </div>
                {selected && (
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-terracotta text-white shrink-0 mt-0.5">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
