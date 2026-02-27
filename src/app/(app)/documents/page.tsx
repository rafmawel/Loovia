// Page Documents — gestion des documents locataires
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { FolderOpen, FileCheck, ExternalLink } from 'lucide-react';
import { formatDate, fullName } from '@/lib/utils';
import type { TenantDocument, Tenant } from '@/types';

export default async function DocumentsPage() {
  const supabase = await createClient();

  const [docsRes, tenantsRes] = await Promise.all([
    supabase.from('tenant_documents').select('*').order('requested_at', { ascending: false }),
    supabase.from('tenants').select('id, first_name, last_name'),
  ]);

  const documents = (docsRes.data as TenantDocument[]) || [];
  const tenants = (tenantsRes.data as Pick<Tenant, 'id' | 'first_name' | 'last_name'>[]) || [];
  const tenantMap = new Map(tenants.map((t) => [t.id, fullName(t.first_name, t.last_name)]));

  return (
    <div>
      <PageHeader title="Documents" description="Suivi des documents de vos locataires" />

      {documents.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderOpen}
            title="Aucun document"
            description="Les documents demandés à vos locataires apparaîtront ici."
          />
        </Card>
      ) : (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Locataire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Demandé le</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Reçu le</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Fichier</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {tenantMap.get(doc.tenant_id) || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{doc.document_type}</td>
                    <td className="px-6 py-4">
                      <StatusBadge variant="document" status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {formatDate(doc.requested_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {doc.received_at ? formatDate(doc.received_at) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark transition-colors"
                        >
                          <FileCheck className="h-4 w-4" />
                          Voir
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
