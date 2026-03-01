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
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  partial: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  late: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },

  // Baux
  draft: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' },
  pending_signature: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  signed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  terminated: { bg: 'bg-stone-100', text: 'text-stone-500', border: 'border-stone-200' },

  // Maintenance
  open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { bg: 'bg-stone-100', text: 'text-stone-500', border: 'border-stone-200' },

  // Transactions bancaires
  unmatched: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' },
  suggestion: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  matched: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  categorized: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },

  // Documents
  requested: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  received: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  validated: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
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
  low: { bg: 'bg-stone-100', text: 'text-stone-600' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700' },
  urgent: { bg: 'bg-red-50', text: 'text-red-700' },
} as const;

// Types de bien
export const propertyTypes = [
  'Appartement',
  'Maison',
  'Studio',
  'Loft',
  'Duplex',
  'Parking',
  'Box',
  'Garage',
  'Cave',
  'Local commercial',
  'Terrain',
] as const;

// Types de bien qui sont des espaces de stationnement/stockage (pas d'habitation)
export const storagePropertyTypes = ['Parking', 'Box', 'Garage', 'Cave', 'Terrain'] as const;

// Types de location
export const furnishedTypes = [
  'Location vide',
  'Location meublée',
] as const;
