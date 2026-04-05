'use client'

import Link from 'next/link'
import {
  Home,
  Building2,
  Users,
  FileText,
  Wallet,
  BarChart3,
  Bell,
  Wrench,
  Shield,
  Smartphone,
  Check,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Gestion des biens',
    description: 'Centralisez tous vos biens immobiliers avec leurs caractéristiques, photos et documents.',
  },
  {
    icon: Users,
    title: 'Suivi des locataires',
    description: 'Gérez vos locataires, leurs documents et leur historique de paiements en un seul endroit.',
  },
  {
    icon: FileText,
    title: 'Baux & signature',
    description: 'Créez vos baux à partir de modèles et envoyez-les en signature électronique.',
  },
  {
    icon: Wallet,
    title: 'Finances & quittances',
    description: 'Suivez les loyers, détectez les impayés et envoyez les quittances en un clic.',
  },
  {
    icon: BarChart3,
    title: 'Analytique avancée',
    description: 'Tableaux de bord, graphiques de rentabilité et suivi de votre cashflow en temps réel.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Soyez alerté des paiements reçus, impayés, échéances de baux et révisions IRL.',
  },
  {
    icon: Wrench,
    title: 'Travaux & maintenance',
    description: 'Suivez les demandes d\'intervention et leur résolution pour chaque bien.',
  },
  {
    icon: Smartphone,
    title: 'App mobile (PWA)',
    description: 'Installez Loovia sur votre téléphone et gérez vos biens où que vous soyez.',
  },
]

const pricingPlans = [
  {
    name: 'Gratuit',
    price: '0',
    description: 'Pour démarrer et découvrir Loovia',
    features: [
      'Jusqu\'a 2 biens',
      'Gestion des locataires',
      'Suivi des paiements',
      'Quittances de loyer',
      'Notifications in-app',
      'Application mobile (PWA)',
    ],
    cta: 'Commencer gratuitement',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '9,90',
    description: 'Pour les propriétaires exigeants',
    features: [
      'Biens illimités',
      'Tout le plan Gratuit',
      'Analytique avancée',
      'Révision IRL automatique',
      'Signature électronique',
      'Sans publicité',
      'Support prioritaire',
    ],
    cta: 'Essayer Pro',
    href: '/register',
    highlighted: true,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-terracotta" />
            <span className="text-xl font-bold text-terracotta">Loovia</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="#fonctionnalites"
              className="hidden sm:inline text-sm text-stone-500 hover:text-slate-900 transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#tarifs"
              className="hidden sm:inline text-sm text-stone-500 hover:text-slate-900 transition-colors"
            >
              Tarifs
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-900 hover:text-terracotta transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta text-white text-sm font-medium hover:bg-terracotta-dark transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-terracotta/5 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-medium mb-6">
            <Shield className="h-3.5 w-3.5" />
            Gestion locative simplifiée
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto">
            Gérez vos biens locatifs{' '}
            <span className="text-terracotta">en toute sérénité</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Loovia centralise la gestion de vos biens, locataires, baux, loyers
            et finances dans une seule application moderne et intuitive.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-terracotta text-white font-medium hover:bg-terracotta-dark hover:scale-[1.02] hover:shadow-md transition-all"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#fonctionnalites"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-200 bg-white text-slate-900 font-medium hover:bg-stone-50 transition-colors"
            >
              Découvrir les fonctionnalités
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats sociales */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">100%</p>
              <p className="text-sm text-stone-500 mt-1">Gratuit pour démarrer</p>
            </div>
            <div className="h-8 w-px bg-stone-200 hidden sm:block" />
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">2 min</p>
              <p className="text-sm text-stone-500 mt-1">Pour créer un compte</p>
            </div>
            <div className="h-8 w-px bg-stone-200 hidden sm:block" />
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">0 %</p>
              <p className="text-sm text-stone-500 mt-1">De commission</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Fonctionnalités ─── */}
      <section id="fonctionnalites" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Tout ce qu&apos;il faut pour gérer vos locations
            </h2>
            <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto">
              Des outils puissants et simples pour les propriétaires bailleurs,
              du premier bien au portefeuille complet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl border border-stone-200/50 p-6 hover:shadow-md hover:border-terracotta/20 transition-all group"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-terracotta/10 text-terracotta mb-4 group-hover:bg-terracotta group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ─── */}
      <section className="py-20 sm:py-28 bg-white border-y border-stone-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Simple comme 1, 2, 3
            </h2>
            <p className="mt-4 text-lg text-stone-500">
              Commencez à gérer vos biens en quelques minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: '1',
                title: 'Créez votre compte',
                description: 'Inscription gratuite en 2 minutes, sans carte bancaire.',
              },
              {
                step: '2',
                title: 'Ajoutez vos biens',
                description: 'Renseignez vos biens, locataires et baux existants.',
              },
              {
                step: '3',
                title: 'Gérez tout depuis Loovia',
                description: 'Suivez vos loyers, envoyez vos quittances et pilotez votre patrimoine.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-terracotta text-white text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─── */}
      <section id="tarifs" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Tarifs simples et transparents
            </h2>
            <p className="mt-4 text-lg text-stone-500">
              Commencez gratuitement. Passez Pro quand vous en avez besoin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'rounded-2xl p-8 flex flex-col',
                  plan.highlighted
                    ? 'bg-slate-900 text-white ring-2 ring-terracotta shadow-xl'
                    : 'bg-white border border-stone-200/50',
                ].join(' ')}
              >
                <h3 className={[
                  'text-lg font-semibold',
                  plan.highlighted ? 'text-white' : 'text-slate-900',
                ].join(' ')}>
                  {plan.name}
                </h3>
                <p className={[
                  'text-sm mt-1',
                  plan.highlighted ? 'text-stone-300' : 'text-stone-500',
                ].join(' ')}>
                  {plan.description}
                </p>

                <div className="mt-6 mb-8">
                  <span className={[
                    'text-4xl font-bold',
                    plan.highlighted ? 'text-white' : 'text-slate-900',
                  ].join(' ')}>
                    {plan.price}&euro;
                  </span>
                  <span className={[
                    'text-sm ml-1',
                    plan.highlighted ? 'text-stone-400' : 'text-stone-500',
                  ].join(' ')}>
                    /mois
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className={[
                        'h-4 w-4 mt-0.5 shrink-0',
                        plan.highlighted ? 'text-terracotta-light' : 'text-terracotta',
                      ].join(' ')} />
                      <span className={plan.highlighted ? 'text-stone-200' : 'text-stone-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={[
                    'inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]',
                    plan.highlighted
                      ? 'bg-terracotta text-white hover:bg-terracotta-dark hover:shadow-md'
                      : 'border border-stone-200 text-slate-900 hover:bg-stone-50',
                  ].join(' ')}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section className="py-20 sm:py-28 bg-white border-t border-stone-200/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Prêt à simplifier votre gestion locative ?
          </h2>
          <p className="mt-4 text-lg text-stone-500">
            Rejoignez Loovia et reprenez le contrôle de votre patrimoine immobilier.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-xl bg-terracotta text-white font-medium text-lg hover:bg-terracotta-dark hover:scale-[1.02] hover:shadow-md transition-all"
          >
            Créer mon compte gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-stone-200/50 bg-off-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-terracotta" />
              <span className="text-lg font-bold text-terracotta">Loovia</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <Link href="/login" className="hover:text-slate-900 transition-colors">
                Connexion
              </Link>
              <Link href="/register" className="hover:text-slate-900 transition-colors">
                Inscription
              </Link>
              <Link href="#fonctionnalites" className="hover:text-slate-900 transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#tarifs" className="hover:text-slate-900 transition-colors">
                Tarifs
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-200/50 text-center text-xs text-stone-400">
            &copy; {new Date().getFullYear()} Loovia. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
