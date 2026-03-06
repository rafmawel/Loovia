'use client';

// Bouton "Ajouter un bien" — ouvre la modale de création
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PropertyForm from '@/components/properties/PropertyForm';
import { createClient } from '@/lib/supabase/client';
import { Plus } from 'lucide-react';
import type { PropertyLot } from '@/types';

export default function AddPropertyButton() {
  const [open, setOpen] = useState(false);
  const [lots, setLots] = useState<PropertyLot[]>([]);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from('property_lots')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (data) setLots(data);
        // Si la table n'existe pas encore, on ignore silencieusement
        if (error) console.warn('property_lots:', error.message);
      });
  }, [open]);

  return (
    <>
      <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
        Ajouter un bien
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un bien" size="xl">
        <PropertyForm lots={lots} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
