// API Route — déconnecter/supprimer une connexion bancaire
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId requis' }, { status: 400 });
    }

    // Supprimer les transactions liées
    await supabase
      .from('bank_transactions')
      .delete()
      .eq('connection_id', connectionId)
      .eq('user_id', user.id);

    // Supprimer la connexion
    const { error } = await supabase
      .from('bank_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
