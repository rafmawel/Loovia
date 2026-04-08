'use client'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { useInView } from '../useInView'

const plans = [
  {
    name: 'Gratuit', price: '0', period: '/mois', description: 'Pour démarrer sereinement',
    features: ['Jusqu\'à 3 biens', 'Gestion des locataires', 'Suivi des paiements', 'Quittances de loyer', 'Notifications in-app', 'Application mobile'],
    cta: 'Commencer gratuitement', href: '/register', highlighted: false,
  },
  {
    name: 'Pro', price: '9,90', period: '/mois', description: 'Pour les propriétaires exigeants',
    features: ['Biens illimités', 'Tout le plan Gratuit', 'Analytique avancée', 'Révision IRL automatique', 'Signature électronique', 'Sans publicité', 'Support prioritaire'],
    cta: 'Passer à Pro', href: '/register', highlighted: true,
  },
]

export function PricingSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="tarifs" ref={ref} className="py-24 sm:py-32 bg-bg-cream">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`text-center mb-14 ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-accent text-[13px] font-semibold tracking-wide uppercase">Tarifs</span>
          <h2 className="mt-4 font-display text-[clamp(28px,4vw,44px)] font-bold tracking-tight text-text-dark">
            Des prix simples, sans surprise.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-[740px] mx-auto">
          {plans.map((plan, i) => (
            <div key={plan.name} className={`rounded-2xl p-8 flex flex-col transition-all ${
              plan.highlighted
                ? 'bg-bg-primary text-white ring-1 ring-accent/30 shadow-xl'
                : 'bg-white border border-stone-200'
            } ${inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'}`}>
              {plan.highlighted && (
                <span className="self-start text-[11px] font-semibold text-accent bg-accent-muted px-3 py-1 rounded-full mb-4">Recommandé</span>
              )}
              <h3 className={`text-xl font-bold font-display ${plan.highlighted ? '' : 'text-text-dark'}`}>{plan.name}</h3>
              <p className={`text-[14px] mt-1 ${plan.highlighted ? 'text-text-secondary' : 'text-text-muted'}`}>{plan.description}</p>

              <div className="mt-6 mb-8">
                <span className={`text-[44px] font-extrabold font-display ${plan.highlighted ? '' : 'text-text-dark'}`}>{plan.price}&euro;</span>
                <span className={`text-[14px] ml-1 ${plan.highlighted ? 'text-text-muted' : 'text-text-muted'}`}>{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-[14px]">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-accent' : 'text-accent'}`} />
                    <span className={plan.highlighted ? 'text-text-secondary' : 'text-text-dark/70'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className={`inline-flex items-center justify-center gap-2 w-full h-12 rounded-lg font-semibold text-[15px] transition-all ${
                plan.highlighted
                  ? 'bg-accent text-white hover:brightness-110'
                  : 'border border-stone-200 text-text-dark hover:border-accent hover:text-accent'
              }`}>
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
