// Moteur de matching bancaire — rapprochement automatique des transactions
import type { BankTransaction, Payment, Tenant, Lease } from '@/types';

interface MatchResult {
  transactionId: string;
  paymentId: string;
  confidence: number; // 0 à 1
  reason: string;
}

// Rapprocher une transaction bancaire avec un paiement en attente
export function matchTransaction(
  transaction: BankTransaction,
  pendingPayments: (Payment & { lease: Lease & { tenant: Tenant } })[],
): MatchResult | null {
  let bestMatch: MatchResult | null = null;
  let bestScore = 0;

  for (const payment of pendingPayments) {
    let score = 0;
    const reasons: string[] = [];

    // Critère 1 : Montant exact (poids fort)
    const expectedAmount = payment.amount_expected;
    const txAmount = Math.abs(transaction.amount);
    if (txAmount === expectedAmount) {
      score += 0.5;
      reasons.push('Montant exact');
    } else if (Math.abs(txAmount - expectedAmount) <= 1) {
      score += 0.35;
      reasons.push('Montant approchant (±1€)');
    } else if (Math.abs(txAmount - expectedAmount) / expectedAmount <= 0.05) {
      score += 0.2;
      reasons.push('Montant proche (±5%)');
    }

    // Critère 2 : IBAN correspondant
    if (
      transaction.sender_iban &&
      payment.lease.tenant.last_known_iban &&
      transaction.sender_iban === payment.lease.tenant.last_known_iban
    ) {
      score += 0.3;
      reasons.push('IBAN correspondant');
    }

    // Critère 3 : Date dans la période attendue
    const txDate = new Date(transaction.date);
    const periodStart = new Date(payment.period_start);
    const periodEnd = new Date(payment.period_end);
    if (txDate >= periodStart && txDate <= periodEnd) {
      score += 0.15;
      reasons.push('Date dans la période');
    }

    // Critère 4 : Nom du locataire dans la description
    if (transaction.description) {
      const desc = transaction.description.toLowerCase();
      const tenantName = `${payment.lease.tenant.first_name} ${payment.lease.tenant.last_name}`.toLowerCase();
      if (desc.includes(tenantName) || desc.includes(payment.lease.tenant.last_name.toLowerCase())) {
        score += 0.05;
        reasons.push('Nom dans la description');
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        transactionId: transaction.id,
        paymentId: payment.id,
        confidence: Math.min(score, 1),
        reason: reasons.join(', '),
      };
    }
  }

  // Seuil minimal de confiance pour proposer un rapprochement
  if (bestMatch && bestMatch.confidence >= 0.4) {
    return bestMatch;
  }

  return null;
}

// Traiter un lot de transactions et retourner les suggestions
export function batchMatch(
  transactions: BankTransaction[],
  pendingPayments: (Payment & { lease: Lease & { tenant: Tenant } })[],
): MatchResult[] {
  const results: MatchResult[] = [];
  const usedPaymentIds = new Set<string>();

  // Trier par montant pour commencer par les correspondances exactes
  const sorted = [...transactions].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  for (const tx of sorted) {
    // Filtrer les paiements déjà utilisés
    const available = pendingPayments.filter((p) => !usedPaymentIds.has(p.id));
    const match = matchTransaction(tx, available);
    if (match) {
      results.push(match);
      usedPaymentIds.add(match.paymentId);
    }
  }

  return results;
}
