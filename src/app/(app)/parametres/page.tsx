'use client';

// Page Paramètres — profil utilisateur, régime fiscal, abonnement
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Settings, User, LogOut, Save, Crown, Check, Sparkles, Building2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import type { Subscription } from '@/types';

const FISCAL_REGIMES = [
  { value: 'lmnp_micro', label: 'LMNP — Micro-BIC' },
  { value: 'lmnp_reel', label: 'LMNP — Régime réel' },
  { value: 'lmp', label: 'LMP (Loueur Meublé Professionnel)' },
  { value: 'nu_micro', label: 'Location nue — Micro-foncier' },
  { value: 'nu_reel', label: 'Location nue — Régime réel' },
  { value: 'sci_ir', label: 'SCI à l\'IR (impôt sur le revenu)' },
  { value: 'sci_is', label: 'SCI à l\'IS (impôt sur les sociétés)' },
  { value: 'autre', label: 'Autre' },
] as const;

export default function ParametresPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [fiscalRegime, setFiscalRegime] = useState('');
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
        setFiscalRegime(user.user_metadata?.fiscal_regime || '');

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
        data: { first_name: firstName, last_name: lastName, fiscal_regime: fiscalRegime },
      });

      if (error) throw error;
      toast.success('Profil mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  }

  // Upgrade vers Pro
  async function handleUpgrade(plan: 'pro' | 'multi_sci') {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
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
        <PageHeader title="Paramètres" description="Gérez votre compte et vos préférences" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border-light border-t-accent" />
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.status === 'active';

  return (
    <div>
      <PageHeader title="Paramètres" description="Gérez votre compte et vos préférences" />

      <div className="max-w-2xl space-y-6">
        {/* Profil */}
        <Card>
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
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

        {/* Régime fiscal */}
        <Card>
          <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Régime fiscal
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Sélectionnez votre régime fiscal pour adapter la comptabilité et les exports.
          </p>
          <div className="grid gap-2">
            {FISCAL_REGIMES.map((regime) => (
              <button
                key={regime.value}
                type="button"
                onClick={() => {
                  setFiscalRegime(regime.value);
                  // Auto-save fiscal regime
                  supabase.auth.updateUser({ data: { fiscal_regime: regime.value } })
                    .then(({ error }) => {
                      if (!error) toast.success('Régime fiscal mis à jour');
                      else toast.error('Erreur');
                    });
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                  fiscalRegime === regime.value
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'bg-bg-card text-text-secondary border border-border-light hover:border-accent/20 hover:text-text-primary'
                }`}
              >
                <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  fiscalRegime === regime.value ? 'border-accent' : 'border-border-light'
                }`}>
                  {fiscalRegime === regime.value && (
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  )}
                </div>
                {regime.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Abonnement */}
        <Card>
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" />
            Abonnement
          </h2>

          {(currentPlan === 'pro' || currentPlan === 'multi_sci') && isActive ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                <Sparkles className="h-5 w-5 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">
                    {currentPlan === 'multi_sci' ? 'Plan Multi-SCI' : 'Plan Pro'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {subscription?.cancel_at_period_end
                      ? `Actif jusqu'au ${new Date(subscription.current_period_end!).toLocaleDateString('fr-FR')}`
                      : `Prochain renouvellement le ${new Date(subscription!.current_period_end!).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleManageSubscription}>
                Gérer mon abonnement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Plan actuel */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-light">
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">Plan Gratuit</p>
                  <p className="text-xs text-text-secondary">Fonctionnalités limitées avec publicités</p>
                </div>
              </div>

              {/* Plan Pro */}
              <div className="p-5 rounded-xl border border-accent/30 bg-accent/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Pro</p>
                    <p className="text-xs text-text-secondary">Pour les propriétaires exigeants</p>
                  </div>
                  <p className="text-right">
                    <span className="text-2xl font-extrabold text-text-primary">9,90&euro;</span>
                    <span className="text-xs text-text-muted">/mois</span>
                  </p>
                </div>
                <ul className="space-y-2 mb-4">
                  {[
                    'Biens illimités',
                    'Aucune publicité',
                    'Analytique avancée',
                    'Révision IRL automatique',
                    'Export fiscal avancé',
                    'Signature électronique',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-text-secondary">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Crown className="h-4 w-4" />}
                  onClick={() => handleUpgrade('pro')}
                  loading={upgrading}
                >
                  Passer au Pro
                </Button>
              </div>

              {/* Plan Multi-SCI */}
              <div className="p-5 rounded-xl border border-accent/30 bg-accent/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                      Multi-SCI
                      <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Populaire</span>
                    </p>
                    <p className="text-xs text-text-secondary">Pour gérer plusieurs structures</p>
                  </div>
                  <p className="text-right">
                    <span className="text-2xl font-extrabold text-text-primary">14,90&euro;</span>
                    <span className="text-xs text-text-muted">/mois</span>
                  </p>
                </div>
                <ul className="space-y-2 mb-4">
                  {[
                    'Tout le plan Pro inclus',
                    'SCI multiples (IR, IS…)',
                    'Basculer entre vos structures',
                    'Analytique par SCI',
                    'Vision globale consolidée',
                    'Comparatif financier entre SCI',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-text-secondary">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Building2 className="h-4 w-4" />}
                  onClick={() => handleUpgrade('multi_sci')}
                  loading={upgrading}
                >
                  Passer au Multi-SCI
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Session */}
        <Card>
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
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
