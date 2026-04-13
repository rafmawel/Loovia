// Page détail / édition d'un état des lieux existant
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import EdlForm from '@/components/edl/EdlForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Property, Tenant, EdlReport } from '@/types';
import type { EdlFormData } from '@/components/edl/EdlForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EdlDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: edl, error } = await supabase
    .from('edl_reports')
    .select('*, property:properties(*), tenant:tenants(*)')
    .eq('id', id)
    .single();

  if (error || !edl) {
    notFound();
  }

  const report = edl as EdlReport & { property: Property; tenant: Tenant };
  const property = report.property;
  const tenant = report.tenant;

  const landlordName =
    user?.user_metadata
      ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
      : 'Propriétaire';

  const typeLabel =
    report.type === 'entrance' ? "d'entrée" : 'de sortie';

  // Reconstruire les données du formulaire depuis le JSONB
  const existingData = report.data as unknown as EdlFormData | undefined;

  return (
    <div>
      <Link
        href={`/biens/${property.id}`}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au bien
      </Link>

      <PageHeader
        title={`État des lieux ${typeLabel}`}
        description={`${property.address}, ${property.city} — ${tenant.first_name} ${tenant.last_name}`}
      />

      <EdlForm
        property={property}
        tenant={tenant}
        landlordName={landlordName || 'Propriétaire'}
        existingData={existingData}
        edlId={id}
      />
    </div>
  );
}
