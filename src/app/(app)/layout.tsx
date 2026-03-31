// Layout pour les pages authentifiées — inclut la Sidebar et le header
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/ui/AppLayout';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import type { Subscription } from '@/types';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirection si non authentifié
  if (!user) {
    redirect('/login');
  }

  // Charger l'abonnement pour le contexte global
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <SubscriptionProvider subscription={subscription as Subscription | null}>
      <AppLayout
        user={{
          email: user.email,
          user_metadata: user.user_metadata as { first_name?: string; [key: string]: unknown },
        }}
      >
        {children}
      </AppLayout>
    </SubscriptionProvider>
  );
}
