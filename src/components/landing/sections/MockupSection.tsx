'use client'
import { useInView } from '../useInView'
import { MockupDashboard } from '../MockupDashboard'

export function MockupSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-bg-section border-t border-border">
      <div className={`max-w-[1000px] mx-auto px-6 ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
        <div className="text-center mb-14">
          <span className="text-accent text-[13px] font-semibold tracking-wide uppercase">Aperçu</span>
          <h2 className="mt-4 font-display text-[clamp(28px,4vw,44px)] font-bold tracking-tight text-white">
            Un tableau de bord <span className="gradient-text">clair et puissant</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-[480px] mx-auto text-[16px]">
            Revenus, locataires, paiements, alertes &mdash; toutes vos données
            de gestion locative en un coup d&apos;œil.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-20 bg-accent/[0.10] rounded-full blur-[90px] pointer-events-none" />
          <MockupDashboard className="relative w-full" />
        </div>
      </div>
    </section>
  )
}
