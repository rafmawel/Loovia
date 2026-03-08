// Génération PDF d'un contrat de bail — Document professionnel multi-pages
import { jsPDF } from 'jspdf';
import type { Lease, Property, Tenant } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

// --- Types exportés pour la signature ---
export interface SignaturePosition {
  recipientId: string;
  label: string;
  page: number;
  yPercent: number;
}

export interface LeaseGenerationResult {
  doc: jsPDF;
  signaturePositions: SignaturePosition[];
}

// --- Types pour les données JSONB du wizard ---
interface LeaseData {
  landlord_type?: string;
  landlord_name?: string;
  landlord_address?: string;
  location_type?: string;
  charges_mode?: string;
  deposit_amount?: number;
  duration_years?: number;
  duration_months?: number;
  is_mobility_lease?: boolean;
  tacit_renewal?: boolean;
  irl_enabled?: boolean;
  irl_quarter?: string;
  irl_year?: number;
  construction_year?: number | null;
  electrical_age?: number | null;
  gas_age?: number | null;
  diag_dpe?: boolean;
  diag_erp?: boolean;
  diag_crep?: boolean;
  diag_amiante?: boolean;
  diag_electricite?: boolean;
  diag_gaz?: boolean;
  diag_carrez?: boolean;
  insurance_required?: boolean;
  solidarity_clause?: boolean;
  special_clauses?: string;
  has_cotenants?: boolean;
  cotenants?: { first_name: string; last_name: string; date_of_birth?: string; email?: string }[];
  property_surface?: number;
  property_rooms?: number;
  property_address?: string;
  property_city?: string;
  property_postal_code?: string;
  property_building?: string;
  property_floor?: string;
  property_door?: string;
  tenant_first_name?: string;
  tenant_last_name?: string;
  tenant_date_of_birth?: string;
}

// --- Constantes ---
const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;
const TERRACOTTA: [number, number, number] = [226, 114, 91];
const BLACK: [number, number, number] = [0, 0, 0];
const GRAY: [number, number, number] = [120, 113, 108];
const DARK: [number, number, number] = [15, 23, 42];
const RED: [number, number, number] = [185, 28, 28];

/**
 * Génère le PDF complet du bail.
 * Retourne l'objet jsPDF pour permettre preview (bloburl) ou download.
 */
export function generateLeasePdf(
  lease: Lease,
  property: Property,
  tenant: Tenant,
): LeaseGenerationResult {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const d = (lease.data || {}) as LeaseData;
  let y = MARGIN;
  let pageCount = 0;

  // --- Helpers ---

  function checkPageBreak(needed: number) {
    if (y + needed > PAGE_HEIGHT - 25) {
      doc.addPage();
      y = MARGIN;
    }
  }

  type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

  function setFont(size: number, style: FontStyle = 'normal', color: [number, number, number] = DARK) {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
  }

  function addText(text: string, fontSize: number = 10, style: FontStyle = 'normal', color: [number, number, number] = DARK) {
    setFont(fontSize, style, color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    for (const line of lines) {
      checkPageBreak(LINE_HEIGHT);
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
  }

  function addCenteredText(text: string, fontSize: number = 10, style: FontStyle = 'normal', color: [number, number, number] = DARK) {
    setFont(fontSize, style, color);
    checkPageBreak(LINE_HEIGHT + 2);
    doc.text(text, PAGE_WIDTH / 2, y, { align: 'center' });
    y += LINE_HEIGHT + 2;
  }

  function addBlankLine(count: number = 1) {
    y += LINE_HEIGHT * count;
  }

  function addHorizontalRule() {
    checkPageBreak(4);
    doc.setDrawColor(...GRAY);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 4;
  }

  function addSectionTitle(number: string, title: string) {
    checkPageBreak(16);
    addBlankLine(0.5);
    setFont(13, 'bold', TERRACOTTA);
    doc.text(`${number}. ${title}`, MARGIN, y);
    y += 3;
    doc.setDrawColor(...TERRACOTTA);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += LINE_HEIGHT;
  }

  function addLabelValue(label: string, value: string) {
    checkPageBreak(LINE_HEIGHT);
    setFont(10, 'bold', DARK);
    doc.text(label + ' : ', MARGIN, y);
    const labelWidth = doc.getTextWidth(label + ' : ');
    setFont(10, 'normal', DARK);
    const remaining = CONTENT_WIDTH - labelWidth;
    const lines = doc.splitTextToSize(value, remaining);
    doc.text(lines[0] || '', MARGIN + labelWidth, y);
    y += LINE_HEIGHT;
    // Lignes suivantes si wrapping
    for (let i = 1; i < lines.length; i++) {
      checkPageBreak(LINE_HEIGHT);
      doc.text(lines[i], MARGIN + labelWidth, y);
      y += LINE_HEIGHT;
    }
  }

  function addColorBox(
    text: string,
    bgColor: [number, number, number],
    textColor: [number, number, number],
    bold: boolean = false,
  ) {
    setFont(10, bold ? 'bold' : 'normal', textColor);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 12);
    const boxHeight = lines.length * LINE_HEIGHT + 8;
    checkPageBreak(boxHeight + 4);
    doc.setFillColor(...bgColor);
    doc.roundedRect(MARGIN, y - 2, CONTENT_WIDTH, boxHeight, 2, 2, 'F');
    y += 4;
    for (const line of lines) {
      doc.text(line, MARGIN + 6, y);
      y += LINE_HEIGHT;
    }
    y += 4;
  }

  function addBullet(text: string, color: [number, number, number] = DARK) {
    checkPageBreak(LINE_HEIGHT);
    setFont(10, 'normal', color);
    doc.text('•', MARGIN + 4, y);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 14);
    for (const line of lines) {
      checkPageBreak(LINE_HEIGHT);
      doc.text(line, MARGIN + 10, y);
      y += LINE_HEIGHT;
    }
  }

  // --- Footer callback ---
  function addFooters() {
    pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      setFont(7, 'normal', GRAY);
      doc.text(
        `Page ${i} sur ${pageCount} — Bail généré par Loovia`,
        PAGE_WIDTH / 2,
        PAGE_HEIGHT - 10,
        { align: 'center' },
      );
    }
  }

  // --- Données dérivées ---
  const locationType = d.location_type || property.furnished_type || 'Location vide';
  const isMeuble = locationType === 'Location meublée';
  const isMobilite = locationType === 'Bail mobilité' || d.is_mobility_lease;
  const cotenants = d.cotenants || [];
  const hasCo = d.has_cotenants && cotenants.length > 0;
  const nbExemplaires = 2 + cotenants.length; // bailleur + locataire principal + co-locataires

  // ====================================================================
  // SECTION 1 — EN-TÊTE
  // ====================================================================

  addCenteredText('BAIL D\'HABITATION', 18, 'bold', TERRACOTTA);
  addBlankLine(0.3);

  const subtitle = isMobilite
    ? 'Bail mobilité — Loi ELAN du 23 novembre 2018'
    : isMeuble
      ? 'Location meublée — Loi n° 89-462 du 6 juillet 1989'
      : 'Location vide — Loi n° 89-462 du 6 juillet 1989';
  addCenteredText(subtitle, 11, 'normal', GRAY);
  addBlankLine(0.3);
  addHorizontalRule();

  // ====================================================================
  // SECTION 2 — DÉSIGNATION DES PARTIES
  // ====================================================================

  addSectionTitle('I', 'DÉSIGNATION DES PARTIES');

  addText('LE BAILLEUR', 11, 'bold');
  addLabelValue('Structure juridique', d.landlord_type || 'Personne physique');
  addLabelValue('Nom / Dénomination', d.landlord_name || '—');
  addLabelValue('Adresse', d.landlord_address || '—');
  addBlankLine();

  addText('LE LOCATAIRE', 11, 'bold');
  addLabelValue('Nom', `${d.tenant_first_name || tenant.first_name} ${d.tenant_last_name || tenant.last_name}`);
  addLabelValue('Date de naissance', (d.tenant_date_of_birth || tenant.date_of_birth) ? formatDate(d.tenant_date_of_birth || tenant.date_of_birth!) : 'Non renseignée');
  if (tenant.nationality) addLabelValue('Nationalité', tenant.nationality);
  if (tenant.profession) addLabelValue('Profession', tenant.profession);
  addLabelValue('Email', tenant.email);
  if (tenant.phone) addLabelValue('Téléphone', tenant.phone);

  // Co-locataires
  if (hasCo) {
    addBlankLine(0.5);
    addText('CO-LOCATAIRE(S)', 11, 'bold');
    for (const co of cotenants) {
      addLabelValue('Nom', `${co.first_name} ${co.last_name}`);
      if (co.date_of_birth) addLabelValue('Date de naissance', formatDate(co.date_of_birth));
    }
    addBlankLine(0.3);
    addColorBox(
      'CLAUSE DE SOLIDARITÉ : Les locataires sont tenus solidairement et indivisiblement au paiement des loyers, charges et à l\'exécution des obligations du présent bail. Cette solidarité subsiste pendant toute la durée du bail et ses renouvellements.',
      [219, 234, 254],
      [29, 78, 216],
      true,
    );
  }

  // ====================================================================
  // SECTION 3 — DÉSIGNATION DES LIEUX
  // ====================================================================

  addSectionTitle('II', 'DÉSIGNATION DES LIEUX');

  const addr = d.property_address || property.address;
  const city = d.property_city || property.city;
  const cp = d.property_postal_code || property.postal_code;
  addLabelValue('Adresse', `${addr}, ${cp} ${city}`);
  if (d.property_building || property.building) addLabelValue('Bâtiment', d.property_building || property.building || '');
  if (d.property_floor || property.floor) addLabelValue('Étage', d.property_floor || property.floor || '');
  if (d.property_door || property.door) addLabelValue('Porte', d.property_door || property.door || '');
  addBlankLine(0.3);

  addText('Consistance :', 10, 'bold');
  addLabelValue('Type de bien', property.property_type);
  addLabelValue('Type de location', locationType);
  if (d.property_surface || property.surface) addLabelValue('Surface habitable', `${d.property_surface || property.surface} m²`);
  if (d.property_rooms || property.number_of_rooms) addLabelValue('Nombre de pièces', `${d.property_rooms || property.number_of_rooms}`);

  // Cuisine
  if (property.kitchen_type) {
    addLabelValue('Cuisine', property.kitchen_type);
    if (property.kitchen_equipment && property.kitchen_equipment.length > 0) {
      addLabelValue('Équipements cuisine', property.kitchen_equipment.join(', '));
    }
  }

  // Annexes
  const annexes: string[] = [];
  if (property.has_cellar) annexes.push(`Cave${property.cellar_number ? ` n°${property.cellar_number}` : ''}`);
  if (property.has_parking) annexes.push(`Parking ${property.parking_type || ''}${property.parking_number ? ` n°${property.parking_number}` : ''}`.trim());
  if (property.has_balcony) annexes.push(`Balcon${property.balcony_surface ? ` (${property.balcony_surface} m²)` : ''}`);
  if (property.has_terrace) annexes.push(`Terrasse${property.terrace_surface ? ` (${property.terrace_surface} m²)` : ''}`);
  if (property.has_garden) annexes.push(`Jardin ${property.garden_type || ''}${property.garden_surface ? ` (${property.garden_surface} m²)` : ''}`.trim());
  if (property.has_attic) annexes.push('Grenier');
  if (annexes.length > 0) {
    addLabelValue('Annexes', annexes.join(' — '));
  }

  // Chauffage / Eau chaude
  if (property.heating_type) addLabelValue('Chauffage', `${property.heating_type} (${property.heating_energy || 'non précisé'})`);
  if (property.hot_water_type) addLabelValue('Eau chaude', `${property.hot_water_type} (${property.hot_water_energy || 'non précisé'})`);

  // Confort
  if (property.glazing_type) addLabelValue('Vitrage', property.glazing_type);
  if (property.shutters_type) addLabelValue('Volets', property.shutters_type);

  addBlankLine(0.3);
  addColorBox(
    'DESTINATION EXCLUSIVE : Usage exclusif d\'habitation. Toute activité commerciale ou professionnelle est strictement interdite dans les lieux loués.',
    [254, 226, 226],
    RED,
    true,
  );

  // ====================================================================
  // SECTION 4 — DURÉE ET PRISE D'EFFET
  // ====================================================================

  addSectionTitle('III', 'DURÉE ET PRISE D\'EFFET');

  addLabelValue('Date d\'entrée en vigueur', formatDate(lease.start_date));

  if (isMobilite) {
    addLabelValue('Durée', `${d.duration_months || 0} mois (Bail mobilité)`);
  } else if (d.duration_years) {
    addLabelValue('Durée', `${d.duration_years} an${d.duration_years > 1 ? 's' : ''}`);
  }

  if (lease.end_date) {
    addLabelValue('Date de fin', formatDate(lease.end_date));
  }

  if (d.tacit_renewal && !isMobilite) {
    addBlankLine(0.3);
    addText(
      'À défaut de congé délivré dans les conditions et délais prévus par la loi, le présent bail sera reconduit tacitement pour une durée identique.',
      10,
      'normal',
      GRAY,
    );
  }

  if (isMobilite) {
    addBlankLine(0.3);
    addText(
      'Le bail mobilité n\'est pas renouvelable et ne fait l\'objet d\'aucune reconduction tacite. Le locataire peut donner congé à tout moment avec un préavis d\'un mois.',
      10,
      'normal',
      GRAY,
    );
  }

  // ====================================================================
  // SECTION 5 — CONDITIONS FINANCIÈRES
  // ====================================================================

  addSectionTitle('IV', 'CONDITIONS FINANCIÈRES');

  const totalCC = lease.monthly_rent + lease.charges_amount;
  addText(`Loyer total charges comprises : ${formatCurrency(totalCC)} / mois`, 12, 'bold');
  addBlankLine(0.3);
  addLabelValue('Loyer mensuel hors charges', formatCurrency(lease.monthly_rent));
  addLabelValue('Provision sur charges', formatCurrency(lease.charges_amount));
  addLabelValue('Mode de récupération des charges', d.charges_mode || 'Provision avec régularisation annuelle');

  addBlankLine(0.3);
  addText('Le loyer est payable mensuellement, d\'avance, le 1er de chaque mois, par virement bancaire ou tout autre moyen convenu entre les parties.', 10, 'normal', GRAY);

  // IRL
  if (d.irl_enabled) {
    addBlankLine(0.5);
    addText('Clause d\'indexation (IRL) :', 10, 'bold');
    addText(
      `Le loyer sera révisé chaque année à la date anniversaire du bail, en fonction de la variation de l'Indice de Référence des Loyers (IRL) publié par l'INSEE. Trimestre de référence : ${d.irl_quarter || 'T1'}, année ${d.irl_year || new Date().getFullYear()}.`,
    );
    addBlankLine(0.3);
    addText(
      'Le défaut de révision du loyer à la date prévue ne vaut pas renonciation du bailleur à sa révision. Conformément à l\'article 17-1 de la loi du 6 juillet 1989, le bailleur dispose d\'un délai d\'un an pour réclamer la révision.',
      9,
      'italic',
      GRAY,
    );
  }

  // Dépôt de garantie
  addBlankLine(0.5);
  if (isMobilite) {
    addLabelValue('Dépôt de garantie', 'Aucun — Bail mobilité');
  } else {
    addLabelValue('Dépôt de garantie', formatCurrency(d.deposit_amount ?? 0));
    addText(
      isMeuble ? '(2 mois de loyer hors charges)' : '(1 mois de loyer hors charges)',
      9,
      'normal',
      GRAY,
    );
  }

  if (!isMobilite) {
    addBlankLine(0.3);
    addColorBox(
      'AVERTISSEMENT : Le dépôt de garantie ne peut en aucun cas être utilisé par le locataire pour payer le dernier mois de loyer. Il sera restitué dans un délai maximal d\'un mois après la remise des clés si l\'état des lieux de sortie est conforme, ou de deux mois dans le cas contraire.',
      [254, 226, 226],
      RED,
      true,
    );
  }

  // ====================================================================
  // SECTION 6 — OBLIGATIONS ET INTERDICTIONS
  // ====================================================================

  addSectionTitle('V', 'OBLIGATIONS ET INTERDICTIONS');

  addText('Le locataire s\'engage à :', 10, 'bold');
  addBullet('Assurer l\'entretien courant du logement et de ses équipements, ainsi que les menues réparations.');
  addBullet('Laisser exécuter les travaux d\'amélioration des parties communes ou privatives, et les travaux nécessaires au maintien en état.');
  addBullet('Ne pas transformer les locaux sans accord écrit préalable du bailleur.');
  addBullet('Rendre les murs en tons neutres (blanc, beige, gris clair) à la restitution des lieux.');
  addBullet('User paisiblement des locaux loués suivant la destination prévue au contrat.');
  addBullet('Répondre des dégradations et pertes survenues pendant la durée du bail.');

  addBlankLine(0.5);
  addColorBox(
    'INTERDICTION FORMELLE : Toute sous-location, même partielle, est STRICTEMENT INTERDITE, y compris la mise en location saisonnière (type Airbnb). Toute infraction à cette clause constitue un motif de résiliation du bail.',
    [254, 226, 226],
    RED,
    true,
  );

  addBlankLine(0.3);
  addColorBox(
    'Aucune modification, transformation ou travaux ne peut être réalisé(e) sans l\'accord écrit et préalable du bailleur. À défaut, le locataire devra remettre les lieux dans leur état d\'origine à ses frais.',
    [254, 226, 226],
    RED,
    false,
  );

  addBlankLine(0.3);
  addText(
    'Un état des lieux contradictoire, accompagné de photographies, sera dressé lors de la remise et de la restitution des clés.',
    10,
    'normal',
    GRAY,
  );

  // ====================================================================
  // SECTION 7 — ASSURANCES ET GARANTIES
  // ====================================================================

  addSectionTitle('VI', 'ASSURANCES ET GARANTIES');

  if (d.insurance_required !== false) {
    addColorBox(
      'OBLIGATION D\'ASSURANCE : Le locataire doit justifier d\'une assurance couvrant les Risques Locatifs (incendie, dégât des eaux, explosion) à la remise des clés, puis annuellement sur simple demande du bailleur. Le défaut d\'assurance constitue un motif de résiliation du bail.',
      [254, 226, 226],
      RED,
      true,
    );
  }

  addText(
    'Le bailleur s\'engage à remettre au locataire un logement décent, en bon état d\'usage et de réparation, et à assurer au locataire la jouissance paisible du logement.',
    10,
    'normal',
    DARK,
  );

  // ====================================================================
  // SECTION 8 — CLAUSE RÉSOLUTOIRE
  // ====================================================================

  addSectionTitle('VII', 'CLAUSE RÉSOLUTOIRE');

  addColorBox(
    'Le présent bail sera résilié de plein droit, deux mois après un commandement de payer demeuré infructueux ou une mise en demeure restée sans effet, dans les cas suivants :',
    [254, 242, 242],
    RED,
    true,
  );

  addBullet('Non-paiement du loyer, des charges ou du dépôt de garantie aux termes convenus.', RED);
  addBullet('Défaut de souscription d\'une assurance habitation couvrant les risques locatifs.', RED);
  addBullet('Troubles de voisinage constatés par décision de justice.', RED);
  addBullet('Sous-location non autorisée ou utilisation contraire à la destination des lieux.', RED);

  addBlankLine(0.3);
  addText(
    'Conformément à l\'article 24 de la loi du 6 juillet 1989, le juge peut accorder des délais de paiement au locataire en situation de régler sa dette locative.',
    9,
    'italic',
    GRAY,
  );

  // ====================================================================
  // SECTION 9 — CLAUSES ADDITIONNELLES
  // ====================================================================

  addSectionTitle('VIII', 'CLAUSES ADDITIONNELLES');

  addBullet('Le bailleur dispose d\'un droit de visite annuel du logement, sur rendez-vous, pour vérifier l\'état des lieux.');
  addBullet('En cas de vente du logement ou de relocation, le locataire s\'engage à laisser visiter les lieux 2 heures par jour ouvrable, à des horaires convenus entre les parties.');
  addBullet('Le locataire s\'engage à signaler immédiatement au bailleur toute présence de nuisibles (termites, cafards, punaises de lit, etc.) et à faciliter les opérations de traitement.');
  addBullet('Toute demande d\'animal domestique devra faire l\'objet d\'un accord écrit du bailleur.');

  // Clauses particulières libres
  if (d.special_clauses && d.special_clauses.trim()) {
    addBlankLine(0.5);
    addText('Clauses particulières :', 10, 'bold');
    addText(d.special_clauses);
  }

  // ====================================================================
  // SECTION 10 — ANNEXES OBLIGATOIRES
  // ====================================================================

  addSectionTitle('IX', 'ANNEXES OBLIGATOIRES');

  addText('Les documents suivants sont annexés au présent bail :', 10, 'bold');
  addBlankLine(0.3);

  // Diagnostics
  const diags: [string, boolean | undefined][] = [
    ['Diagnostic de Performance Énergétique (DPE)', d.diag_dpe],
    ['État des Risques et Pollutions (ERP)', d.diag_erp],
    ['Constat de Risque d\'Exposition au Plomb (CREP)', d.diag_crep],
    ['Diagnostic Amiante', d.diag_amiante],
    ['Diagnostic Électricité', d.diag_electricite],
    ['Diagnostic Gaz', d.diag_gaz],
    ['Mesurage Loi Carrez', d.diag_carrez],
  ];

  for (const [label, active] of diags) {
    if (active) {
      addBullet(label);
    }
  }

  addBullet('État des lieux d\'entrée (à réaliser contradictoirement)');
  addBullet('Grille de vétusté');
  if (isMeuble) {
    addBullet('Inventaire détaillé du mobilier et des équipements');
  }

  // ====================================================================
  // BLOC SIGNATURES
  // ====================================================================

  const signaturePositions: SignaturePosition[] = [];
  const SIGNATURE_SPACE = 25; // mm reserved for each signature

  // Compute how many signers we have
  const totalSigners = 2 + cotenants.length; // bailleur + locataire + co-locataires
  // Space needed: header (20) + each signer label+space (35 each) + footer (15)
  const neededSpace = 30 + totalSigners * 35 + 15;

  checkPageBreak(neededSpace);
  addBlankLine();
  addHorizontalRule();
  addBlankLine(0.5);

  addText(`Fait en ${nbExemplaires} exemplaires originaux.`, 10, 'bold');
  addLabelValue('Lieu', '.........................................');
  addLabelValue('Date', formatDate(new Date().toISOString()));
  addBlankLine();

  // Helper: add a signature label + space and track position
  const addSignatureSlot = (recipientId: string, roleLabel: string, name: string) => {
    checkPageBreak(35);
    setFont(10, 'bold', DARK);
    doc.text(roleLabel, MARGIN, y);
    y += LINE_HEIGHT;
    setFont(9, 'normal', GRAY);
    doc.text(name, MARGIN, y);
    y += 3;

    // Track signature position (Y as percentage of page height)
    const currentPage = doc.getNumberOfPages();
    const yPercent = (y / PAGE_HEIGHT) * 100;
    signaturePositions.push({ recipientId, label: roleLabel, page: currentPage, yPercent });

    y += SIGNATURE_SPACE;
  };

  // Bailleur
  addSignatureSlot('temp_1', 'Le Bailleur', d.landlord_name || '—');

  // Locataire
  const tenantName = `${d.tenant_first_name || tenant.first_name} ${d.tenant_last_name || tenant.last_name}`;
  addSignatureSlot('temp_2', cotenants.length > 0 ? 'Le(s) Locataire(s)' : 'Le Locataire', tenantName);

  // Co-locataires
  cotenants.forEach((co, index) => {
    const coName = `${co.first_name} ${co.last_name}`;
    addSignatureSlot(`temp_${3 + index}`, 'Co-locataire', coName);
  });

  // Mention « Lu et approuvé »
  addBlankLine(0.3);
  addCenteredText('Lu et approuvé — Bon pour accord', 9, 'italic', GRAY);

  // --- Pieds de page ---
  addFooters();

  return { doc, signaturePositions };
}

/**
 * Génère le nom de fichier du PDF.
 */
export function getLeasePdfFilename(tenant: Tenant, property: Property): string {
  const name = `${tenant.last_name}_${tenant.first_name}`.replace(/\s+/g, '_');
  const addr = property.address.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  return `Bail_${name}_${addr}.pdf`;
}
