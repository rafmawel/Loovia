// Génération PDF d'un contrat de bail
import { jsPDF } from 'jspdf';
import type { Lease, Property, Tenant } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

// Générer le PDF du bail
export function generateLeasePdf(
  lease: Lease,
  property: Property,
  tenant: Tenant,
  landlordName: string,
): string {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Fonction helper pour ajouter du texte avec retour à la ligne automatique
  function addText(text: string, fontSize: number = 10, bold: boolean = false) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, 170);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.5;
    }
    y += 2;
  }

  function addSection(title: string) {
    y += 5;
    addText(title, 12, true);
    y += 2;
  }

  // En-tête
  doc.setTextColor(226, 114, 91); // Terracotta
  addText('CONTRAT DE LOCATION', 18, true);
  doc.setTextColor(0, 0, 0);
  addText(`${property.furnished_type === 'Location meublée' ? 'MEUBLÉE' : 'NON MEUBLÉE'}`, 12, true);
  y += 5;

  addText(`Loi n° 89-462 du 6 juillet 1989`, 8);
  y += 5;

  // Parties
  addSection('I. DÉSIGNATION DES PARTIES');
  addText(`Le bailleur : ${landlordName}`, 10, true);
  y += 3;
  addText(`Le locataire : ${tenant.first_name} ${tenant.last_name}`, 10, true);
  addText(`Né(e) le : ${tenant.date_of_birth ? formatDate(tenant.date_of_birth) : 'Non renseigné'}`);
  addText(`Nationalité : ${tenant.nationality || 'Non renseignée'}`);
  addText(`Profession : ${tenant.profession || 'Non renseignée'}`);
  addText(`Email : ${tenant.email}`);
  if (tenant.phone) addText(`Téléphone : ${tenant.phone}`);

  // Co-locataires
  if (tenant.co_tenants && tenant.co_tenants.length > 0) {
    y += 3;
    addText('Colocataire(s) :', 10, true);
    for (const co of tenant.co_tenants) {
      addText(`- ${co.first_name} ${co.last_name}${co.email ? ` (${co.email})` : ''}`);
    }
  }

  // Logement
  addSection('II. OBJET DU CONTRAT — DESCRIPTION DU LOGEMENT');
  addText(`Adresse : ${property.address}, ${property.postal_code} ${property.city}`);
  if (property.building) addText(`Bâtiment : ${property.building}`);
  if (property.floor) addText(`Étage : ${property.floor}`);
  if (property.door) addText(`Porte : ${property.door}`);
  addText(`Type de bien : ${property.property_type}`);
  addText(`Type de location : ${property.furnished_type}`);
  if (property.surface) addText(`Surface habitable : ${property.surface} m²`);
  if (property.number_of_rooms) addText(`Nombre de pièces : ${property.number_of_rooms}`);

  // Annexes
  const annexes: string[] = [];
  if (property.has_cellar) annexes.push(`Cave${property.cellar_number ? ` (n°${property.cellar_number})` : ''}`);
  if (property.has_parking) annexes.push(`Parking ${property.parking_type || ''}${property.parking_number ? ` (n°${property.parking_number})` : ''}`);
  if (property.has_balcony) annexes.push(`Balcon${property.balcony_surface ? ` (${property.balcony_surface} m²)` : ''}`);
  if (property.has_terrace) annexes.push(`Terrasse${property.terrace_surface ? ` (${property.terrace_surface} m²)` : ''}`);
  if (property.has_garden) annexes.push(`Jardin${property.garden_surface ? ` (${property.garden_surface} m²)` : ''}`);
  if (property.has_attic) annexes.push('Grenier');

  if (annexes.length > 0) {
    addText(`Annexes : ${annexes.join(', ')}`);
  }

  // Durée et dates
  addSection('III. DURÉE DU BAIL');
  addText(`Date de prise d'effet : ${formatDate(lease.start_date)}`);
  if (lease.end_date) {
    addText(`Date de fin : ${formatDate(lease.end_date)}`);
  } else {
    addText(`Durée : ${property.furnished_type === 'Location meublée' ? '1 an renouvelable' : '3 ans renouvelable'}`);
  }

  // Conditions financières
  addSection('IV. CONDITIONS FINANCIÈRES');
  addText(`Loyer mensuel hors charges : ${formatCurrency(lease.monthly_rent)}`);
  addText(`Provision sur charges : ${formatCurrency(lease.charges_amount)}`);
  addText(`Total mensuel : ${formatCurrency(lease.monthly_rent + lease.charges_amount)}`, 10, true);
  addText(`Dépôt de garantie : ${formatCurrency(property.deposit_amount)}`);
  addText(`Le loyer est payable mensuellement, d'avance, le 1er de chaque mois.`);

  // Chauffage
  addSection('V. ÉQUIPEMENTS');
  if (property.heating_type) addText(`Chauffage : ${property.heating_type} (${property.heating_energy || 'non précisé'})`);
  if (property.hot_water_type) addText(`Eau chaude : ${property.hot_water_type} (${property.hot_water_energy || 'non précisé'})`);

  // Signature
  addSection('VI. SIGNATURES');
  y += 10;
  doc.text('Le Bailleur', margin, y);
  doc.text('Le Locataire', 120, y);
  y += 5;
  doc.text(`Fait à ____________, le ${formatDate(new Date().toISOString())}`, margin, y);

  // Retourner le PDF en base64
  return doc.output('datauristring');
}
