// Calcul de la révision IRL (Indice de Référence des Loyers)
//
// Formule légale : nouveau_loyer = ancien_loyer × (nouvel_IRL / ancien_IRL)
// - ancien_IRL : indice du trimestre de référence du bail (lors de la signature ou dernière révision)
// - nouvel_IRL : indice du même trimestre, un an plus tard

export interface IrlRevisionResult {
  eligible: boolean;
  currentRent: number;
  newRent: number;
  increase: number;
  increasePercent: number;
  oldIrl: { quarter: string; year: number; value: number };
  newIrl: { quarter: string; year: number; value: number };
  revisionDate: string;
}

/**
 * Calcule le nouveau loyer après révision IRL.
 */
export function computeIrlRevision(
  currentRent: number,
  oldIrlValue: number,
  newIrlValue: number,
): { newRent: number; increase: number; increasePercent: number } {
  const newRent = Math.round((currentRent * (newIrlValue / oldIrlValue)) * 100) / 100;
  const increase = Math.round((newRent - currentRent) * 100) / 100;
  const increasePercent = oldIrlValue > 0
    ? Math.round(((newIrlValue - oldIrlValue) / oldIrlValue) * 10000) / 100
    : 0;

  return { newRent, increase, increasePercent };
}

/**
 * Détermine le trimestre de référence pour la prochaine révision.
 * La révision se fait à la date anniversaire du bail, en comparant
 * l'IRL du trimestre de référence de l'année N avec celui de l'année N-1.
 */
export function getRevisionQuarterAndYears(
  irlQuarter: string,
  irlYear: number,
  leaseStartDate: string,
): { oldYear: number; newYear: number; quarter: string; revisionDate: string } | null {
  const now = new Date();
  const start = new Date(leaseStartDate);

  // La première révision a lieu 1 an après le début du bail
  const firstRevision = new Date(start);
  firstRevision.setFullYear(firstRevision.getFullYear() + 1);

  if (now < firstRevision) return null;

  // Combien d'années depuis le début du bail ?
  const yearsSinceStart = now.getFullYear() - start.getFullYear();

  // L'ancien IRL est celui de l'année précédente à la révision
  // Le nouveau IRL est celui de la même année que la révision
  const newYear = irlYear + yearsSinceStart;
  const oldYear = newYear - 1;

  // Date de révision = anniversaire du bail cette année
  const revisionDate = new Date(start);
  revisionDate.setFullYear(now.getFullYear());
  // Si la date anniversaire est passée et qu'on est dans la fenêtre d'un an
  if (revisionDate > now) {
    revisionDate.setFullYear(now.getFullYear());
  }

  return {
    quarter: irlQuarter,
    oldYear,
    newYear,
    revisionDate: revisionDate.toISOString().slice(0, 10),
  };
}
