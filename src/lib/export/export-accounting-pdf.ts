// Export PDF — Récapitulatif comptable par période
import { jsPDF } from 'jspdf';
import type { BankTransaction } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const TC = { r: 226, g: 114, b: 91 };

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

export function exportAccountingPdf(
  transactions: BankTransaction[],
  dateFrom: string,
  dateTo: string,
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Filtrer par période
  const filtered = transactions.filter((tx) => tx.date >= dateFrom && tx.date <= dateTo);

  // ── Header ──────────────────────────────────────────────────────

  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.rect(0, 0, PAGE_W, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('RÉCAPITULATIF COMPTABLE', PAGE_W / 2, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.text(
    `Période : ${formatDate(dateFrom)} — ${formatDate(dateTo)}`,
    PAGE_W / 2,
    26,
    { align: 'center' },
  );
  doc.setTextColor(0, 0, 0);

  let y = 45;

  // ── Tableau récapitulatif par catégorie ──────────────────────────

  // Regrouper par catégorie
  const byCategory = new Map<string, { incomes: number; expenses: number }>();
  for (const tx of filtered) {
    const cat = tx.category || 'Autre';
    const entry = byCategory.get(cat) || { incomes: 0, expenses: 0 };
    if (tx.amount >= 0) {
      entry.incomes += tx.amount;
    } else {
      entry.expenses += Math.abs(tx.amount);
    }
    byCategory.set(cat, entry);
  }

  // En-tête du tableau récapitulatif
  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SYNTHÈSE PAR CATÉGORIE', MARGIN + 4, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  // Headers du tableau
  doc.setFillColor(240, 240, 240);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Catégorie', MARGIN + 3, y + 5);
  doc.text('Total Entrées', MARGIN + 65, y + 5);
  doc.text('Total Sorties', MARGIN + 105, y + 5);
  doc.text('Solde', MARGIN + CONTENT_W - 5, y + 5, { align: 'right' });
  y += 10;

  let totalIn = 0;
  let totalOut = 0;

  const categories = Array.from(byCategory.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], 'fr'),
  );

  for (const [cat, data] of categories) {
    y = ensureSpace(doc, y, 8);
    const solde = data.incomes - data.expenses;
    totalIn += data.incomes;
    totalOut += data.expenses;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(cat, MARGIN + 3, y + 3);

    doc.setTextColor(16, 185, 129);
    doc.text(data.incomes > 0 ? formatCurrency(data.incomes) : '—', MARGIN + 65, y + 3);

    doc.setTextColor(239, 68, 68);
    doc.text(data.expenses > 0 ? formatCurrency(data.expenses) : '—', MARGIN + 105, y + 3);

    doc.setTextColor(solde >= 0 ? 16 : 239, solde >= 0 ? 185 : 68, solde >= 0 ? 129 : 68);
    doc.text(formatCurrency(solde), MARGIN + CONTENT_W - 5, y + 3, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(230, 230, 230);
    doc.line(MARGIN, y + 5, MARGIN + CONTENT_W, y + 5);
    y += 7;
  }

  // Ligne TOTAL
  y += 2;
  doc.setFillColor(247, 245, 243);
  doc.roundedRect(MARGIN, y - 2, CONTENT_W, 9, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL', MARGIN + 3, y + 4);

  doc.setTextColor(16, 185, 129);
  doc.text(formatCurrency(totalIn), MARGIN + 65, y + 4);

  doc.setTextColor(239, 68, 68);
  doc.text(formatCurrency(totalOut), MARGIN + 105, y + 4);

  const netTotal = totalIn - totalOut;
  doc.setTextColor(netTotal >= 0 ? 16 : 239, netTotal >= 0 ? 185 : 68, netTotal >= 0 ? 129 : 68);
  doc.text(formatCurrency(netTotal), MARGIN + CONTENT_W - 5, y + 4, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  y += 16;

  // ── Tableau détaillé ────────────────────────────────────────────

  y = ensureSpace(doc, y, 30);

  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`DÉTAIL DES TRANSACTIONS (${filtered.length})`, MARGIN + 4, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  // Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Date', MARGIN + 3, y + 5);
  doc.text('Libellé', MARGIN + 28, y + 5);
  doc.text('Catégorie', MARGIN + 105, y + 5);
  doc.text('Montant', MARGIN + CONTENT_W - 5, y + 5, { align: 'right' });
  y += 9;

  // Trier par date
  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  for (const tx of sorted) {
    y = ensureSpace(doc, y, 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(formatDate(tx.date), MARGIN + 3, y + 3);

    // Tronquer le libellé si trop long
    const desc = tx.description || '—';
    const truncated = desc.length > 55 ? desc.slice(0, 52) + '...' : desc;
    doc.text(truncated, MARGIN + 28, y + 3);

    doc.text(tx.category || 'Autre', MARGIN + 105, y + 3);

    const isPositive = tx.amount >= 0;
    doc.setTextColor(isPositive ? 16 : 239, isPositive ? 185 : 68, isPositive ? 129 : 68);
    doc.text(
      `${isPositive ? '+' : ''}${formatCurrency(tx.amount)}`,
      MARGIN + CONTENT_W - 5,
      y + 3,
      { align: 'right' },
    );
    doc.setTextColor(0, 0, 0);

    doc.setDrawColor(240, 240, 240);
    doc.line(MARGIN, y + 5, MARGIN + CONTENT_W, y + 5);
    y += 6;
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
      `Export généré par Loovia le ${formatDate(new Date().toISOString())}`,
      MARGIN,
      287,
    );
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MARGIN, 287, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  // Sauvegarde
  const fromSlug = dateFrom.replace(/-/g, '');
  const toSlug = dateTo.replace(/-/g, '');
  doc.save(`Recap_Comptable_Loovia_${fromSlug}_${toSlug}.pdf`);
}
