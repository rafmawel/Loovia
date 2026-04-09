'use client'
import Link from 'next/link'
import { ArrowRight, Shield, ChevronRight } from 'lucide-react'
import { MockupDashboard } from '../MockupDashboard'

export function HeroSection() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 bg-bg-primary overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-accent/[0.04] rounded-full blur-[120px]" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <h1 className="font-display text-[clamp(40px,5.5vw,72px)] font-extrabold leading-[1] tracking-[-0.035em] text-white">
              Gérez vos biens.
              <br />
              <span className="gradient-text">Loovia</span> s&apos;occupe du reste.
            </h1>

            <p className="mt-7 text-[17px] text-text-secondary leading-[1.7] max-w-[460px]">
              Loyers automatisés, quittances en un clic, suivi financier complet.
              La gestion locative conçue pour les propriétaires qui veulent
              l&apos;efficacité sans la complexité.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 h-12 px-7 rounded-lg bg-accent text-white font-semibold text-[15px] hover:brightness-110 transition-all shadow-lg shadow-accent/20">
                Commencer gratuitement <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#fonctionnalites" className="inline-flex items-center gap-2 h-12 px-7 rounded-lg border border-border-light text-text-secondary font-semibold text-[15px] hover:border-accent/40 hover:text-white transition-all">
                Découvrir <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-5 text-[13px] text-text-muted">
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent/70" /> SSL &amp; RGPD</span>
              <span className="w-px h-3 bg-border" />
              <span>Gratuit pour démarrer</span>
              <span className="w-px h-3 bg-border" />
              <span>Prêt en 2 min</span>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative hidden lg:block">
            {/* Halo orange */}
            <div className="absolute -inset-10 bg-accent/[0.07] rounded-full blur-[80px] pointer-events-none" />
            <MockupDashboard className="relative w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
