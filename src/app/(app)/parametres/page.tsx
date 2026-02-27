'use client';

// Page Paramètres — profil utilisateur et intégrations
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Settings, User, Plug, LogOut, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ParametresPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
                {process.env.NEXT_PUBLIC_FIRMA_API_KEY ? 'Configuré' : 'Non configuré'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
              <div>
                <p className="text-sm font-medium text-slate-900">Plaid</p>
                <p className="text-xs text-stone-500">Synchronisation bancaire</p>
              </div>
              <span className="text-xs font-medium text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">
                {process.env.NEXT_PUBLIC_PLAID_CLIENT_ID ? 'Configuré' : 'Non configuré'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
              <div>
                <p className="text-sm font-medium text-slate-900">Resend</p>
                <p className="text-xs text-stone-500">Envoi d&apos;emails et quittances</p>
              </div>
              <span className="text-xs font-medium text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">
                {process.env.NEXT_PUBLIC_RESEND_API_KEY ? 'Configuré' : 'Non configuré'}
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
