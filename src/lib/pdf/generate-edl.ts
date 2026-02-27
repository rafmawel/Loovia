// Génération PDF d'un état des lieux
import { jsPDF } from 'jspdf';
import type { EdlReport, Property, Tenant } from '@/types';
import { formatDate } from '@/lib/utils';

// Générer l'état des lieux en PDF
export function generateEdlPdf(
  report: EdlReport,
  property: Property,
  tenant: Tenant,
  landlordName: string,
): string {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const isEntrance = report.type === 'entrance';

  // En-tête
  doc.setTextColor(226, 114, 91);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isEntrance ? "ÉTAT DES LIEUX D'ENTRÉE" : "ÉTAT DES LIEUX DE SORTIE",
    margin,
    y
  );
  y += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date : ${formatDate(report.created_at)}`, margin, y);
  y += 10;

  // Logement
  doc.setFont('helvetica', 'bold');
  doc.text('LOGEMENT', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`${property.name}`, margin, y);
  y += 5;
  doc.text(`${property.address}, ${property.postal_code} ${property.city}`, margin, y);
  y += 5;
  doc.text(`Type : ${property.property_type} — ${property.furnished_type}`, margin, y);
  if (property.surface) {
    y += 5;
    doc.text(`Surface : ${property.surface} m²`, margin, y);
  }
  y += 10;

  // Parties
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIES', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Bailleur : ${landlordName}`, margin, y);
  y += 5;
  doc.text(`Locataire : ${tenant.first_name} ${tenant.last_name}`, margin, y);
  y += 10;

  // Données de l'état des lieux (contenu dynamique du JSONB)
  const data = report.data as Record<string, unknown>;
  if (data && typeof data === 'object') {
    doc.setFont('helvetica', 'bold');
    doc.text('CONSTATATIONS', margin, y);
    y += 8;

    // Parcourir les pièces si elles existent
    const rooms = (data.rooms as Record<string, unknown>[]) || [];
    for (const room of rooms) {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }

      const roomName = (room.name as string) || 'Pièce';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(roomName, margin, y);
      y += 6;

      // Éléments de la pièce
      const items = (room.items as Record<string, unknown>[]) || [];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      for (const item of items) {
        if (y > 265) {
          doc.addPage();
          y = margin;
        }
        const itemName = (item.name as string) || '';
        const state = (item.state as string) || '';
        const comment = (item.comment as string) || '';
        doc.text(`• ${itemName} : ${state}${comment ? ` — ${comment}` : ''}`, margin + 5, y);
        y += 5;
      }
      y += 3;
    }

    // Compteurs
    const meters = data.meters as Record<string, unknown> | undefined;
    if (meters) {
      if (y > 240) {
        doc.addPage();
        y = margin;
      }
      y += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('RELEVÉS DE COMPTEURS', margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      if (meters.electricity) doc.text(`Électricité : ${meters.electricity}`, margin + 5, y);
      y += 5;
      if (meters.gas) doc.text(`Gaz : ${meters.gas}`, margin + 5, y);
      y += 5;
      if (meters.water) doc.text(`Eau : ${meters.water}`, margin + 5, y);
      y += 5;
    }

    // Observations
    if (data.observations) {
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVATIONS', margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(String(data.observations), 170);
      for (const line of obsLines) {
        if (y > 265) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      }
    }
  }

  // Signatures
  y += 10;
  if (y > 240) {
    doc.addPage();
    y = margin;
  }
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURES', margin, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Le Bailleur :', margin, y);
  doc.text('Le Locataire :', 120, y);

  return doc.output('datauristring');
}
