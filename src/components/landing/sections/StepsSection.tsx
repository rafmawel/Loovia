'use client'

import { useInView } from '../hooks'

const steps = [
  {
    number: '01',
    title: 'Ajoutez votre bien et votre locataire',
    description: 'Renseignez les informations de base : adresse, loyer, charges, coordonnées du locataire.',
  },
  {
    number: '02',
    title: 'Configurez votre bail et vos conditions',
    description: 'Créez votre bail personnalisé, définissez les échéances et les conditions de location.',
  },
  {
    number: '03',
    title: 'Loovia gère le reste chaque mois',
    description: 'Suivi des paiements, quittances automatiques, alertes. Vous gardez le contrôle, sans la corvée.',
  },
]

export function StepsSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="comment-ca-marche" ref={ref} className="landing-section bg-bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={inView ? 'animate-fade-up' : 'opacity-0'}>
          <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
            // 3 minutes pour démarrer
          </span>
          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em] text-text-dark max-w-xl">
            Simple comme{' '}
            <span className="text-accent">bonjour.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
          {steps.map((s, i) => (
            <div
              key={s.number}
              className={`relative ${inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'}`}
            >
              {/* Connector */}
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-full w-full">
                  <div className="h-px bg-gradient-to-r from-accent/40 to-transparent ml-4 mr-4" />
                </div>
              )}

              <div className="bg-white rounded-2xl border border-stone-200 p-8 hover:shadow-lg hover:border-accent/20 transition-all">
                <span className="font-display text-5xl font-extrabold text-accent/15">{s.number}</span>
                <h3 className="text-lg font-bold text-text-dark mt-3 mb-3 font-display">{s.title}</h3>
                <p className="text-sm text-text-muted leading-[1.75]">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
