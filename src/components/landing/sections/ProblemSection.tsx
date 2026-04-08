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
              Un bail téléchargé sur un site, un état des lieux sur un autre.
              Les quittances dans un fichier Word, les factures travaux quelque
              part dans vos mails. Le nom de votre locataire ? Dans votre téléphone.
              Son RIB ? Dans un email de 2021.
            </p>
            <p>
              Ce n&apos;est pas de la mauvaise gestion. C&apos;est simplement que les
              outils existants n&apos;ont jamais été conçus pour couvrir l&apos;ensemble
              de vos besoins. Vous finissez avec quatre abonnements, trois exports
              Excel, et aucune vue d&apos;ensemble.
            </p>
          </div>

          <div className={`bg-white rounded-2xl border border-stone-200/80 p-8 ${inView ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
            <p className="text-[16px] text-text-dark leading-[1.8] font-medium">
              &laquo;&nbsp;Loovia est né de cette frustration. L&apos;idée est simple&nbsp;:
              tout ce qu&apos;un propriétaire fait, refait, et oublie de faire &mdash;
              automatisé, centralisé, accessible.
            </p>
            <p className="mt-4 text-[16px] text-text-dark leading-[1.8] font-medium">
              Pas un outil de plus. Un outil{' '}
              <span className="text-accent font-bold">à la place de tous les autres.</span>&nbsp;&raquo;
            </p>
            <div className="mt-6 pt-5 border-t border-stone-100">
              <p className="text-[14px] text-text-dark font-semibold">Rafmawel</p>
              <p className="text-[13px] text-text-muted">Fondateur de Loovia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
