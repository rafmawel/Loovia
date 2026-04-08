'use client';

// Formulaire multi-sections pour créer/modifier un bien immobilier
import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { propertySchema, type PropertyFormData } from '@/lib/validators/property';
import { propertyTypes, furnishedTypes, storagePropertyTypes, commercialPropertyTypes } from '@/lib/design-system';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { toast } from 'sonner';
import {
  Home, MapPin, Utensils, Warehouse, Thermometer, Shield, Wallet,
  ImageIcon, Save, X, Upload, Trash2, Building2, Car, Box, Landmark,
} from 'lucide-react';
import type { Property, PropertyLot } from '@/types';

const MAX_PHOTOS_FREE = 3;

interface PropertyFormProps {
  property?: Property | null;
  lots?: PropertyLot[];
  onClose: () => void;
}

// Icônes par type de bien
const typeIcons: Record<string, React.ReactNode> = {
  Appartement: <Building2 className="h-5 w-5" />,
  Maison: <Home className="h-5 w-5" />,
  'Local commercial': <Landmark className="h-5 w-5" />,
  Parking: <Car className="h-5 w-5" />,
  Box: <Box className="h-5 w-5" />,
  Garage: <Car className="h-5 w-5" />,
  Cave: <Warehouse className="h-5 w-5" />,
  Terrain: <MapPin className="h-5 w-5" />,
};

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
  purchase_price: null,
  monthly_payment: null,
  payment_months: null,
  loan_rate: null,
  purchase_date: null,
  notary_fees: null,
  lot_id: null,
  image_url: '',
  images: [],
};

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
    purchase_price: p.purchase_price ?? null,
    monthly_payment: p.monthly_payment ?? null,
    payment_months: p.payment_months ?? null,
    loan_rate: p.loan_rate ?? null,
    purchase_date: p.purchase_date || null,
    notary_fees: p.notary_fees ?? null,
    lot_id: p.lot_id || null,
    image_url: p.image_url || '',
    images: p.images || [],
  };
}

export default function PropertyForm({ property, lots = [], onClose }: PropertyFormProps) {
  const isEditing = !!property;
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PropertyFormData>(
    property ? propertyToFormData(property) : defaultValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [photoFiles, setPhotoFiles] = useState<{ file: File; preview: string }[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const isStorageType = (storagePropertyTypes as readonly string[]).includes(form.property_type);
  const isCommercialType = (commercialPropertyTypes as readonly string[]).includes(form.property_type);
  const [lotEnabled, setLotEnabled] = useState(!!property?.lot_id);
  const [creatingLot, setCreatingLot] = useState(false);
  const [newLotName, setNewLotName] = useState('');

  // Dynamic sections based on property type
  const sections = useMemo(() => {
    const base = [
      { icon: Home, label: 'Type de bien' },
      { icon: MapPin, label: 'Localisation' },
      { icon: Home, label: 'Description' },
    ];

    if (isStorageType) {
      // Storage types: pas de cuisine/annexes/énergie/confort
    } else if (isCommercialType) {
      // Local commercial: pas de cuisine, mais annexes simplifiées et énergie
      base.push(
        { icon: Warehouse, label: 'Annexes' },
        { icon: Thermometer, label: 'Énergie' },
      );
    } else {
      // Habitable types: full form
      base.push(
        { icon: Utensils, label: 'Cuisine' },
        { icon: Warehouse, label: 'Annexes' },
        { icon: Thermometer, label: 'Énergie' },
        { icon: Shield, label: 'Confort' },
      );
    }

    base.push(
      { icon: Wallet, label: 'Finances' },
      { icon: ImageIcon, label: 'Photos' },
    );

    return base;
  }, [isStorageType, isCommercialType]);

  function updateField<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function toggleField(key: keyof PropertyFormData) {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const currentCount = (form.images || []).length + photoFiles.length;
    const remaining = MAX_PHOTOS_FREE - currentCount;

    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS_FREE} photos sans abonnement`);
      return;
    }

    const newFiles: { file: File; preview: string }[] = [];
    const limit = Math.min(files.length, remaining);

    for (let i = 0; i < limit; i++) {
      const file = files[i];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} : format non supporté`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} : dépasse 5 Mo`);
        continue;
      }
      newFiles.push({ file, preview: URL.createObjectURL(file) });
    }

    setPhotoFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhotoFile(index: number) {
    setPhotoFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingImage(index: number) {
    const updated = [...(form.images || [])];
    updated.splice(index, 1);
    updateField('images', updated);
  }

  async function uploadPhotos(): Promise<string[]> {
    if (photoFiles.length === 0) return [];

    const urls: string[] = [];
    for (const { file } of photoFiles) {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur upload');
      urls.push(data.url);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Si on n'est pas sur la dernière section, passer à la suivante au lieu de soumettre
    if (activeSection < sections.length - 1) {
      setActiveSection((s) => s + 1);
      return;
    }

    setLoading(true);
    setErrors({});

    let uploadedUrls: string[] = [];
    if (photoFiles.length > 0) {
      setUploadingPhotos(true);
      try {
        uploadedUrls = await uploadPhotos();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur upload photos';
        toast.error(message);
        setLoading(false);
        setUploadingPhotos(false);
        return;
      }
      setUploadingPhotos(false);
    }

    const allImages = [...(form.images || []), ...uploadedUrls];
    const mainImage = form.image_url || allImages[0] || null;

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
      rent_amount: form.rent_amount || 0,
      charges_amount: form.charges_amount || 0,
      deposit_amount: form.deposit_amount || 0,
      purchase_price: form.purchase_price || null,
      monthly_payment: form.monthly_payment || null,
      payment_months: form.payment_months || null,
      loan_rate: form.loan_rate || null,
      purchase_date: form.purchase_date || null,
      notary_fees: form.notary_fees || null,
      lot_id: form.lot_id || null,
      image_url: mainImage,
      images: allImages,
      surface: form.surface || null,
      number_of_rooms: form.number_of_rooms || null,
      balcony_surface: form.balcony_surface || null,
      terrace_surface: form.terrace_surface || null,
      garden_surface: form.garden_surface || null,
    };

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Vous devez être connecté pour ajouter un bien');

        // Créer un lot si demandé
        let lotId = result.data.lot_id;
        if (creatingLot && newLotName.trim()) {
          const { data: lot, error: lotError } = await supabase
            .from('property_lots')
            .insert({
              user_id: user.id,
              name: newLotName.trim(),
              purchase_price: result.data.purchase_price,
              monthly_payment: result.data.monthly_payment,
              payment_months: result.data.payment_months,
              loan_rate: result.data.loan_rate,
              purchase_date: result.data.purchase_date,
              notary_fees: result.data.notary_fees,
            })
            .select()
            .single();
          if (lotError) throw new Error(lotError.message);
          lotId = lot.id;
        }

        const { data, error } = await supabase
          .from('properties')
          .insert({ ...result.data, user_id: user.id, lot_id: lotId })
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

  const sectionKey = sections[activeSection]?.label || '';
  const totalPhotos = (form.images || []).length + photoFiles.length;

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-hidden flex flex-col">
      {/* Navigation des sections */}
      <div className="flex gap-1 overflow-x-auto pb-4 mb-4 border-b border-border shrink-0">
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
                  : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Contenu de la section active */}
      <div className="overflow-y-auto flex-1 px-1">
        {/* Section : Type de bien */}
        {sectionKey === 'Type de bien' && (
          <div className="space-y-5 animate-in">
            <p className="text-sm text-text-secondary">Quel type de bien souhaitez-vous ajouter ?</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    updateField('property_type', type);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.property_type === type
                      ? 'border-terracotta bg-terracotta/5 text-terracotta'
                      : 'border-border-light text-stone-600 hover:border-stone-300 hover:bg-bg-card'
                  }`}
                >
                  {typeIcons[type] || <Home className="h-5 w-5" />}
                  <span className="text-xs font-medium">{type}</span>
                </button>
              ))}
            </div>

            {!isStorageType && !isCommercialType && (
              <div className="pt-2">
                <Select
                  label="Type de location"
                  options={furnishedTypes.map((t) => ({ value: t, label: t }))}
                  value={form.furnished_type}
                  onChange={(e) => updateField('furnished_type', e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Section : Localisation */}
        {sectionKey === 'Localisation' && (
          <div className="space-y-5 animate-in">
            <Input
              label="Nom du bien *"
              placeholder="Ex: Appartement Montmartre"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
            />
            <AddressAutocomplete
              label="Adresse *"
              placeholder="Commencez à taper une adresse..."
              value={form.address}
              onChange={(val) => updateField('address', val)}
              onSelect={(suggestion) => {
                const street = suggestion.housenumber
                  ? `${suggestion.housenumber} ${suggestion.street || ''}`
                  : suggestion.street || suggestion.label;
                updateField('address', street);
                if (suggestion.city) updateField('city', suggestion.city);
                if (suggestion.postcode) updateField('postal_code', suggestion.postcode);
              }}
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
            {!isStorageType && (
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
            )}
          </div>
        )}

        {/* Section : Description */}
        {sectionKey === 'Description' && (
          <div className="space-y-5 animate-in">
            {!isStorageType && (
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
            )}
            {isStorageType && (
              <div className="space-y-5">
                <Input
                  label="Surface (m²)"
                  type="number"
                  placeholder={form.property_type === 'Parking' ? '12' : '15'}
                  value={form.surface ?? ''}
                  onChange={(e) => updateField('surface', e.target.value ? Number(e.target.value) : null)}
                  error={errors.surface}
                />
                {(form.property_type === 'Parking' || form.property_type === 'Box' || form.property_type === 'Garage') && (
                  <Input
                    label="Numéro d'emplacement"
                    placeholder="P5"
                    value={form.parking_number || ''}
                    onChange={(e) => updateField('parking_number', e.target.value)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Section : Cuisine */}
        {sectionKey === 'Cuisine' && (
          <div className="space-y-5 animate-in">
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
              <p className="text-sm font-medium text-text-primary mb-3">Équipements de cuisine</p>
              <div className="grid grid-cols-2 gap-2">
                {['Réfrigérateur', 'Four', 'Micro-ondes', 'Lave-vaisselle', 'Plaques de cuisson', 'Hotte', 'Congélateur', 'Lave-linge'].map((equip) => (
                  <label key={equip} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-bg-card cursor-pointer">
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
                      className="rounded border-stone-300 text-terracotta focus:ring-accent"
                    />
                    <span className="text-sm text-text-primary">{equip}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section : Annexes */}
        {sectionKey === 'Annexes' && (
          <div className="space-y-4 animate-in">
            <div className="p-5 rounded-xl border border-border-light">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_cellar} onChange={() => toggleField('has_cellar')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Cave</span>
              </label>
              {form.has_cellar && (
                <div className="mt-4 pl-7">
                  <Input label="Numéro" placeholder="C12" value={form.cellar_number || ''} onChange={(e) => updateField('cellar_number', e.target.value)} />
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl border border-border-light">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_parking} onChange={() => toggleField('has_parking')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Parking</span>
              </label>
              {form.has_parking && (
                <div className="mt-4 pl-7 grid grid-cols-2 gap-4">
                  <Select label="Type" options={[{ value: 'Intérieur', label: 'Intérieur' }, { value: 'Extérieur', label: 'Extérieur' }, { value: 'Box', label: 'Box fermé' }]}
                    value={form.parking_type || ''} onChange={(e) => updateField('parking_type', e.target.value)} placeholder="Type..." />
                  <Input label="Numéro" placeholder="P5" value={form.parking_number || ''} onChange={(e) => updateField('parking_number', e.target.value)} />
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl border border-border-light">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_balcony} onChange={() => toggleField('has_balcony')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Balcon</span>
              </label>
              {form.has_balcony && (
                <div className="mt-4 pl-7">
                  <Input label="Surface (m²)" type="number" value={form.balcony_surface ?? ''} onChange={(e) => updateField('balcony_surface', e.target.value ? Number(e.target.value) : null)} />
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl border border-border-light">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_terrace} onChange={() => toggleField('has_terrace')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Terrasse</span>
              </label>
              {form.has_terrace && (
                <div className="mt-4 pl-7">
                  <Input label="Surface (m²)" type="number" value={form.terrace_surface ?? ''} onChange={(e) => updateField('terrace_surface', e.target.value ? Number(e.target.value) : null)} />
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl border border-border-light">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_garden} onChange={() => toggleField('has_garden')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Jardin</span>
              </label>
              {form.has_garden && (
                <div className="mt-4 pl-7 grid grid-cols-2 gap-4">
                  <Input label="Surface (m²)" type="number" value={form.garden_surface ?? ''} onChange={(e) => updateField('garden_surface', e.target.value ? Number(e.target.value) : null)} />
                  <Select label="Type" options={[{ value: 'Privatif', label: 'Privatif' }, { value: 'Commun', label: 'Commun' }]}
                    value={form.garden_type || ''} onChange={(e) => updateField('garden_type', e.target.value)} placeholder="Type..." />
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl border border-border-light">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_attic} onChange={() => toggleField('has_attic')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Grenier</span>
              </label>
            </div>
          </div>
        )}

        {/* Section : Énergie */}
        {sectionKey === 'Énergie' && (
          <div className="space-y-5 animate-in">
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

        {/* Section : Confort */}
        {sectionKey === 'Confort' && (
          <div className="space-y-5 animate-in">
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
              <label className="flex items-center gap-3 p-4 rounded-xl border border-border-light cursor-pointer hover:bg-bg-card transition-colors">
                <input type="checkbox" checked={form.has_intercom} onChange={() => toggleField('has_intercom')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Interphone / Digicode</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-border-light cursor-pointer hover:bg-bg-card transition-colors">
                <input type="checkbox" checked={form.has_fiber} onChange={() => toggleField('has_fiber')}
                  className="rounded border-stone-300 text-terracotta focus:ring-accent" />
                <span className="text-sm font-medium text-text-primary">Fibre optique disponible</span>
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

        {/* Section : Finances */}
        {sectionKey === 'Finances' && (
          <div className="space-y-5 animate-in">
            {/* Location */}
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Location</h3>
            <Input
              label={isStorageType ? 'Loyer mensuel *' : 'Loyer mensuel HC *'}
              type="number"
              placeholder={isStorageType ? '80' : '850'}
              value={form.rent_amount || ''}
              onChange={(e) => updateField('rent_amount', e.target.value ? Number(e.target.value) : 0)}
              error={errors.rent_amount}
              helperText={isStorageType ? 'En euros par mois' : 'Hors charges, en euros'}
            />
            {!isStorageType && (
              <Input
                label="Provisions sur charges"
                type="number"
                placeholder="50"
                value={form.charges_amount || ''}
                onChange={(e) => updateField('charges_amount', e.target.value ? Number(e.target.value) : 0)}
                error={errors.charges_amount}
                helperText="Provision mensuelle sur charges"
              />
            )}
            <Input
              label="Dépôt de garantie"
              type="number"
              placeholder={isStorageType ? '80' : '850'}
              value={form.deposit_amount || ''}
              onChange={(e) => updateField('deposit_amount', e.target.value ? Number(e.target.value) : 0)}
              error={errors.deposit_amount}
            />
            {(form.rent_amount > 0 || form.charges_amount > 0) && (
              <div className="p-5 rounded-xl bg-terracotta/5 border border-terracotta/20">
                <p className="text-sm text-text-secondary">Total mensuel</p>
                <p className="text-xl font-bold tabular-nums text-terracotta">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    (form.rent_amount || 0) + (form.charges_amount || 0)
                  )}
                </p>
              </div>
            )}

            {/* Achat */}
            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Achat</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prix d'achat"
                    type="number"
                    placeholder="200000"
                    value={form.purchase_price ?? ''}
                    onChange={(e) => updateField('purchase_price', e.target.value ? Number(e.target.value) : null)}
                    helperText="En euros"
                  />
                  <Input
                    label="Date d'achat"
                    type="date"
                    value={form.purchase_date || ''}
                    onChange={(e) => updateField('purchase_date', e.target.value || null)}
                  />
                </div>
                <Input
                  label="Frais de notaire"
                  type="number"
                  placeholder="15000"
                  value={form.notary_fees ?? ''}
                  onChange={(e) => updateField('notary_fees', e.target.value ? Number(e.target.value) : null)}
                  helperText="En euros"
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Mensualité crédit"
                    type="number"
                    placeholder="900"
                    value={form.monthly_payment ?? ''}
                    onChange={(e) => updateField('monthly_payment', e.target.value ? Number(e.target.value) : null)}
                    helperText="En euros"
                  />
                  <Input
                    label="Durée (mois)"
                    type="number"
                    placeholder="240"
                    value={form.payment_months ?? ''}
                    onChange={(e) => updateField('payment_months', e.target.value ? Number(e.target.value) : null)}
                  />
                  <Input
                    label="Taux (%)"
                    type="number"
                    step="0.01"
                    placeholder="3.5"
                    value={form.loan_rate ?? ''}
                    onChange={(e) => updateField('loan_rate', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>

                {/* Achat en lot */}
                <div className="p-5 rounded-xl border border-border-light">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lotEnabled}
                      onChange={() => {
                        if (lotEnabled) {
                          setLotEnabled(false);
                          updateField('lot_id', null);
                          setCreatingLot(false);
                          setNewLotName('');
                        } else {
                          setLotEnabled(true);
                          setCreatingLot(true);
                        }
                      }}
                      className="rounded border-stone-300 text-terracotta focus:ring-accent"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-primary">Achat en lot</span>
                      <p className="text-xs text-text-secondary">Les infos d&apos;achat seront partagées entre tous les biens du lot</p>
                    </div>
                  </label>

                  {lotEnabled && (
                    <div className="mt-4 pl-7 space-y-3">
                      {lots.length > 0 && !creatingLot && (
                        <Select
                          label="Lot existant"
                          placeholder="Sélectionner un lot..."
                          options={lots.map((l) => ({ value: l.id, label: l.name }))}
                          value={form.lot_id || ''}
                          onChange={(e) => {
                            updateField('lot_id', e.target.value || null);
                          }}
                        />
                      )}
                      {lots.length > 0 && !creatingLot && (
                        <button
                          type="button"
                          onClick={() => setCreatingLot(true)}
                          className="text-xs text-terracotta hover:underline"
                        >
                          + Créer un nouveau lot
                        </button>
                      )}
                      {(creatingLot || lots.length === 0) && (
                        <Input
                          label="Nom du nouveau lot"
                          placeholder="Ex: Immeuble Rue de la Paix"
                          value={newLotName}
                          onChange={(e) => setNewLotName(e.target.value)}
                        />
                      )}
                      {creatingLot && lots.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setCreatingLot(false); setNewLotName(''); }}
                          className="text-xs text-text-secondary hover:underline"
                        >
                          Choisir un lot existant
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section : Photos (upload direct) */}
        {sectionKey === 'Photos' && (
          <div className="space-y-5 animate-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Photos du bien</p>
                <p className="text-xs text-text-secondary mt-1">
                  {totalPhotos}/{MAX_PHOTOS_FREE} photos (max {MAX_PHOTOS_FREE} sans abonnement)
                </p>
              </div>
              <button
                type="button"
                disabled={totalPhotos >= MAX_PHOTOS_FREE}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-sm font-medium text-text-primary hover:bg-bg-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                Ajouter
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {(form.images || []).length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {(form.images || []).map((url, i) => (
                  <div key={url} className="relative group rounded-xl overflow-hidden border border-border-light">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-bg-elevated/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoFiles.length > 0 && (
              <div>
                <p className="text-xs text-text-secondary mb-2">Nouvelles photos (seront uploadées à la sauvegarde)</p>
                <div className="grid grid-cols-3 gap-3">
                  {photoFiles.map((pf, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-terracotta/30 border-dashed">
                      <img src={pf.preview} alt={`Nouvelle ${i + 1}`} className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhotoFile(i)}
                        className="absolute top-2 right-2 p-1.5 bg-bg-elevated/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalPhotos === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 border-2 border-dashed border-border-light rounded-xl text-text-muted hover:border-terracotta/40 hover:text-terracotta transition-colors flex flex-col items-center gap-2"
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Cliquez pour ajouter des photos</span>
                <span className="text-xs">JPG, PNG ou WebP — max 5 Mo par photo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Barre d'actions sticky en bas */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border shrink-0">
        <Button type="button" variant="ghost" onClick={onClose} icon={<X className="h-4 w-4" />}>
          Annuler
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {activeSection + 1}/{sections.length}
          </span>
          {activeSection < sections.length - 1 ? (
            <Button type="button" variant="primary" onClick={() => setActiveSection((s) => s + 1)}>
              Suivant
            </Button>
          ) : (
            <Button type="submit" loading={loading || uploadingPhotos} icon={<Save className="h-4 w-4" />}>
              {uploadingPhotos ? 'Upload...' : isEditing ? 'Enregistrer' : 'Créer le bien'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
