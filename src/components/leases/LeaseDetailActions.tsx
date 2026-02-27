'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { Eye, Download, Send } from 'lucide-react';
import { generateLeasePdf, getLeasePdfFilename } from '@/lib/pdf/generate-lease';
import { createClient } from '@/lib/supabase/client';
import type { Lease, Property, Tenant } from '@/types';

interface LeaseDetailActionsProps {
  lease: Lease;
  property: Property;
  tenant: Tenant;
}

export default function LeaseDetailActions({ lease, property, tenant }: LeaseDetailActionsProps) {
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const isDraft = lease.status === 'draft';

  // Prévisualiser le PDF dans un nouvel onglet
  const handlePreview = () => {
    try {
      const doc = generateLeasePdf(lease, property, tenant);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Erreur lors de la génération du PDF');
      console.error(err);
    }
  };

  // Télécharger le PDF
  const handleDownload = () => {
    try {
      const doc = generateLeasePdf(lease, property, tenant);
      const filename = getLeasePdfFilename(tenant, property);
      doc.save(filename);
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
      console.error(err);
    }
  };

  // Envoyer pour signature
  const handleSendForSignature = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/leases/send-for-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId: lease.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      // Mettre à jour le statut localement
      const supabase = createClient();
      await supabase
        .from('leases')
        .update({
          status: 'pending_signature',
          sent_for_signature_at: new Date().toISOString(),
        })
        .eq('id', lease.id);

      toast.success('Bail envoyé pour signature');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        icon={<Eye className="h-4 w-4" />}
        onClick={handlePreview}
      >
        Prévisualiser
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<Download className="h-4 w-4" />}
        onClick={handleDownload}
      >
        Télécharger
      </Button>
      {isDraft && (
        <Button
          variant="primary"
          size="sm"
          icon={<Send className="h-4 w-4" />}
          onClick={handleSendForSignature}
          loading={sending}
        >
          Envoyer pour signature
        </Button>
      )}
    </div>
  );
}
