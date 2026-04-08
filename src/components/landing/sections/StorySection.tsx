'use client'

import { useInView } from '../hooks'
import { Star4 } from '../Decorations'
import { AntMini } from '../AntMascot'

export function StorySection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="landing-section bg-bg-section relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-10" />
      <Star4 className="absolute top-20 right-20 w-5 h-5 animate-twinkle hidden lg:block" color="#F4A77C" />
      <Star4 className="absolute bottom-32 left-16 w-4 h-4 animate-twinkle-d2 hidden lg:block" color="white" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className={`max-w-3xl ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
              &#9654; L&apos;histoire
            </span>
            <AntMini className="w-5 h-5 opacity-50" />
          </div>

          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em] mb-10 text-white">
            Créé par un propriétaire.{' '}
            <span className="text-pastel-peach">Pour les propriétaires.</span>
          </h2>

          <div className="space-y-6 text-text-secondary text-base leading-[1.85]">
            <p>
              Comme beaucoup de propriétaires, j&apos;ai longtemps géré mes biens avec les moyens
              du bord. Un bail téléchargé sur un site, un état des lieux sur un autre, les
              quittances dans un fichier Word, les factures travaux dans un dossier quelque
              part sur mon bureau &mdash; ou peut-être dans mes mails, je ne sais plus trop.
            </p>
            <p>
              Le nom de mon locataire ? Quelque part dans mon téléphone. Son RIB ? Dans un
              email de 2021. La date de révision du loyer ?{' '}
              <span className="text-pastel-peach font-medium">Bonne question.</span>
            </p>
            <p>
              Ce n&apos;est pas de la mauvaise gestion &mdash; c&apos;est juste que rien n&apos;a
              jamais été conçu pour ça. Vous finissez avec quatre abonnements, trois exports
              Excel, et autant d&apos;angles morts.
            </p>
            <p className="text-white font-medium border-l-2 border-accent pl-6">
              Loovia est né de cette frustration. Tout ce qu&apos;un propriétaire fait, refait,
              et oublie de faire &mdash; automatisé, centralisé, accessible. Pas un outil de plus.
              Un outil à la place de tous les autres.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
