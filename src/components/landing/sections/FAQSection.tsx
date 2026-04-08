'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useInView } from '../useInView'

const faqs = [
  {
    question: 'Loovia est-il vraiment gratuit ?',
    answer:
      'Oui, le plan Gratuit vous permet de gérer jusqu\'à 2 biens sans limite de durée. Vous avez accès à la gestion des locataires, au suivi des paiements, aux quittances et aux notifications. Le plan Pro débloque les biens illimités, l\'analytique avancée et la signature électronique.',
  },
  {
    question: 'Ai-je besoin de connaissances techniques ?',
    answer:
      'Aucune. Loovia a été conçu pour les propriétaires bailleurs, pas pour les informaticiens. L\'interface est intuitive et vous guide à chaque étape : ajout d\'un bien, création d\'un bail, envoi de quittances…',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument. Vos données sont hébergées en Europe, chiffrées en transit et au repos. Nous utilisons Supabase (infrastructure PostgreSQL) avec des politiques de sécurité strictes (Row Level Security). Chaque utilisateur n\'accède qu\'à ses propres données.',
  },
  {
    question: 'Puis-je gérer plusieurs biens et locataires ?',
    answer:
      'Avec le plan Gratuit, vous pouvez gérer jusqu\'à 2 biens et autant de locataires que nécessaire. Le plan Pro supprime cette limite : gérez un portefeuille entier depuis un seul tableau de bord.',
  },
  {
    question: 'Comment fonctionne la révision IRL automatique ?',
    answer:
      'Loovia récupère automatiquement les indices IRL publiés par l\'INSEE. Quand une révision est due sur l\'un de vos baux, vous êtes notifié et le nouveau loyer est calculé pour vous. Cette fonctionnalité est disponible dans le plan Pro.',
  },
  {
    question: 'Est-ce que Loovia remplace un gestionnaire immobilier ?',
    answer:
      'Loovia est un outil de gestion locative en autonomie. Il est idéal pour les propriétaires qui souhaitent gérer eux-mêmes leurs biens sans passer par une agence. Vous gardez le contrôle total sur vos baux, loyers et documents.',
  },
  {
    question: 'Puis-je utiliser Loovia sur mobile ?',
    answer:
      'Oui, Loovia est une Progressive Web App (PWA). Vous pouvez l\'installer directement sur votre smartphone depuis le navigateur et y accéder comme une application native, même hors connexion pour certaines fonctionnalités.',
  },
  {
    question: 'Comment résilier ou changer de plan ?',
    answer:
      'Vous pouvez passer du plan Gratuit au Pro (et inversement) à tout moment depuis vos paramètres. Aucun engagement, aucuns frais cachés. La résiliation du Pro est immédiate et vous conservez vos données.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border-subtle last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left gap-4"
      >
        <span className="text-base font-medium text-text-primary">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-text-secondary">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-bg-section">
      <div className={`max-w-3xl mx-auto px-4 sm:px-6 ${inView ? 'animate-fade-up' : 'opacity-0'}`}>
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary font-[var(--font-syne)]">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Tout ce que vous devez savoir pour bien démarrer avec Loovia.
          </p>
        </div>

        <div className="glass-card rounded-2xl px-6 sm:px-8">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
