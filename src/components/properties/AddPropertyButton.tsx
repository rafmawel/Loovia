'use client';

// Bouton "Ajouter un bien" — ouvre la modale de création
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PropertyForm from '@/components/properties/PropertyForm';
import { Plus } from 'lucide-react';

export default function AddPropertyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
        Ajouter un bien
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un bien" size="xl">
        <PropertyForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
