'use client'

import { FileText, ClipboardCheck, Receipt, Wallet, FolderLock, Users } from 'lucide-react'
import { useInView } from '../hooks'

const features = [
  {
    icon: FileText,
    title: 'Bail sur mesure',
    description: 'Pas un modèle générique. Un bail configuré selon votre bien, votre type de location, vos clauses spécifiques.',
  },
  {
    icon: ClipboardCheck,
    title: 'État des lieux intégré',
    description: 'Entrée et sortie dans le même outil. Photos, signatures, tout archivé automatiquement.',
  },
  {
    icon: Receipt,
    title: 'Quittances en un clic',
    description: 'Générées et envoyées automatiquement chaque mois. Ou manuellement si vous préférez.',
  },
  {
    icon: Wallet,
    title: 'Suivi des paiements',
    description: 'Chaque virement est affecté au bon locataire, au bon bien. Votre comptabilité se tient seule.',
  },
  {
    icon: FolderLock,
    title: 'Coffre-fort documentaire',
    description: 'Factures travaux, contrats, assurances. Classés, retrouvables, partageables avec votre comptable.',
  },
  {
    icon: Users,
    title: 'Fiche locataire complète',
    description: 'Coordonnées, historique des paiements, documents, échanges. Jamais un nom de perdu.',
  },
]

export function FeaturesSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="fonctionnalites" ref={ref} className="landing-section bg-bg-primary relative">
      <div className="absolute inset-0 bg-dot-grid opacity-15" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className={`max-w-2xl ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-accent font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6 block">
            // Ce que Loovia fait pour vous
          </span>
          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">
            Chaque corvée.{' '}
            <span className="text-accent">Automatisée.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`group bg-bg-card rounded-2xl border border-border p-8 border-t-[3px] border-t-transparent hover:border-t-accent hover:border-accent/40 hover:-translate-y-1.5 transition-all duration-300 ${
                  inView ? `animate-fade-up delay-${(i + 1) * 100}` : 'opacity-0'
                }`}
              >
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-accent/10 text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 font-display">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-[1.75]">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
