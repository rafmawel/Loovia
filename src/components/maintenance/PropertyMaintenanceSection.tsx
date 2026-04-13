'use client';

// Section Maintenance interactive pour la fiche bien — Client Component
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import MaintenanceRequestModal from './MaintenanceRequestModal';
import { Wrench, Plus, Play, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { priorityLabels, priorityColors } from '@/lib/design-system';
import type { MaintenanceRequest, MaintenanceStatus } from '@/types';

interface PropertyMaintenanceSectionProps {
  propertyId: string;
  tenantId?: string | null;
}

export default function PropertyMaintenanceSection({
  propertyId,
  tenantId,
}: PropertyMaintenanceSectionProps) {
  const supabase = createClient();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    setRequests((data || []) as MaintenanceRequest[]);
    setLoading(false);
  }, [supabase, propertyId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async (reqId: string, newStatus: MaintenanceStatus) => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur');

      const label =
        newStatus === 'in_progress' ? 'passée en cours' :
        newStatus === 'resolved' ? 'résolue' :
        newStatus === 'closed' ? 'fermée' : newStatus;

      toast.success(`Demande ${label}`);
      fetchRequests();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Wrench className="h-5 w-5 text-terracotta" />
            Demandes de travaux ({requests.length})
          </h2>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setShowModal(true)}
          >
            Nouvelle demande
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-light border-t-accent" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-text-secondary">Aucune demande de travaux pour ce bien.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl bg-bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {req.title}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityColors[req.priority]?.bg || 'bg-bg-card'
                        } ${priorityColors[req.priority]?.text || 'text-stone-600'}`}
                      >
                        {priorityLabels[req.priority] || req.priority}
                      </span>
                    </div>
                    {req.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 mb-1">
                        {req.description}
                      </p>
                    )}
                    <p className="text-xs text-text-muted">
                      {formatDate(req.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge variant="maintenance" status={req.status} />
                    {/* Quick status actions */}
                    {req.status === 'open' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Passer en cours"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(req.status === 'open' || req.status === 'in_progress') && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'resolved')}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Marquer résolu"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {req.status === 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'closed')}
                        className="p-1.5 text-text-secondary hover:bg-stone-200 rounded-lg transition-colors"
                        title="Fermer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Photos preview */}
                {req.photos && req.photos.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {req.photos.slice(0, 3).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-lg overflow-hidden border border-border-light shrink-0"
                      >
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                    {req.photos.length > 3 && (
                      <span className="text-xs text-text-muted">
                        +{req.photos.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showModal && (
        <MaintenanceRequestModal
          propertyId={propertyId}
          tenantId={tenantId}
          onClose={() => setShowModal(false)}
          onSuccess={fetchRequests}
        />
      )}
    </>
  );
}
