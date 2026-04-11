// API Route — initialiser la connexion Powens et retourner l'URL de la webview
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthToken, createPowensUser, getConnectUrl } from '@/lib/api/powens';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur a déjà un token Powens
    const { data: existing } = await supabase
      .from('bank_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    let token: string;

    if (existing?.access_token) {
      // Réutiliser le token permanent existant
      token = existing.access_token;
    } else {
      // Créer un nouveau token et utilisateur Powens
      const tempToken = await getAuthToken();
      const powensUser = await createPowensUser(tempToken);
      token = powensUser.token;

      // Sauvegarder le token permanent dans bank_connections
      const admin = createAdminClient();
      await admin.from('bank_connections').insert({
        user_id: user.id,
        access_token: token,
        item_id: String(powensUser.id),
      });
    }

    const connectUrl = getConnectUrl(token);

    return NextResponse.json({ connect_url: connectUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur Powens connect:', message);
    return NextResponse.json({ error: 'Erreur lors de la connexion bancaire' }, { status: 500 });
  }
}
