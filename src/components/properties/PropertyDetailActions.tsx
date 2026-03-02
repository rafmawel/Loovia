'use client';

// Boutons d'action pour la page détail d'un bien (Modifier, Supprimer)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PropertyForm from '@/components/properties/PropertyForm';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Property, PropertyLot } from '@/types';

interface Props {
  property: Property;
}

export default function PropertyDetailActions({ property }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lots, setLots] = useState<PropertyLot[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!showEditModal) return;
    supabase
      .from('property_lots')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setLots(data);
      });
  }, [showEditModal, supabase]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from('properties').delete().eq('id', property.id);
      if (error) throw new Error(error.message);
      toast.success('Bien supprimé avec succès');
      router.push('/biens');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Pencil className="h-4 w-4" />}
          onClick={() => setShowEditModal(true)}
        >
          Modifier
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => setShowDeleteModal(true)}
        >
          Supprimer
        </Button>
      </div>

      {/* Modale de modification */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le bien"
        size="xl"
      >
        <PropertyForm
          property={property}
          lots={lots}
          onClose={() => {
            setShowEditModal(false);
            router.refresh();
          }}
        />
      </Modal>

      {/* Modale de confirmation de suppression */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer ce bien"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Cette action est irréversible
              </p>
              <p className="text-sm text-red-600 mt-1">
                Le bien <strong>{property.name}</strong> sera définitivement supprimé,
                ainsi que tous les baux, paiements et documents associés.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={handleDelete}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
