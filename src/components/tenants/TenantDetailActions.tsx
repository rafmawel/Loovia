'use client';

// Boutons d'action pour la page détail d'un locataire (Modifier, Fin de bail, Demander un document)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TenantForm from '@/components/tenants/TenantForm';
import EndLeaseModal from '@/components/tenants/EndLeaseModal';
import { Pencil, UserX, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Tenant } from '@/types';

interface Props {
  tenant: Tenant;
}

export default function TenantDetailActions({ tenant }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEndLeaseModal, setShowEndLeaseModal] = useState(false);
  const router = useRouter();

  const isActive = !tenant.end_date;

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
        {isActive && (
          <Button
            variant="danger"
            size="sm"
            icon={<UserX className="h-4 w-4" />}
            onClick={() => setShowEndLeaseModal(true)}
          >
            Fin de bail
          </Button>
        )}
        <Link href="/documents">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileText className="h-4 w-4" />}
          >
            Demander un document
          </Button>
        </Link>
      </div>

      {/* Modale de modification */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le locataire"
        size="lg"
      >
        <TenantForm
          tenant={tenant}
          onClose={() => {
            setShowEditModal(false);
            router.refresh();
          }}
        />
      </Modal>

      {/* Modale fin de bail */}
      <EndLeaseModal
        tenant={tenant}
        open={showEndLeaseModal}
        onClose={() => setShowEndLeaseModal(false)}
      />
    </>
  );
}
