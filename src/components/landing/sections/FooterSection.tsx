import Link from 'next/link'
import { Shield } from 'lucide-react'
import { AntWave } from '../AntMascot'

export function FooterSection() {
  return (
    <footer className="bg-[#080A12] border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-xl font-extrabold font-display tracking-tight">
                <span className="text-white">L</span>
                <span className="text-accent">oo</span>
                <span className="text-white">via</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mt-4">
              La plateforme de gestion locative moderne pour les propriétaires bailleurs.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-display">Produit</h4>
            <ul className="space-y-2.5">
              <li><Link href="#fonctionnalites" className="text-sm text-text-muted hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link href="#tarifs" className="text-sm text-text-muted hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="#comment-ca-marche" className="text-sm text-text-muted hover:text-white transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-display">Compte</h4>
            <ul className="space-y-2.5">
              <li><Link href="/register" className="text-sm text-text-muted hover:text-white transition-colors">Rejoindre la bêta</Link></li>
              <li><Link href="/login" className="text-sm text-text-muted hover:text-white transition-colors">Se connecter</Link></li>
            </ul>
          </div>

          {/* Sécurité */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-display">Sécurité</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-text-muted"><Shield className="h-3.5 w-3.5 text-accent" /> Chiffrement SSL</li>
              <li className="flex items-center gap-2 text-sm text-text-muted"><Shield className="h-3.5 w-3.5 text-accent" /> Conforme RGPD</li>
              <li className="flex items-center gap-2 text-sm text-text-muted"><Shield className="h-3.5 w-3.5 text-accent" /> Hébergé en France</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Loovia. Tous droits réservés.
          </p>
          <AntWave className="w-8 h-auto opacity-40 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </footer>
  )
}
