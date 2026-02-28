// Moteur de matching — rapprochement automatique transactions ↔ paiements
import type { BankTransaction, Payment, Tenant, Lease } from '@/types';

// ── Types ──────────────────────────────────────────────────────────

export interface MatchResult {
  transactionId: string;
  paymentId: string | null;
  score: number;
  status: 'matched' | 'suggestion' | 'unmatched';
  details: string[];
}

// ── Scoring d'un couple transaction/paiement ──────────────────────

function scoreMatch(
  tx: BankTransaction,
  payment: Payment,
  tenant: Tenant | undefined,
): { score: number; details: string[] } {
  let score = 0;
  const details: string[] = [];

  // 1. MONTANT (+50 points) — écart < 1€
  const amountDiff = Math.abs(Math.abs(tx.amount) - payment.amount_expected);
  if (amountDiff < 1) {
    score += 50;
    details.push(`Montant exact (écart ${amountDiff.toFixed(2)}€)`);
  } else if (amountDiff < 10) {
    score += 25;
    details.push(`Montant proche (écart ${amountDiff.toFixed(2)}€)`);
  }

  // 2. PÉRIODE (+20 points) — date dans [period_start - 5j, period_end + 10j]
  const txDate = new Date(tx.date);
  const periodStart = new Date(payment.period_start);
  const periodEnd = new Date(payment.period_end);
  periodStart.setDate(periodStart.getDate() - 5);
  periodEnd.setDate(periodEnd.getDate() + 10);

  if (txDate >= periodStart && txDate <= periodEnd) {
    score += 20;
    details.push('Date dans la période attendue');
  }

  // 3. IBAN (+30 points) — hard match si IBAN dispo
  if (
    tx.sender_iban &&
    tenant?.last_known_iban &&
    tx.sender_iban.replace(/\s/g, '').toUpperCase() ===
      tenant.last_known_iban.replace(/\s/g, '').toUpperCase()
  ) {
    score += 30;
    details.push('IBAN correspondant');
  }

  // 4. NOM (+15 points) — description contient le nom du locataire
  if (tenant?.last_name && tx.description) {
    const lastName = tenant.last_name.toLowerCase();
    const desc = tx.description.toLowerCase();
    if (desc.includes(lastName)) {
      score += 15;
      details.push(`Nom "${tenant.last_name}" trouvé dans le libellé`);
    }
  }

  return { score, details };
}

// ── Matching d'un lot de transactions ──────────────────────────────

export function matchTransactions(
  transactions: BankTransaction[],
  pendingPayments: (Payment & { lease?: Lease & { tenant?: Tenant } })[],
  tenants: Tenant[],
): MatchResult[] {
  // Index rapide : tenant par lease_id
  const tenantByLease = new Map<string, Tenant>();
  for (const payment of pendingPayments) {
    if (payment.lease?.tenant) {
      tenantByLease.set(payment.lease_id, payment.lease.tenant as Tenant);
    }
  }
  // Fallback : chercher dans la liste des tenants
  for (const payment of pendingPayments) {
    if (!tenantByLease.has(payment.lease_id) && payment.lease?.tenant_id) {
      const tenant = tenants.find((t) => t.id === payment.lease!.tenant_id);
      if (tenant) tenantByLease.set(payment.lease_id, tenant);
    }
  }

  const matchedPaymentIds = new Set<string>();
  const results: MatchResult[] = [];

  // Trier par montant décroissant pour prioriser les gros montants
  const sorted = [...transactions].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  for (const tx of sorted) {
    let bestMatch: { payment: Payment; score: number; details: string[] } | null = null;

    for (const payment of pendingPayments) {
      if (matchedPaymentIds.has(payment.id)) continue;
      if (payment.status === 'paid') continue;

      const tenant = tenantByLease.get(payment.lease_id);
      const { score, details } = scoreMatch(tx, payment, tenant);

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { payment, score, details };
      }
    }

    let status: MatchResult['status'] = 'unmatched';

    if (bestMatch) {
      if (bestMatch.score >= 90) {
        status = 'matched';
        matchedPaymentIds.add(bestMatch.payment.id);
      } else if (bestMatch.score >= 70) {
        status = 'suggestion';
      }
    }

    results.push({
      transactionId: tx.id,
      paymentId: bestMatch?.payment.id ?? null,
      score: bestMatch?.score ?? 0,
      status,
      details: bestMatch?.details ?? [],
    });
  }

  return results;
}
