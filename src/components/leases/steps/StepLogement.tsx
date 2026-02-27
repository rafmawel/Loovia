'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import type { Property, Tenant } from '@/types';
import type { LeaseWizardData } from '../LeaseWizard';

const LOCATION_TYPES = [
  { value: 'Location vide', label: 'Location vide' },
  { value: 'Location meublée', label: 'Location meublée' },
  { value: 'Bail mobilité', label: 'Bail mobilité' },
];

interface Props {
  data: LeaseWizardData;
  errors: Record<string, string>;
  properties: Property[];
  tenants: Tenant[];
  onChange: (partial: Partial<LeaseWizardData>) => void;
}

export default function StepLogement({ data, errors, properties, tenants, onChange }: Props) {
  // Trouver le bien lié au locataire sélectionné
  const selectedTenant = tenants.find((t) => t.id === data.tenant_id);
  const linkedPropertyId = selectedTenant?.property_id;

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (property) {
      // Déterminer le type de location depuis le bien
      let locationType = data.location_type;
      if (property.furnished_type === 'Location meublée') {
        locationType = 'Location meublée';
      } else if (property.furnished_type === 'Location vide') {
        locationType = 'Location vide';
      }

      onChange({
        property_id: propertyId,
        property_address: property.address,
        property_city: property.city,
        property_postal_code: property.postal_code,
        property_building: property.building || '',
        property_floor: property.floor || '',
        property_door: property.door || '',
        property_surface: property.surface || 0,
        property_rooms: property.number_of_rooms || 0,
        location_type: locationType,
        // Met à jour aussi les finances
        monthly_rent: property.rent_amount || 0,
        charges_amount: property.charges_amount || 0,
      });
    }
  };

  // Si un bien est lié au locataire, le pré-sélectionner au montage
  if (linkedPropertyId && !data.property_id) {
    // On le fait via un effet implicite au premier rendu
    setTimeout(() => handlePropertyChange(linkedPropertyId), 0);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-opacity-70">
        Désignation du logement
      </h3>

      <Select
        label="Choisir un bien"
        options={properties.map((p) => ({
          value: p.id,
          label: `${p.name} — ${p.address}, ${p.city}`,
        }))}
        value={data.property_id}
        onChange={(e) => handlePropertyChange(e.target.value)}
        placeholder="Sélectionner un bien"
        error={errors.property_id}
        helperText={
          linkedPropertyId
            ? 'Bien lié au locataire sélectionné (pré-rempli)'
            : undefined
        }
      />

      {data.property_id && (
        <div className="space-y-4">
          {/* Adresse */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Adresse"
                value={data.property_address}
                onChange={(e) => onChange({ property_address: e.target.value })}
              />
            </div>
            <Input
              label="Ville"
              value={data.property_city}
              onChange={(e) => onChange({ property_city: e.target.value })}
            />
            <Input
              label="Code postal"
              value={data.property_postal_code}
              onChange={(e) => onChange({ property_postal_code: e.target.value })}
            />
          </div>

          {/* Détails */}
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Bâtiment"
              value={data.property_building}
              onChange={(e) => onChange({ property_building: e.target.value })}
              placeholder="—"
            />
            <Input
              label="Étage"
              value={data.property_floor}
              onChange={(e) => onChange({ property_floor: e.target.value })}
              placeholder="—"
            />
            <Input
              label="Porte"
              value={data.property_door}
              onChange={(e) => onChange({ property_door: e.target.value })}
              placeholder="—"
            />
          </div>

          {/* Caractéristiques */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Surface habitable (m²)"
              type="number"
              value={data.property_surface || ''}
              onChange={(e) => onChange({ property_surface: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Nombre de pièces"
              type="number"
              value={data.property_rooms || ''}
              onChange={(e) => onChange({ property_rooms: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Type de location */}
          <Select
            label="Type de location"
            options={LOCATION_TYPES}
            value={data.location_type}
            onChange={(e) => onChange({ location_type: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
