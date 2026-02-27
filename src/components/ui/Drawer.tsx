'use client';

import React, { useEffect, useCallback, useState } from 'react';

// --- Types pour le composant Drawer ---

interface DrawerProps {
  /** Contrôle l'ouverture du tiroir */
  open: boolean;
  /** Callback appelé à la fermeture (clic overlay, touche Échap, bouton fermer) */
  onClose: () => void;
  /** Titre affiché dans l'en-tête du tiroir */
  title?: string;
  /** Contenu du tiroir */
  children: React.ReactNode;
  /** Classes CSS supplémentaires pour le panneau de contenu */
  className?: string;
}

/**
 * Tiroir latéral (Drawer) — Design "Premium Minimaliste Naturel"
 *
 * Panneau glissant depuis la droite, utilisé notamment pour l'assistant bail.
 * Overlay semi-transparent avec flou, animation de glissement.
 * Se ferme au clic sur l'overlay ou à l'appui sur la touche Échap.
 */
export default function Drawer({
  open,
  onClose,
  title,
  children,
  className = '',
}: DrawerProps) {
  // État interne pour gérer l'animation de fermeture avant le démontage
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Synchroniser l'état visible avec la prop open
  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    }
  }, [open]);

  // Gestion de la fermeture avec animation
  const handleClose = useCallback(() => {
    setClosing(true);
    // Attendre la fin de l'animation avant de masquer le composant
    const timer = setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 200);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Fermeture via la touche Échap
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      // Empêcher le défilement du body quand le tiroir est ouvert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [visible, handleKeyDown]);

  // Ne rien rendre si le tiroir n'est pas visible
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {/* Overlay semi-transparent avec flou d'arrière-plan */}
      <div
        className={[
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200',
          closing ? 'opacity-0' : 'opacity-100 animate-fade-in',
        ].join(' ')}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panneau de contenu — glisse depuis la droite */}
      <div
        className={[
          'relative w-full max-w-xl h-full bg-white shadow-xl flex flex-col',
          closing
            ? 'animate-[slide-out-to-right_0.2s_ease-in_forwards]'
            : 'animate-[slide-in-from-right_0.3s_ease-out]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* En-tête avec titre et bouton de fermeture */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-200/50">
          {title && (
            <h2
              id="drawer-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto rounded-lg p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors duration-150"
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

        {/* Contenu principal avec défilement */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
