'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      toast.success('Connexion réussie !');
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Login error:', err);
      setError(`Erreur : ${message}`);
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

        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-text-primary">Connexion</h1>
          <p className="text-sm text-text-secondary mt-1">
            Accédez à votre espace de gestion
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              autoComplete="current-password"
              className="rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light hover:scale-[1.02] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Se connecter
          </button>
        </form>

        {/* Lien inscription */}
        <p className="text-sm text-text-secondary text-center mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-accent font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
