'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TenantForm from '@/components/tenants/TenantForm';
import { Plus } from 'lucide-react';

interface Props {
  propertyId: string;
}

export default function AddTenantToPropertyButton({ propertyId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-terracotta hover:text-terracotta/80 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter un locataire
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un locataire" size="lg">
        <TenantForm propertyId={propertyId} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
