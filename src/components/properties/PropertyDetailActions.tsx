'use client';

// Boutons d'action pour la page détail d'un bien (Modifier, Supprimer)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import PropertyForm from '@/components/properties/PropertyForm';
import { Pencil, Trash2, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate, fullName } from '@/lib/utils';
import JSZip from 'jszip';
import type { Property, PropertyLot, Tenant, Lease, Payment } from '@/types';

interface Props {
  property: Property;
}

const deleteReasons = [
  { value: 'vente', label: 'Vente du bien' },
  { value: 'heritage', label: 'Héritage / Donation' },
  { value: 'fin_gestion', label: 'Fin de gestion' },
  { value: 'erreur', label: 'Erreur de saisie' },
  { value: 'autre', label: 'Autre' },
];

export default function PropertyDetailActions({ property }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lots, setLots] = useState<PropertyLot[]>([]);
  const [deleteReason, setDeleteReason] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!showEditModal) return;
    supabase
      .from('property_lots')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (data) setLots(data);
        if (error) console.warn('property_lots:', error.message);
      });
  }, [showEditModal, supabase]);

  function resetDeleteForm() {
    setDeleteReason('');
    setSalePrice('');
    setSaleDate('');
    setOtherReason('');
  }

  async function handleExportZip() {
    setExporting(true);
    try {
      // Charger toutes les données liées en parallèle
      const [tenantsRes, leasesRes, paymentsRes, docsRes, edlRes, maintenanceRes] = await Promise.all([
        supabase.from('tenants').select('*').eq('property_id', property.id),
        supabase.from('leases').select('*').eq('property_id', property.id),
        supabase.from('maintenance_requests').select('*').eq('property_id', property.id),
        // Documents via les locataires de ce bien
        supabase.from('tenants').select('id').eq('property_id', property.id).then(async ({ data: tenants }) => {
          if (!tenants || tenants.length === 0) return { data: [] };
          const ids = tenants.map((t) => t.id);
          return supabase.from('tenant_documents').select('*').in('tenant_id', ids);
        }),
        supabase.from('edl_reports').select('*').eq('property_id', property.id),
        supabase.from('maintenance_requests').select('*').eq('property_id', property.id),
      ]);

      const tenants = (tenantsRes.data || []) as Tenant[];
      const leases = (leasesRes.data || []) as Lease[];
      const documents = (docsRes.data || []) as Array<Record<string, unknown>>;
      const edlReports = (edlRes.data || []) as Array<Record<string, unknown>>;
      const maintenanceRequests = (maintenanceRes.data || []) as Array<Record<string, unknown>>;

      // Charger les paiements via les baux
      let payments: Payment[] = [];
      if (leases.length > 0) {
        const leaseIds = leases.map((l) => l.id);
        const { data } = await supabase.from('payments').select('*').in('lease_id', leaseIds);
        payments = (data || []) as Payment[];
      }

      const zip = new JSZip();

      // 1. Fiche du bien
      zip.file('bien.json', JSON.stringify(property, null, 2));
      zip.file('bien_resume.txt', buildPropertySummary(property));

      // 2. Locataires
      if (tenants.length > 0) {
        const tenantsFolder = zip.folder('locataires')!;
        tenantsFolder.file('locataires.json', JSON.stringify(tenants, null, 2));
        tenantsFolder.file('locataires_resume.txt', buildTenantsSummary(tenants));
      }

      // 3. Baux
      if (leases.length > 0) {
        const leasesFolder = zip.folder('baux')!;
        leasesFolder.file('baux.json', JSON.stringify(leases, null, 2));
        leasesFolder.file('baux_resume.txt', buildLeasesSummary(leases));
      }

      // 4. Paiements
      if (payments.length > 0) {
        const paymentsFolder = zip.folder('paiements')!;
        paymentsFolder.file('paiements.json', JSON.stringify(payments, null, 2));
        paymentsFolder.file('paiements_resume.txt', buildPaymentsSummary(payments));
      }

      // 5. Documents
      if (documents.length > 0) {
        const docsFolder = zip.folder('documents')!;
        docsFolder.file('documents.json', JSON.stringify(documents, null, 2));
      }

      // 6. États des lieux
      if (edlReports.length > 0) {
        const edlFolder = zip.folder('etats_des_lieux')!;
        edlFolder.file('edl.json', JSON.stringify(edlReports, null, 2));
      }

      // 7. Demandes de travaux
      if (maintenanceRequests.length > 0) {
        const maintenanceFolder = zip.folder('travaux')!;
        maintenanceFolder.file('travaux.json', JSON.stringify(maintenanceRequests, null, 2));
      }

      // Générer et télécharger le ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${property.name.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s-]/g, '')}_export_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export téléchargé avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'export');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!deleteReason) {
      toast.error('Veuillez indiquer la raison de la suppression');
      return;
    }
    if (deleteReason === 'autre' && !otherReason.trim()) {
      toast.error('Veuillez préciser la raison');
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase.from('properties').delete().eq('id', property.id);
      if (error) throw new Error(error.message);
      toast.success('Bien supprimé avec succès');
      router.push('/biens');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  }

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
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => setShowDeleteModal(true)}
        >
          Supprimer
        </Button>
      </div>

      {/* Modale de modification */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le bien"
        size="xl"
      >
        <PropertyForm
          property={property}
          lots={lots}
          onClose={() => {
            setShowEditModal(false);
            router.refresh();
          }}
        />
      </Modal>

      {/* Modale de suppression */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); resetDeleteForm(); }}
        title="Supprimer ce bien"
        size="md"
      >
        <div className="space-y-5">
          {/* Avertissement */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Cette action est irréversible
              </p>
              <p className="text-sm text-red-600 mt-1">
                Le bien <strong>{property.name}</strong> sera définitivement supprimé,
                ainsi que tous les baux, paiements et documents associés.
              </p>
            </div>
          </div>

          {/* Export ZIP */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <Download className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Exporter les données avant suppression
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Téléchargez un fichier ZIP contenant toutes les informations du bien, locataires, baux, paiements et documents.
                Utile en cas de besoin futur (poursuites, recontact, etc.).
              </p>
              <Button
                variant="secondary"
                size="sm"
                loading={exporting}
                icon={<Download className="h-4 w-4" />}
                onClick={handleExportZip}
                className="mt-3"
              >
                {exporting ? 'Export en cours...' : 'Télécharger l\'export ZIP'}
              </Button>
            </div>
          </div>

          {/* Raison de la suppression */}
          <div className="space-y-3">
            <Select
              label="Raison de la suppression"
              placeholder="Sélectionner une raison..."
              options={deleteReasons}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />

            {deleteReason === 'autre' && (
              <Input
                label="Précisez la raison"
                placeholder="Ex: Transfert vers une autre plateforme"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            )}

            {deleteReason === 'vente' && (
              <div className="space-y-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <p className="text-sm font-medium text-slate-900">Détails de la vente</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Prix de vente"
                    type="number"
                    placeholder="Ex: 250000"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                  <Input
                    label="Date de vente"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                  />
                </div>
                {salePrice && property.purchase_price ? (
                  <div className="mt-2 p-3 rounded-lg bg-white border border-stone-200">
                    <p className="text-xs text-stone-500">Plus-value estimée</p>
                    <p className={`text-sm font-bold ${Number(salePrice) - property.purchase_price >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(Number(salePrice) - property.purchase_price)}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <Button variant="ghost" onClick={() => { setShowDeleteModal(false); resetDeleteForm(); }}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              disabled={!deleteReason}
              onClick={handleDelete}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// --- Fonctions utilitaires pour l'export ---

function buildPropertySummary(p: Property): string {
  const lines = [
    `=== FICHE DU BIEN ===`,
    `Nom: ${p.name}`,
    `Adresse: ${p.address}, ${p.postal_code} ${p.city}`,
    `Type: ${p.property_type} — ${p.furnished_type}`,
    `Surface: ${p.surface ? `${p.surface} m²` : 'Non renseignée'}`,
    `Pièces: ${p.number_of_rooms || 'Non renseigné'}`,
    ``,
    `--- Finances ---`,
    `Loyer HC: ${p.rent_amount} €`,
    `Charges: ${p.charges_amount} €`,
    `Dépôt: ${p.deposit_amount} €`,
  ];
  if (p.purchase_price) lines.push(`Prix d'achat: ${p.purchase_price} €`);
  if (p.notary_fees) lines.push(`Frais de notaire: ${p.notary_fees} €`);
  lines.push(``, `Créé le: ${p.created_at}`, `Mis à jour le: ${p.updated_at}`);
  return lines.join('\n');
}

function buildTenantsSummary(tenants: Tenant[]): string {
  return tenants.map((t) => [
    `--- ${t.first_name} ${t.last_name} ---`,
    `Email: ${t.email}`,
    `Téléphone: ${t.phone || 'Non renseigné'}`,
    `Entrée: ${t.start_date}`,
    `Sortie: ${t.end_date || 'En cours'}`,
    `Loyer: ${t.rent_amount} €`,
    `Statut paiement: ${t.payment_status}`,
    t.last_known_iban ? `IBAN: ${t.last_known_iban}` : '',
    ``,
  ].filter(Boolean).join('\n')).join('\n');
}

function buildLeasesSummary(leases: Lease[]): string {
  return leases.map((l) => [
    `--- Bail ${l.id.slice(0, 8)} ---`,
    `Statut: ${l.status}`,
    `Loyer: ${l.monthly_rent} € + ${l.charges_amount} € charges`,
    `Début: ${l.start_date}`,
    `Fin: ${l.end_date || 'En cours'}`,
    ``,
  ].join('\n')).join('\n');
}

function buildPaymentsSummary(payments: Payment[]): string {
  const total = payments.reduce((sum, p) => sum + p.amount_paid, 0);
  const lines = [
    `=== RÉCAPITULATIF DES PAIEMENTS ===`,
    `Nombre de paiements: ${payments.length}`,
    `Total encaissé: ${total} €`,
    ``,
  ];
  payments.forEach((p) => {
    lines.push(`${p.period_start} → ${p.period_end} | ${p.amount_paid}/${p.amount_expected} € | ${p.status}`);
  });
  return lines.join('\n');
}
