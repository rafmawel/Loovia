'use client';

import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import type { LeaseWizardData } from '../LeaseWizard';

const QUARTERS = [
  { value: 'T1', label: 'T1 — 1er trimestre' },
  { value: 'T2', label: 'T2 — 2e trimestre' },
  { value: 'T3', label: 'T3 — 3e trimestre' },
  { value: 'T4', label: 'T4 — 4e trimestre' },
];

interface Props {
  data: LeaseWizardData;
  onChange: (partial: Partial<LeaseWizardData>) => void;
}

export default function StepIRL({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-opacity-70">
        Clause d'indexation IRL
      </h3>

      {/* Toggle */}
      <label className="flex items-center justify-between p-4 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Activer la clause d'indexation du loyer (IRL)
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            Indice de Référence des Loyers publié par l'INSEE
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={data.irl_enabled}
          onClick={() => onChange({ irl_enabled: !data.irl_enabled })}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer',
            data.irl_enabled ? 'bg-terracotta' : 'bg-stone-300',
          ].join(' ')}
        >
          <span
            className={[
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform duration-200',
              data.irl_enabled ? 'translate-x-5' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </label>

      {data.irl_enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Trimestre de référence"
              options={QUARTERS}
              value={data.irl_quarter}
              onChange={(e) => onChange({ irl_quarter: e.target.value })}
            />
            <Input
              label="Année de référence"
              type="number"
              min={2000}
              max={2099}
              value={data.irl_year || ''}
              onChange={(e) => onChange({ irl_year: parseInt(e.target.value) || new Date().getFullYear() })}
            />
          </div>

          {/* Mention légale */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Mention légale :</strong> Le défaut de révision du loyer à la date
              prévue ne vaut pas renonciation du bailleur à sa révision. Conformément à
              l'article 17-1 de la loi du 6 juillet 1989, le bailleur dispose d'un délai
              d'un an pour réclamer la révision.
            </p>
          </div>
        </div>
      )}

      {!data.irl_enabled && (
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
          <p className="text-sm text-stone-500">
            Sans clause d'indexation, le loyer restera fixe pendant toute la durée du bail.
          </p>
        </div>
      )}
    </div>
  );
}
