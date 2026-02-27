// Layout pour les pages authentifiées — inclut la Sidebar et le header
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/ui/AppLayout';

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

  return (
    <AppLayout
      user={{
        email: user.email,
        user_metadata: user.user_metadata as { first_name?: string; [key: string]: unknown },
      }}
    >
      {children}
    </AppLayout>
  );
}
