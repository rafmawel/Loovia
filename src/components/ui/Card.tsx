import React from 'react';

// --- Types pour le composant Card ---

interface CardProps {
  /** Contenu de la carte */
  children: React.ReactNode;
  /** Classes CSS supplémentaires */
  className?: string;
  /** Active les effets de survol (ombre + scale) */
  interactive?: boolean;
  /** Rend la carte cliquable */
  onClick?: () => void;
  /** Padding interne — accepte n'importe quelle classe Tailwind (défaut : p-6) */
  padding?: string;
}

/**
 * Carte générique — Design "Premium Minimaliste Naturel"
 *
 * Fond blanc, coins arrondis, ombre discrète.
 * En mode interactif, la carte réagit au survol avec un léger scale + ombre.
 */
export default function Card({
  children,
  className = '',
  interactive = false,
  onClick,
  padding = 'p-6',
}: CardProps) {
  // On utilise un <div> cliquable si onClick est fourni
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={[
        // Style de base
        'bg-bg-elevated rounded-2xl border border-border-light glow-accent',
        // Padding configurable
        padding,
        // Effets interactifs (seulement si activé)
        interactive && 'hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer',
        // Reset pour le bouton — alignement texte à gauche
        onClick && 'w-full text-left',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Component>
  );
}
