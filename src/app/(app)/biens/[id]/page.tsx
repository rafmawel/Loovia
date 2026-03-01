// Page détail d'un bien immobilier — Server Component
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import PropertyMaintenanceSection from '@/components/maintenance/PropertyMaintenanceSection';
import {
  Building2, MapPin, ArrowLeft, Home, Thermometer, Wallet, Shield, Utensils,
  Warehouse, FileText, User, Wrench, ChevronRight, ClipboardList, Plus,
} from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyDetailActions from '@/components/properties/PropertyDetailActions';
import type { Property, Tenant, Lease, MaintenanceRequest, EdlReport } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BienDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Chargement en parallèle
  const [propertyRes, tenantsRes, leasesRes, maintenanceRes, edlRes] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('tenants').select('*').eq('property_id', id).order('start_date', { ascending: false }),
    supabase.from('leases').select('*, tenant:tenants(first_name, last_name)').eq('property_id', id).order('created_at', { ascending: false }),
    supabase.from('maintenance_requests').select('*').eq('property_id', id).order('created_at', { ascending: false }),
    supabase.from('edl_reports').select('*, tenant:tenants(first_name, last_name)').eq('property_id', id).order('created_at', { ascending: false }),
  ]);

  if (propertyRes.error || !propertyRes.data) {
    notFound();
  }

  const property = propertyRes.data as Property;
  const tenants = (tenantsRes.data as Tenant[]) || [];
  const leases = (leasesRes.data as Lease[]) || [];
  const maintenanceRequests = (maintenanceRes.data as MaintenanceRequest[]) || [];
  const edlReports = (edlRes.data as (EdlReport & { tenant?: { first_name: string; last_name: string } })[]) || [];

  // Locataires actifs vs anciens
  const activeTenants = tenants.filter((t) => !t.end_date || new Date(t.end_date) > new Date());
  const pastTenants = tenants.filter((t) => t.end_date && new Date(t.end_date) <= new Date());

  // Annexes qui sont true (pour n'afficher que celles actives)
  const annexes: { label: string; detail?: string | null }[] = [];
  if (property.has_cellar) annexes.push({ label: 'Cave', detail: property.cellar_number ? `N°${property.cellar_number}` : null });
  if (property.has_parking) annexes.push({ label: 'Parking', detail: [property.parking_type, property.parking_number ? `N°${property.parking_number}` : null].filter(Boolean).join(' — ') || null });
  if (property.has_balcony) annexes.push({ label: 'Balcon', detail: property.balcony_surface ? `${property.balcony_surface} m²` : null });
  if (property.has_terrace) annexes.push({ label: 'Terrasse', detail: property.terrace_surface ? `${property.terrace_surface} m²` : null });
  if (property.has_garden) annexes.push({ label: 'Jardin', detail: [property.garden_type, property.garden_surface ? `${property.garden_surface} m²` : null].filter(Boolean).join(' — ') || null });
  if (property.has_attic) annexes.push({ label: 'Grenier' });

  // Galerie d'images
  const allImages = [property.image_url, ...(property.images || [])].filter(Boolean) as string[];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
        <Link href="/biens" className="hover:text-slate-900 transition-colors">Mes Biens</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 font-medium truncate">{property.name}</span>
      </div>

      {/* En-tête avec actions */}
      <PageHeader title={property.name} description={`${property.address}, ${property.postal_code} ${property.city}`}>
        <PropertyDetailActions property={property} />
      </PageHeader>

      {/* Galerie photo */}
      {allImages.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-h-80 overflow-hidden rounded-2xl">
            {/* Image principale */}
            <div className="md:col-span-3 h-80 overflow-hidden">
              <img
                src={allImages[0]}
                alt={property.name}
                className="w-full h-full object-cover rounded-2xl md:rounded-r-none"
              />
            </div>
            {/* Miniatures */}
            {allImages.length > 1 && (
              <div className="hidden md:flex flex-col gap-3">
                {allImages.slice(1, 4).map((img, i) => (
                  <div key={i} className="flex-1 overflow-hidden rounded-xl">
                    <img src={img} alt={`Vue ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Localisation */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-terracotta" />
              Localisation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Adresse" value={property.address} />
              <InfoItem label="Ville" value={`${property.postal_code} ${property.city}`} />
              <InfoItem label="Bâtiment" value={property.building || '—'} />
              <InfoItem label="Étage" value={property.floor || '—'} />
              <InfoItem label="Porte" value={property.door || '—'} />
            </div>
          </Card>

          {/* 2. Description */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-terracotta" />
              Description
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Type de bien" value={property.property_type} />
              <InfoItem label="Type de location" value={property.furnished_type} />
              <InfoItem label="Surface habitable" value={property.surface ? `${property.surface} m²` : '—'} />
              <InfoItem label="Nombre de pièces" value={property.number_of_rooms?.toString() || '—'} />
            </div>
          </Card>

          {/* 3. Cuisine */}
          {(property.kitchen_type || (property.kitchen_equipment && property.kitchen_equipment.length > 0)) && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-terracotta" />
                Cuisine
              </h2>
              <div className="space-y-3">
                {property.kitchen_type && <InfoItem label="Type" value={property.kitchen_type} />}
                {property.kitchen_equipment && property.kitchen_equipment.length > 0 && (
                  <div>
                    <p className="text-xs text-stone-500 mb-2">Équipements</p>
                    <div className="flex flex-wrap gap-2">
                      {property.kitchen_equipment.map((equip) => (
                        <span key={equip} className="text-xs font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                          {equip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 4. Annexes (uniquement si au moins une est true) */}
          {annexes.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-terracotta" />
                Annexes
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {annexes.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">{item.label}</p>
                      {item.detail && <p className="text-xs text-emerald-600">{item.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 5. Chauffage & Eau chaude */}
          {(property.heating_type || property.hot_water_type) && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-terracotta" />
                Chauffage & Eau chaude
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Type de chauffage" value={property.heating_type || '—'} />
                <InfoItem label="Énergie chauffage" value={property.heating_energy || '—'} />
                <InfoItem label="Eau chaude" value={property.hot_water_type || '—'} />
                <InfoItem label="Énergie eau chaude" value={property.hot_water_energy || '—'} />
              </div>
            </Card>
          )}

          {/* 6. Confort */}
          {(property.glazing_type || property.shutters_type || property.has_intercom || property.has_fiber) && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-terracotta" />
                Confort
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.glazing_type && <InfoItem label="Vitrage" value={property.glazing_type} />}
                {property.shutters_type && <InfoItem label="Volets" value={property.shutters_type} />}
                {property.has_intercom && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-medium text-emerald-800">Interphone</p>
                  </div>
                )}
                {property.has_fiber && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-medium text-emerald-800">Fibre optique</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 9. Baux associés */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-terracotta" />
                Baux associés ({leases.length})
              </h2>
              <Link
                href={`/baux?property_id=${property.id}${activeTenants.length > 0 ? `&tenant_id=${activeTenants[0].id}` : ''}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-terracotta hover:text-terracotta/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Créer un bail
              </Link>
            </div>
            {leases.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun bail associé à ce bien.</p>
            ) : (
              <div className="space-y-3">
                {leases.map((lease) => (
                  <Link
                    key={lease.id}
                    href={`/baux/${lease.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {lease.tenant ? fullName(lease.tenant.first_name, lease.tenant.last_name) : '—'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatDate(lease.start_date)}{lease.end_date ? ` — ${formatDate(lease.end_date)}` : ' — En cours'}
                        {' · '}{formatCurrency(lease.monthly_rent)}/mois
                      </p>
                    </div>
                    <StatusBadge variant="lease" status={lease.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* 10. États des lieux */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-terracotta" />
                États des lieux ({edlReports.length})
              </h2>
              {activeTenants.length > 0 && (
                <Link
                  href={`/edl/nouveau?property_id=${property.id}&tenant_id=${activeTenants[0].id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-terracotta hover:text-terracotta/80 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouvel EDL
                </Link>
              )}
            </div>
            {edlReports.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun état des lieux enregistré.</p>
            ) : (
              <div className="space-y-3">
                {edlReports.map((edl) => (
                  <Link
                    key={edl.id}
                    href={`/edl/${edl.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {edl.type === 'entrance' ? "État des lieux d'entrée" : 'État des lieux de sortie'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {edl.tenant ? `${edl.tenant.first_name} ${edl.tenant.last_name}` : '—'}
                        {' · '}{formatDate(edl.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {edl.signature_landlord && edl.signature_tenant ? (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Signé</span>
                      ) : (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Brouillon</span>
                      )}
                      <ChevronRight className="h-4 w-4 text-stone-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* 11. Demandes de travaux */}
          <Card>
            <PropertyMaintenanceSection
              propertyId={property.id}
              tenantId={activeTenants.length > 0 ? activeTenants[0].id : null}
            />
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* 7. Conditions financières */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-terracotta" />
              Conditions financières
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Loyer HC</span>
                <span className="text-base font-bold tabular-nums text-slate-900">
                  {formatCurrency(property.rent_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Charges</span>
                <span className="text-sm font-medium tabular-nums text-slate-900">
                  +{formatCurrency(property.charges_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                <span className="text-sm font-medium text-slate-900">Total mensuel</span>
                <span className="text-lg font-bold tabular-nums text-terracotta">
                  {formatCurrency(property.rent_amount + property.charges_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                <span className="text-sm text-stone-500">Dépôt de garantie</span>
                <span className="text-sm font-medium tabular-nums text-slate-900">
                  {formatCurrency(property.deposit_amount)}
                </span>
              </div>
            </div>
          </Card>

          {/* 8. Locataire actuel */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-terracotta" />
              Locataire actuel
            </h2>
            {activeTenants.length === 0 ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  Bien libre
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTenants.map((tenant) => (
                  <Link
                    key={tenant.id}
                    href={`/locataires/${tenant.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold shrink-0">
                      {tenant.first_name.charAt(0)}{tenant.last_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {fullName(tenant.first_name, tenant.last_name)}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{tenant.email}</p>
                      <p className="text-xs text-stone-400">Depuis le {formatDate(tenant.start_date)}</p>
                    </div>
                    <StatusBadge variant="payment" status={tenant.payment_status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Historique des locataires */}
          {pastTenants.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Anciens locataires ({pastTenants.length})
              </h2>
              <div className="space-y-2">
                {pastTenants.map((tenant) => (
                  <Link
                    key={tenant.id}
                    href={`/locataires/${tenant.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-500 truncate">
                        {fullName(tenant.first_name, tenant.last_name)}
                      </p>
                      <p className="text-xs text-stone-400">
                        {formatDate(tenant.start_date)} — {tenant.end_date ? formatDate(tenant.end_date) : '—'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant réutilisable d'information
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
