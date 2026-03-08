'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { Property, Tenant } from '@/types';

import StepTypeBail from './steps/StepTypeBail';
import StepParties from './steps/StepParties';
import StepLogement from './steps/StepLogement';
import StepFinances from './steps/StepFinances';
import StepDuree from './steps/StepDuree';
import StepIRL from './steps/StepIRL';
import StepDiagnostics from './steps/StepDiagnostics';

// --- Types pour le wizard ---

export type LeaseType = 'vide' | 'meuble' | 'colocation' | 'etudiant' | 'mobilite';

export interface LeaseWizardData {
  // Étape 0 — Type de bail
  lease_type: LeaseType;

  // Étape 1 — Parties
  landlord_type: string;
  landlord_name: string;
  landlord_address: string;
  tenant_id: string;
  tenant_first_name: string;
  tenant_last_name: string;
  tenant_date_of_birth: string;
  tenant_email: string;
  tenant_phone: string;
  has_cotenants: boolean;
  cotenants: { first_name: string; last_name: string; date_of_birth?: string; email?: string; phone?: string; relationship_type?: string }[];

  // Étape 2 — Logement
  property_id: string;
  property_address: string;
  property_city: string;
  property_postal_code: string;
  property_building: string;
  property_floor: string;
  property_door: string;
  property_surface: number;
  property_rooms: number;
  location_type: string;

  // Étape 3 — Finances
  monthly_rent: number;
  charges_amount: number;
  charges_mode: string;
  deposit_amount: number;

  // Étape 4 — Durée
  start_date: string;
  duration_years: number;
  duration_months: number;
  end_date: string;
  is_mobility_lease: boolean;
  tacit_renewal: boolean;

  // Étape 5 — IRL
  irl_enabled: boolean;
  irl_quarter: string;
  irl_year: number;

  // Étape 6 — Diagnostics
  construction_year: number | null;
  electrical_age: number | null;
  gas_age: number | null;
  diag_dpe: boolean;
  diag_erp: boolean;
  diag_crep: boolean;
  diag_amiante: boolean;
  diag_electricite: boolean;
  diag_gaz: boolean;
  diag_carrez: boolean;
  insurance_required: boolean;
  solidarity_clause: boolean;
  special_clauses: string;
}

const INITIAL_DATA: LeaseWizardData = {
  lease_type: 'vide',
  landlord_type: 'Personne physique',
  landlord_name: '',
  landlord_address: '',
  tenant_id: '',
  tenant_first_name: '',
  tenant_last_name: '',
  tenant_date_of_birth: '',
  tenant_email: '',
  tenant_phone: '',
  has_cotenants: false,
  cotenants: [],

  property_id: '',
  property_address: '',
  property_city: '',
  property_postal_code: '',
  property_building: '',
  property_floor: '',
  property_door: '',
  property_surface: 0,
  property_rooms: 0,
  location_type: 'Location vide',

  monthly_rent: 0,
  charges_amount: 0,
  charges_mode: 'Provision avec régularisation annuelle',
  deposit_amount: 0,

  start_date: '',
  duration_years: 3,
  duration_months: 0,
  end_date: '',
  is_mobility_lease: false,
  tacit_renewal: true,

  irl_enabled: true,
  irl_quarter: 'T1',
  irl_year: new Date().getFullYear(),

  construction_year: null,
  electrical_age: null,
  gas_age: null,
  diag_dpe: true,
  diag_erp: true,
  diag_crep: false,
  diag_amiante: false,
  diag_electricite: false,
  diag_gaz: false,
  diag_carrez: false,
  insurance_required: true,
  solidarity_clause: false,
  special_clauses: '',
};

const STEPS = [
  { number: 1, label: 'Type' },
  { number: 2, label: 'Parties' },
  { number: 3, label: 'Logement' },
  { number: 4, label: 'Finances' },
  { number: 5, label: 'Durée' },
  { number: 6, label: 'IRL' },
  { number: 7, label: 'Diagnostics' },
];

interface LeaseWizardProps {
  open: boolean;
  onClose: () => void;
  tenants: Tenant[];
  properties: Property[];
  userMetadata?: { first_name?: string; last_name?: string; [key: string]: unknown };
  initialPropertyId?: string;
  initialTenantId?: string;
}

export default function LeaseWizard({
  open,
  onClose,
  tenants,
  properties,
  userMetadata,
  initialPropertyId,
  initialTenantId,
}: LeaseWizardProps) {
  const [step, setStep] = useState(1);

  // Pré-remplissage depuis les props initiales
  const buildInitialData = useCallback((): LeaseWizardData => {
    const initial = { ...INITIAL_DATA };

    if (initialPropertyId) {
      const prop = properties.find((p) => p.id === initialPropertyId);
      if (prop) {
        initial.property_id = prop.id;
        initial.property_address = prop.address;
        initial.property_city = prop.city;
        initial.property_postal_code = prop.postal_code;
        initial.property_building = prop.building || '';
        initial.property_floor = prop.floor || '';
        initial.property_door = prop.door || '';
        initial.property_surface = prop.surface || 0;
        initial.property_rooms = prop.number_of_rooms || 0;
        initial.location_type = prop.furnished_type || 'Location vide';
        initial.monthly_rent = prop.rent_amount || 0;
        initial.charges_amount = prop.charges_amount || 0;
        initial.deposit_amount = prop.deposit_amount || 0;
      }
    }

    if (initialTenantId) {
      const tenant = tenants.find((t) => t.id === initialTenantId);
      if (tenant) {
        initial.tenant_id = tenant.id;
        initial.tenant_first_name = tenant.first_name;
        initial.tenant_last_name = tenant.last_name;
        initial.tenant_date_of_birth = tenant.date_of_birth || '';
      }
    }

    return initial;
  }, [initialPropertyId, initialTenantId, properties, tenants]);

  const [data, setData] = useState<LeaseWizardData>(buildInitialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Mise à jour des données
  const updateData = useCallback((partial: Partial<LeaseWizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    // Effacer les erreurs des champs modifiés
    const keys = Object.keys(partial);
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // Validation par étape
  const validateStep = useCallback((): boolean => {
    const errs: Record<string, string> = {};

    // Step 1 = Type (always valid)

    if (step === 2) {
      if (!data.landlord_name.trim()) errs.landlord_name = 'Nom requis';
      if (!data.landlord_address.trim()) errs.landlord_address = 'Adresse requise';
      if (!data.tenant_id) {
        if (!data.tenant_first_name.trim()) errs.tenant_first_name = 'Prénom requis';
        if (!data.tenant_last_name.trim()) errs.tenant_last_name = 'Nom requis';
        if (!data.tenant_email?.trim()) errs.tenant_email = 'Email requis';
      }
    }

    if (step === 3) {
      if (!data.property_id) errs.property_id = 'Sélectionnez un bien';
    }

    if (step === 4) {
      if (data.monthly_rent <= 0) errs.monthly_rent = 'Le loyer doit être positif';
    }

    if (step === 5) {
      if (!data.start_date) errs.start_date = 'Date requise';
      if (data.lease_type === 'mobilite' && data.duration_months < 1) {
        errs.duration_months = 'Minimum 1 mois';
      }
      if (data.lease_type === 'mobilite' && data.duration_months > 10) {
        errs.duration_months = 'Maximum 10 mois';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, data]);

  // Navigation
  const goNext = useCallback(() => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 7));
    }
  }, [validateStep]);

  const goPrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // Soumission finale
  const handleSubmit = useCallback(async () => {
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Non authentifié');

      // Créer le locataire automatiquement si c'est un nouveau
      let tenantId = data.tenant_id;
      if (!tenantId) {
        const { data: newTenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            user_id: userData.user.id,
            property_id: data.property_id || null,
            first_name: data.tenant_first_name,
            last_name: data.tenant_last_name,
            email: data.tenant_email,
            phone: data.tenant_phone || null,
            date_of_birth: data.tenant_date_of_birth || null,
            start_date: data.start_date || new Date().toISOString().split('T')[0],
            rent_amount: data.monthly_rent || 0,
            co_tenants: data.cotenants,
            relationship_type: data.cotenants.length > 0 ? 'Colocation' : null,
            payment_status: 'pending',
          })
          .select()
          .single();

        if (tenantError) throw new Error(tenantError.message);
        tenantId = newTenant.id;
      }

      const { data: lease, error } = await supabase
        .from('leases')
        .insert({
          user_id: userData.user.id,
          property_id: data.property_id,
          tenant_id: tenantId,
          status: 'draft',
          monthly_rent: data.monthly_rent,
          charges_amount: data.charges_amount,
          start_date: data.start_date,
          end_date: data.end_date || null,
          data: {
            lease_type: data.lease_type,
            landlord_type: data.landlord_type,
            landlord_name: data.landlord_name,
            landlord_address: data.landlord_address,
            tenant_first_name: data.tenant_first_name,
            tenant_last_name: data.tenant_last_name,
            tenant_date_of_birth: data.tenant_date_of_birth,
            has_cotenants: data.has_cotenants,
            cotenants: data.cotenants,
            property_address: data.property_address,
            property_city: data.property_city,
            property_postal_code: data.property_postal_code,
            property_building: data.property_building,
            property_floor: data.property_floor,
            property_door: data.property_door,
            property_surface: data.property_surface,
            property_rooms: data.property_rooms,
            location_type: data.location_type,
            charges_mode: data.charges_mode,
            deposit_amount: data.deposit_amount,
            duration_years: data.duration_years,
            duration_months: data.duration_months,
            is_mobility_lease: data.is_mobility_lease,
            tacit_renewal: data.tacit_renewal,
            irl_enabled: data.irl_enabled,
            irl_quarter: data.irl_quarter,
            irl_year: data.irl_year,
            construction_year: data.construction_year,
            electrical_age: data.electrical_age,
            gas_age: data.gas_age,
            diag_dpe: data.diag_dpe,
            diag_erp: data.diag_erp,
            diag_crep: data.diag_crep,
            diag_amiante: data.diag_amiante,
            diag_electricite: data.diag_electricite,
            diag_gaz: data.diag_gaz,
            diag_carrez: data.diag_carrez,
            insurance_required: data.insurance_required,
            solidarity_clause: data.solidarity_clause,
            special_clauses: data.special_clauses,
          },
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      toast.success('Bail créé en brouillon');
      onClose();
      setStep(1);
      setData(INITIAL_DATA);
      router.push(`/baux/${lease.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création du bail');
    } finally {
      setSubmitting(false);
    }
  }, [data, validateStep, onClose, router]);

  // Reset à la fermeture
  const handleClose = useCallback(() => {
    setStep(1);
    setData(INITIAL_DATA);
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Drawer open={open} onClose={handleClose} title="Nouveau bail" className="!max-w-[600px]">
      {/* Barre de progression */}
      <div className="flex items-center gap-1 mb-6 -mt-2">
        {STEPS.map((s) => (
          <button
            key={s.number}
            type="button"
            onClick={() => {
              if (s.number < step) setStep(s.number);
            }}
            className={[
              'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center',
              s.number === step
                ? 'bg-terracotta/10 text-terracotta border border-terracotta/30'
                : s.number < step
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100'
                  : 'bg-stone-50 text-stone-400 border border-stone-100',
            ].join(' ')}
          >
            <span
              className={[
                'flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold shrink-0',
                s.number === step
                  ? 'bg-terracotta text-white'
                  : s.number < step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-500',
              ].join(' ')}
            >
              {s.number < step ? '✓' : s.number}
            </span>
            <span className="hidden sm:inline truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu de l'étape */}
      <div className="min-h-[400px]">
        {step === 1 && (
          <StepTypeBail data={data} onChange={updateData} />
        )}
        {step === 2 && (
          <StepParties
            data={data}
            errors={errors}
            tenants={tenants}
            userMetadata={userMetadata}
            onChange={updateData}
          />
        )}
        {step === 3 && (
          <StepLogement
            data={data}
            errors={errors}
            properties={properties}
            tenants={tenants}
            onChange={updateData}
          />
        )}
        {step === 4 && (
          <StepFinances data={data} errors={errors} onChange={updateData} />
        )}
        {step === 5 && (
          <StepDuree data={data} errors={errors} onChange={updateData} />
        )}
        {step === 6 && (
          <StepIRL data={data} onChange={updateData} />
        )}
        {step === 7 && (
          <StepDiagnostics data={data} onChange={updateData} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-200/50">
        <Button
          variant="ghost"
          onClick={goPrev}
          disabled={step === 1}
        >
          Précédent
        </Button>

        {step < 7 ? (
          <Button variant="primary" onClick={goNext}>
            Suivant
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Générer le bail
          </Button>
        )}
      </div>
    </Drawer>
  );
}
