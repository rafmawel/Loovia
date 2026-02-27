import { statusColors, statusLabels } from '@/lib/design-system';

// --- Types pour le composant Badge ---

/** Clés de statut disponibles dans le design system */
type StatusKey = keyof typeof statusColors;

interface BadgeProps {
  /** Clé de statut — détermine la couleur et le libellé par défaut */
  status: StatusKey;
  /** Libellé personnalisé (remplace le label français par défaut) */
  label?: string;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Badge de statut — Design "Premium Minimaliste Naturel"
 *
 * Affiche un petit badge coloré avec le libellé français du statut.
 * Les couleurs sont issues du design system centralisé.
 */
export default function Badge({ status, label, className = '' }: BadgeProps) {
  // Récupération des couleurs depuis le design system, avec un fallback neutre
  const colors = statusColors[status] ?? {
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-200',
  };

  // Libellé : priorité au label personnalisé, sinon le label français, sinon la clé brute
  const displayLabel = label ?? statusLabels[status] ?? status;

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
