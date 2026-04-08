'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { useInView } from '../hooks'

const plans = [
  {
    name: 'Bêta gratuite',
    price: '0',
    period: 'pour toujours',
    description: 'Accès complet pendant la bêta — votre feedback est bienvenu',
    features: [
      'Tous vos biens',
      'Gestion des locataires',
      'Suivi des paiements',
      'Quittances de loyer',
      'Coffre-fort documentaire',
      'Notifications in-app',
      'App mobile (PWA)',
    ],
    cta: 'Rejoindre la bêta',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '—',
    period: 'bientôt',
    description: 'Tarif défini avec les premiers utilisateurs',
    features: [
      'Tout le plan gratuit',
      'Analytique avancée',
      'Révision IRL automatique',
      'Signature électronique',
      'Sans publicité',
      'Support prioritaire',
      'Export comptable',
    ],
    cta: 'Être notifié du lancement',
    href: '/register',
    highlighted: true,
  },
]

export function PricingSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="tarifs" ref={ref} className="landing-section bg-bg-primary relative">
      <div className="absolute inset-0 bg-dot-grid opacity-15" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className={`text-center mb-16 ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
            // Simple et transparent
          </span>
          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold tracking-[-0.025em]">
            Gratuit pendant la <span className="text-accent">bêta</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-lg mx-auto">
            Les tarifs seront définis avec les premiers utilisateurs.
            Pas de surprise, pas d&apos;engagement caché.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col relative overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-bg-card border-2 border-accent shadow-2xl shadow-accent/10'
                  : 'bg-bg-card border border-border hover:border-border-accent'
              } ${inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold font-mono tracking-wider px-4 py-1.5 rounded-bl-xl uppercase">
                  Bientôt
                </div>
              )}

              <h3 className="text-xl font-bold font-display">{plan.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{plan.description}</p>

              <div className="mt-8 mb-8">
                <span className="text-5xl font-extrabold font-display">
                  {plan.price === '—' ? '—' : `${plan.price}\u20AC`}
                </span>
                <span className="text-sm text-text-muted ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-3.5 mb-10 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                    <span className="text-text-secondary">{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-md font-display font-bold text-[15px] transition-all hover:scale-[1.02] ${
                  plan.highlighted
                    ? 'bg-accent text-white border-2 border-accent hover:bg-transparent hover:text-accent'
                    : 'border-2 border-border text-text-primary hover:border-accent hover:text-accent'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
