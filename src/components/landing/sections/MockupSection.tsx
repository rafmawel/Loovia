'use client'

import { useInView } from '../hooks'
import { MockupDashboard } from '../MockupDashboard'
import { Star4 } from '../Decorations'

export function MockupSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="landing-section bg-bg-primary relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-dot-grid opacity-10" />
      <Star4 className="absolute top-24 left-[10%] w-4 h-4 animate-twinkle hidden lg:block" color="white" />
      <Star4 className="absolute bottom-20 right-[12%] w-3 h-3 animate-twinkle-d1 hidden lg:block" color="#F4A77C" />

      <div className={`max-w-5xl mx-auto px-4 sm:px-6 relative z-10 ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
        <div className="text-center mb-12">
          <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
            // Aperçu du produit
          </span>
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-bold tracking-[-0.025em] text-white">
            Un tableau de bord{' '}
            <span className="text-pastel-peach">clair et puissant</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-lg mx-auto">
            Toutes vos données de gestion locative en un coup d&apos;œil.
          </p>
        </div>

        <div className="relative">
          <MockupDashboard className="w-full max-w-4xl mx-auto" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-pastel-lavender/5 to-transparent blur-3xl rounded-3xl scale-110" />
        </div>
      </div>
    </section>
  )
}
