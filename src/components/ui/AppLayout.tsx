'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { Menu } from 'lucide-react'

interface AppUser {
  email?: string
  user_metadata?: {
    first_name?: string
    [key: string]: unknown
  }
}

interface AppLayoutProps {
  children: ReactNode
  user: AppUser
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-bg-cream">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={[
          'fixed left-0 top-0 h-screen z-40 transition-transform duration-200 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Contenu principal */}
      <main className="md:ml-[260px] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-bg-cream/80 border-b border-stone-200/50 px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden rounded-lg p-2 text-text-dark hover:bg-stone-200/50 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="md:hidden text-sm font-bold gradient-text font-[var(--font-syne)]">Loovia</span>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Page */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
