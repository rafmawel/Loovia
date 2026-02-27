'use client';

import React, { useEffect, useCallback } from 'react';

// --- Types pour le composant Modal ---

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  /** Contrôle l'ouverture de la modale */
  open: boolean;
  /** Callback appelé à la fermeture (clic overlay, touche Échap, bouton fermer) */
  onClose: () => void;
  /** Titre affiché dans l'en-tête de la modale */
  title?: string;
  /** Contenu de la modale */
  children: React.ReactNode;
  /** Largeur maximale de la modale (défaut : md) */
  size?: ModalSize;
  /** Classes CSS supplémentaires pour le conteneur de contenu */
  className?: string;
}

// --- Classes de largeur par taille ---
const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Modale — Design "Premium Minimaliste Naturel"
 *
 * Overlay semi-transparent avec flou, contenu centré sur fond blanc.
 * Se ferme au clic sur l'overlay ou à l'appui sur la touche Échap.
 * Animation d'entrée en fondu.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}: ModalProps) {
  // Fermeture via la touche Échap
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Empêcher le défilement du body quand la modale est ouverte
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // Ne rien rendre si la modale est fermée
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay semi-transparent avec flou d'arrière-plan */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteneur de contenu */}
      <div
        className={[
          'relative w-full bg-white rounded-2xl shadow-xl p-6',
          'animate-fade-in',
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* En-tête avec titre et bouton de fermeture */}
        {(title != null) && (
          <div className="flex items-center justify-between mb-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors duration-150"
              aria-label="Fermer"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Bouton fermer sans titre — affiché en haut à droite */}
        {title == null && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors duration-150"
            aria-label="Fermer"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Contenu principal */}
        {children}
      </div>
    </div>
  );
}
