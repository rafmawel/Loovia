'use client'

import { useInView } from '../hooks'
import { AntOverwhelmed } from '../AntMascot'

const painPoints = [
  'Un bail téléchargé sur un site, un état des lieux sur un autre',
  'Les quittances dans un fichier Word, les factures travaux quelque part dans vos mails',
  'Le RIB du locataire ? Dans un email de 2021',
  'La date de révision du loyer ? Bonne question',
  'Quatre abonnements, trois exports Excel, et autant d\'angles morts',
]

export function ProblemSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="landing-section bg-bg-section relative">
      <div className="absolute inset-0 bg-dot-grid opacity-10" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
          // Ça vous parle ?
        </span>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Fourmi submergée */}
          <div className={`flex justify-center ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <AntOverwhelmed className="w-56 h-auto" />
          </div>

          {/* Right — Pain points */}
          <div className={inView ? 'animate-fade-up delay-200' : 'opacity-0'}>
            <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em] mb-8">
              Être propriétaire, c&apos;est aussi être{' '}
              <span className="text-accent">son propre gestionnaire.</span>
            </h2>

            <p className="text-text-secondary text-base leading-[1.75] mb-8">
              Ce n&apos;est pas de la mauvaise gestion &mdash; c&apos;est juste que rien
              n&apos;a jamais été conçu pour ça.
            </p>

            <ul className="space-y-4">
              {painPoints.map((point, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 text-[15px] text-text-secondary ${
                    inView ? `animate-fade-up delay-${(i + 2) * 100}` : 'opacity-0'
                  }`}
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
