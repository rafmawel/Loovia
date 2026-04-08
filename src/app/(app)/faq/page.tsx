'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

const categories = [
  {
    title: 'Général',
    faqs: [
      {
        q: 'Comment fonctionne Loovia ?',
        a: 'Loovia est une application de gestion locative en ligne. Vous ajoutez vos biens, vos locataires et vos baux, puis Loovia s\'occupe du suivi des loyers, de l\'envoi des quittances et des notifications automatiques.',
      },
      {
        q: 'Quelles sont les différences entre le plan Gratuit et le plan Pro ?',
        a: 'Le plan Gratuit permet de gérer jusqu\'à 2 biens avec les fonctionnalités essentielles (locataires, paiements, quittances, notifications). Le plan Pro débloque les biens illimités, l\'analytique avancée, la révision IRL automatique, la signature électronique et supprime les publicités.',
      },
      {
        q: 'Mes données sont-elles sécurisées ?',
        a: 'Oui. Vos données sont hébergées en Europe sur une infrastructure PostgreSQL sécurisée (Supabase), chiffrées en transit (TLS) et au repos. Chaque utilisateur n\'accède qu\'à ses propres données grâce au Row Level Security (RLS).',
      },
    ],
  },
  {
    title: 'Biens & Locataires',
    faqs: [
      {
        q: 'Comment ajouter un bien ?',
        a: 'Rendez-vous sur "Mes Biens" puis cliquez sur "+ Ajouter un bien". Remplissez les informations du bien (adresse, surface, loyer, charges) et validez. Vous pouvez ensuite y associer des locataires et des baux.',
      },
      {
        q: 'Puis-je gérer des colocations ?',
        a: 'Oui, vous pouvez associer plusieurs locataires à un même bien via un bail partagé. Chaque locataire peut avoir ses propres informations de contact et documents.',
      },
      {
        q: 'Comment associer un locataire à un bien ?',
        a: 'Créez d\'abord le locataire depuis l\'onglet "Locataires", puis créez un bail dans "Baux" en sélectionnant le bien et le locataire concerné. Le lien entre les trois est automatique.',
      },
    ],
  },
  {
    title: 'Baux & Documents',
    faqs: [
      {
        q: 'Comment créer un bail ?',
        a: 'Allez dans "Baux" puis "+ Nouveau bail". L\'assistant vous guide étape par étape : type de bail, parties (bien + locataire), durée, loyer, charges, clause IRL, diagnostics. Le bail est ensuite consultable avec tous ses détails.',
      },
      {
        q: 'Comment envoyer une quittance de loyer ?',
        a: 'Une fois un paiement enregistré, vous pouvez générer et envoyer la quittance de loyer en PDF directement depuis la section "Finances" ou depuis la fiche du bail. Le locataire la reçoit par email.',
      },
      {
        q: 'Comment fonctionne la signature électronique ?',
        a: 'La signature électronique est disponible avec le plan Pro. Depuis la fiche d\'un bail, cliquez sur "Envoyer en signature". Le locataire reçoit un lien par email pour signer le document en ligne.',
      },
    ],
  },
  {
    title: 'Finances & Paiements',
    faqs: [
      {
        q: 'Comment suivre les loyers reçus et impayés ?',
        a: 'L\'onglet "Finances" affiche tous vos paiements avec leur statut (reçu, en attente, en retard). Le tableau de bord vous donne une vue d\'ensemble de vos revenus mensuels et de votre taux de recouvrement.',
      },
      {
        q: 'Comment fonctionne la détection des impayés ?',
        a: 'Loovia compare automatiquement la date d\'échéance de chaque loyer avec les paiements reçus. Si un paiement est en retard, vous recevez une notification et le statut passe en "En retard" dans le suivi.',
      },
      {
        q: 'Qu\'est-ce que la révision IRL ?',
        a: 'L\'Indice de Référence des Loyers (IRL), publié par l\'INSEE, permet de réviser annuellement le montant du loyer. Avec le plan Pro, Loovia détecte automatiquement les révisions dues et calcule le nouveau loyer pour vous.',
      },
    ],
  },
  {
    title: 'Compte & Abonnement',
    faqs: [
      {
        q: 'Comment passer au plan Pro ?',
        a: 'Rendez-vous dans "Paramètres" et cliquez sur "Passer au Pro". Vous serez redirigé vers notre page de paiement sécurisée (Stripe). L\'abonnement est mensuel, sans engagement.',
      },
      {
        q: 'Comment résilier mon abonnement Pro ?',
        a: 'Depuis "Paramètres", cliquez sur "Gérer mon abonnement". Vous pouvez résilier à tout moment. Votre accès Pro reste actif jusqu\'à la fin de la période payée. Vos données sont conservées et vous repassez automatiquement au plan Gratuit.',
      },
      {
        q: 'Puis-je exporter mes données ?',
        a: 'Vos quittances et documents sont téléchargeables en PDF à tout moment. L\'export complet de vos données est prévu dans une prochaine mise à jour.',
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-stone-200/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-slate-900">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-stone-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-stone-500">{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="Aide & FAQ"
        description="Retrouvez les réponses aux questions les plus fréquentes."
      />

      <div className="mt-8 grid gap-6">
        {categories.map((cat) => (
          <div key={cat.title} className="bg-white rounded-2xl border border-stone-200/60 shadow-xs overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-200/60 bg-stone-50/50">
              <HelpCircle className="h-5 w-5 text-accent" />
              <h2 className="text-base font-semibold text-slate-900">{cat.title}</h2>
            </div>
            <div className="px-6">
              {cat.faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
