'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Eye, Download, Send, RefreshCw, CheckCircle2, Clock, FileCheck } from 'lucide-react';
import { generateLeasePdf, getLeasePdfFilename } from '@/lib/pdf/generate-lease';
import { formatDate } from '@/lib/utils';
import type { Lease, Property, Tenant } from '@/types';

interface LeaseDetailActionsProps {
  lease: Lease;
  property: Property;
  tenant: Tenant;
}

export default function LeaseDetailActions({ lease, property, tenant }: LeaseDetailActionsProps) {
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  // ── PDF Actions ──────────────────────────────────────────────────

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

  // ── Signature Actions ────────────────────────────────────────────

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

      toast.success('Bail envoyé pour signature');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/leases/check-signature-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId: lease.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la vérification');
      }

      toast.success('Statut mis à jour');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la vérification');
    } finally {
      setChecking(false);
    }
  };

  // ── Rendu selon le statut ────────────────────────────────────────

  // Boutons PDF (toujours visibles)
  const pdfButtons = (
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
    </div>
  );

  // ── Draft ────────────────────────────────────────────────────────
  if (lease.status === 'draft') {
    return (
      <div className="flex items-center gap-2">
        {pdfButtons}
        <Button
          variant="primary"
          size="sm"
          icon={<Send className="h-4 w-4" />}
          onClick={handleSendForSignature}
          loading={sending}
        >
          Envoyer pour signature
        </Button>
      </div>
    );
  }

  // ── Pending Signature ────────────────────────────────────────────
  if (lease.status === 'pending_signature') {
    const landlordSigned = lease.signature_landlord_status === 'signed';
    const tenantSigned = lease.signature_tenant_status === 'signed';

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {pdfButtons}
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={handleCheckStatus}
            loading={checking}
          >
            Vérifier le statut
          </Button>
        </div>

        {/* Timeline des signatures */}
        <Card>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-terracotta" />
            Suivi des signatures
          </h3>
          {lease.sent_for_signature_at && (
            <p className="text-xs text-stone-500 mb-3">
              Envoyé le {formatDate(lease.sent_for_signature_at)}
            </p>
          )}
          <div className="space-y-3">
            {/* Bailleur */}
            <div className="flex items-center gap-3">
              {landlordSigned ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">Bailleur</p>
                {landlordSigned && lease.signature_landlord_date ? (
                  <p className="text-xs text-emerald-600">
                    Signé le {formatDate(lease.signature_landlord_date)}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600">En attente de signature</p>
                )}
              </div>
            </div>

            {/* Locataire */}
            <div className="flex items-center gap-3">
              {tenantSigned ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  Locataire — {tenant.first_name} {tenant.last_name}
                </p>
                {tenantSigned && lease.signature_tenant_date ? (
                  <p className="text-xs text-emerald-600">
                    Signé le {formatDate(lease.signature_tenant_date)}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600">En attente de signature</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Signed ───────────────────────────────────────────────────────
  if (lease.status === 'signed') {
    return (
      <div className="space-y-4">
        {pdfButtons}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-700">Bail signé</h3>
          </div>
          <div className="space-y-2 text-xs text-stone-600">
            {lease.signature_landlord_date && (
              <p>Bailleur : signé le {formatDate(lease.signature_landlord_date)}</p>
            )}
            {lease.signature_tenant_date && (
              <p>Locataire : signé le {formatDate(lease.signature_tenant_date)}</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ── Active ───────────────────────────────────────────────────────
  if (lease.status === 'active') {
    return (
      <div className="space-y-4">
        {pdfButtons}
        <Card>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm font-medium text-blue-700">Bail actif</p>
          </div>
        </Card>
      </div>
    );
  }

  // ── Terminated ou autre ──────────────────────────────────────────
  return pdfButtons;
}
