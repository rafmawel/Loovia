'use client';

// Page Finances — KPIs, alertes retards, connexion bancaire, transactions
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, Landmark,
  RefreshCw, Check, X, Tag, ChevronDown, Filter, FileText, Send, Download,
} from 'lucide-react';
import AdVideo from '@/components/ui/AdVideo';
import { formatCurrency, formatDate, fullName, formatMonthYear } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import type {
  Payment, Lease, Tenant, Property,
  BankConnection, BankTransaction, TransactionStatus,
} from '@/types';

// ── Types étendus ──────────────────────────────────────────────────

type PaymentWithRelations = Payment & {
  lease?: Lease & {
    tenant?: { first_name: string; last_name: string };
    property?: { name: string; address: string };
  };
};

type TransactionWithPayment = BankTransaction & {
  payment?: Payment & {
    lease?: Lease & {
      tenant?: { first_name: string; last_name: string };
    };
  };
};

type FilterStatus = 'all' | TransactionStatus;
type FilterCategory = 'all' | string;

const CATEGORIES = [
  'Loyer',
  'Prêt',
  'Charges Copro',
  'Travaux',
  'Assurance',
  'Taxe/Impôt',
  'Autre',
];

// ── Page ───────────────────────────────────────────────────────────

export default function FinancesPage() {
  const supabase = createClient();

  // Data
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithPayment[]>([]);
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Properties (for fiscal export)
  const [properties, setProperties] = useState<Property[]>([]);

  // Ad video avant quittance
  const [adPaymentId, setAdPaymentId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState<string | null>(null);

  // Export
  const [showExportMenu, setShowExportMenu] = useState(false);
  const currentYear = new Date().getFullYear();
  const [exportDateFrom, setExportDateFrom] = useState(`${currentYear}-01-01`);
  const [exportDateTo, setExportDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Checkboxes
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Fetch ────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);

    // ── Détection automatique des retards ───────────────────────────
    // Passer les paiements "pending" dont la date d'échéance est dépassée à "late"
    const now = new Date().toISOString().split('T')[0];
    await supabase
      .from('payments')
      .update({ status: 'late' })
      .eq('status', 'pending')
      .lt('period_end', now);

    const [paymentsRes, txRes, connectionsRes, propertiesRes] = await Promise.all([
      supabase
        .from('payments')
        .select('*, lease:leases(*, property:properties(name, address), tenant:tenants(first_name, last_name))')
        .order('period_start', { ascending: false }),
      supabase
        .from('bank_transactions')
        .select('*, payment:payments(*, lease:leases(*, tenant:tenants(first_name, last_name)))')
        .order('date', { ascending: false }),
      supabase.from('bank_connections').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*'),
    ]);

    setPayments((paymentsRes.data as PaymentWithRelations[]) || []);
    setTransactions((txRes.data as TransactionWithPayment[]) || []);
    setConnections((connectionsRes.data as BankConnection[]) || []);
    setProperties((propertiesRes.data as Property[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── KPIs ─────────────────────────────────────────────────────────

  const incomes = transactions
    .filter((tx) => tx.status === 'matched' || tx.category === 'Loyer')
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);

  const expenses = transactions
    .filter((tx) => tx.amount < 0 && tx.category !== 'Loyer' && tx.status !== 'matched')
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);

  const cashflow = incomes - expenses;

  // ── Retards ──────────────────────────────────────────────────────

  const latePayments = payments.filter((p) => p.status === 'late');

  // ── Transactions filtrées ────────────────────────────────────────

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
    return true;
  });

  // ── Actions ──────────────────────────────────────────────────────

  const handlePlaidLink = async () => {
    try {
      const res = await fetch('/api/plaid/create-link-token', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Charger Plaid Link dynamiquement
      const { default: loadPlaidLink } = await import('@/lib/plaid-link');
      await loadPlaidLink(data.link_token, async (publicToken: string, metadata: Record<string, unknown>) => {
        const institution = metadata?.institution as { name?: string } | undefined;
        const exchangeRes = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicToken,
            institutionName: institution?.name || null,
          }),
        });
        if (!exchangeRes.ok) throw new Error('Erreur lors de la connexion');
        toast.success('Compte bancaire connecté');
        fetchAll();
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleSync = async () => {
    if (connections.length === 0) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/finance/sync-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: connections[0].id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(
        `Synchronisation terminée : ${data.added} nouvelles, ${data.matched} matchées, ${data.suggestions} suggestions`,
      );
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const handleValidate = async (txId: string, paymentId: string) => {
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', transactionId: txId, paymentId }),
      });
      if (!res.ok) throw new Error('Erreur');

      // Trouver le tenant associé pour le toast
      const tx = transactions.find((t) => t.id === txId);
      const tenant = tx?.payment?.lease?.tenant;
      const tenantLabel = tenant
        ? `${tenant.first_name} ${tenant.last_name}`
        : 'Locataire';

      // Toast interactif avec bouton quittance
      toast.success(`Loyer de ${tenantLabel} validé !`, {
        action: {
          label: 'Générer la quittance',
          onClick: () => setAdPaymentId(paymentId),
        },
        duration: 8000,
      });

      fetchAll();
    } catch {
      toast.error('Erreur lors de la validation');
    }
  };

  // ── Envoi de quittance ───────────────────────────────────────────

  const handleSendReceipt = async (paymentId: string) => {
    try {
      const res = await fetch('/api/receipts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Quittance envoyée à ${data.email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    }
  };

  // ── Télécharger la quittance PDF ─────────────────────────────────

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const p = payments.find((pay) => pay.id === paymentId);
      if (!p) return;

      const { generateReceiptPdf, getReceiptFilename } = await import(
        '@/lib/pdf/generate-receipt'
      );

      // On a besoin du lease, property, tenant complets
      // Récupérons-les depuis l'API
      const res = await supabase
        .from('payments')
        .select('*, lease:leases(*, property:properties(*), tenant:tenants(*))')
        .eq('id', paymentId)
        .single();

      if (!res.data) throw new Error('Données introuvables');

      const paymentFull = res.data as PaymentWithRelations & {
        lease: { charges_amount: number; property: { address: string; postal_code: string; city: string }; tenant: { first_name: string; last_name: string } };
      };

      const period = formatMonthYear(paymentFull.period_start);
      const tenant = paymentFull.lease?.tenant;
      const property = paymentFull.lease?.property;

      if (!tenant || !property) throw new Error('Données incomplètes');

      const doc = generateReceiptPdf(
        paymentFull as unknown as Parameters<typeof generateReceiptPdf>[0],
        paymentFull.lease as unknown as Parameters<typeof generateReceiptPdf>[1],
        property as unknown as Parameters<typeof generateReceiptPdf>[2],
        tenant as unknown as Parameters<typeof generateReceiptPdf>[3],
        'Propriétaire',
      );

      const filename = getReceiptFilename(
        tenant as unknown as Parameters<typeof getReceiptFilename>[0],
        period,
      );
      doc.save(filename);
      toast.success('PDF téléchargé');
    } catch (err) {
      toast.error('Erreur lors de la génération du PDF');
      void err;
    }
  };

  const handleIgnore = async (txId: string) => {
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ignore', transactionId: txId }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Suggestion ignorée');
      fetchAll();
    } catch {
      toast.error('Erreur');
    }
  };

  const handleCategorize = async (txIds: string[], category: string) => {
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'categorize', transactionIds: txIds, category }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success(`${txIds.length} transaction(s) catégorisée(s)`);
      setSelected(new Set());
      setShowCategoryMenu(null);
      fetchAll();
    } catch {
      toast.error('Erreur lors de la catégorisation');
    }
  };

  const handleReminder = async (paymentId: string) => {
    try {
      const res = await fetch('/api/finance/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      toast.success(`Relance envoyée à ${data.email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi du rappel");
    }
  };

  // ── Export ──────────────────────────────────────────────────────

  const handleExportCsv = async () => {
    const { exportTransactionsCsv } = await import('@/lib/export/export-csv');
    exportTransactionsCsv(transactions, exportDateFrom, exportDateTo);
    toast.success('Export CSV téléchargé');
    setShowExportMenu(false);
  };

  const handleExportAccountingPdf = async () => {
    const { exportAccountingPdf } = await import('@/lib/export/export-accounting-pdf');
    exportAccountingPdf(transactions, exportDateFrom, exportDateTo);
    toast.success('PDF comptable téléchargé');
    setShowExportMenu(false);
  };

  const handleExportFiscalPdf = async () => {
    const year = new Date(exportDateFrom).getFullYear();
    const { exportFiscalPdf } = await import('@/lib/export/export-fiscal-pdf');
    exportFiscalPdf(transactions, properties, year);
    toast.success('PDF fiscal téléchargé');
    setShowExportMenu(false);
  };

  // ── Toggle checkbox ──────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredTransactions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredTransactions.map((tx) => tx.id)));
    }
  };

  // ── Status badge par transaction ─────────────────────────────────

  const renderTxStatus = (tx: TransactionWithPayment) => {
    const tenant = tx.payment?.lease?.tenant;
    switch (tx.status) {
      case 'matched':
        return <StatusBadge variant="transaction" status="matched" label="Loyer confirmé" />;
      case 'suggestion':
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Loyer détecté ?
            </span>
            {tenant && (
              <span className="text-xs text-text-secondary">
                {tenant.first_name} {tenant.last_name}
              </span>
            )}
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => tx.matched_payment_id && handleValidate(tx.id, tx.matched_payment_id)}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Valider"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleIgnore(tx.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Ignorer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      case 'categorized':
        return <StatusBadge variant="transaction" status="categorized" label={tx.category} />;
      default:
        return <StatusBadge variant="transaction" status="unmatched" label="Non identifié" />;
    }
  };

  // ── Loading ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <PageHeader title="Finances" description="Suivi financier et rapprochement bancaire" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border-light border-t-accent" />
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader title="Finances" description="Suivi financier et rapprochement bancaire" />

      {/* SECTION 1 — KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Entrées (Loyers)"
          value={formatCurrency(incomes)}
          className="!border-emerald-100"
        />
        <StatCard
          icon={TrendingDown}
          label="Sorties (Charges)"
          value={formatCurrency(expenses)}
          className="!border-red-100"
        />
        <StatCard
          icon={Wallet}
          label="Cashflow Net"
          value={formatCurrency(cashflow)}
          trend={cashflow >= 0 ? { value: 0, positive: true } : { value: 0, positive: false }}
        />
      </div>

      {/* SECTION 2 — Alertes retards */}
      {latePayments.length > 0 && (
        <Card className="mb-6 !border-red-200 !bg-red-50/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-red-800">
              Paiements en retard ({latePayments.length})
            </h2>
          </div>
          <div className="space-y-3">
            {latePayments.map((p) => {
              const tenant = p.lease?.tenant;
              const property = p.lease?.property;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-red-100"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {tenant && p.lease?.tenant_id ? (
                        <Link href={`/locataires/${p.lease.tenant_id}`} className="text-terracotta hover:underline">
                          {fullName(tenant.first_name, tenant.last_name)}
                        </Link>
                      ) : '—'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {property && p.lease?.property_id ? (
                        <Link href={`/biens/${p.lease.property_id}`} className="text-text-secondary hover:text-terracotta hover:underline">
                          {property.address}
                        </Link>
                      ) : '—'}
                      {' · Échéance '}{formatDate(p.period_end)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold tabular-nums text-red-600">
                      {formatCurrency(p.amount_expected - p.amount_paid)}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReminder(p.id)}
                    >
                      Relancer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SECTION 3 — Connexion bancaire */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-terracotta/10 p-3 text-terracotta">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                {connections.length > 0
                  ? connections[0].institution_name || 'Compte connecté'
                  : 'Connexion bancaire'}
              </h2>
              <p className="text-xs text-text-secondary">
                {connections.length > 0
                  ? `Connecté le ${formatDate(connections[0].created_at)}`
                  : 'Connectez votre banque pour synchroniser vos transactions'}
              </p>
            </div>
          </div>
          <div>
            {connections.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />}
                onClick={handleSync}
                loading={syncing}
              >
                Tout synchroniser
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handlePlaidLink}>
                Connecter mon compte bancaire
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 4 — Export comptable */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Export comptable</h2>
            <p className="text-xs text-text-secondary">
              Exportez vos transactions en CSV ou PDF pour votre comptabilité
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary">Du</label>
              <input
                type="date"
                value={exportDateFrom}
                onChange={(e) => setExportDateFrom(e.target.value)}
                className="text-sm border border-border-light rounded-lg px-2 py-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <label className="text-xs text-text-secondary">au</label>
              <input
                type="date"
                value={exportDateTo}
                onChange={(e) => setExportDateTo(e.target.value)}
                className="text-sm border border-border-light rounded-lg px-2 py-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="h-3.5 w-3.5" />}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Exporter
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-bg-elevated border border-border-light rounded-xl shadow-lg py-1 w-56">
                  <button
                    onClick={handleExportCsv}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-card transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Export CSV (Excel)
                  </button>
                  <button
                    onClick={handleExportAccountingPdf}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-card transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-terracotta" />
                    PDF Récapitulatif comptable
                  </button>
                  <button
                    onClick={handleExportFiscalPdf}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-card transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    PDF Déclaration foncière
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 5 — Tableau des transactions */}
      <Card padding="p-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            {/* Filtre par statut */}
            <div className="flex items-center gap-1">
              {(
                [
                  { label: 'Tous', value: 'all' },
                  { label: 'Matchées', value: 'matched' },
                  { label: 'Suggestions', value: 'suggestion' },
                  { label: 'Catégorisées', value: 'categorized' },
                  { label: 'Non identifiées', value: 'unmatched' },
                ] as { label: string; value: FilterStatus }[]
              ).map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setStatusFilter(btn.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    statusFilter === btn.value
                      ? 'bg-terracotta text-white'
                      : 'text-text-secondary hover:bg-bg-card'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {/* Filtre par catégorie */}
            <div className="relative">
              <button
                onClick={() => setCategoryFilter(categoryFilter === 'all' ? CATEGORIES[0] : 'all')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-text-secondary hover:bg-bg-card"
              >
                <Tag className="h-3 w-3" />
                {categoryFilter === 'all' ? 'Catégorie' : categoryFilter}
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Catégorisation groupée */}
          {selected.size > 0 && (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                icon={<Tag className="h-3.5 w-3.5" />}
                onClick={() => setShowCategoryMenu(showCategoryMenu ? null : 'bulk')}
              >
                Catégoriser ({selected.size})
              </Button>
              {showCategoryMenu === 'bulk' && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-bg-elevated border border-border-light rounded-xl shadow-lg py-1 w-48">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-card transition-colors"
                      onClick={() => handleCategorize([...selected], cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Wallet}
                title="Aucune transaction"
                description="Les transactions apparaîtront ici après la synchronisation bancaire."
              />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-bg-card">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-stone-300 text-terracotta focus:ring-accent/30"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Libellé
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border hover:bg-bg-card/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                        className="rounded border-stone-300 text-terracotta focus:ring-accent/30"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary max-w-xs truncate">
                      {tx.description || '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold tabular-nums text-right whitespace-nowrap ${
                      tx.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setShowCategoryMenu(showCategoryMenu === tx.id ? null : tx.id)}
                          className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
                        >
                          {tx.category || 'Autre'}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {showCategoryMenu === tx.id && (
                          <div className="absolute left-0 top-full mt-1 z-10 bg-bg-elevated border border-border-light rounded-xl shadow-lg py-1 w-44">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-card transition-colors"
                                onClick={() => handleCategorize([tx.id], cat)}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{renderTxStatus(tx)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Vidéo pub avant envoi de quittance */}
      {adPaymentId && (
        <AdVideo
          onComplete={() => { const id = adPaymentId; setAdPaymentId(null); handleSendReceipt(id); }}
          onCancel={() => setAdPaymentId(null)}
        />
      )}
    </div>
  );
}
