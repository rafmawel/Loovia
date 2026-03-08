'use client';

import { useEffect } from 'react';
import Input from '@/components/ui/Input';
import type { LeaseWizardData } from '../LeaseWizard';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: LeaseWizardData;
  errors: Record<string, string>;
  onChange: (partial: Partial<LeaseWizardData>) => void;
}

export default function StepFinances({ data, errors, onChange }: Props) {
  const isMeuble = data.location_type === 'Location meublée';
  const isMobilite = data.lease_type === 'mobilite';

  // Calcul automatique du dépôt de garantie
  useEffect(() => {
    let deposit = 0;
    if (isMobilite) {
      deposit = 0;
    } else if (isMeuble) {
      deposit = data.monthly_rent * 2;
    } else {
      deposit = data.monthly_rent;
    }
    onChange({ deposit_amount: deposit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.monthly_rent, data.location_type]);

  // Forfait uniquement si meublé
  useEffect(() => {
    if (!isMeuble && data.charges_mode === 'Forfait') {
      onChange({ charges_mode: 'Provision avec régularisation annuelle' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.location_type]);

  const totalCC = data.monthly_rent + data.charges_amount;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-opacity-70">
        Conditions financières
      </h3>

      {/* KPI Loyer total */}
      <div className="bg-terracotta/5 border border-terracotta/20 rounded-2xl p-6 text-center">
        <p className="text-xs text-stone-500 mb-1">Loyer total charges comprises</p>
        <p className="text-3xl font-bold tabular-nums text-terracotta">
          {formatCurrency(totalCC)}
        </p>
        <p className="text-xs text-stone-400 mt-1">/ mois</p>
      </div>

      {/* Loyer et charges */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Loyer mensuel HC"
          type="number"
          min={0}
          step={0.01}
          value={data.monthly_rent || ''}
          onChange={(e) => onChange({ monthly_rent: parseFloat(e.target.value) || 0 })}
          error={errors.monthly_rent}
          helperText="Hors charges"
        />
        <Input
          label="Charges mensuelles"
          type="number"
          min={0}
          step={0.01}
          value={data.charges_amount || ''}
          onChange={(e) => onChange({ charges_amount: parseFloat(e.target.value) || 0 })}
          helperText="Provision ou forfait"
        />
      </div>

      {/* Mode de récupération des charges */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-900">Mode de récupération des charges</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
            <input
              type="radio"
              name="charges_mode"
              checked={data.charges_mode === 'Provision avec régularisation annuelle'}
              onChange={() => onChange({ charges_mode: 'Provision avec régularisation annuelle' })}
              className="text-terracotta focus:ring-terracotta/30"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Provision avec régularisation annuelle
              </p>
              <p className="text-xs text-stone-500">Ajustement annuel selon les charges réelles</p>
            </div>
          </label>
          <label
            className={[
              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
              isMeuble
                ? 'border-stone-200 hover:bg-stone-50'
                : 'border-stone-100 opacity-50 cursor-not-allowed',
            ].join(' ')}
          >
            <input
              type="radio"
              name="charges_mode"
              checked={data.charges_mode === 'Forfait'}
              onChange={() => isMeuble && onChange({ charges_mode: 'Forfait' })}
              disabled={!isMeuble}
              className="text-terracotta focus:ring-terracotta/30"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Forfait</p>
              <p className="text-xs text-stone-500">
                {isMeuble
                  ? 'Montant fixe sans régularisation'
                  : 'Uniquement disponible en location meublée'}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Dépôt de garantie */}
      <div className="rounded-xl bg-stone-50 p-4">
        <p className="text-xs text-stone-500 mb-1">Dépôt de garantie</p>
        {isMobilite ? (
          <p className="text-sm font-semibold text-amber-700">
            Aucun dépôt — Bail mobilité
          </p>
        ) : (
          <>
            <p className="text-lg font-bold tabular-nums text-slate-900">
              {formatCurrency(data.deposit_amount)}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {isMeuble ? '2 mois de loyer HC' : '1 mois de loyer HC'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
