import type {
  PaymentStatus,
  LeaseStatus,
  MaintenanceStatus,
  TransactionStatus,
  DocumentStatus,
} from '@/types/index';
import { statusColors, statusLabels } from '@/lib/design-system';

// --- Types pour le composant StatusBadge ---

/**
 * Union de tous les statuts métier de l'application.
 * Chaque variante limite les valeurs autorisées au type correspondant.
 */
type StatusVariantMap = {
  payment: PaymentStatus;
  lease: LeaseStatus;
  maintenance: MaintenanceStatus;
  transaction: TransactionStatus;
  document: DocumentStatus;
};

type StatusVariant = keyof StatusVariantMap;

interface StatusBadgeProps<V extends StatusVariant = StatusVariant> {
  /** Domaine métier du statut (paiement, bail, maintenance, etc.) */
  variant: V;
  /** Valeur du statut — typée selon la variante */
  status: StatusVariantMap[V];
  /** Libellé personnalisé (remplace le label français par défaut) */
  label?: string;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Badge de statut typé par domaine métier — Design "Premium Minimaliste Naturel"
 *
 * Contrairement au Badge générique, ce composant s'assure au niveau TypeScript
 * que le statut fourni correspond bien au domaine métier choisi.
 *
 * Exemples :
 *   <StatusBadge variant="payment" status="paid" />
 *   <StatusBadge variant="lease" status="active" />
 *   <StatusBadge variant="maintenance" status="in_progress" />
 */
export default function StatusBadge<V extends StatusVariant>({
  variant: _variant,
  status,
  label,
  className = '',
}: StatusBadgeProps<V>) {
  // Le paramètre variant est utilisé uniquement pour le typage TypeScript.
  // On le préfixe avec _ pour éviter l'avertissement de variable inutilisée.
  void _variant;

  // Récupération des couleurs depuis le design system
  const colors = statusColors[status as keyof typeof statusColors] ?? {
    bg: 'bg-bg-card',
    text: 'text-stone-600',
    border: 'border-border-light',
  };

  // Libellé français par défaut
  const displayLabel = label ?? statusLabels[status] ?? String(status);

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        'border',
        colors.bg,
        colors.text,
        colors.border,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {displayLabel}
    </span>
  );
}
