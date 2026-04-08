'use client'

import { useInView } from '../hooks'
import { Star4 } from '../Decorations'

const painPoints = [
  { text: 'Un bail téléchargé ici, un état des lieux là-bas', emoji: '📄' },
  { text: 'Les quittances dans un Word, les factures dans vos mails', emoji: '📧' },
  { text: 'Le RIB du locataire ? Quelque part dans un email de 2021', emoji: '🔍' },
  { text: 'La date de révision du loyer ? Bonne question', emoji: '📅' },
  { text: 'Quatre abonnements, trois exports Excel, zéro visibilité', emoji: '😮‍💨' },
]

export function ProblemSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="landing-section bg-bg-peach relative overflow-hidden">
      {/* Decorative stars */}
      <Star4 className="absolute top-16 right-20 w-5 h-5 animate-twinkle hidden lg:block" color="white" />
      <Star4 className="absolute bottom-24 left-16 w-4 h-4 animate-twinkle-d1 hidden lg:block" color="#0D0F1A" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className={`max-w-3xl ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-text-dark/60 font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
            // Ça vous parle ?
          </span>

          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em] text-text-dark">
            Être propriétaire, c&apos;est aussi être{' '}
            <span className="relative inline-block">
              son propre gestionnaire.
              <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-text-dark/20 rounded-full" />
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className={`bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/60 transition-all ${
                inView ? `animate-fade-up delay-${(i + 1) * 100}` : 'opacity-0'
              }`}
            >
              <span className="text-2xl mb-3 block">{point.emoji}</span>
              <p className="text-[15px] text-text-dark/80 leading-relaxed">{point.text}</p>
            </div>
          ))}
          {/* Last card — la conclusion */}
          <div className={`bg-text-dark/90 rounded-2xl p-6 flex items-center ${
            inView ? 'animate-fade-up delay-600' : 'opacity-0'
          }`}>
            <p className="text-[15px] text-white font-medium leading-relaxed">
              Ce n&apos;est pas de la mauvaise gestion &mdash;{' '}
              <span className="text-pastel-peach">c&apos;est juste que rien n&apos;a jamais été conçu pour ça.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
