// Génération PDF d'une quittance de loyer — Document professionnel
import { jsPDF } from 'jspdf';
import type { Payment, Property, Tenant, Lease } from '@/types';
import { formatDate, formatCurrency, formatMonthYear } from '@/lib/utils';

// ── Constantes ─────────────────────────────────────────────────────

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const TC = { r: 226, g: 114, b: 91 }; // Terracotta

// ── Génération ─────────────────────────────────────────────────────

export function generateReceiptPdf(
  payment: Payment,
  lease: Lease,
  property: Property,
  tenant: Tenant,
  landlordName: string,
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const period = formatMonthYear(payment.period_start);
  const chargesAmount = lease.charges_amount ?? 0;
  const loyerHC = payment.amount_expected - chargesAmount;
  let y = MARGIN;

  // ── Bande terracotta en haut ────────────────────────────────────

  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.rect(0, 0, PAGE_W, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('QUITTANCE DE LOYER', PAGE_W / 2, 16, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('Helvetica', 'normal');
  doc.text(period.charAt(0).toUpperCase() + period.slice(1), PAGE_W / 2, 26, {
    align: 'center',
  });
  doc.setTextColor(0, 0, 0);

  y = 45;

  // ── Deux colonnes : Bailleur / Locataire ────────────────────────

  const colW = (CONTENT_W - 10) / 2;

  // Bailleur
  doc.setFillColor(247, 245, 243);
  doc.roundedRect(MARGIN, y, colW, 30, 3, 3, 'F');
  doc.setTextColor(TC.r, TC.g, TC.b);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BAILLEUR', MARGIN + 5, y + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(landlordName, MARGIN + 5, y + 14);

  // Locataire
  const col2X = MARGIN + colW + 10;
  doc.setFillColor(247, 245, 243);
  doc.roundedRect(col2X, y, colW, 30, 3, 3, 'F');
  doc.setTextColor(TC.r, TC.g, TC.b);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('LOCATAIRE', col2X + 5, y + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${tenant.first_name} ${tenant.last_name}`, col2X + 5, y + 14);
  doc.setFontSize(8);
  doc.text(property.address, col2X + 5, y + 20);
  doc.text(`${property.postal_code} ${property.city}`, col2X + 5, y + 25);

  y += 38;

  // ── Adresse du bien ─────────────────────────────────────────────

  doc.setFillColor(247, 245, 243);
  doc.roundedRect(MARGIN, y, CONTENT_W, 16, 3, 3, 'F');
  doc.setTextColor(TC.r, TC.g, TC.b);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BIEN LOUÉ', MARGIN + 5, y + 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `${property.address}, ${property.postal_code} ${property.city}`,
    MARGIN + 5,
    y + 12,
  );

  y += 24;

  // ── Période et date de paiement ─────────────────────────────────

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Période : du ${formatDate(payment.period_start)} au ${formatDate(payment.period_end)}`,
    MARGIN,
    y,
  );
  y += 6;
  if (payment.payment_date) {
    doc.text(`Date de paiement : ${formatDate(payment.payment_date)}`, MARGIN, y);
  }

  y += 10;

  // ── Tableau des montants ────────────────────────────────────────

  // En-tête
  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Désignation', MARGIN + 5, y + 5.5);
  doc.text('Montant', MARGIN + CONTENT_W - 5, y + 5.5, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  y += 12;

  // Loyer HC
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Loyer hors charges', MARGIN + 5, y);
  doc.text(formatCurrency(loyerHC), MARGIN + CONTENT_W - 5, y, { align: 'right' });
  doc.setDrawColor(230, 230, 230);
  doc.line(MARGIN, y + 3, MARGIN + CONTENT_W, y + 3);

  y += 8;

  // Charges
  doc.text('Charges', MARGIN + 5, y);
  doc.text(formatCurrency(chargesAmount), MARGIN + CONTENT_W - 5, y, { align: 'right' });
  doc.line(MARGIN, y + 3, MARGIN + CONTENT_W, y + 3);

  y += 8;

  // Total
  doc.setFillColor(247, 245, 243);
  doc.roundedRect(MARGIN, y - 3, CONTENT_W, 10, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', MARGIN + 5, y + 3);
  doc.text(formatCurrency(payment.amount_expected), MARGIN + CONTENT_W - 5, y + 3, {
    align: 'right',
  });

  y += 18;

  // ── Texte légal ─────────────────────────────────────────────────

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);

  const legalText = `Je soussigné(e) ${landlordName}, propriétaire du logement sis ${property.address}, ${property.postal_code} ${property.city}, déclare avoir reçu de ${tenant.first_name} ${tenant.last_name} la somme de ${formatCurrency(payment.amount_paid)} au titre du loyer et des charges pour la période de ${period}.`;

  const legalLines = doc.splitTextToSize(legalText, CONTENT_W) as string[];
  doc.text(legalLines, MARGIN, y);
  y += legalLines.length * 5 + 6;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Pour valoir quittance de loyer.', MARGIN, y);

  y += 16;

  // ── Date et signature ───────────────────────────────────────────

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Fait le ${formatDate(new Date().toISOString())}`, MARGIN, y);

  y += 12;

  // Signature simulée (nom en italique bleu foncé)
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('Helvetica', 'bolditalic');
  doc.setFontSize(14);
  doc.text(landlordName, MARGIN, y);
  doc.setTextColor(0, 0, 0);

  // ── Pied de page ────────────────────────────────────────────────

  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, 282, PAGE_W - MARGIN, 282);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Document généré automatiquement par Loovia', MARGIN, 287);
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(6.5);
  doc.text(
    "Ce document est une quittance de loyer au sens de l'article 21 de la loi du 6 juillet 1989.",
    MARGIN,
    291,
  );
  doc.setTextColor(0, 0, 0);

  return doc;
}

// ── Nom du fichier ────────────────────────────────────────────────

export function getReceiptFilename(tenant: Tenant, period: string): string {
  const name = `${tenant.last_name}_${tenant.first_name}`.replace(/\s+/g, '_');
  const periodSlug = period.replace(/\s+/g, '_');
  return `Quittance_${name}_${periodSlug}.pdf`;
}

// ── Export base64 pour pièce jointe email ─────────────────────────

export function generateReceiptBase64(
  payment: Payment,
  lease: Lease,
  property: Property,
  tenant: Tenant,
  landlordName: string,
): string {
  const doc = generateReceiptPdf(payment, lease, property, tenant, landlordName);
  // Retourner seulement la partie base64 (sans le préfixe data:...)
  const dataUri = doc.output('datauristring');
  return dataUri.split(',')[1];
}
