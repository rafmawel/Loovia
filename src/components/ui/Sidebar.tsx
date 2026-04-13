'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wallet,
  Wrench,
  FolderOpen,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface SidebarProps {
  user: {
    email?: string
    user_metadata?: {
      first_name?: string
      [key: string]: unknown
    }
  }
  onClose?: () => void
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes Biens', href: '/biens', icon: Building2 },
  { label: 'Locataires', href: '/locataires', icon: Users },
  { label: 'Baux', href: '/baux', icon: FileText },
  { label: 'Finances', href: '/finances', icon: Wallet },
  { label: 'Travaux', href: '/maintenance', icon: Wrench },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Analytique', href: '/analytique', icon: BarChart3 },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
  { label: 'Aide & FAQ', href: '/faq', icon: HelpCircle },
]

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const displayName =
    user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'Utilisateur'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string): boolean {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen bg-bg-elevated border-r border-border flex flex-col z-20">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <Home className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold gradient-text font-[var(--font-syne)]">
            Loovia
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden rounded-lg p-1 text-text-muted hover:bg-bg-elevated" aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={[
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-accent/12 text-accent'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
              ].join(' ')}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Utilisateur */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent/12 text-accent text-sm font-semibold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {displayName}
            </p>
            {user.email && (
              <p className="text-xs text-text-muted truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-secondary
                     hover:bg-bg-elevated hover:text-text-primary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
