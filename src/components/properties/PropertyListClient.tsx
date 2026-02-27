'use client';

// Partie interactive de la page liste des biens (recherche, filtres, modale création)
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import PropertyForm from '@/components/properties/PropertyForm';
import { Building2, Plus, MapPin, Search, User, Maximize } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Property, Tenant } from '@/types';

type FilterStatus = 'all' | 'occupied' | 'vacant';

interface PropertyWithTenant extends Property {
  /** Locataire actif associé (null = bien libre) */
  activeTenant?: Tenant | null;
}

interface PropertyListClientProps {
  /** Liste des biens enrichis avec le locataire actif */
  properties: PropertyWithTenant[];
}

export default function PropertyListClient({ properties }: PropertyListClientProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Recherche textuelle (nom, adresse, ville)
  const filtered = useMemo(() => {
    let result = properties;

    // Filtre par statut occupé/libre
    if (filter === 'occupied') {
      result = result.filter((p) => p.activeTenant);
    } else if (filter === 'vacant') {
      result = result.filter((p) => !p.activeTenant);
    }

    // Recherche textuelle
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    return result;
  }, [properties, search, filter]);

  const filterButtons: { label: string; value: FilterStatus; count: number }[] = [
    { label: 'Tous', value: 'all', count: properties.length },
    { label: 'Occupés', value: 'occupied', count: properties.filter((p) => p.activeTenant).length },
    { label: 'Libres', value: 'vacant', count: properties.filter((p) => !p.activeTenant).length },
  ];

  return (
    <>
      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Recherche */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, adresse, ville..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-colors"
          />
        </div>

        {/* Filtres par statut */}
        <div className="flex items-center gap-2 shrink-0">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setFilter(btn.value)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                filter === btn.value
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {btn.label}
              <span className={`ml-1.5 ${filter === btn.value ? 'text-white/70' : 'text-stone-400'}`}>
                {btn.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grille de biens ou état vide */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title={properties.length === 0 ? 'Aucun bien ajouté' : 'Aucun résultat'}
            description={
              properties.length === 0
                ? 'Ajoutez votre premier bien immobilier pour commencer la gestion locative.'
                : 'Essayez de modifier vos critères de recherche ou de filtrage.'
            }
            action={
              properties.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un bien
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <Link key={property.id} href={`/biens/${property.id}`} className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-200 h-full flex flex-col">
                {/* Image ou placeholder */}
                <div className="h-44 bg-stone-100 relative overflow-hidden">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                      <Building2 className="h-12 w-12 text-stone-300" />
                    </div>
                  )}

                  {/* Badge type en overlay */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-xs font-medium text-white bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      {property.property_type}
                    </span>
                    <span className="text-xs font-medium text-white bg-slate-900/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      {property.furnished_type === 'Location meublée' ? 'Meublé' : 'Vide'}
                    </span>
                  </div>

                  {/* Badge statut occupé/libre en overlay */}
                  <div className="absolute top-3 right-3">
                    {property.activeTenant ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-terracotta bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                        <User className="h-3 w-3" />
                        {property.activeTenant.first_name} {property.activeTenant.last_name}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-emerald-200">
                        Libre
                      </span>
                    )}
                  </div>
                </div>

                {/* Informations */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 truncate mb-1 group-hover:text-terracotta transition-colors">
                    {property.name}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-stone-500 mb-3">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{property.address}, {property.postal_code} {property.city}</span>
                  </div>

                  {/* Infos surface + pièces */}
                  <div className="flex items-center gap-3 mb-4">
                    {property.surface && (
                      <div className="flex items-center gap-1 text-sm text-stone-500">
                        <Maximize className="h-3.5 w-3.5" />
                        <span>{property.surface} m²</span>
                      </div>
                    )}
                    {property.number_of_rooms && (
                      <span className="text-sm text-stone-500">
                        {property.number_of_rooms} pièce{property.number_of_rooms > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Finances en bas */}
                  <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-500">Loyer HC</p>
                      <p className="text-sm font-bold tabular-nums text-slate-900">
                        {formatCurrency(property.rent_amount)}<span className="text-xs font-normal text-stone-400">/mois</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500">Charges</p>
                      <p className="text-sm font-medium tabular-nums text-stone-500">
                        +{formatCurrency(property.charges_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modale de création */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Ajouter un bien"
        size="xl"
      >
        <PropertyForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </>
  );
}
