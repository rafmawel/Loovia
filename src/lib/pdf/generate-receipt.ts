// Génération PDF d'une quittance de loyer
import { jsPDF } from 'jspdf';
import type { Payment, Property, Tenant } from '@/types';
import { formatDate, formatCurrency, formatMonthYear } from '@/lib/utils';

// Générer la quittance de loyer en PDF
export function generateReceiptPdf(
  payment: Payment,
  property: Property,
  tenant: Tenant,
  landlordName: string,
): string {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // En-tête
  doc.setTextColor(226, 114, 91);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('QUITTANCE DE LOYER', margin, y);
  y += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Période : ${formatMonthYear(payment.period_start)}`, margin, y);
  y += 15;

  // Bailleur
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BAILLEUR', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(landlordName, margin, y);
  y += 12;

  // Locataire
  doc.setFont('helvetica', 'bold');
  doc.text('LOCATAIRE', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`${tenant.first_name} ${tenant.last_name}`, margin, y);
  y += 5;
  doc.text(`${property.address}`, margin, y);
  y += 5;
  doc.text(`${property.postal_code} ${property.city}`, margin, y);
  y += 12;

  // Détail du paiement
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAIL DU PAIEMENT', margin, y);
  y += 8;

  // Tableau simple
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);

  // En-tête du tableau
  doc.setFillColor(247, 245, 243); // off-white
  doc.rect(margin, y - 4, 170, 8, 'F');
  doc.text('Libellé', margin + 2, y);
  doc.text('Montant', 155, y, { align: 'right' });
  y += 8;

  // Loyer
  doc.text('Loyer', margin + 2, y);
  doc.text(formatCurrency(payment.amount_expected), 155, y, { align: 'right' });
  y += 7;

  // Montant payé
  doc.text('Montant reçu', margin + 2, y);
  doc.text(formatCurrency(payment.amount_paid), 155, y, { align: 'right' });
  y += 2;

  // Ligne de séparation
  doc.line(margin, y, margin + 170, y);
  y += 7;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.text('Solde', margin + 2, y);
  const solde = payment.amount_paid - payment.amount_expected;
  doc.text(formatCurrency(solde), 155, y, { align: 'right' });
  y += 15;

  // Période
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Je soussigné(e) ${landlordName}, propriétaire du logement désigné ci-dessus,`,
    margin,
    y
  );
  y += 5;
  doc.text(
    `déclare avoir reçu de ${tenant.first_name} ${tenant.last_name}`,
    margin,
    y
  );
  y += 5;
  doc.text(
    `la somme de ${formatCurrency(payment.amount_paid)} au titre du loyer et des charges`,
    margin,
    y
  );
  y += 5;
  doc.text(
    `pour la période du ${formatDate(payment.period_start)} au ${formatDate(payment.period_end)}.`,
    margin,
    y
  );
  y += 5;
  doc.text(
    `et lui en donne quittance, sous réserve de tous mes droits.`,
    margin,
    y
  );
  y += 15;

  // Date et signature
  doc.setFontSize(10);
  doc.text(`Fait le ${formatDate(new Date().toISOString())}`, margin, y);
  y += 10;
  doc.text('Signature du bailleur :', margin, y);

  // Pied de page
  doc.setFontSize(7);
  doc.setTextColor(120, 113, 108); // stone-500
  doc.text(
    'Ce document est une quittance de loyer au sens de l\'article 21 de la loi du 6 juillet 1989.',
    margin,
    280
  );

  return doc.output('datauristring');
}
