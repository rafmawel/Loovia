'use client'

import { useEffect, useRef, useState } from 'react'
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
  Smartphone,
  Check,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Clock,
  ChevronRight,
} from 'lucide-react'

// ── Intersection Observer hook pour animations au scroll ──
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

// ── Animated counter ──
function AnimatedStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const { ref, inView } = useInView()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setCount(value); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-terracotta tabular-nums">
        {inView ? count : 0}{suffix}
      </p>
      <p className="text-sm sm:text-base text-stone-500 mt-2">{label}</p>
    </div>
  )
}

// ── Data ──

const features = [
  { icon: Building2, title: 'Gestion des biens', description: 'Centralisez tous vos biens avec leurs caractéristiques, loyers, charges et documents associés.' },
  { icon: Users, title: 'Suivi des locataires', description: 'Fiches locataires complètes : contacts, documents, historique des paiements et communications.' },
  { icon: FileText, title: 'Baux & signature', description: 'Créez vos baux depuis des modèles et envoyez-les en signature électronique en un clic.' },
  { icon: Wallet, title: 'Finances & quittances', description: 'Suivi des loyers, détection des impayés, envoi de quittances et synchronisation bancaire.' },
  { icon: BarChart3, title: 'Analytique avancée', description: 'Graphiques de rentabilité, cashflow, taux d\'occupation et répartition des charges.' },
  { icon: Bell, title: 'Notifications', description: 'Alertes automatiques : paiements reçus, impayés, échéances de baux, révisions IRL.' },
  { icon: Wrench, title: 'Travaux & maintenance', description: 'Suivez les demandes d\'intervention, leur priorité et leur résolution pour chaque bien.' },
  { icon: Smartphone, title: 'App mobile (PWA)', description: 'Installez Loovia sur votre téléphone et gérez vos biens où que vous soyez, même hors-ligne.' },
]

const steps = [
  { number: '01', title: 'Créez votre compte', description: 'Inscription gratuite en 2 minutes, sans engagement ni carte bancaire. Votre espace est prêt immédiatement.', visual: 'register' },
  { number: '02', title: 'Ajoutez vos biens & locataires', description: 'Renseignez vos biens immobiliers, ajoutez vos locataires et créez vos baux. Tout est centralisé.', visual: 'properties' },
  { number: '03', title: 'Pilotez votre patrimoine', description: 'Suivez vos loyers, envoyez vos quittances, analysez votre rentabilité. Loovia s\'occupe du reste.', visual: 'dashboard' },
]

const testimonials = [
  { name: 'Marie L.', location: 'Paris', text: 'Loovia a complètement changé ma façon de gérer mes locations. Tout est centralisé, clair et rapide. Je ne reviendrais en arrière pour rien au monde.', rating: 5 },
  { name: 'Thomas B.', location: 'Lyon', text: 'Enfin un outil simple et moderne pour les propriétaires bailleurs. Les quittances automatiques et le suivi des paiements me font gagner un temps fou.', rating: 5 },
  { name: 'Sophie M.', location: 'Bordeaux', text: 'Le tableau de bord analytique est incroyable. Je vois en un coup d\'œil la rentabilité de chaque bien. Et le tout gratuitement pour commencer !', rating: 5 },
]

const pricingPlans = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'pour toujours',
    description: 'Idéal pour démarrer',
    features: ['Jusqu\'à 2 biens', 'Gestion des locataires', 'Suivi des paiements', 'Quittances de loyer', 'Notifications in-app', 'Application mobile (PWA)'],
    cta: 'Commencer gratuitement',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '9,90',
    period: '/mois',
    description: 'Pour les propriétaires exigeants',
    features: ['Biens illimités', 'Tout le plan Gratuit', 'Analytique avancée', 'Révision IRL automatique', 'Signature électronique', 'Sans publicité', 'Support prioritaire'],
    cta: 'Passer à Pro',
    href: '/register',
    highlighted: true,
  },
]

// ── Mock screenshots (gradient placeholders) ──
function MockScreen({ type, className = '' }: { type: string; className?: string }) {
  const screens: Record<string, { title: string; items: string[] }> = {
    dashboard: {
      title: 'Tableau de bord',
      items: ['4 biens', '6 locataires', '3 850 € / mois', '92% occupation'],
    },
    properties: {
      title: 'Mes Biens',
      items: ['Appartement T3 — Lyon 6e', 'Studio meublé — Paris 11e', 'Maison — Bordeaux'],
    },
    register: {
      title: 'Créer un compte',
      items: ['Prénom', 'Email', 'Mot de passe', 'Commencer →'],
    },
    analytics: {
      title: 'Analytique',
      items: ['Revenus : 46 200 €', 'Charges : 12 100 €', 'Rentabilité : 7,2%', 'Cashflow : +2 840 €'],
    },
    finances: {
      title: 'Finances',
      items: ['Loyer reçu — T3 Lyon', 'Quittance envoyée', 'Impayé détecté — Studio Paris'],
    },
  }
  const screen = screens[type] || screens.dashboard

  return (
    <div className={`bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden ${className}`}>
      {/* Title bar */}
      <div className="bg-gradient-to-r from-terracotta to-terracotta-dark px-5 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        </div>
        <span className="text-xs font-medium text-white/90 ml-2">{screen.title}</span>
      </div>
      {/* Content */}
      <div className="p-5 space-y-3">
        {screen.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <div className="h-3 w-3 rounded-sm bg-terracotta/40" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-700 font-medium">{item}</div>
              <div className="h-1.5 w-2/3 bg-stone-100 rounded-full mt-1.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ──

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Section refs for animations
  const heroSection = useInView(0.1)
  const statsSection = useInView()
  const featuresSection = useInView(0.1)
  const stepsSection = useInView(0.1)
  const testimonialsSection = useInView()
  const pricingSection = useInView(0.1)
  const ctaSection = useInView()

  return (
    <div className="min-h-screen bg-off-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-stone-200/50 py-3'
          : 'bg-transparent py-5',
      ].join(' ')}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-terracotta" />
            <span className="text-xl font-bold text-terracotta">Loovia</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#fonctionnalites" className="text-sm text-stone-500 hover:text-slate-900 transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#comment-ca-marche" className="text-sm text-stone-500 hover:text-slate-900 transition-colors">
              Comment ça marche
            </Link>
            <Link href="#temoignages" className="text-sm text-stone-500 hover:text-slate-900 transition-colors">
              Témoignages
            </Link>
            <Link href="#tarifs" className="text-sm text-stone-500 hover:text-slate-900 transition-colors">
              Tarifs
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-900 hover:text-terracotta transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-terracotta text-white text-sm font-medium hover:bg-terracotta-dark hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroSection.ref} className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-terracotta/8 to-terracotta-light/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-terracotta/5 to-transparent blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className={heroSection.inView ? 'animate-fade-up' : 'opacity-0'}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold mb-8 border border-terracotta/20">
                <Zap className="h-3.5 w-3.5" />
                Gestion locative nouvelle génération
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.1] tracking-tight">
                Gérez vos biens locatifs{' '}
                <span className="relative inline-block">
                  <span className="text-terracotta">en toute sérénité</span>
                  <span className="absolute -bottom-1 left-0 w-full h-2 bg-terracotta/15 rounded-full animate-underline-draw" />
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-stone-500 leading-relaxed max-w-lg">
                Loovia centralise la gestion de vos biens, locataires, baux, loyers et finances
                dans une application moderne, intuitive et{' '}
                <strong className="text-slate-700">100% gratuite pour démarrer</strong>.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-terracotta text-white font-semibold text-base hover:bg-terracotta-dark hover:scale-[1.02] hover:shadow-xl transition-all"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  href="#comment-ca-marche"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-stone-200 bg-white text-slate-900 font-medium hover:bg-stone-50 hover:border-stone-300 transition-all"
                >
                  Voir la démo
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 text-xs text-stone-400">
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Données sécurisées</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Prêt en 2 min</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Sans engagement</span>
              </div>
            </div>

            {/* Right: Screenshots */}
            <div className={`relative ${heroSection.inView ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
              <MockScreen type="dashboard" className="animate-float relative z-10" />
              <MockScreen type="analytics" className="absolute -bottom-8 -left-8 w-56 sm:w-64 animate-float-delay z-20 scale-90" />
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-terracotta/10 rounded-2xl -z-10 rotate-12" />
              <div className="absolute -bottom-4 right-12 w-16 h-16 bg-terracotta-light/20 rounded-xl -z-10 -rotate-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section ref={statsSection.ref} className="py-16 sm:py-20 bg-white border-y border-stone-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${statsSection.inView ? '' : 'opacity-0'}`}>
            <AnimatedStat value={100} suffix="%" label="Gratuit pour démarrer" />
            <AnimatedStat value={2} suffix=" min" label="Pour créer un compte" />
            <AnimatedStat value={0} suffix=" €" label="De commission" />
            <AnimatedStat value={24} suffix="h/24" label="Accès à vos données" />
          </div>
        </div>
      </section>

      {/* ─── Fonctionnalités ─── */}
      <section id="fonctionnalites" ref={featuresSection.ref} className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-16 ${featuresSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="text-terracotta text-sm font-semibold tracking-wide uppercase">Fonctionnalités</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Tout ce qu&apos;il faut pour gérer vos locations
            </h2>
            <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto">
              Des outils puissants et simples, pensés pour les propriétaires bailleurs
              qui veulent reprendre le contrôle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={[
                    'bg-white rounded-2xl border border-stone-200/50 p-6 hover:shadow-lg hover:border-terracotta/30 hover:-translate-y-1 transition-all duration-300 group',
                    featuresSection.inView ? `animate-fade-up delay-${(i % 4 + 1) * 100}` : 'opacity-0',
                  ].join(' ')}
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-terracotta/10 text-terracotta mb-5 group-hover:bg-terracotta group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-5.5 w-5.5" />
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
      <section id="comment-ca-marche" ref={stepsSection.ref} className="py-20 sm:py-28 bg-white border-y border-stone-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-20 ${stepsSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="text-terracotta text-sm font-semibold tracking-wide uppercase">Comment ça marche</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Démarrez en 3 étapes simples
            </h2>
            <p className="mt-4 text-lg text-stone-500">
              Pas de configuration compliquée. Vous êtes opérationnel en quelques minutes.
            </p>
          </div>

          <div className="space-y-24 sm:space-y-32">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={[
                  'grid md:grid-cols-2 gap-12 items-center',
                  stepsSection.inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0',
                ].join(' ')}
              >
                {/* Text side */}
                <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                  <span className="text-5xl sm:text-6xl font-bold text-terracotta/15">{step.number}</span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{step.title}</h3>
                  <p className="mt-4 text-base text-stone-500 leading-relaxed max-w-md">{step.description}</p>
                  {i === 0 && (
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 mt-6 text-terracotta font-semibold hover:text-terracotta-dark transition-colors"
                    >
                      Créer mon compte <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                {/* Visual side */}
                <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <MockScreen type={step.visual} className="hover:shadow-2xl transition-shadow duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Témoignages ─── */}
      <section id="temoignages" ref={testimonialsSection.ref} className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-16 ${testimonialsSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="text-terracotta text-sm font-semibold tracking-wide uppercase">Témoignages</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Ce que disent nos utilisateurs
            </h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-stone-500 ml-2 font-medium">4.8/5 — Plus de 1 000 utilisateurs satisfaits</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={[
                  'bg-white rounded-2xl border border-stone-200/50 p-8 hover:shadow-lg transition-all duration-300 relative',
                  testimonialsSection.inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0',
                ].join(' ')}
              >
                {/* Quote mark */}
                <span className="absolute top-5 right-6 text-5xl text-terracotta/10 font-serif leading-none">&ldquo;</span>
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-stone-600 leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-terracotta/10 text-terracotta font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─── */}
      <section id="tarifs" ref={pricingSection.ref} className="py-20 sm:py-28 bg-white border-y border-stone-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-16 ${pricingSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="text-terracotta text-sm font-semibold tracking-wide uppercase">Tarifs</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Simple et transparent
            </h2>
            <p className="mt-4 text-lg text-stone-500">
              Commencez gratuitement. Passez Pro quand vous en avez besoin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={plan.name}
                className={[
                  'rounded-2xl p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl',
                  plan.highlighted
                    ? 'bg-slate-900 text-white ring-2 ring-terracotta shadow-2xl scale-[1.02]'
                    : 'bg-white border border-stone-200/80 hover:border-terracotta/30',
                  pricingSection.inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0',
                ].join(' ')}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-terracotta text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    Populaire
                  </div>
                )}
                <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.highlighted ? 'text-stone-400' : 'text-stone-500'}`}>
                  {plan.description}
                </p>

                <div className="mt-8 mb-8">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}&euro;
                  </span>
                  <span className={`text-sm ml-1 ${plan.highlighted ? 'text-stone-400' : 'text-stone-500'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3.5 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${plan.highlighted ? 'text-terracotta-light' : 'text-terracotta'}`} />
                      <span className={plan.highlighted ? 'text-stone-300' : 'text-stone-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={[
                    'inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02]',
                    plan.highlighted
                      ? 'bg-terracotta text-white hover:bg-terracotta-dark hover:shadow-lg'
                      : 'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white',
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
      <section ref={ctaSection.ref} className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta/5 via-transparent to-terracotta-light/5 animate-gradient" />
        <div className={`max-w-3xl mx-auto px-4 sm:px-6 text-center relative ${ctaSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Prêt à simplifier votre gestion locative ?
          </h2>
          <p className="mt-6 text-lg text-stone-500 max-w-xl mx-auto">
            Rejoignez les propriétaires qui ont choisi Loovia pour piloter leur patrimoine immobilier en toute simplicité.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-xl bg-terracotta text-white font-semibold text-lg hover:bg-terracotta-dark hover:scale-[1.03] hover:shadow-xl transition-all"
          >
            Créer mon compte gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-6 text-sm text-stone-400">
            Gratuit pour toujours &middot; Sans engagement &middot; Prêt en 2 minutes
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-5 w-5 text-terracotta" />
                <span className="text-lg font-bold text-white">Loovia</span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">
                La plateforme de gestion locative moderne pour les propriétaires bailleurs.
              </p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2.5">
                <li><Link href="#fonctionnalites" className="text-sm text-stone-400 hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#tarifs" className="text-sm text-stone-400 hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="#temoignages" className="text-sm text-stone-400 hover:text-white transition-colors">Témoignages</Link></li>
                <li><Link href="#comment-ca-marche" className="text-sm text-stone-400 hover:text-white transition-colors">Comment ça marche</Link></li>
              </ul>
            </div>

            {/* Compte */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Compte</h4>
              <ul className="space-y-2.5">
                <li><Link href="/register" className="text-sm text-stone-400 hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link href="/login" className="text-sm text-stone-400 hover:text-white transition-colors">Se connecter</Link></li>
              </ul>
            </div>

            {/* Sécurité */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Sécurité</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-stone-400">
                  <Shield className="h-3.5 w-3.5 text-terracotta" /> Chiffrement SSL
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-400">
                  <Shield className="h-3.5 w-3.5 text-terracotta" /> Conforme RGPD
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-400">
                  <Shield className="h-3.5 w-3.5 text-terracotta" /> Hébergé en Europe
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-stone-500">
            &copy; {new Date().getFullYear()} Loovia. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
