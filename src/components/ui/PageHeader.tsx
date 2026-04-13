// En-tête de page avec titre, description et actions
import type { ReactNode } from 'react'

/** Props du composant PageHeader */
interface PageHeaderProps {
  /** Titre principal de la page */
  title: string
  /** Description secondaire optionnelle */
  description?: string
  /** Actions optionnelles (boutons) affichées à droite */
  children?: ReactNode
}

/**
 * En-tête de page — Design "Premium Minimaliste Naturel"
 *
 * Affiche le titre de la page avec une description optionnelle
 * et un emplacement pour les boutons d'action à droite.
 * Utilise l'animation d'entrée définie dans le thème.
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between animate-in mb-8">
      {/* Zone titre et description */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-secondary mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Zone d'actions (boutons) */}
      {children && (
        <div className="flex items-center gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
