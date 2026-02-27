'use client';

// Bouton "Ajouter un locataire" — ouvre la modale de création
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TenantForm from '@/components/tenants/TenantForm';
import { Plus } from 'lucide-react';

export default function AddTenantButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
        Ajouter un locataire
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un locataire" size="lg">
        <TenantForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
