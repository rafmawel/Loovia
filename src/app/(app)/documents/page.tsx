'use client';

// Page Documents — Vue centralisée des documents demandés
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText, Filter, ChevronDown, Eye, CheckCircle, XCircle, Upload,
} from 'lucide-react';
import { formatDate, fullName } from '@/lib/utils';
import { toast } from 'sonner';
import type { TenantDocument, DocumentStatus } from '@/types';

// ── Types ─────────────────────────────────────────────────────────

type DocumentWithRelations = TenantDocument & {
  tenant?: {
    first_name: string;
    last_name: string;
    property_id?: string | null;
  };
  property_name?: string;
};

type FilterStatusType = 'all' | DocumentStatus;

// ── Page ──────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const supabase = createClient();

  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [tenants, setTenants] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [docsRes, tenantsRes, propertiesRes] = await Promise.all([
      supabase
        .from('tenant_documents')
        .select('*, tenant:tenants(first_name, last_name, property_id)')
        .order('requested_at', { ascending: false }),
      supabase.from('tenants').select('id, first_name, last_name'),
      supabase.from('properties').select('id, name'),
    ]);

    const docs = (docsRes.data || []) as DocumentWithRelations[];
    const properties = (propertiesRes.data || []) as { id: string; name: string }[];

    // Enrichir avec le nom du bien
    const enriched = docs.map((doc) => {
      const propId = doc.tenant?.property_id;
      const prop = propId ? properties.find((p) => p.id === propId) : null;
      return { ...doc, property_name: prop?.name || '—' };
    });

    setDocuments(enriched);
    setTenants((tenantsRes.data || []) as { id: string; first_name: string; last_name: string }[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Filtres ─────────────────────────────────────────────────────

  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (tenantFilter !== 'all' && doc.tenant_id !== tenantFilter) return false;
    return true;
  });

  // ── Actions ─────────────────────────────────────────────────────

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
      setShowStatusMenu(null);
      fetchAll();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // ── Loading ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Documents" description="Gestion des documents locataires" />
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
        title="Documents"
        description="Vue centralisée de tous les documents demandés aux locataires"
      />

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
                { label: 'Demandés', value: 'requested' },
                { label: 'Reçus', value: 'received' },
                { label: 'Validés', value: 'validated' },
                { label: 'Refusés', value: 'rejected' },
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

          {/* Filtre par locataire */}
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          >
            <option value="all">Tous les locataires</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredDocuments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FileText}
                title="Aucun document"
                description="Les documents demandés aux locataires apparaîtront ici."
              />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Bien
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Type de document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Demandé le
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
                  const tenant = doc.tenant;
                  return (
                    <tr
                      key={doc.id}
                      className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {tenant
                          ? fullName(tenant.first_name, tenant.last_name)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-500">
                        {doc.property_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {doc.document_type}
                        {doc.notes && (
                          <p className="text-xs text-stone-400 mt-0.5 truncate max-w-xs">
                            {doc.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant="document" status={doc.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-500 whitespace-nowrap">
                        {formatDate(doc.requested_at)}
                        {doc.received_at && (
                          <p className="text-xs text-stone-400">
                            Reçu le {formatDate(doc.received_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center gap-1">
                          {/* Voir le fichier */}
                          {doc.file_url && (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-stone-500 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Voir le fichier"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}

                          {/* Menu d'actions */}
                          <button
                            onClick={() =>
                              setShowStatusMenu(showStatusMenu === doc.id ? null : doc.id)
                            }
                            className="p-1.5 text-stone-500 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Changer le statut"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>

                          {showStatusMenu === doc.id && (
                            <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-stone-200 rounded-xl shadow-lg py-1 w-48">
                              {doc.status !== 'received' && (
                                <button
                                  onClick={() => handleUpdateStatus(doc.id, 'received')}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-900 hover:bg-stone-50 transition-colors flex items-center gap-2"
                                >
                                  <Upload className="h-3.5 w-3.5 text-amber-600" />
                                  Marquer reçu
                                </button>
                              )}
                              {doc.status !== 'validated' && (
                                <button
                                  onClick={() => handleUpdateStatus(doc.id, 'validated')}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-900 hover:bg-stone-50 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                  Valider
                                </button>
                              )}
                              {doc.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(doc.id, 'rejected')}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Refuser
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
