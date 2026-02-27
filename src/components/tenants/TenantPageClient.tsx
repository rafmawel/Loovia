'use client';

// Wrapper client pour la page locataires (gère l'état de la modale fin de bail)
import { useState } from 'react';
import TenantListClient from '@/components/tenants/TenantListClient';
import EndLeaseModal from '@/components/tenants/EndLeaseModal';
import type { Tenant, Property } from '@/types';

interface TenantWithProperty extends Tenant {
  property?: Pick<Property, 'id' | 'name' | 'address' | 'city'> | null;
}

interface TenantPageClientProps {
  tenants: TenantWithProperty[];
}

export default function TenantPageClient({ tenants }: TenantPageClientProps) {
  const [endLeaseTenant, setEndLeaseTenant] = useState<Tenant | null>(null);

  return (
    <>
      <TenantListClient
        tenants={tenants}
        onEndLease={(tenant) => setEndLeaseTenant(tenant)}
      />
      <EndLeaseModal
        tenant={endLeaseTenant}
        open={!!endLeaseTenant}
        onClose={() => setEndLeaseTenant(null)}
      />
    </>
  );
}
