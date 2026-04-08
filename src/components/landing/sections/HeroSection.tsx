'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown, Shield } from 'lucide-react'
import { AntHero } from '../AntMascot'
import { Star4, MiniBuilding, KeyIcon, CoinEuro, DocPDF } from '../Decorations'

export function HeroSection() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden bg-bg-primary">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-10 -right-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[140px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 items-center">
          {/* Left — 60% */}
          <div className="lg:col-span-3">
            {/* Label */}
            <span className="inline-block text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6">
              &#9654; Gestion locative
            </span>

            {/* H1 */}
            <h1 className="font-display text-[clamp(48px,7vw,96px)] font-extrabold leading-[0.95] tracking-[-0.04em]">
              Gérez vos biens.
              <br />
              <span className="relative">
                Pas vos{' '}
                <span className="text-accent relative">
                  papiers
                  <span className="absolute left-0 bottom-[0.05em] w-full h-[4px] bg-accent/40 rounded-full" />
                </span>
                .
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 text-base sm:text-lg text-text-secondary leading-[1.75] max-w-lg">
              Loovia centralise tout ce qu&apos;un propriétaire jongle en permanence
              &mdash; loyers, baux, quittances, comptabilité. Automatisé. Fiable.
              En un seul endroit.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md bg-accent text-white font-display font-bold text-[15px] border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
              >
                Rejoindre la bêta gratuite
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#comment-ca-marche"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md border-2 border-border text-text-secondary font-display font-bold text-[15px] hover:border-accent hover:text-accent transition-all"
              >
                Voir comment ça marche
                <ChevronDown className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-10 flex items-center gap-5 text-[13px] text-text-muted">
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> SSL &amp; RGPD</span>
              <span className="h-3 w-px bg-border" />
              <span>100% gratuit en bêta</span>
              <span className="h-3 w-px bg-border" />
              <span>Données en France</span>
            </div>
          </div>

          {/* Right — 40% — Fourmi + éléments flottants */}
          <div className="lg:col-span-2 relative hidden lg:flex items-center justify-center min-h-[450px]">
            {/* Fourmi Hero — centre */}
            <AntHero className="w-52 h-auto relative z-10" />

            {/* Éléments flottants */}
            <div className="absolute top-4 right-8 animate-float">
              <DocPDF className="w-12 h-auto" />
            </div>
            <div className="absolute top-16 left-0 animate-float-d1">
              <CoinEuro className="w-14 h-auto" />
            </div>
            <div className="absolute bottom-16 right-4 animate-float-d2">
              <MiniBuilding className="w-16 h-auto" />
            </div>
            <div className="absolute bottom-8 left-8 animate-float-d3">
              <KeyIcon className="w-12 h-auto" />
            </div>

            {/* Étoiles décoratives */}
            <Star4 className="absolute top-0 left-16 w-4 h-4 animate-twinkle" color="#E8622A" />
            <Star4 className="absolute top-24 right-0 w-3 h-3 animate-twinkle-d1" color="white" />
            <Star4 className="absolute bottom-32 left-2 w-5 h-5 animate-twinkle-d2" color="#F5C842" />
            <Star4 className="absolute bottom-0 right-20 w-3 h-3 animate-twinkle-d3" color="white" />
          </div>
        </div>

        {/* Beta banner */}
        <div className="mt-16 py-3 border-t border-border text-center">
          <p className="text-[12px] font-mono text-text-muted tracking-wider">
            <span className="text-accent">//</span> Actuellement en bêta ouverte &mdash; accès gratuit pour les premiers propriétaires
          </p>
        </div>
      </div>
    </section>
  )
}
