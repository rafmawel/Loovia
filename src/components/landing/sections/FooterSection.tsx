import Link from 'next/link'
import { Shield } from 'lucide-react'

export function FooterSection() {
  return (
    <footer className="bg-bg-primary border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-lg font-extrabold text-white">L<span className="gradient-text">oo</span>via</span>
            <p className="text-[13px] text-text-muted leading-relaxed mt-3">
              La gestion locative moderne pour les propriétaires bailleurs.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-white mb-4">Produit</h4>
            <ul className="space-y-2">
              <li><Link href="#fonctionnalites" className="text-[13px] text-text-muted hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link href="#tarifs" className="text-[13px] text-text-muted hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="#comment-ca-marche" className="text-[13px] text-text-muted hover:text-white transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-white mb-4">Compte</h4>
            <ul className="space-y-2">
              <li><Link href="/register" className="text-[13px] text-text-muted hover:text-white transition-colors">Créer un compte</Link></li>
              <li><Link href="/login" className="text-[13px] text-text-muted hover:text-white transition-colors">Se connecter</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-white mb-4">Confiance</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[13px] text-text-muted"><Shield className="h-3 w-3 text-accent/60" /> Chiffrement SSL</li>
              <li className="flex items-center gap-2 text-[13px] text-text-muted"><Shield className="h-3 w-3 text-accent/60" /> Conforme RGPD</li>
              <li className="flex items-center gap-2 text-[13px] text-text-muted"><Shield className="h-3 w-3 text-accent/60" /> Hébergé en France</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-border text-[12px] text-text-muted">
          &copy; {new Date().getFullYear()} Loovia. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
