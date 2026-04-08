'use client'

import { Layers, Zap, Moon } from 'lucide-react'
import { useInView } from '../hooks'
import { AntRelaxed } from '../AntMascot'

const pillars = [
  { icon: Layers, title: 'Centraliser', description: 'Baux, locataires, documents, historique. Tout au même endroit.', color: 'bg-pastel-mint/30 border-pastel-mint/50' },
  { icon: Zap, title: 'Automatiser', description: 'Loyers encaissés, quittances générées, comptabilité mise à jour.', color: 'bg-pastel-peach/30 border-pastel-peach/50' },
  { icon: Moon, title: 'Dormir tranquille', description: 'Rappels automatiques, alertes, rien ne passe entre les mailles.', color: 'bg-pastel-lavender/30 border-pastel-lavender/50' },
]

export function SolutionSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="landing-section bg-bg-cream relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-start justify-between gap-8">
          <div className={`max-w-2xl ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
              &#9654; La réponse Loovia
            </span>
            <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em] text-text-dark">
              Un seul outil.
              <br />
              <span className="text-accent">Tout votre patrimoine.</span>
            </h2>
          </div>

          {/* Fourmi discrète en haut à droite */}
          <div className="hidden lg:block">
            <AntRelaxed className="w-20 h-20 opacity-70" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {pillars.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className={`rounded-2xl p-8 border ${p.color} hover:shadow-lg hover:-translate-y-1 transition-all ${
                  inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'
                }`}
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/80 shadow-sm mb-5">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-text-dark font-display">{p.title}</h3>
                <p className="text-sm text-text-muted mt-3 leading-[1.75]">{p.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
