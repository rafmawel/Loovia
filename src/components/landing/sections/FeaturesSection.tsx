'use client'
import { Building2, Users, FileText, Wallet, BarChart3, Bell, Wrench, Smartphone } from 'lucide-react'
import { useInView } from '../useInView'

const features = [
  { icon: Building2, title: 'Gestion des biens', description: 'Centralisez vos biens avec leurs caractéristiques, loyers, charges et documents associés.' },
  { icon: Users, title: 'Suivi des locataires', description: 'Fiches locataires complètes : contacts, documents, historique des paiements et communications.' },
  { icon: FileText, title: 'Baux & signature', description: 'Créez vos baux depuis des modèles et envoyez-les en signature électronique en un clic.' },
  { icon: Wallet, title: 'Finances & quittances', description: 'Suivi des loyers, détection des impayés, envoi de quittances et synchronisation bancaire.' },
  { icon: BarChart3, title: 'Analytique avancée', description: 'Graphiques de rentabilité, cashflow, taux d\'occupation et répartition des charges.' },
  { icon: Bell, title: 'Notifications', description: 'Alertes automatiques : paiements reçus, impayés, échéances de baux, révisions IRL.' },
  { icon: Wrench, title: 'Travaux & maintenance', description: 'Suivez les demandes d\'intervention, leur priorité et leur résolution pour chaque bien.' },
  { icon: Smartphone, title: 'App mobile (PWA)', description: 'Installez Loovia sur votre téléphone et gérez vos biens où que vous soyez.' },
]

export function FeaturesSection() {
  const { ref, inView } = useInView(0.05)

  return (
    <section id="fonctionnalites" ref={ref} className="py-24 sm:py-32 bg-bg-primary">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`max-w-[520px] ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-accent text-[13px] font-semibold tracking-wide uppercase">Fonctionnalités</span>
          <h2 className="mt-4 font-display text-[clamp(28px,4vw,44px)] font-bold leading-[1.1] tracking-tight text-white">
            Tout ce dont un bailleur a besoin.{' '}
            <span className="text-text-secondary">Rien de plus.</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={f.title} className={`group glass-card rounded-2xl p-6 hover:border-accent/20 hover:bg-white/[0.05] transition-all duration-300 ${
                inView ? `animate-fade-up delay-${Math.min((i + 1) * 100, 600)}` : 'opacity-0'
              }`}>
                <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-text-secondary leading-[1.7]">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
