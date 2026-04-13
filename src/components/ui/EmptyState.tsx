// Composant d'état vide — affiché quand aucune donnée n'est disponible
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Props du composant EmptyState */
interface EmptyStateProps {
  /** Icône optionnelle affichée au centre (type LucideIcon de lucide-react) */
  icon?: LucideIcon
  /** Titre principal du message */
  title: string
  /** Description secondaire expliquant le contexte */
  description: string
  /** Bouton d'action optionnel (ex. : créer un premier élément) */
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Icône dans un cercle arrondi */}
      {Icon && (
        <div className="rounded-full bg-bg-card p-4 mb-4 text-text-muted">
          <Icon className="h-6 w-6" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>

      <p className="text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>

      {/* Bouton d'action optionnel */}
      {action && <div>{action}</div>}
    </div>
  )
}
