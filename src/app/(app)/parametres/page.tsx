'use client';

// Page Paramètres — profil utilisateur et intégrations
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Settings, User, Plug, LogOut, Save, Crown, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Subscription } from '@/types';

export default function ParametresPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Chargement des données utilisateur
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setFirstName(user.user_metadata?.first_name || '');
        setLastName(user.user_metadata?.last_name || '');

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setSubscription(sub as Subscription | null);
      }
      setInitialLoading(false);
    }
    loadUser();
  }, [supabase]);

  // Sauvegarde du profil
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { first_name: firstName, last_name: lastName },
      });

      if (error) throw error;
      toast.success('Profil mis à jour avec succès');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  }

  // Upgrade vers Pro
  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à niveau');
      setUpgrading(false);
    }
  }

  // Gérer l'abonnement via Stripe Portal
  async function handleManageSubscription() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  }

  // Déconnexion
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (initialLoading) {
    return (
      <div>
        <PageHeader title="Paramètres" description="Gérez votre compte et vos intégrations" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-terracotta" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Paramètres" description="Gérez votre compte et vos intégrations" />

      <div className="max-w-2xl space-y-6">
        {/* Profil */}
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-terracotta" />
            Mon profil
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
              />
              <Input
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={email}
              disabled
              helperText="L'email ne peut pas être modifié ici."
            />
            <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
              Sauvegarder
            </Button>
          </form>
        </Card>

        {/* Abonnement */}
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-terracotta" />
            Abonnement
          </h2>

          {subscription?.plan === 'pro' && subscription?.status === 'active' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-terracotta/10 to-amber-50 border border-terracotta/20">
                <Sparkles className="h-5 w-5 text-terracotta shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Plan Pro</p>
                  <p className="text-xs text-stone-500">
                    {subscription.cancel_at_period_end
                      ? `Actif jusqu'au ${new Date(subscription.current_period_end!).toLocaleDateString('fr-FR')}`
                      : `Prochain renouvellement le ${new Date(subscription.current_period_end!).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleManageSubscription}>
                Gérer mon abonnement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Plan Gratuit</p>
                  <p className="text-xs text-stone-500">Fonctionnalités limitées avec publicités</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-terracotta/30 bg-gradient-to-r from-terracotta/5 to-amber-50">
                <p className="text-sm font-bold text-slate-900 mb-3">Passez au Pro</p>
                <ul className="space-y-2 mb-4">
                  {[
                    'Aucune publicité',
                    'Tableau de bord analytique',
                    'Révision IRL automatique',
                    'Export fiscal avancé',
                    'Photos illimitées',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-stone-600">
                      <Check className="h-3.5 w-3.5 text-terracotta shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Crown className="h-4 w-4" />}
                  onClick={handleUpgrade}
                  loading={upgrading}
                >
                  Passer au Pro
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Intégrations */}
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plug className="h-5 w-5 text-terracotta" />
            Intégrations
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
              <div>
                <p className="text-sm font-medium text-slate-900">Firma.dev</p>
                <p className="text-xs text-stone-500">Signature électronique des baux</p>
              </div>
              <span className="text-xs font-medium text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">
                Variable serveur
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
              <div>
                <p className="text-sm font-medium text-slate-900">Plaid</p>
                <p className="text-xs text-stone-500">Synchronisation bancaire</p>
              </div>
              <span className="text-xs font-medium text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">
                Variable serveur
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
              <div>
                <p className="text-sm font-medium text-slate-900">Resend</p>
                <p className="text-xs text-stone-500">Envoi d&apos;emails et quittances</p>
              </div>
              <span className="text-xs font-medium text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">
                Variable serveur
              </span>
            </div>
          </div>
        </Card>

        {/* Zone dangereuse */}
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-terracotta" />
            Session
          </h2>
          <Button variant="danger" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>
            Se déconnecter
          </Button>
        </Card>
      </div>
    </div>
  );
}
