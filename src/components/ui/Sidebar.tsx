'use client'

// Barre latérale de navigation — responsive avec fermeture mobile
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
  LogOut,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

/** Props du composant Sidebar */
export interface SidebarProps {
  /** Informations utilisateur connecté */
  user: {
    email?: string
    user_metadata?: {
      first_name?: string
      [key: string]: unknown
    }
  }
  /** Callback pour fermer la sidebar sur mobile */
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
]

/**
 * Barre latérale de navigation fixe
 *
 * Affiche le logo, les liens de navigation avec état actif,
 * et les informations utilisateur avec bouton de déconnexion en bas.
 */
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
    <aside className="w-[260px] h-screen bg-white border-r border-stone-200 flex flex-col">
      {/* Logo + bouton fermer mobile */}
      <div className="px-6 py-6 border-b border-stone-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <Home className="h-6 w-6 text-terracotta" />
          <span className="text-xl font-bold text-terracotta">
            Loovia
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation principale */}
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
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-terracotta/10 text-terracotta border-l-2 border-terracotta'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Section utilisateur en bas */}
      <div className="border-t border-stone-100 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {displayName}
            </p>
            {user.email && (
              <p className="text-xs text-stone-500 truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-500
                     hover:bg-stone-50 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
