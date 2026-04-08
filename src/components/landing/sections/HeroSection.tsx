'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { MockupDashboard } from '../MockupDashboard'
import { AntWithKeys } from '../AntMascot'
import { Star4 } from '../Decorations'

export function HeroSection() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden bg-bg-primary">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-10 -right-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[140px]" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-pastel-lavender/5 blur-[120px]" />

      {/* Étoiles décoratives */}
      <Star4 className="absolute top-32 right-[12%] w-4 h-4 animate-twinkle hidden lg:block" color="#F4A77C" />
      <Star4 className="absolute top-48 left-[8%] w-3 h-3 animate-twinkle-d1 hidden lg:block" color="white" />
      <Star4 className="absolute bottom-40 right-[25%] w-5 h-5 animate-twinkle-d2 hidden lg:block" color="#C0B0DC" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Text centered */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6">
            &#9654; Gestion locative
          </span>

          <h1 className="font-display text-[clamp(44px,7vw,88px)] font-extrabold leading-[0.95] tracking-[-0.04em]">
            Gérez vos biens.
            <br />
            <span className="relative inline-block">
              Pas vos{' '}
              <span className="text-accent relative">
                papiers
                <span className="absolute left-0 -bottom-1 w-full h-[4px] bg-pastel-peach rounded-full" />
              </span>
              .
            </span>
          </h1>

          <p className="mt-8 text-lg text-text-secondary leading-[1.75] max-w-xl mx-auto">
            Loovia centralise tout ce qu&apos;un propriétaire jongle en permanence
            &mdash; loyers, baux, quittances, comptabilité. Automatisé. Fiable.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md bg-accent text-white font-display font-bold text-[15px] border-2 border-accent hover:bg-transparent hover:text-accent transition-all">
              Rejoindre la bêta gratuite
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#comment-ca-marche" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md border-2 border-border text-text-secondary font-display font-bold text-[15px] hover:border-pastel-peach hover:text-pastel-peach transition-all">
              Voir comment ça marche
              <ChevronDown className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Mockup Dashboard — le visuel principal */}
        <div className="mt-16 relative">
          {/* Petite fourmi discrète en haut à gauche du mockup */}
          <div className="absolute -top-8 -left-4 z-20 hidden lg:block">
            <AntWithKeys className="w-16 h-16 animate-float-slow" />
          </div>

          <div className="relative">
            <MockupDashboard className="w-full max-w-4xl mx-auto" />
            {/* Halo glow derrière le mockup */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/8 via-pastel-lavender/5 to-transparent blur-3xl rounded-3xl scale-110" />
          </div>
        </div>

        {/* Beta banner */}
        <div className="mt-14 py-3 border-t border-border text-center">
          <p className="text-[12px] font-mono text-text-muted tracking-wider">
            <span className="text-accent">//</span> Actuellement en bêta ouverte &mdash; accès gratuit pour les premiers propriétaires
          </p>
        </div>
      </div>
    </section>
  )
}
