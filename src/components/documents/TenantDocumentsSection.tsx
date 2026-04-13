'use client';

// Section Documents pour la fiche locataire — Client Component
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import DocumentRequestModal from './DocumentRequestModal';
import { FileText, Plus, CheckCircle, XCircle, Upload } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { TenantDocument, DocumentStatus } from '@/types';

interface TenantDocumentsSectionProps {
  tenantId: string;
  tenantName: string;
}

export default function TenantDocumentsSection({
  tenantId,
  tenantName,
}: TenantDocumentsSectionProps) {
  const supabase = createClient();
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tenant_documents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('requested_at', { ascending: false });

    setDocuments((data || []) as TenantDocument[]);
    setLoading(false);
  }, [supabase, tenantId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpdateStatus = async (docId: string, newStatus: DocumentStatus) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur');

      const statusLabel =
        newStatus === 'validated' ? 'validé' :
        newStatus === 'rejected' ? 'refusé' :
        newStatus === 'received' ? 'marqué comme reçu' : newStatus;

      toast.success(`Document ${statusLabel}`);
      fetchDocuments();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <FileText className="h-5 w-5 text-terracotta" />
            Documents
          </h2>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setShowModal(true)}
          >
            Demander un document
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-light border-t-accent" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Aucun document demandé pour ce locataire.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {doc.document_type}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-secondary">
                      Demandé le {formatDate(doc.requested_at)}
                    </span>
                    {doc.received_at && (
                      <span className="text-xs text-text-muted">
                        · Reçu le {formatDate(doc.received_at)}
                      </span>
                    )}
                  </div>
                  {doc.notes && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {doc.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <StatusBadge variant="document" status={doc.status} />
                  {/* Quick actions */}
                  {doc.status === 'requested' && (
                    <button
                      onClick={() => handleUpdateStatus(doc.id, 'received')}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Marquer comme reçu"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {(doc.status === 'requested' || doc.status === 'received') && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(doc.id, 'validated')}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Valider"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(doc.id, 'rejected')}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Refuser"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de demande de document */}
      {showModal && (
        <DocumentRequestModal
          tenantId={tenantId}
          tenantName={tenantName}
          onClose={() => setShowModal(false)}
          onSuccess={fetchDocuments}
        />
      )}
    </>
  );
}
