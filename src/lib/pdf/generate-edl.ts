// Génération PDF d'un état des lieux — Document professionnel
import { jsPDF } from 'jspdf';
import type { Property, Tenant, EdlType } from '@/types';
import { formatDate } from '@/lib/utils';
import type { EdlFormData } from '@/components/edl/EdlForm';

// ── Constantes ─────────────────────────────────────────────────────

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const LINE_H = 6;

type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

// Couleurs par état
const STATE_COLORS: Record<string, { r: number; g: number; b: number; label: string }> = {
  neuf: { r: 16, g: 185, b: 129, label: 'Neuf' },
  bon: { r: 59, g: 130, b: 246, label: 'Bon' },
  use: { r: 234, g: 179, b: 8, label: 'Usé' },
  mauvais: { r: 239, g: 68, b: 68, label: 'Mauvais' },
  na: { r: 168, g: 162, b: 158, label: 'N/A' },
};

// Terracotta
const TC = { r: 226, g: 114, b: 91 };

// ── Helpers ────────────────────────────────────────────────────────

function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { size?: number; style?: FontStyle; maxWidth?: number },
): number {
  const size = options?.size ?? 10;
  const style = options?.style ?? 'normal';
  doc.setFont('Helvetica', style);
  doc.setFontSize(size);

  if (options?.maxWidth) {
    const lines = doc.splitTextToSize(text, options.maxWidth) as string[];
    doc.text(lines, x, y);
    return y + lines.length * (size * 0.4);
  }

  doc.text(text, x, y);
  return y + size * 0.4;
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = 285;
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y - 3, PAGE_W - MARGIN, y - 3);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Document généré par Loovia', MARGIN, y);
  doc.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

// ── Génération principale ──────────────────────────────────────────

export function generateEdlPdf(
  data: EdlFormData,
  property: Property,
  tenant: Tenant,
  landlordName: string,
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const typeLabel = data.type === 'entrance' ? "D'ENTRÉE" : 'DE SORTIE';
  let y = MARGIN;

  // ── Titre ───────────────────────────────────────────────────────

  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.rect(0, 0, PAGE_W, 40, 'F');

  doc.setTextColor(255, 255, 255);
  y = addText(doc, `ÉTAT DES LIEUX ${typeLabel}`, MARGIN, 18, {
    size: 20,
    style: 'bold',
  });
  addText(doc, `${property.address}, ${property.postal_code} ${property.city}`, MARGIN, 28, {
    size: 11,
  });
  doc.setTextColor(0, 0, 0);

  y = 50;

  // ── Informations générales ──────────────────────────────────────

  doc.setFillColor(247, 245, 243);
  doc.roundedRect(MARGIN, y, CONTENT_W, 36, 3, 3, 'F');

  y += 8;
  doc.setTextColor(TC.r, TC.g, TC.b);
  y = addText(doc, 'INFORMATIONS GÉNÉRALES', MARGIN + 5, y, {
    size: 9,
    style: 'bold',
  });
  doc.setTextColor(0, 0, 0);

  y += 2;
  const col1X = MARGIN + 5;
  const col2X = MARGIN + CONTENT_W / 2;

  addText(doc, 'Propriétaire :', col1X, y, { size: 8, style: 'bold' });
  addText(doc, landlordName, col1X + 28, y, { size: 8 });

  addText(doc, 'Locataire :', col2X, y, { size: 8, style: 'bold' });
  addText(doc, `${tenant.first_name} ${tenant.last_name}`, col2X + 24, y, { size: 8 });

  y += LINE_H;
  addText(doc, 'Adresse :', col1X, y, { size: 8, style: 'bold' });
  addText(doc, `${property.address}, ${property.city}`, col1X + 20, y, { size: 8 });

  addText(doc, 'Date :', col2X, y, { size: 8, style: 'bold' });
  addText(doc, formatDate(data.date), col2X + 14, y, { size: 8 });

  y += LINE_H;
  addText(doc, 'Type :', col1X, y, { size: 8, style: 'bold' });
  addText(
    doc,
    data.type === 'entrance' ? "État des lieux d'entrée" : 'État des lieux de sortie',
    col1X + 14,
    y,
    { size: 8 },
  );

  y += 14;

  // ── Pièces ──────────────────────────────────────────────────────

  for (const room of data.rooms) {
    y = ensureSpace(doc, y, 30);

    // Header pièce
    doc.setFillColor(TC.r, TC.g, TC.b);
    doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    addText(doc, room.name.toUpperCase(), MARGIN + 4, y + 5.5, {
      size: 10,
      style: 'bold',
    });
    doc.setTextColor(0, 0, 0);
    y += 12;

    if (room.elements.length === 0) {
      y = addText(doc, 'Aucun élément renseigné', MARGIN + 4, y, {
        size: 8,
        style: 'italic',
      });
      y += 4;
      continue;
    }

    // En-tête du tableau
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Élément', MARGIN + 3, y + 5);
    doc.text('État', MARGIN + 65, y + 5);
    doc.text('Observations', MARGIN + 95, y + 5);
    y += 9;

    // Lignes
    for (const element of room.elements) {
      y = ensureSpace(doc, y, 10);

      const stateInfo = STATE_COLORS[element.state] ?? STATE_COLORS.na;

      doc.setDrawColor(230, 230, 230);
      doc.line(MARGIN, y + 4, MARGIN + CONTENT_W, y + 4);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(element.name, MARGIN + 3, y + 3);

      // Pastille couleur + état
      doc.setFillColor(stateInfo.r, stateInfo.g, stateInfo.b);
      doc.circle(MARGIN + 66, y + 2, 1.5, 'F');
      doc.text(stateInfo.label, MARGIN + 70, y + 3);

      // Observations
      if (element.observations) {
        const obsLines = doc.splitTextToSize(element.observations, CONTENT_W - 95) as string[];
        doc.setFontSize(7);
        doc.text(obsLines, MARGIN + 95, y + 3);
        y += Math.max(LINE_H, obsLines.length * 4);
      } else {
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text('—', MARGIN + 95, y + 3);
        doc.setTextColor(0, 0, 0);
        y += LINE_H;
      }
    }

    y += 6;
  }

  // ── Signatures ──────────────────────────────────────────────────

  y = ensureSpace(doc, y, 60);

  doc.setFillColor(TC.r, TC.g, TC.b);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  addText(doc, 'SIGNATURES', MARGIN + 4, y + 5.5, {
    size: 10,
    style: 'bold',
  });
  doc.setTextColor(0, 0, 0);
  y += 14;

  const sigW = (CONTENT_W - 10) / 2;

  // Signature propriétaire
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Propriétaire', MARGIN, y);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(landlordName, MARGIN, y + 5);

  if (data.signature_landlord) {
    try {
      doc.addImage(data.signature_landlord, 'PNG', MARGIN, y + 8, sigW, 30);
    } catch {
      doc.setFontSize(8);
      doc.text('[Signature numérique enregistrée]', MARGIN, y + 20);
    }
  } else {
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(MARGIN, y + 8, sigW, 30);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('Non signé', MARGIN + sigW / 2, y + 25, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  // Signature locataire
  const sigX2 = MARGIN + sigW + 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Locataire', sigX2, y);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${tenant.first_name} ${tenant.last_name}`, sigX2, y + 5);

  if (data.signature_tenant) {
    try {
      doc.addImage(data.signature_tenant, 'PNG', sigX2, y + 8, sigW, 30);
    } catch {
      doc.setFontSize(8);
      doc.text('[Signature numérique enregistrée]', sigX2, y + 20);
    }
  } else {
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(sigX2, y + 8, sigW, 30);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('Non signé', sigX2 + sigW / 2, y + 25, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  // ── Footers ─────────────────────────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  return doc;
}

// ── Nom du fichier ────────────────────────────────────────────────

export function getEdlPdfFilename(type: EdlType, tenant: Tenant): string {
  const typeLabel = type === 'entrance' ? 'entree' : 'sortie';
  const name = `${tenant.last_name}_${tenant.first_name}`.replace(/\s+/g, '_');
  return `Etat_des_Lieux_${typeLabel}_${name}.pdf`;
}
