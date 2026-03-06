'use client';

// Formulaire de création/modification d'un locataire
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { tenantSchema, type TenantFormData } from '@/lib/validators/tenant';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { Save, X, Plus, Trash2, Users } from 'lucide-react';
import type { Property, Tenant, CoTenant } from '@/types';

interface TenantFormProps {
  tenant?: Tenant | null;
  propertyId?: string | null;
  onClose: () => void;
}

const emptyCoTenant: CoTenant = {
  first_name: '',
  last_name: '',
  date_of_birth: null,
  relationship_type: null,
};

const defaultValues: TenantFormData = {
  property_id: null,
  first_name: '',
  last_name: '',
  date_of_birth: null,
  nationality: null,
  profession: null,
  email: '',
  phone: null,
  start_date: '',
  end_date: null,
  rent_amount: 0,
  co_tenants: [],
  relationship_type: null,
  payment_status: 'pending',
  last_known_iban: null,
};

function tenantToFormData(t: Tenant): TenantFormData {
  return {
    property_id: t.property_id || null,
    first_name: t.first_name,
    last_name: t.last_name,
    date_of_birth: t.date_of_birth || null,
    nationality: t.nationality || null,
    profession: t.profession || null,
    email: t.email,
    phone: t.phone || null,
    start_date: t.start_date,
    end_date: t.end_date || null,
    rent_amount: t.rent_amount,
    co_tenants: t.co_tenants || [],
    relationship_type: t.relationship_type || null,
    payment_status: t.payment_status,
    last_known_iban: t.last_known_iban || null,
  };
}

export default function TenantForm({ tenant, propertyId, onClose }: TenantFormProps) {
  const isEditing = !!tenant;
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<TenantFormData>(
    tenant ? tenantToFormData(tenant) : { ...defaultValues, property_id: propertyId || null }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [hasCoTenants, setHasCoTenants] = useState(
    tenant ? (tenant.co_tenants?.length ?? 0) > 0 : false
  );

  // Biens libres (pas de locataire actif)
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    async function fetchAvailableProperties() {
      setLoadingProperties(true);

      // Récupérer tous les biens et les locataires actifs
      const [propsRes, tenantsRes] = await Promise.all([
        supabase.from('properties').select('*').order('name'),
        supabase.from('tenants').select('id, property_id').is('end_date', null),
      ]);

      const allProperties = (propsRes.data as Property[]) || [];
      const activeTenants = (tenantsRes.data || []) as { id: string; property_id: string | null }[];

      // IDs des biens occupés (sauf par le locataire en édition)
      const occupiedIds = new Set(
        activeTenants
          .filter((t) => t.property_id && t.id !== tenant?.id)
          .map((t) => t.property_id!)
      );

      // Biens libres + le bien déjà associé au locataire en édition
      const available = allProperties.filter(
        (p) => !occupiedIds.has(p.id) || p.id === tenant?.property_id
      );

      setAvailableProperties(available);
      setLoadingProperties(false);

      // Auto-remplissage du loyer si propertyId pré-rempli
      if (propertyId && !tenant) {
        const prop = available.find((p) => p.id === propertyId);
        if (prop) {
          setForm((prev) => ({ ...prev, rent_amount: prop.rent_amount }));
        }
      }
    }

    fetchAvailableProperties();
  }, [supabase, tenant?.id, tenant?.property_id, propertyId, tenant]);

  function updateField<K extends keyof TenantFormData>(key: K, value: TenantFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  // Auto-remplissage du loyer quand un bien est sélectionné
  function handlePropertyChange(propertyId: string) {
    updateField('property_id', propertyId || null);
    if (propertyId) {
      const selectedProperty = availableProperties.find((p) => p.id === propertyId);
      if (selectedProperty) {
        updateField('rent_amount', selectedProperty.rent_amount);
      }
    }
  }

  // Gestion des co-locataires
  function addCoTenant() {
    setForm((prev) => ({
      ...prev,
      co_tenants: [...prev.co_tenants, { ...emptyCoTenant }],
    }));
  }

  function removeCoTenant(index: number) {
    setForm((prev) => ({
      ...prev,
      co_tenants: prev.co_tenants.filter((_, i) => i !== index),
    }));
  }

  function updateCoTenant(index: number, field: keyof CoTenant, value: string | null) {
    setForm((prev) => ({
      ...prev,
      co_tenants: prev.co_tenants.map((co, i) =>
        i === index ? { ...co, [field]: value } : co
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const cleaned = {
      ...form,
      property_id: form.property_id || null,
      date_of_birth: form.date_of_birth || null,
      nationality: form.nationality || null,
      profession: form.profession || null,
      phone: form.phone || null,
      end_date: form.end_date || null,
      relationship_type: form.relationship_type || null,
      last_known_iban: form.last_known_iban || null,
      co_tenants: hasCoTenants ? form.co_tenants : [],
    };

    const result = tenantSchema.safeParse(cleaned);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setLoading(false);
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      if (isEditing && tenant) {
        const { error } = await supabase
          .from('tenants')
          .update(result.data)
          .eq('id', tenant.id);

        if (error) throw new Error(error.message);
        toast.success('Locataire modifié avec succès');
        router.refresh();
        onClose();
      } else {
        const { data, error } = await supabase
          .from('tenants')
          .insert(result.data)
          .select()
          .single();

        if (error) throw new Error(error.message);
        toast.success('Locataire ajouté avec succès');
        router.push(`/locataires/${data.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-hidden flex flex-col">
      <div className="overflow-y-auto flex-1 pr-1 space-y-6">
        {/* Bien associé */}
        <div>
          <Select
            label="Bien associé"
            placeholder={loadingProperties ? 'Chargement...' : 'Sélectionner un bien libre...'}
            options={availableProperties.map((p) => ({
              value: p.id,
              label: `${p.name} — ${p.address}, ${p.city}`,
            }))}
            value={form.property_id || ''}
            onChange={(e) => handlePropertyChange(e.target.value)}
            error={errors.property_id}
            disabled={loadingProperties}
          />
          {form.property_id && (
            <p className="text-xs text-stone-500 mt-1">
              Loyer du bien auto-rempli : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(form.rent_amount)}
            </p>
          )}
        </div>

        {/* Informations personnelles */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Informations personnelles</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom *"
                placeholder="Jean"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                error={errors.first_name}
              />
              <Input
                label="Nom *"
                placeholder="Dupont"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                error={errors.last_name}
              />
            </div>

            <Input
              label="Email *"
              type="email"
              placeholder="jean.dupont@email.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Téléphone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={form.phone || ''}
                onChange={(e) => updateField('phone', e.target.value || null)}
              />
              <Input
                label="Date de naissance"
                type="date"
                value={form.date_of_birth || ''}
                onChange={(e) => updateField('date_of_birth', e.target.value || null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nationalité"
                placeholder="Française"
                value={form.nationality || ''}
                onChange={(e) => updateField('nationality', e.target.value || null)}
              />
              <Input
                label="Profession"
                placeholder="Ingénieur"
                value={form.profession || ''}
                onChange={(e) => updateField('profession', e.target.value || null)}
              />
            </div>
          </div>
        </div>

        {/* Bail */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Bail</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date d'entrée *"
                type="date"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                error={errors.start_date}
              />
              <Input
                label="Loyer mensuel (€) *"
                type="number"
                placeholder="850"
                min={0}
                step={0.01}
                value={form.rent_amount || ''}
                onChange={(e) => updateField('rent_amount', Number(e.target.value))}
                error={errors.rent_amount}
              />
            </div>
          </div>
        </div>

        {/* Co-locataires */}
        <div>
          <div className="p-4 rounded-xl border border-stone-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasCoTenants}
                onChange={(e) => {
                  setHasCoTenants(e.target.checked);
                  if (!e.target.checked) {
                    updateField('co_tenants', []);
                  }
                }}
                className="rounded border-stone-300 text-terracotta focus:ring-terracotta"
              />
              <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-stone-400" />
                Plusieurs locataires ?
              </span>
            </label>

            {hasCoTenants && (
              <div className="mt-4 space-y-4">
                {form.co_tenants.map((co, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-stone-500">
                        Co-locataire {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeCoTenant(index)}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Prénom *"
                        placeholder="Marie"
                        value={co.first_name}
                        onChange={(e) => updateCoTenant(index, 'first_name', e.target.value)}
                        error={errors[`co_tenants.${index}.first_name`]}
                      />
                      <Input
                        label="Nom *"
                        placeholder="Martin"
                        value={co.last_name}
                        onChange={(e) => updateCoTenant(index, 'last_name', e.target.value)}
                        error={errors[`co_tenants.${index}.last_name`]}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Date de naissance"
                        type="date"
                        value={co.date_of_birth || ''}
                        onChange={(e) =>
                          updateCoTenant(index, 'date_of_birth', e.target.value || null)
                        }
                      />
                      <Select
                        label="Relation"
                        placeholder="Type..."
                        options={[
                          { value: 'Colocation', label: 'Colocation' },
                          { value: 'Couple', label: 'Couple' },
                          { value: 'Famille', label: 'Famille' },
                        ]}
                        value={co.relationship_type || ''}
                        onChange={(e) =>
                          updateCoTenant(
                            index,
                            'relationship_type',
                            (e.target.value as CoTenant['relationship_type']) || null
                          )
                        }
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCoTenant}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-terracotta hover:bg-terracotta/5 rounded-lg transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter un co-locataire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100 shrink-0">
        <Button type="button" variant="ghost" onClick={onClose} icon={<X className="h-4 w-4" />}>
          Annuler
        </Button>
        <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
          {isEditing ? 'Enregistrer' : 'Ajouter le locataire'}
        </Button>
      </div>
    </form>
  );
}
