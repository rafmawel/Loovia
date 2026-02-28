'use client';

// Page Maintenance — Vue globale des demandes de travaux
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import MaintenanceRequestModal from '@/components/maintenance/MaintenanceRequestModal';
import {
  Wrench, Filter, Plus, Play, CheckCircle, XCircle, ChevronDown,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { priorityLabels, priorityColors } from '@/lib/design-system';
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from '@/types';

// ── Types ─────────────────────────────────────────────────────────

type RequestWithRelations = MaintenanceRequest & {
  property?: { name: string; address: string };
  tenant?: { first_name: string; last_name: string } | null;
};

type FilterStatusType = 'all' | MaintenanceStatus;
type FilterPriorityType = 'all' | MaintenancePriority;

// ── Page ──────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const supabase = createClient();

  const [requests, setRequests] = useState<RequestWithRelations[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriorityType>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // ── Fetch ───────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [reqRes, propRes] = await Promise.all([
      supabase
        .from('maintenance_requests')
        .select('*, property:properties(name, address), tenant:tenants(first_name, last_name)')
        .order('created_at', { ascending: false }),
      supabase.from('properties').select('id, name'),
    ]);

    setRequests((reqRes.data || []) as RequestWithRelations[]);
    setProperties((propRes.data || []) as { id: string; name: string }[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Filtres ─────────────────────────────────────────────────────

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
    if (propertyFilter !== 'all' && req.property_id !== propertyFilter) return false;
    return true;
  });

  // Stats
  const openCount = requests.filter((r) => r.status === 'open').length;
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length;
  const urgentCount = requests.filter((r) => r.priority === 'urgent' && r.status !== 'closed' && r.status !== 'resolved').length;

  // ── Actions ─────────────────────────────────────────────────────

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
      fetchAll();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // ── Loading ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Travaux & Maintenance" description="Suivi des demandes de travaux" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-terracotta" />
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Travaux & Maintenance"
        description="Vue globale de toutes les demandes de travaux"
      >
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => setShowModal(true)}
        >
          Nouvelle demande
        </Button>
      </PageHeader>

      {/* Compteurs rapides */}
      <div className="flex items-center gap-4 mb-6">
        {urgentCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-700">
              {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
          <span className="text-xs font-medium text-blue-700">
            {openCount} ouverte{openCount > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
          <span className="text-xs font-medium text-amber-700">
            {inProgressCount} en cours
          </span>
        </div>
      </div>

      {/* Tableau */}
      <Card padding="p-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-stone-100 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-stone-400" />

          {/* Filtre par statut */}
          <div className="flex items-center gap-1">
            {(
              [
                { label: 'Tous', value: 'all' },
                { label: 'Ouvertes', value: 'open' },
                { label: 'En cours', value: 'in_progress' },
                { label: 'Résolues', value: 'resolved' },
                { label: 'Fermées', value: 'closed' },
              ] as { label: string; value: FilterStatusType }[]
            ).map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  statusFilter === btn.value
                    ? 'bg-terracotta text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Filtre par priorité */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as FilterPriorityType)}
            className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgente</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          {/* Filtre par bien */}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          >
            <option value="all">Tous les biens</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Wrench}
                title="Aucune demande"
                description="Les demandes de travaux apparaîtront ici."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => setShowModal(true)}
                  >
                    Nouvelle demande
                  </Button>
                }
              />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Demande
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Bien
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">
                        {req.title}
                      </p>
                      {req.description && (
                        <p className="text-xs text-stone-400 truncate max-w-xs mt-0.5">
                          {req.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">
                      {req.property?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">
                      {req.tenant
                        ? `${req.tenant.first_name} ${req.tenant.last_name}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityColors[req.priority]?.bg || 'bg-stone-100'
                        } ${priorityColors[req.priority]?.text || 'text-stone-600'}`}
                      >
                        {priorityLabels[req.priority] || req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant="maintenance" status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500 whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
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
                            className="p-1.5 text-stone-500 hover:bg-stone-200 rounded-lg transition-colors"
                            title="Fermer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modal de création */}
      {showModal && (
        <MaintenanceRequestModal
          properties={properties}
          onClose={() => setShowModal(false)}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
}
