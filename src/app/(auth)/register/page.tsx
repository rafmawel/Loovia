'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

/**
 * Page d'inscription — Loovia
 *
 * Permet à l'utilisateur de créer un compte avec son prénom, nom,
 * email et mot de passe via Supabase Auth. Redirige vers la page
 * de connexion après inscription réussie.
 */
export default function RegisterPage() {
  // --- État du formulaire ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // --- Soumission du formulaire ---
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Inscription réussie — notification et redirection vers la connexion
      toast.success('Compte créé ! Vérifiez votre email.');
      router.push('/login');
    } catch {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-off-white min-h-screen flex items-center justify-center px-4">
      {/* Carte d'inscription */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Home className="h-6 w-6 text-terracotta" />
          <span className="text-2xl font-bold text-terracotta">Loovia</span>
        </div>

        {/* Titre et sous-titre */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-slate-900">Créer un compte</h1>
          <p className="text-sm text-stone-500 mt-1">
            Commencez à gérer vos biens en toute sérénité
          </p>
        </div>

        {/* Alerte d'erreur */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Formulaire d'inscription */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Prénom"
            type="text"
            placeholder="Jean"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />

          <Input
            label="Nom"
            type="text"
            placeholder="Dupont"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />

          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            Créer mon compte
          </Button>
        </form>

        {/* Lien vers la connexion */}
        <p className="text-sm text-stone-500 text-center mt-6">
          Déjà un compte ?{' '}
          <Link
            href="/login"
            className="text-terracotta font-medium hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
