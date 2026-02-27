// Mise en page principale pour les pages authentifiées
import type { ReactNode } from 'react'
import { Sidebar } from '@/components/ui/Sidebar'

/** Informations utilisateur transmises au layout */
interface AppUser {
  email?: string
  user_metadata?: {
    first_name?: string
    [key: string]: unknown
  }
}

/** Props du composant AppLayout */
interface AppLayoutProps {
  /** Contenu de la page */
  children: ReactNode
  /** Utilisateur connecté */
  user: AppUser
}

/**
 * Layout principal de l'application — Design "Premium Minimaliste Naturel"
 *
 * Structure : barre latérale fixe à gauche (260px) + zone de contenu principale.
 * L'en-tête du contenu est collant (sticky) avec un effet de flou en arrière-plan.
 * Le contenu est centré avec une largeur maximale de 7xl.
 */
export function AppLayout({ children, user }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Barre latérale fixe */}
      <Sidebar user={user} />

      {/* Zone de contenu principale — décalée à droite de la sidebar */}
      <main className="ml-[260px] min-h-screen">
        {/* En-tête collant avec effet de flou */}
        <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-stone-200/50 px-8 py-4">
          {/* Espace réservé pour le fil d'Ariane ou d'autres éléments d'en-tête */}
        </header>

        {/* Contenu de la page */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
