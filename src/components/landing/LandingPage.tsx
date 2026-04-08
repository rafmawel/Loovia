'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Star,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { useInView, useCountUp } from './hooks'
import { MockupDashboard } from './MockupDashboard'
import {
  IlluBuilding, IlluTenant, IlluContract, IlluWallet,
  IlluChart, IlluBell, IlluWrench, IlluMobile,
} from './illustrations'

// ── Data ──

const features = [
  { Illu: IlluBuilding, title: 'Gestion des biens', description: 'Centralisez tous vos biens avec leurs caractéristiques, loyers, charges et documents associés.' },
  { Illu: IlluTenant, title: 'Suivi des locataires', description: 'Fiches locataires complètes : contacts, documents, historique des paiements et communications.' },
  { Illu: IlluContract, title: 'Baux & signature', description: 'Créez vos baux depuis des modèles et envoyez-les en signature électronique en un clic.' },
  { Illu: IlluWallet, title: 'Finances & quittances', description: 'Suivi des loyers, détection des impayés, envoi de quittances et synchronisation bancaire.' },
  { Illu: IlluChart, title: 'Analytique avancée', description: 'Graphiques de rentabilité, cashflow, taux d\'occupation et répartition des charges.' },
  { Illu: IlluBell, title: 'Notifications', description: 'Alertes automatiques : paiements reçus, impayés, échéances de baux, révisions IRL.' },
  { Illu: IlluWrench, title: 'Travaux & maintenance', description: 'Suivez les demandes d\'intervention, leur priorité et leur résolution pour chaque bien.' },
  { Illu: IlluMobile, title: 'App mobile (PWA)', description: 'Installez Loovia sur votre téléphone et gérez vos biens où que vous soyez, même hors-ligne.' },
]

const steps = [
  { number: '01', title: 'Créez votre compte', description: 'Inscription gratuite en 2 minutes, sans engagement ni carte bancaire.' },
  { number: '02', title: 'Ajoutez vos biens & locataires', description: 'Renseignez vos biens immobiliers, ajoutez vos locataires et créez vos baux.' },
  { number: '03', title: 'Pilotez votre patrimoine', description: 'Suivez vos loyers, envoyez vos quittances, analysez votre rentabilité.' },
]

const testimonials = [
  { name: 'Marie L.', location: 'Paris — 3 biens', text: 'Loovia a complètement changé ma façon de gérer mes locations. Tout est centralisé, clair et rapide.', rating: 5 },
  { name: 'Thomas B.', location: 'Lyon — 5 biens', text: 'Enfin un outil simple et moderne. Les quittances automatiques et le suivi des paiements me font gagner un temps fou.', rating: 5 },
  { name: 'Sophie M.', location: 'Bordeaux — 2 biens', text: 'Le tableau de bord analytique est incroyable. Je vois en un coup d\'œil la rentabilité de chaque bien.', rating: 5 },
]

const plans = [
  {
    name: 'Gratuit', price: '0', period: 'pour toujours', description: 'Idéal pour démarrer',
    features: ['Jusqu\'à 2 biens', 'Gestion des locataires', 'Suivi des paiements', 'Quittances de loyer', 'Notifications in-app', 'Application mobile (PWA)'],
    cta: 'Commencer gratuitement', href: '/register', highlighted: false,
  },
  {
    name: 'Pro', price: '9,90', period: '/mois', description: 'Pour les propriétaires exigeants',
    features: ['Biens illimités', 'Tout le plan Gratuit', 'Analytique avancée', 'Révision IRL automatique', 'Signature électronique', 'Sans publicité', 'Support prioritaire'],
    cta: 'Passer à Pro', href: '/register', highlighted: true,
  },
]

// ── Animated Stat ──

function AnimatedStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const { ref, inView } = useInView()
  const count = useCountUp(value, inView)
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tabular-nums">
        {inView ? count : 0}{suffix}
      </p>
      <p className="text-sm text-accent font-mono uppercase tracking-wider mt-2">{label}</p>
    </div>
  )
}

// ── Logo with orange "oo" ──

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' }
  return (
    <span className={`${sizes[size]} font-extrabold tracking-tight`}>
      <span className="text-text-primary">L</span>
      <span className="text-accent">oo</span>
      <span className="text-text-primary">via</span>
    </span>
  )
}

// ── Section Label ──

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-6">
      <span className="text-xs font-medium tracking-wider uppercase font-mono text-accent">
        &mdash; {children}
      </span>
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

  const featSection = useInView(0.1)
  const stepsSection = useInView(0.1)
  const mockupSection = useInView(0.1)
  const testSection = useInView(0.1)
  const pricingSection = useInView(0.1)
  const ctaSection = useInView(0.1)

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-dark/90 backdrop-blur-xl border-b border-ui-border shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="#fonctionnalites" className="hidden md:inline text-sm text-text-secondary hover:text-text-primary transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#tarifs" className="hidden md:inline text-sm text-text-secondary hover:text-text-primary transition-colors">
              Tarifs
            </Link>
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <div className="absolute top-20 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[100px]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <div>
              <SectionLabel>Gestion locative nouvelle génération</SectionLabel>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mt-2">
                Gérez vos biens.{' '}
                <span className="text-accent">Loovia</span>{' '}
                s&apos;occupe du reste.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-lg">
                Loyers automatisés, quittances en un clic, suivi financier complet.
                Pour les propriétaires qui ont mieux à faire.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover hover:scale-[1.02] transition-all shadow-lg shadow-accent/20">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#fonctionnalites" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border-2 border-ui-border text-text-secondary font-semibold hover:border-accent hover:text-accent transition-all">
                  Voir les fonctionnalités
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> SSL &amp; RGPD</span>
                <span className="h-3 w-px bg-ui-border" />
                <span>Gratuit pour démarrer</span>
                <span className="h-3 w-px bg-ui-border" />
                <span>Prêt en 2 min</span>
              </div>
            </div>

            {/* Right — Mockup */}
            <div className="relative hidden lg:block">
              <div className="animate-float">
                <MockupDashboard />
              </div>
              <div className="absolute -bottom-6 -left-8 w-24 h-24 rounded-2xl bg-accent/10 border border-accent/20 animate-float-delay" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF STATS ═══════════ */}
      <section className="py-16 sm:py-20 bg-bg-mid border-y border-ui-border relative bg-noise">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
            <AnimatedStat value={12000} suffix="+" label="Propriétaires" />
            <AnimatedStat value={98} suffix="%" label="Satisfaits" />
            <AnimatedStat value={3} suffix=" min" label="Pour démarrer" />
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="fonctionnalites" ref={featSection.ref} className="landing-section bg-bg-light relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`max-w-2xl ${featSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <SectionLabel>Ce que Loovia fait pour vous</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-dark leading-tight tracking-tight">
              Tout ce dont un bailleur a besoin.{' '}
              <span className="text-text-muted">Rien de plus.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {features.map((f, i) => {
              const Illu = f.Illu
              return (
                <div
                  key={f.title}
                  className={`group bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 border-t-[3px] border-t-transparent hover:border-t-accent ${
                    featSection.inView ? `animate-fade-up delay-${(i % 4 + 1) * 100}` : 'opacity-0'
                  }`}
                >
                  <Illu className="h-16 w-16 mb-4" />
                  <h3 className="text-base font-bold text-text-dark mb-2">{f.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ COMMENT CA MARCHE ═══════════ */}
      <section id="comment-ca-marche" ref={stepsSection.ref} className="landing-section bg-bg-dark relative">
        <div className="absolute inset-0 bg-dot-grid opacity-20" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className={`max-w-2xl ${stepsSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <SectionLabel>Simple comme bonjour</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Commencez en{' '}
              <span className="text-accent">3 étapes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            {steps.map((s, i) => (
              <div
                key={s.number}
                className={`relative ${stepsSection.inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'}`}
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-accent/40 to-transparent z-0" />
                )}
                <div className="relative z-10 bg-ui-card rounded-2xl border border-ui-border p-8 hover:border-accent/40 transition-colors">
                  <span className="text-5xl font-extrabold text-accent/20">{s.number}</span>
                  <h3 className="text-xl font-bold mt-4 mb-3">{s.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MOCKUP PRODUIT ═══════════ */}
      <section ref={mockupSection.ref} className="landing-section bg-bg-mid border-y border-ui-border relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-10" />
        <div className={`max-w-5xl mx-auto px-4 sm:px-6 relative z-10 ${mockupSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <SectionLabel>Aperçu du produit</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Un tableau de bord{' '}
              <span className="text-accent">clair et puissant</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Toutes vos données de gestion locative en un coup d&apos;œil.
              Revenus, locataires, paiements, alertes — tout est là.
            </p>
          </div>
          <div className="flex justify-center">
            <MockupDashboard className="w-full max-w-3xl animate-pulse-glow" />
          </div>
        </div>
      </section>

      {/* ═══════════ TEMOIGNAGES ═══════════ */}
      <section id="temoignages" ref={testSection.ref} className="landing-section bg-bg-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`max-w-2xl ${testSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <SectionLabel>Ils nous font confiance</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-dark leading-tight tracking-tight">
              Propriétaires satisfaits.{' '}
              <span className="text-text-muted">Vraiment.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`bg-white rounded-2xl border border-stone-200 p-7 hover:shadow-lg transition-all relative ${
                  testSection.inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'
                }`}
              >
                <span className="absolute top-5 right-6 text-5xl text-accent/10 font-serif leading-none">&ldquo;</span>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-text-muted leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent/10 text-accent font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-dark">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TARIFS ═══════════ */}
      <section id="tarifs" ref={pricingSection.ref} className="landing-section bg-bg-dark relative">
        <div className="absolute inset-0 bg-dot-grid opacity-20" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-16 ${pricingSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <SectionLabel>Tarifs</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simple et <span className="text-accent">transparent</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Commencez gratuitement. Passez Pro quand vous en avez besoin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative overflow-hidden transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-ui-card border-2 border-accent shadow-2xl shadow-accent/10 scale-[1.02]'
                    : 'bg-ui-card border border-ui-border hover:border-accent/30'
                } ${pricingSection.inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'}`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    Populaire
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{plan.description}</p>

                <div className="mt-8 mb-8">
                  <span className="text-5xl font-extrabold">{plan.price}&euro;</span>
                  <span className="text-sm text-text-muted ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-3.5 mb-10 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                      <span className="text-text-secondary">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg font-semibold transition-all hover:scale-[1.02] ${
                    plan.highlighted
                      ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20'
                      : 'border-2 border-ui-border text-text-primary hover:border-accent hover:text-accent'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section ref={ctaSection.ref} className="landing-section bg-bg-mid border-t border-ui-border relative overflow-hidden bg-noise">
        <div className="absolute inset-0 bg-dot-grid opacity-10" />
        <div className={`max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10 ${ctaSection.inView ? 'animate-fade-up' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Prêt à simplifier votre{' '}
            <span className="text-accent">gestion locative</span> ?
          </h2>
          <p className="mt-6 text-lg text-text-secondary max-w-xl mx-auto">
            Rejoignez les propriétaires qui ont choisi Loovia pour piloter leur patrimoine immobilier.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-lg bg-accent text-white font-semibold text-lg hover:bg-accent-hover hover:scale-[1.03] shadow-xl shadow-accent/20 transition-all"
          >
            Créer mon compte gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-6 text-sm text-text-muted">
            Gratuit pour toujours &middot; Sans engagement &middot; Prêt en 2 minutes
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[#0A0C14] border-t border-ui-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div className="sm:col-span-2 md:col-span-1">
              <Logo size="sm" />
              <p className="text-sm text-text-muted leading-relaxed mt-4">
                La plateforme de gestion locative moderne pour les propriétaires bailleurs.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Produit</h4>
              <ul className="space-y-2.5">
                <li><Link href="#fonctionnalites" className="text-sm text-text-muted hover:text-text-primary transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#tarifs" className="text-sm text-text-muted hover:text-text-primary transition-colors">Tarifs</Link></li>
                <li><Link href="#temoignages" className="text-sm text-text-muted hover:text-text-primary transition-colors">Témoignages</Link></li>
                <li><Link href="#comment-ca-marche" className="text-sm text-text-muted hover:text-text-primary transition-colors">Comment ça marche</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Compte</h4>
              <ul className="space-y-2.5">
                <li><Link href="/register" className="text-sm text-text-muted hover:text-text-primary transition-colors">Créer un compte</Link></li>
                <li><Link href="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors">Se connecter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Sécurité</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-text-muted"><Shield className="h-3.5 w-3.5 text-accent" /> Chiffrement SSL</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><Shield className="h-3.5 w-3.5 text-accent" /> Conforme RGPD</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><Shield className="h-3.5 w-3.5 text-accent" /> Hébergé en Europe</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-ui-border text-center text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Loovia. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
