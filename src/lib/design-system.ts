// Constantes du Design System Loovia
// Philosophie : "Premium Minimaliste Naturel"

export const colors = {
  terracotta: '#e2725b',
  terracottaLight: '#f0a899',
  terracottaDark: '#c45a44',
  offWhite: '#f7f5f3',
  slate900: '#0f172a',
  stone500: '#78716c',
  stone200: '#e7e5e0',
  stone100: '#f5f5f4',
  stone300: '#d6d3d1',
} as const;

// Mapping des statuts vers les couleurs de badges
export const statusColors = {
  // Paiements
  paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  partial: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  late: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },

  // Baux
  draft: { bg: 'bg-white/5', text: 'text-text-secondary', border: 'border-border-light' },
  pending_signature: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  signed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  terminated: { bg: 'bg-white/5', text: 'text-text-muted', border: 'border-border-light' },

  // Maintenance
  open: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  in_progress: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  closed: { bg: 'bg-white/5', text: 'text-text-muted', border: 'border-border-light' },

  // Transactions
  unmatched: { bg: 'bg-white/5', text: 'text-text-secondary', border: 'border-border-light' },
  suggestion: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  matched: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  categorized: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },

  // Documents
  requested: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  received: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  validated: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
} as const;

// Labels français pour les statuts
export const statusLabels: Record<string, string> = {
  // Paiements
  paid: 'Payé',
  pending: 'En attente',
  partial: 'Partiel',
  late: 'En retard',

  // Baux
  draft: 'Brouillon',
  pending_signature: 'En signature',
  signed: 'Signé',
  active: 'Actif',
  terminated: 'Résilié',

  // Maintenance
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',

  // Transactions
  unmatched: 'Non rapproché',
  suggestion: 'Suggestion',
  matched: 'Rapproché',
  categorized: 'Catégorisé',

  // Documents
  requested: 'Demandé',
  received: 'Reçu',
  validated: 'Validé',
  rejected: 'Rejeté',
};

// Labels pour les priorités de maintenance
export const priorityLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente',
};

export const priorityColors = {
  low: { bg: 'bg-white/5', text: 'text-text-secondary' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  urgent: { bg: 'bg-red-500/10', text: 'text-red-400' },
} as const;

// Types de bien
export const propertyTypes = [
  'Appartement',
  'Maison',
  'Local commercial',
  'Parking',
  'Box',
  'Garage',
  'Cave',
  'Terrain',
] as const;

// Types de bien qui sont des espaces de stationnement/stockage (pas d'habitation)
export const storagePropertyTypes = ['Parking', 'Box', 'Garage', 'Cave', 'Terrain'] as const;

// Types de bien commerciaux (sections adaptées)
export const commercialPropertyTypes = ['Local commercial'] as const;

// Types de location
export const furnishedTypes = [
  'Location vide',
  'Location meublée',
] as const;
