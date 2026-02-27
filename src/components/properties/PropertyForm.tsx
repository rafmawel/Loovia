'use client';

// Formulaire multi-sections pour créer/modifier un bien immobilier
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { propertySchema, type PropertyFormData } from '@/lib/validators/property';
import { propertyTypes, furnishedTypes } from '@/lib/design-system';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import {
  Home, MapPin, Utensils, Warehouse, Thermometer, Shield, Wallet, Image, Save, X,
} from 'lucide-react';
import type { Property } from '@/types';

interface PropertyFormProps {
  /** Bien existant pour le mode édition (null = création) */
  property?: Property | null;
  /** Callback de fermeture */
  onClose: () => void;
}

// Valeurs par défaut pour un nouveau bien
const defaultValues: PropertyFormData = {
  name: '',
  address: '',
  city: '',
  postal_code: '',
  building: '',
  floor: '',
  door: '',
  property_type: 'Appartement',
  furnished_type: 'Location vide',
  surface: null,
  number_of_rooms: null,
  kitchen_type: '',
  kitchen_equipment: [],
  has_cellar: false,
  cellar_number: '',
  has_parking: false,
  parking_type: '',
  parking_number: '',
  has_balcony: false,
  balcony_surface: null,
  has_terrace: false,
  terrace_surface: null,
  has_garden: false,
  garden_surface: null,
  garden_type: '',
  has_attic: false,
  heating_type: '',
  heating_energy: '',
  hot_water_type: '',
  hot_water_energy: '',
  charges_included: [],
  charges_other: '',
  glazing_type: '',
  shutters_type: '',
  has_intercom: false,
  has_fiber: false,
  rent_amount: 0,
  charges_amount: 0,
  deposit_amount: 0,
  image_url: '',
  images: [],
};

// Convertir un Property existant en PropertyFormData
function propertyToFormData(p: Property): PropertyFormData {
  return {
    name: p.name,
    address: p.address,
    city: p.city,
    postal_code: p.postal_code,
    building: p.building || '',
    floor: p.floor || '',
    door: p.door || '',
    property_type: p.property_type,
    furnished_type: p.furnished_type,
    surface: p.surface ?? null,
    number_of_rooms: p.number_of_rooms ?? null,
    kitchen_type: p.kitchen_type || '',
    kitchen_equipment: p.kitchen_equipment || [],
    has_cellar: p.has_cellar,
    cellar_number: p.cellar_number || '',
    has_parking: p.has_parking,
    parking_type: p.parking_type || '',
    parking_number: p.parking_number || '',
    has_balcony: p.has_balcony,
    balcony_surface: p.balcony_surface ?? null,
    has_terrace: p.has_terrace,
    terrace_surface: p.terrace_surface ?? null,
    has_garden: p.has_garden,
    garden_surface: p.garden_surface ?? null,
    garden_type: p.garden_type || '',
    has_attic: p.has_attic,
    heating_type: p.heating_type || '',
    heating_energy: p.heating_energy || '',
    hot_water_type: p.hot_water_type || '',
    hot_water_energy: p.hot_water_energy || '',
    charges_included: p.charges_included || [],
    charges_other: p.charges_other || '',
    glazing_type: p.glazing_type || '',
    shutters_type: p.shutters_type || '',
    has_intercom: p.has_intercom,
    has_fiber: p.has_fiber,
    rent_amount: p.rent_amount,
    charges_amount: p.charges_amount,
    deposit_amount: p.deposit_amount,
    image_url: p.image_url || '',
    images: p.images || [],
  };
}

export default function PropertyForm({ property, onClose }: PropertyFormProps) {
  const isEditing = !!property;
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<PropertyFormData>(
    property ? propertyToFormData(property) : defaultValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Mettre à jour un champ du formulaire
  function updateField<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  // Toggle pour les booléens
  function toggleField(key: keyof PropertyFormData) {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Nettoyage des champs vides → null pour la BDD
    const cleaned = {
      ...form,
      building: form.building || null,
      floor: form.floor || null,
      door: form.door || null,
      kitchen_type: form.kitchen_type || null,
      cellar_number: form.cellar_number || null,
      parking_type: form.parking_type || null,
      parking_number: form.parking_number || null,
      garden_type: form.garden_type || null,
      heating_type: form.heating_type || null,
      heating_energy: form.heating_energy || null,
      hot_water_type: form.hot_water_type || null,
      hot_water_energy: form.hot_water_energy || null,
      charges_other: form.charges_other || null,
      glazing_type: form.glazing_type || null,
      shutters_type: form.shutters_type || null,
      image_url: form.image_url || null,
      surface: form.surface || null,
      number_of_rooms: form.number_of_rooms || null,
      balcony_surface: form.balcony_surface || null,
      terrace_surface: form.terrace_surface || null,
      garden_surface: form.garden_surface || null,
    };

    // Validation Zod
    const result = propertySchema.safeParse(cleaned);
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
      if (isEditing && property) {
        const { error } = await supabase
          .from('properties')
          .update(result.data)
          .eq('id', property.id);

        if (error) throw new Error(error.message);
        toast.success('Bien modifié avec succès');
        router.refresh();
        onClose();
      } else {
        const { data, error } = await supabase
          .from('properties')
          .insert(result.data)
          .select()
          .single();

        if (error) throw new Error(error.message);
        toast.success('Bien ajouté avec succès');
        router.push(`/biens/${data.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // Sections du formulaire
  const sections = [
    { icon: MapPin, label: 'Localisation' },
    { icon: Home, label: 'Description' },
    { icon: Utensils, label: 'Cuisine' },
    { icon: Warehouse, label: 'Annexes' },
    { icon: Thermometer, label: 'Énergie' },
    { icon: Shield, label: 'Confort' },
    { icon: Wallet, label: 'Finances' },
    { icon: Image, label: 'Photos' },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-hidden flex flex-col">
      {/* Navigation des sections */}
      <div className="flex gap-1 overflow-x-auto pb-4 mb-4 border-b border-stone-100 shrink-0">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveSection(index)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === index
                  ? 'bg-terracotta/10 text-terracotta'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Contenu de la section active */}
      <div className="overflow-y-auto flex-1 pr-1">
        {/* Section 0 : Localisation */}
        {activeSection === 0 && (
          <div className="space-y-4 animate-in">
            <Input
              label="Nom du bien *"
              placeholder="Ex: Appartement Montmartre"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
            />
            <Input
              label="Adresse *"
              placeholder="12 rue de la Paix"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              error={errors.address}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ville *"
                placeholder="Paris"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                error={errors.city}
              />
              <Input
                label="Code postal *"
                placeholder="75001"
                value={form.postal_code}
                onChange={(e) => updateField('postal_code', e.target.value)}
                error={errors.postal_code}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Bâtiment"
                placeholder="A"
                value={form.building || ''}
                onChange={(e) => updateField('building', e.target.value)}
              />
              <Input
                label="Étage"
                placeholder="3e"
                value={form.floor || ''}
                onChange={(e) => updateField('floor', e.target.value)}
              />
              <Input
                label="Porte"
                placeholder="302"
                value={form.door || ''}
                onChange={(e) => updateField('door', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Section 1 : Description */}
        {activeSection === 1 && (
          <div className="space-y-4 animate-in">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type de bien"
                options={propertyTypes.map((t) => ({ value: t, label: t }))}
                value={form.property_type}
                onChange={(e) => updateField('property_type', e.target.value)}
              />
              <Select
                label="Type de location"
                options={furnishedTypes.map((t) => ({ value: t, label: t }))}
                value={form.furnished_type}
                onChange={(e) => updateField('furnished_type', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Surface (m²)"
                type="number"
                placeholder="65"
                value={form.surface ?? ''}
                onChange={(e) => updateField('surface', e.target.value ? Number(e.target.value) : null)}
                error={errors.surface}
              />
              <Input
                label="Nombre de pièces"
                type="number"
                placeholder="3"
                value={form.number_of_rooms ?? ''}
                onChange={(e) => updateField('number_of_rooms', e.target.value ? Number(e.target.value) : null)}
                error={errors.number_of_rooms}
              />
            </div>
          </div>
        )}

        {/* Section 2 : Cuisine */}
        {activeSection === 2 && (
          <div className="space-y-4 animate-in">
            <Select
              label="Type de cuisine"
              placeholder="Sélectionner..."
              options={[
                { value: 'Séparée', label: 'Séparée' },
                { value: 'Américaine', label: 'Américaine (ouverte)' },
                { value: 'Kitchenette', label: 'Kitchenette' },
                { value: 'Équipée', label: 'Équipée' },
              ]}
              value={form.kitchen_type || ''}
              onChange={(e) => updateField('kitchen_type', e.target.value)}
            />
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">Équipements de cuisine</p>
              <div className="grid grid-cols-2 gap-2">
                {['Réfrigérateur', 'Four', 'Micro-ondes', 'Lave-vaisselle', 'Plaques de cuisson', 'Hotte', 'Congélateur', 'Lave-linge'].map((equip) => (
                  <label key={equip} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.kitchen_equipment.includes(equip)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('kitchen_equipment', [...form.kitchen_equipment, equip]);
                        } else {
                          updateField('kitchen_equipment', form.kitchen_equipment.filter((i) => i !== equip));
                        }
                      }}
                      className="rounded border-stone-300 text-terracotta focus:ring-terracotta"
                    />
                    <span className="text-sm text-slate-900">{equip}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3 : Annexes */}
        {activeSection === 3 && (
          <div className="space-y-4 animate-in">
            {/* Cave */}
            <div className="p-4 rounded-xl border border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_cellar} onChange={() => toggleField('has_cellar')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Cave</span>
              </label>
              {form.has_cellar && (
                <div className="mt-3 pl-7">
                  <Input label="Numéro" placeholder="C12" value={form.cellar_number || ''} onChange={(e) => updateField('cellar_number', e.target.value)} />
                </div>
              )}
            </div>

            {/* Parking */}
            <div className="p-4 rounded-xl border border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_parking} onChange={() => toggleField('has_parking')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Parking</span>
              </label>
              {form.has_parking && (
                <div className="mt-3 pl-7 grid grid-cols-2 gap-3">
                  <Select label="Type" options={[{ value: 'Intérieur', label: 'Intérieur' }, { value: 'Extérieur', label: 'Extérieur' }, { value: 'Box', label: 'Box fermé' }]}
                    value={form.parking_type || ''} onChange={(e) => updateField('parking_type', e.target.value)} placeholder="Type..." />
                  <Input label="Numéro" placeholder="P5" value={form.parking_number || ''} onChange={(e) => updateField('parking_number', e.target.value)} />
                </div>
              )}
            </div>

            {/* Balcon */}
            <div className="p-4 rounded-xl border border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_balcony} onChange={() => toggleField('has_balcony')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Balcon</span>
              </label>
              {form.has_balcony && (
                <div className="mt-3 pl-7">
                  <Input label="Surface (m²)" type="number" value={form.balcony_surface ?? ''} onChange={(e) => updateField('balcony_surface', e.target.value ? Number(e.target.value) : null)} />
                </div>
              )}
            </div>

            {/* Terrasse */}
            <div className="p-4 rounded-xl border border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_terrace} onChange={() => toggleField('has_terrace')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Terrasse</span>
              </label>
              {form.has_terrace && (
                <div className="mt-3 pl-7">
                  <Input label="Surface (m²)" type="number" value={form.terrace_surface ?? ''} onChange={(e) => updateField('terrace_surface', e.target.value ? Number(e.target.value) : null)} />
                </div>
              )}
            </div>

            {/* Jardin */}
            <div className="p-4 rounded-xl border border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_garden} onChange={() => toggleField('has_garden')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Jardin</span>
              </label>
              {form.has_garden && (
                <div className="mt-3 pl-7 grid grid-cols-2 gap-3">
                  <Input label="Surface (m²)" type="number" value={form.garden_surface ?? ''} onChange={(e) => updateField('garden_surface', e.target.value ? Number(e.target.value) : null)} />
                  <Select label="Type" options={[{ value: 'Privatif', label: 'Privatif' }, { value: 'Commun', label: 'Commun' }]}
                    value={form.garden_type || ''} onChange={(e) => updateField('garden_type', e.target.value)} placeholder="Type..." />
                </div>
              )}
            </div>

            {/* Grenier */}
            <div className="p-4 rounded-xl border border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_attic} onChange={() => toggleField('has_attic')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Grenier</span>
              </label>
            </div>
          </div>
        )}

        {/* Section 4 : Énergie (chauffage + eau chaude) */}
        {activeSection === 4 && (
          <div className="space-y-4 animate-in">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Type de chauffage" placeholder="Sélectionner..." options={[
                { value: 'Individuel', label: 'Individuel' }, { value: 'Collectif', label: 'Collectif' },
                { value: 'Mixte', label: 'Mixte' },
              ]} value={form.heating_type || ''} onChange={(e) => updateField('heating_type', e.target.value)} />
              <Select label="Énergie chauffage" placeholder="Sélectionner..." options={[
                { value: 'Gaz', label: 'Gaz' }, { value: 'Électrique', label: 'Électrique' },
                { value: 'Fioul', label: 'Fioul' }, { value: 'Bois', label: 'Bois' },
                { value: 'Pompe à chaleur', label: 'Pompe à chaleur' },
              ]} value={form.heating_energy || ''} onChange={(e) => updateField('heating_energy', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Eau chaude" placeholder="Sélectionner..." options={[
                { value: 'Individuelle', label: 'Individuelle' }, { value: 'Collective', label: 'Collective' },
              ]} value={form.hot_water_type || ''} onChange={(e) => updateField('hot_water_type', e.target.value)} />
              <Select label="Énergie eau chaude" placeholder="Sélectionner..." options={[
                { value: 'Gaz', label: 'Gaz' }, { value: 'Électrique', label: 'Électrique' },
                { value: 'Solaire', label: 'Solaire' },
              ]} value={form.hot_water_energy || ''} onChange={(e) => updateField('hot_water_energy', e.target.value)} />
            </div>
          </div>
        )}

        {/* Section 5 : Confort */}
        {activeSection === 5 && (
          <div className="space-y-4 animate-in">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Type de vitrage" placeholder="Sélectionner..." options={[
                { value: 'Simple', label: 'Simple vitrage' }, { value: 'Double', label: 'Double vitrage' },
                { value: 'Triple', label: 'Triple vitrage' },
              ]} value={form.glazing_type || ''} onChange={(e) => updateField('glazing_type', e.target.value)} />
              <Select label="Type de volets" placeholder="Sélectionner..." options={[
                { value: 'Roulants', label: 'Roulants' }, { value: 'Battants', label: 'Battants' },
                { value: 'Persiennes', label: 'Persiennes' }, { value: 'Aucun', label: 'Aucun' },
              ]} value={form.shutters_type || ''} onChange={(e) => updateField('shutters_type', e.target.value)} />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
                <input type="checkbox" checked={form.has_intercom} onChange={() => toggleField('has_intercom')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Interphone / Digicode</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
                <input type="checkbox" checked={form.has_fiber} onChange={() => toggleField('has_fiber')}
                  className="rounded border-stone-300 text-terracotta focus:ring-terracotta" />
                <span className="text-sm font-medium text-slate-900">Fibre optique disponible</span>
              </label>
            </div>
            <Input
              label="Charges incluses (autres)"
              placeholder="Eau froide, ordures ménagères..."
              value={form.charges_other || ''}
              onChange={(e) => updateField('charges_other', e.target.value)}
            />
          </div>
        )}

        {/* Section 6 : Finances */}
        {activeSection === 6 && (
          <div className="space-y-4 animate-in">
            <Input
              label="Loyer mensuel HC *"
              type="number"
              placeholder="850"
              value={form.rent_amount || ''}
              onChange={(e) => updateField('rent_amount', Number(e.target.value))}
              error={errors.rent_amount}
              helperText="Hors charges, en euros"
            />
            <Input
              label="Provisions sur charges"
              type="number"
              placeholder="50"
              value={form.charges_amount || ''}
              onChange={(e) => updateField('charges_amount', Number(e.target.value))}
              error={errors.charges_amount}
              helperText="Provision mensuelle sur charges"
            />
            <Input
              label="Dépôt de garantie"
              type="number"
              placeholder="850"
              value={form.deposit_amount || ''}
              onChange={(e) => updateField('deposit_amount', Number(e.target.value))}
              error={errors.deposit_amount}
            />
            {(form.rent_amount > 0 || form.charges_amount > 0) && (
              <div className="p-4 rounded-xl bg-terracotta/5 border border-terracotta/20">
                <p className="text-sm text-stone-500">Total mensuel</p>
                <p className="text-xl font-bold tabular-nums text-terracotta">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    (form.rent_amount || 0) + (form.charges_amount || 0)
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 7 : Photos */}
        {activeSection === 7 && (
          <div className="space-y-4 animate-in">
            <Input
              label="URL de la photo principale"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={form.image_url || ''}
              onChange={(e) => updateField('image_url', e.target.value)}
              error={errors.image_url}
              helperText="Collez l'URL d'une image. Le stockage direct sera disponible prochainement."
            />
            {form.image_url && (
              <div className="relative rounded-xl overflow-hidden border border-stone-200">
                <img
                  src={form.image_url}
                  alt="Aperçu"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barre d'actions sticky en bas */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100 shrink-0">
        <Button type="button" variant="ghost" onClick={onClose} icon={<X className="h-4 w-4" />}>
          Annuler
        </Button>
        <div className="flex items-center gap-3">
          {/* Indicateur de progression */}
          <span className="text-xs text-stone-400">
            {activeSection + 1}/{sections.length}
          </span>
          {activeSection < sections.length - 1 && (
            <Button type="button" variant="secondary" onClick={() => setActiveSection((s) => s + 1)}>
              Suivant
            </Button>
          )}
          <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
            {isEditing ? 'Enregistrer' : 'Créer le bien'}
          </Button>
        </div>
      </div>
    </form>
  );
}
