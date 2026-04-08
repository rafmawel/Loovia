'use client'
import { useInView } from '../useInView'

const steps = [
  { n: '01', title: 'Créez votre compte', description: 'Inscription gratuite en 2 minutes, sans engagement ni carte bancaire.' },
  { n: '02', title: 'Ajoutez vos biens & locataires', description: 'Renseignez vos biens immobiliers, ajoutez vos locataires et créez vos baux.' },
  { n: '03', title: 'Pilotez votre patrimoine', description: 'Suivez vos loyers, envoyez vos quittances, analysez votre rentabilité.' },
]

export function StepsSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="comment-ca-marche" ref={ref} className="py-24 sm:py-32 bg-bg-primary">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={inView ? 'animate-fade-up' : 'opacity-0'}>
          <span className="text-accent text-[13px] font-semibold tracking-wide uppercase">Comment ça marche</span>
          <h2 className="mt-4 font-display text-[clamp(28px,4vw,44px)] font-bold tracking-tight text-white">
            Commencez en <span className="gradient-text">3 étapes</span>
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.n} className={`glass-card rounded-2xl p-8 ${inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'}`}>
              <span className="font-display text-[48px] font-extrabold gradient-text leading-none">{s.n}</span>
              <h3 className="mt-5 text-[17px] font-semibold text-white">{s.title}</h3>
              <p className="mt-3 text-[14px] text-text-secondary leading-[1.7]">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
