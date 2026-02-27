// API Route — création d'un Plaid Link token
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLinkToken } from '@/lib/api/plaid';

export async function POST() {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Créer le link token
    const result = await createLinkToken(user.id);

    return NextResponse.json({ link_token: result.link_token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
