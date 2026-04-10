// Helpers pour vérifier le statut d'abonnement côté serveur
import { createClient } from '@/lib/supabase/server';
import type { Subscription } from '@/types';

export async function getUserSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data as Subscription | null;
}

export async function isUserPro(): Promise<boolean> {
  const sub = await getUserSubscription();
  return (sub?.plan === 'pro' || sub?.plan === 'multi_sci') && sub?.status === 'active';
}
