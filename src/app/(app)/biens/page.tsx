// Page liste des biens immobiliers — Server Component
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import PropertyListClient from '@/components/properties/PropertyListClient';
import AddPropertyButton from '@/components/properties/AddPropertyButton';
import type { Property, Tenant } from '@/types';

export default async function BiensPage() {
  const supabase = await createClient();

  // Chargement des biens et des locataires actifs en parallèle
  const [propertiesRes, tenantsRes] = await Promise.all([
    supabase.from('properties').select('*').order('created_at', { ascending: false }),
    supabase.from('tenants').select('*').is('end_date', null),
  ]);

  const properties = (propertiesRes.data as Property[]) || [];
  const activeTenants = (tenantsRes.data as Tenant[]) || [];

  // Enrichir chaque bien avec son locataire actif
  const enriched = properties.map((p) => ({
    ...p,
    activeTenant: activeTenants.find((t) => t.property_id === p.id) ?? null,
  }));

  return (
    <div>
      <PageHeader title="Mes Biens" description="Gérez votre patrimoine immobilier">
        <AddPropertyButton />
      </PageHeader>

      <PropertyListClient properties={enriched} />
    </div>
  );
}
