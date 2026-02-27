'use client';

// Modale de confirmation de fin de bail
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { AlertTriangle, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { fullName } from '@/lib/utils';
import type { Tenant } from '@/types';

interface EndLeaseModalProps {
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
}

export default function EndLeaseModal({ tenant, open, onClose }: EndLeaseModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleEndLease() {
    if (!tenant) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Mettre end_date sur le locataire
      const { error } = await supabase
        .from('tenants')
        .update({ end_date: today })
        .eq('id', tenant.id);

      if (error) throw new Error(error.message);

      const name = fullName(tenant.first_name, tenant.last_name);
      toast.success(`Bail terminé pour ${name}`);
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la fin de bail');
    } finally {
      setLoading(false);
    }
  }

  if (!tenant) return null;

  const name = fullName(tenant.first_name, tenant.last_name);

  return (
    <Modal open={open} onClose={onClose} title="Fin de bail" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Êtes-vous sûr de vouloir mettre fin au bail de {name} ?
            </p>
            <p className="text-sm text-amber-600 mt-1">
              Le locataire passera dans l&apos;onglet &quot;Anciens&quot; et le bien redeviendra libre.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={handleEndLease}
            icon={<UserX className="h-4 w-4" />}
          >
            Confirmer la fin de bail
          </Button>
        </div>
      </div>
    </Modal>
  );
}
