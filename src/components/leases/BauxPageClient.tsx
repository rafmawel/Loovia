'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import LeaseWizard from './LeaseWizard';
import type { Property, Tenant } from '@/types';

interface BauxPageClientProps {
  tenants: Tenant[];
  properties: Property[];
  userMetadata?: { first_name?: string; last_name?: string; [key: string]: unknown };
}

export default function BauxPageClient({ tenants, properties, userMetadata }: BauxPageClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const searchParams = useSearchParams();

  // Ouvrir le wizard si ?action=create dans l'URL
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setWizardOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      {/* Bouton d'ouverture — utilisable depuis l'extérieur via ce composant */}
      <button
        type="button"
        onClick={() => setWizardOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-terracotta rounded-xl hover:bg-terracotta-dark hover:scale-[1.02] hover:shadow-md transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Créer un bail
      </button>

      <LeaseWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        tenants={tenants}
        properties={properties}
        userMetadata={userMetadata}
      />
    </>
  );
}
