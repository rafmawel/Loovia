'use client'
import { Building2, Users, FileText, Wallet, BarChart3, Bell, Wrench, Smartphone, CalendarDays } from 'lucide-react'
import { useInView } from '../useInView'

const features = [
  { icon: Building2, title: 'Gestion des biens', description: 'Centralisez vos biens avec leurs caractéristiques, loyers, charges et documents associés.', comingSoon: false },
  { icon: Users, title: 'Suivi des locataires', description: 'Fiches locataires complètes : contacts, documents, historique des paiements et communications.', comingSoon: false },
  { icon: FileText, title: 'Baux & signature', description: 'Créez vos baux depuis des modèles et envoyez-les en signature électronique en un clic.', comingSoon: false },
  { icon: Wallet, title: 'Finances & quittances', description: 'Suivi des loyers, détection des impayés, envoi de quittances et synchronisation bancaire.', comingSoon: false },
  { icon: BarChart3, title: 'Analytique avancée', description: 'Graphiques de rentabilité, cashflow, taux d\'occupation et répartition des charges.', comingSoon: false },
  { icon: Bell, title: 'Notifications', description: 'Alertes automatiques : paiements reçus, impayés, échéances de baux, révisions IRL.', comingSoon: false },
  { icon: Wrench, title: 'Travaux & artisans', description: 'Mise en relation avec des artisans, devis, suivi des interventions — tout centralisé.', comingSoon: true },
  { icon: CalendarDays, title: 'Location saisonnière', description: 'Gestion Airbnb, calendrier de réservations, tarification et contrats saisonniers.', comingSoon: true },
  { icon: Smartphone, title: 'App mobile (PWA)', description: 'Installez Loovia sur votre téléphone et gérez vos biens où que vous soyez.', comingSoon: false },
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

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={f.title} className={`group glass-card rounded-2xl p-6 hover:border-accent/20 hover:bg-white/[0.05] transition-all duration-300 ${
                inView ? `animate-fade-up delay-${Math.min((i + 1) * 100, 600)}` : 'opacity-0'
              }`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-accent-muted flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  {f.comingSoon && (
                    <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">À venir</span>
                  )}
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
