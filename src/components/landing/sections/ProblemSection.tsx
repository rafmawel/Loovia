'use client'
import { useInView } from '../useInView'

export function ProblemSection() {
  const { ref, inView } = useInView(0.15)

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-bg-cream">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`max-w-[680px] ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-accent text-[13px] font-semibold tracking-wide uppercase">Le constat</span>
          <h2 className="mt-4 font-display text-[clamp(28px,4vw,44px)] font-bold leading-[1.1] tracking-tight text-text-dark">
            Être propriétaire, c&apos;est aussi devenir son propre gestionnaire.
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          <div className={`space-y-6 text-[16px] text-text-dark/70 leading-[1.8] ${inView ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
            <p>
              Baux éparpillés, quittances manuelles, factures introuvables,
              échéances oubliées. Chaque propriétaire bailleur connaît cette
              réalité : des heures passées sur des tâches administratives
              qui pourraient être automatisées.
            </p>
            <p>
              Les solutions existantes ne répondent qu&apos;à une partie du problème.
              Vous multipliez les outils, les abonnements et les fichiers Excel
              &mdash; sans jamais avoir de vision globale sur votre patrimoine.
            </p>
          </div>

          <div className={`bg-white rounded-2xl border border-stone-200/80 p-8 ${inView ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
            <p className="text-[16px] text-text-dark leading-[1.8] font-medium">
              &laquo;&nbsp;J&apos;ai créé Loovia parce que je vivais ce problème au quotidien.
              Mon objectif était clair&nbsp;: réunir tout ce dont un propriétaire
              a besoin dans un seul outil, simple et accessible.
            </p>
            <p className="mt-4 text-[16px] text-text-dark leading-[1.8] font-medium">
              Pas un logiciel de plus. Une plateforme{' '}
              <span className="text-accent font-bold">qui remplace tous les autres.</span>&nbsp;&raquo;
            </p>
            <div className="mt-6 pt-5 border-t border-stone-100">
              <p className="text-[14px] text-text-dark font-semibold">Raphaël Da Silva Santos</p>
              <p className="text-[13px] text-text-muted">Fondateur de Loovia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
