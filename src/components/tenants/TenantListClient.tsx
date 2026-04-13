'use client';

// Partie interactive de la page liste des locataires (recherche, filtres, onglets, modale)
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import TenantForm from '@/components/tenants/TenantForm';
import StatusBadge from '@/components/ui/StatusBadge';
import { Users, Plus, Search, Eye, Pencil, UserX } from 'lucide-react';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import type { Tenant, Property } from '@/types';

type PaymentFilter = 'all' | 'paid' | 'pending' | 'late';
type Tab = 'active' | 'former';

interface TenantWithProperty extends Tenant {
  property?: Pick<Property, 'id' | 'name' | 'address' | 'city'> | null;
}

interface TenantListClientProps {
  tenants: TenantWithProperty[];
  onEndLease: (tenant: Tenant) => void;
}

export default function TenantListClient({ tenants, onEndLease }: TenantListClientProps) {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [tab, setTab] = useState<Tab>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Séparer actifs / anciens
  const activeTenants = useMemo(() => tenants.filter((t) => !t.end_date), [tenants]);
  const formerTenants = useMemo(() => tenants.filter((t) => !!t.end_date), [tenants]);

  const currentList = tab === 'active' ? activeTenants : formerTenants;

  // Filtrer
  const filtered = useMemo(() => {
    let result = currentList;

    // Filtre par statut de paiement
    if (paymentFilter !== 'all') {
      result = result.filter((t) => t.payment_status === paymentFilter);
    }

    // Recherche textuelle
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.first_name.toLowerCase().includes(q) ||
          t.last_name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          (t.property?.address?.toLowerCase().includes(q) ?? false) ||
          (t.property?.name?.toLowerCase().includes(q) ?? false)
      );
    }

    return result;
  }, [currentList, search, paymentFilter]);

  const paymentFilterButtons: { label: string; value: PaymentFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Payé', value: 'paid' },
    { label: 'En attente', value: 'pending' },
    { label: 'En retard', value: 'late' },
  ];

  return (
    <>
      {/* Onglets Actifs / Anciens */}
      <div className="flex items-center gap-1 mb-6 bg-bg-card rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'active'
              ? 'bg-bg-elevated text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Actifs
          <span className={`ml-2 text-xs ${tab === 'active' ? 'text-terracotta' : 'text-text-muted'}`}>
            {activeTenants.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('former')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'former'
              ? 'bg-bg-elevated text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Anciens
          <span className={`ml-2 text-xs ${tab === 'former' ? 'text-terracotta' : 'text-text-muted'}`}>
            {formerTenants.length}
          </span>
        </button>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, adresse du bien..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border-light rounded-xl bg-bg-elevated text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {paymentFilterButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setPaymentFilter(btn.value)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                paymentFilter === btn.value
                  ? 'bg-terracotta text-white'
                  : 'bg-bg-elevated text-text-secondary border border-border-light hover:bg-bg-card'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={currentList.length === 0 ? (tab === 'active' ? 'Aucun locataire actif' : 'Aucun ancien locataire') : 'Aucun résultat'}
            description={
              currentList.length === 0 && tab === 'active'
                ? 'Ajoutez votre premier locataire pour commencer.'
                : 'Essayez de modifier vos critères de recherche ou de filtrage.'
            }
            action={
              currentList.length === 0 && tab === 'active' ? (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un locataire
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-card">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Locataire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Bien associé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Loyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Paiement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Entrée</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border hover:bg-bg-card/50 transition-colors">
                    {/* Avatar + Nom */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-terracotta text-white text-sm font-semibold shrink-0">
                          {tenant.first_name.charAt(0)}{tenant.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {fullName(tenant.first_name, tenant.last_name)}
                          </p>
                          <p className="text-xs text-text-secondary">{tenant.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Bien associé */}
                    <td className="px-6 py-4">
                      {tenant.property ? (
                        <Link
                          href={`/biens/${tenant.property.id}`}
                          className="text-sm text-terracotta hover:underline"
                        >
                          <span className="font-medium">{tenant.property.name}</span>
                          <br />
                          <span className="text-xs text-text-secondary">
                            {tenant.property.address}, {tenant.property.city}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </td>

                    {/* Loyer */}
                    <td className="px-6 py-4 text-sm font-medium tabular-nums text-text-primary">
                      {formatCurrency(tenant.rent_amount)}
                    </td>

                    {/* Statut paiement */}
                    <td className="px-6 py-4">
                      <StatusBadge variant="payment" status={tenant.payment_status} />
                    </td>

                    {/* Date d'entrée */}
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(tenant.start_date)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/locataires/${tenant.id}`}
                          className="p-2 rounded-lg text-text-muted hover:text-terracotta hover:bg-terracotta/5 transition-colors"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingTenant(tenant)}
                          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {!tenant.end_date && (
                          <button
                            type="button"
                            onClick={() => onEndLease(tenant)}
                            className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Fin de bail"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modale de création */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Ajouter un locataire"
        size="lg"
      >
        <TenantForm onClose={() => setShowCreateModal(false)} />
      </Modal>

      {/* Modale de modification */}
      <Modal
        open={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        title="Modifier le locataire"
        size="lg"
      >
        {editingTenant && (
          <TenantForm
            tenant={editingTenant}
            onClose={() => setEditingTenant(null)}
          />
        )}
      </Modal>
    </>
  );
}
