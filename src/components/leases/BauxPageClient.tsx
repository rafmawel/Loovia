'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LeaseWizard from './LeaseWizard';
import ImportLeaseModal from './ImportLeaseModal';
import { Upload } from 'lucide-react';
import type { Property, Tenant } from '@/types';

interface BauxPageClientProps {
  tenants: Tenant[];
  properties: Property[];
  userMetadata?: { first_name?: string; last_name?: string; [key: string]: unknown };
}

export default function BauxPageClient({ tenants, properties, userMetadata }: BauxPageClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pré-sélection depuis les query params
  const initialPropertyId = searchParams.get('property_id') || undefined;
  const initialTenantId = searchParams.get('tenant_id') || undefined;

  // Ouvrir le wizard si ?action=create ou ?property_id dans l'URL
  useEffect(() => {
    if (searchParams.get('action') === 'create' || searchParams.get('property_id')) {
      setWizardOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary border border-border-light rounded-xl hover:border-accent/40 hover:text-text-primary transition-all"
        >
          <Upload className="h-4 w-4" />
          Importer
        </button>
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-xl hover:brightness-110 hover:scale-[1.02] hover:shadow-md transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Créer un bail
        </button>
      </div>

      <LeaseWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        tenants={tenants}
        properties={properties}
        userMetadata={userMetadata}
        initialPropertyId={initialPropertyId}
        initialTenantId={initialTenantId}
      />

      {importOpen && (
        <ImportLeaseModal
          properties={properties}
          tenants={tenants}
          onClose={() => setImportOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
