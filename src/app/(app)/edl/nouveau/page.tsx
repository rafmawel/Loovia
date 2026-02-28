// Page de création d'un nouvel état des lieux
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import EdlForm from '@/components/edl/EdlForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Property, Tenant } from '@/types';

interface Props {
  searchParams: Promise<{ property_id?: string; tenant_id?: string }>;
}

export default async function NouvelEdlPage({ searchParams }: Props) {
  const params = await searchParams;
  const { property_id, tenant_id } = params;

  if (!property_id || !tenant_id) {
    redirect('/biens');
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [propertyRes, tenantRes] = await Promise.all([
    supabase.from('properties').select('*').eq('id', property_id).single(),
    supabase.from('tenants').select('*').eq('id', tenant_id).single(),
  ]);

  if (propertyRes.error || !propertyRes.data || tenantRes.error || !tenantRes.data) {
    redirect('/biens');
  }

  const property = propertyRes.data as Property;
  const tenant = tenantRes.data as Tenant;

  const landlordName =
    user?.user_metadata
      ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
      : 'Propriétaire';

  return (
    <div>
      <Link
        href={`/biens/${property_id}`}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au bien
      </Link>

      <PageHeader
        title="Nouvel état des lieux"
        description={`${property.address}, ${property.city}`}
      />

      <EdlForm
        property={property}
        tenant={tenant}
        landlordName={landlordName || 'Propriétaire'}
      />
    </div>
  );
}
