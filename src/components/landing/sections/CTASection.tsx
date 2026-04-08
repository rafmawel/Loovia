'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useInView } from '../useInView'

export function CTASection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent" />
      <div className={`max-w-[640px] mx-auto px-6 text-center relative z-10 ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
        <h2 className="font-display text-[clamp(28px,4.5vw,48px)] font-extrabold tracking-tight text-white leading-[1.1]">
          Arrêtez de jongler.
          <br />
          <span className="gradient-text">Commencez à gérer.</span>
        </h2>
        <p className="mt-6 text-text-secondary text-[16px] max-w-[440px] mx-auto leading-[1.7]">
          Rejoignez les propriétaires qui ont choisi la simplicité pour
          piloter leur patrimoine immobilier.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 mt-9 h-13 px-8 rounded-lg bg-accent text-white font-semibold text-[16px] hover:brightness-110 transition-all shadow-lg shadow-accent/20">
          Créer mon compte gratuitement <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-5 text-[13px] text-text-muted">
          Aucune carte bancaire requise &middot; Accès immédiat &middot; Hébergé en France
        </p>
      </div>
    </section>
  )
}
