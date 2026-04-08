'use client'

import { Layers, Zap, Moon } from 'lucide-react'
import { useInView } from '../hooks'
import { AntRelaxed } from '../AntMascot'

const pillars = [
  {
    icon: Layers,
    title: 'Centraliser',
    description: 'Baux, locataires, documents, historique. Tout au même endroit.',
  },
  {
    icon: Zap,
    title: 'Automatiser',
    description: 'Loyers encaissés, quittances générées, comptabilité mise à jour.',
  },
  {
    icon: Moon,
    title: 'Dormir tranquille',
    description: 'Rappels automatiques, alertes, rien ne passe entre les mailles.',
  },
]

export function SolutionSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="landing-section bg-bg-cream relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
          &#9654; La réponse Loovia
        </span>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text + Cards */}
          <div className={inView ? 'animate-fade-up' : 'opacity-0'}>
            <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em] text-text-dark mb-10">
              Un seul outil.
              <br />
              <span className="text-accent">Tout votre patrimoine.</span>
            </h2>

            <div className="space-y-5">
              {pillars.map((p, i) => {
                const Icon = p.icon
                return (
                  <div
                    key={p.title}
                    className={`flex gap-4 p-5 rounded-2xl bg-white border border-stone-200 hover:border-accent/30 hover:-translate-y-0.5 transition-all ${
                      inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'
                    }`}
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent/10 shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-dark">{p.title}</h3>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{p.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right — Fourmi relaxée */}
          <div className={`flex justify-center ${inView ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
            <AntRelaxed className="w-64 h-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}
