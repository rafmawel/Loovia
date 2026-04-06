'use client'

// Mise en page principale pour les pages authentifiées
import { useState, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { Menu } from 'lucide-react'

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
  children: ReactNode
  user: AppUser
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Fermer la sidebar quand on change de page (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-off-white">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Barre latérale — fixe sur desktop, slide-over sur mobile */}
      <div
        className={[
          'fixed left-0 top-0 h-screen z-40 transition-transform duration-200 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Zone de contenu principale */}
      <main className="md:ml-[260px] min-h-screen">
        {/* Header mobile avec hamburger */}
        <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-stone-200/50 px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden rounded-lg p-2 text-stone-500 hover:bg-stone-100 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Titre mobile */}
              <span className="md:hidden text-sm font-bold text-terracotta">Loovia</span>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Contenu de la page */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
