'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useInView } from '../hooks'
import { AntWithKeys } from '../AntMascot'
import { Star4 } from '../Decorations'

export function CTASection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="landing-section bg-bg-peach relative overflow-hidden">
      <Star4 className="absolute top-16 left-[15%] w-5 h-5 animate-twinkle hidden lg:block" color="white" />
      <Star4 className="absolute bottom-20 right-[20%] w-4 h-4 animate-twinkle-d1 hidden lg:block" color="#0D0F1A" />
      <Star4 className="absolute top-32 right-[10%] w-3 h-3 animate-twinkle-d2 hidden lg:block" color="white" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className={`flex flex-col items-center text-center ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] font-extrabold leading-[0.95] tracking-[-0.03em] text-text-dark">
            Arrêtez de jongler.
            <br />
            Commencez à <span className="relative inline-block">gérer.
              <span className="absolute left-0 -bottom-1 w-full h-[4px] bg-text-dark/20 rounded-full" />
            </span>
          </h2>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-10 px-10 py-4 rounded-md bg-text-dark text-white font-display font-bold text-lg border-2 border-text-dark hover:bg-transparent hover:text-text-dark transition-all"
          >
            Rejoindre la bêta gratuite
            <ArrowRight className="h-5 w-5" />
          </Link>

          <p className="mt-6 text-sm text-text-dark/60">
            Aucune carte bancaire requise &middot; Accès immédiat &middot; Données hébergées en France
          </p>

          {/* Petite fourmi discrète */}
          <div className="mt-10 opacity-50">
            <AntWithKeys className="w-14 h-14" />
          </div>
        </div>
      </div>
    </section>
  )
}
