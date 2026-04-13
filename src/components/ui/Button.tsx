'use client';

import React from 'react';

// --- Types pour le composant Button ---

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visuelle du bouton */
  variant?: ButtonVariant;
  /** Taille du bouton */
  size?: ButtonSize;
  /** Affiche un spinner et désactive le bouton */
  loading?: boolean;
  /** Icône affichée avant le texte */
  icon?: React.ReactNode;
  /** Contenu du bouton */
  children: React.ReactNode;
}

// --- Classes par variante ---
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-light active:bg-accent-light',
  secondary:
    'border border-border-light bg-bg-card text-text-primary hover:bg-bg-elevated active:bg-bg-elevated',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost:
    'text-text-primary hover:bg-bg-elevated active:bg-bg-card',
};

// --- Classes par taille ---
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

// --- Spinner de chargement ---
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className ?? ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Bouton réutilisable — Design "Premium Minimaliste Naturel"
 *
 * Prend en charge 4 variantes (primary, secondary, danger, ghost),
 * 3 tailles (sm, md, lg), un état de chargement et une icône optionnelle.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        // Base
        'inline-flex items-center justify-center font-medium rounded-xl',
        'transition-all duration-200',
        // Effet de survol interactif (seulement si actif)
        !isDisabled && 'hover:scale-[1.02] hover:shadow-md',
        // État désactivé
        isDisabled && 'opacity-50 cursor-not-allowed',
        // Variante et taille
        variantClasses[variant],
        sizeClasses[size],
        // Focus visible pour l'accessibilité
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* Spinner affiché pendant le chargement, remplace l'icône */}
      {loading ? <Spinner /> : icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
}
