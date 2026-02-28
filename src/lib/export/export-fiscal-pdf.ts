// Export PDF — Déclaration foncière (compatible 2044)
import { jsPDF } from 'jspdf';
import type { BankTransaction, Property } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const TC = { r: 226, g: 114, b: 91 };

// Catégories fiscales
const FISCAL_CATEGORIES = [
  { key: 'Loyer', label: 'Loyers encaissés', type: 'income' as const },
  { key: 'Charges Copro', label: 'Charges de copropriété', type: 'expense' as const },
  { key: 'Travaux', label: 'Travaux et réparations', type: 'expense' as const },
  { key: 'Assurance', label: 'Primes d\'assurance', type: 'expense' as const },
  { key: 'Taxe/Impôt', label: 'Taxes et impôts', type: 'expense' as const },
  { key: 'Prêt', label: 'Intérêts d\'emprunt', type: 'expense' as const },
];

interface PropertySummary {
  property: Property;
  transactions: BankTransaction[];
  totals: Record<string, number>;
  brutRevenue: number;
  totalCharges: number;
  netRevenue: number;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

export function exportFiscalPdf(
  transactions: BankTransaction[],
  properties: Property[],
  year: number,
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const dateFrom = `${year}-01-01`;
  const dateTo = `${year}-12-31`;

  // Filtrer les transactions de l'année
  const yearTx = transactions.filter((tx) => tx.date >= dateFrom && tx.date <= dateTo);

  // ── Header ──────────────────────────────────────────────────────

  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.rect(0, 0, PAGE_W, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DÉCLARATION DE REVENUS FONCIERS', PAGE_W / 2, 16, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Année ${year}`, PAGE_W / 2, 26, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Récapitulatif compatible déclaration 2044', PAGE_W / 2, 34, {
    align: 'center',
  });
  doc.setTextColor(0, 0, 0);

  let y = 50;

  // ── Encadré info ────────────────────────────────────────────────

  doc.setFillColor(247, 245, 243);
  doc.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.text(
    'Ce document est un récapitulatif de vos revenus fonciers. Il ne remplace pas la déclaration officielle',
    MARGIN + 5,
    y + 6,
  );
  doc.text(
    'mais vous aide à préparer votre formulaire 2044. Vérifiez les montants avec votre comptable.',
    MARGIN + 5,
    y + 11,
  );
  doc.setTextColor(0, 0, 0);

  y += 22;

  // ── Récapitulatif global toutes propriétés ──────────────────────

  // Calculer les totaux globaux par catégorie
  const globalTotals: Record<string, number> = {};
  for (const cat of FISCAL_CATEGORIES) {
    const catTx = yearTx.filter((tx) => tx.category === cat.key);
    globalTotals[cat.key] = catTx.reduce((s, tx) => s + Math.abs(tx.amount), 0);
  }

  const globalBrut = globalTotals['Loyer'] || 0;
  const globalCharges = FISCAL_CATEGORIES
    .filter((c) => c.type === 'expense')
    .reduce((s, c) => s + (globalTotals[c.key] || 0), 0);
  const globalNet = globalBrut - globalCharges;

  // Section titre
  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RÉCAPITULATIF GLOBAL', MARGIN + 4, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  // Tableau des catégories
  for (const cat of FISCAL_CATEGORIES) {
    const amount = globalTotals[cat.key] || 0;
    if (amount === 0) continue;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(cat.label, MARGIN + 5, y + 3);

    if (cat.type === 'income') {
      doc.setTextColor(16, 185, 129);
      doc.text(`+${formatCurrency(amount)}`, MARGIN + CONTENT_W - 5, y + 3, { align: 'right' });
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text(`-${formatCurrency(amount)}`, MARGIN + CONTENT_W - 5, y + 3, { align: 'right' });
    }
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(230, 230, 230);
    doc.line(MARGIN, y + 5, MARGIN + CONTENT_W, y + 5);
    y += 8;
  }

  // Totaux
  y += 2;
  doc.setFillColor(247, 245, 243);
  doc.roundedRect(MARGIN, y - 2, CONTENT_W, 24, 2, 2, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Revenus fonciers bruts', MARGIN + 5, y + 4);
  doc.setTextColor(16, 185, 129);
  doc.text(formatCurrency(globalBrut), MARGIN + CONTENT_W - 5, y + 4, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  doc.text('Total charges déductibles', MARGIN + 5, y + 11);
  doc.setTextColor(239, 68, 68);
  doc.text(`-${formatCurrency(globalCharges)}`, MARGIN + CONTENT_W - 5, y + 11, {
    align: 'right',
  });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  doc.text('REVENU FONCIER NET', MARGIN + 5, y + 19);
  doc.setTextColor(globalNet >= 0 ? 16 : 239, globalNet >= 0 ? 185 : 68, globalNet >= 0 ? 129 : 68);
  doc.text(formatCurrency(globalNet), MARGIN + CONTENT_W - 5, y + 19, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  y += 32;

  // ── Détail par bien ─────────────────────────────────────────────

  if (properties.length > 0) {
    y = ensureSpace(doc, y, 20);

    doc.setFillColor(TC.r, TC.g, TC.b);
    doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DÉTAIL PAR BIEN', MARGIN + 4, y + 5.5);
    doc.setTextColor(0, 0, 0);
    y += 14;

    for (const prop of properties) {
      y = ensureSpace(doc, y, 30);

      // Nom du bien
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(TC.r, TC.g, TC.b);
      doc.text(prop.name, MARGIN + 3, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`${prop.address}, ${prop.postal_code} ${prop.city}`, MARGIN + 3, y + 5);
      y += 10;

      // Loyers attendus (depuis rent_amount * 12)
      const annualRent = prop.rent_amount * 12;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Loyer annuel attendu', MARGIN + 8, y + 3);
      doc.text(formatCurrency(annualRent), MARGIN + CONTENT_W - 10, y + 3, {
        align: 'right',
      });
      doc.setDrawColor(230, 230, 230);
      doc.line(MARGIN + 5, y + 5, MARGIN + CONTENT_W - 5, y + 5);
      y += 8;

      // Charges annuelles
      const annualCharges = prop.charges_amount * 12;
      doc.text('Charges annuelles', MARGIN + 8, y + 3);
      doc.text(formatCurrency(annualCharges), MARGIN + CONTENT_W - 10, y + 3, {
        align: 'right',
      });
      doc.line(MARGIN + 5, y + 5, MARGIN + CONTENT_W - 5, y + 5);
      y += 10;
    }
  }

  // ── Footer sur toutes les pages ─────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, 282, PAGE_W - MARGIN, 282);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Document généré par Loovia le ${formatDate(new Date().toISOString())}`,
      MARGIN,
      287,
    );
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MARGIN, 287, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`Declaration_Fonciere_${year}.pdf`);
}
