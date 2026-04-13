'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';

const FISCAL_REGIMES = [
  { value: 'lmnp_micro', label: 'LMNP — Micro-BIC', description: 'Location meublée non professionnelle, régime simplifié' },
  { value: 'lmnp_reel', label: 'LMNP — Régime réel', description: 'Location meublée avec déduction des charges réelles' },
  { value: 'lmp', label: 'LMP', description: 'Loueur Meublé Professionnel' },
  { value: 'nu_micro', label: 'Location nue — Micro-foncier', description: 'Abattement forfaitaire de 30%' },
  { value: 'nu_reel', label: 'Location nue — Régime réel', description: 'Déduction des charges réelles (revenus fonciers)' },
  { value: 'sci_ir', label: 'SCI à l\'IR', description: 'Société Civile Immobilière à l\'impôt sur le revenu' },
  { value: 'sci_is', label: 'SCI à l\'IS', description: 'Société Civile Immobilière à l\'impôt sur les sociétés' },
  { value: 'autre', label: 'Autre / Je ne sais pas', description: 'Vous pourrez préciser plus tard' },
];

export default function RegisterPage() {
  const [step, setStep] = useState<'info' | 'regime'>('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fiscalRegime, setFiscalRegime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  function handleNextStep(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStep('regime');
  }

  async function handleSubmit() {
    if (!fiscalRegime) {
      setError('Veuillez sélectionner un régime fiscal');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            fiscal_regime: fiscalRegime,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      toast.success('Compte créé ! Vérifiez votre email.');
      router.push('/login');
    } catch {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Gradient orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Retour au site */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au site
      </Link>

      {/* Carte */}
      <div className="glass-card rounded-2xl p-8 w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <Home className="h-6 w-6 text-accent" />
          <span className="text-2xl font-bold gradient-text font-[var(--font-syne)]">Loovia</span>
        </Link>

        {/* Étape indicateur */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-8 rounded-full transition-all ${step === 'info' ? 'bg-accent' : 'bg-accent/30'}`} />
          <div className={`h-2 w-8 rounded-full transition-all ${step === 'regime' ? 'bg-accent' : 'bg-accent/30'}`} />
        </div>

        {step === 'info' ? (
          <>
            {/* Titre */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-text-primary">Créer un compte</h1>
              <p className="text-sm text-text-secondary mt-1">
                Commencez à gérer vos biens en toute sérénité
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-6 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Formulaire identité */}
            <form onSubmit={handleNextStep} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Prénom</label>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    className="rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Nom</label>
                  <input
                    type="text"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    className="rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Email</label>
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
                <p className="text-xs text-text-muted">Minimum 8 caractères</p>
              </div>

              <button
                type="submit"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light hover:scale-[1.02] hover:shadow-md transition-all"
              >
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Lien connexion */}
            <p className="text-sm text-text-secondary text-center mt-6">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-accent font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </>
        ) : (
          <>
            {/* Titre étape 2 */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-text-primary">Votre régime fiscal</h1>
              <p className="text-sm text-text-secondary mt-1">
                Sélectionnez votre régime principal. Vous pourrez en ajouter d&apos;autres lors de l&apos;ajout de vos biens.
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Sélecteur de régime */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {FISCAL_REGIMES.map((regime) => (
                <button
                  key={regime.value}
                  type="button"
                  onClick={() => { setFiscalRegime(regime.value); setError(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    fiscalRegime === regime.value
                      ? 'bg-accent/10 border border-accent/30'
                      : 'bg-bg-elevated border border-border-light hover:border-accent/20'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    fiscalRegime === regime.value ? 'border-accent' : 'border-border-light'
                  }`}>
                    {fiscalRegime === regime.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${fiscalRegime === regime.value ? 'text-accent' : 'text-text-primary'}`}>
                      {regime.label}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{regime.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:border-accent/40 hover:text-text-primary transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light hover:scale-[1.02] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Créer mon compte
              </button>
            </div>

            {/* Lien connexion */}
            <p className="text-sm text-text-secondary text-center mt-6">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-accent font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
