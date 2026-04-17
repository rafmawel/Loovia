// API Route — initialiser la connexion Powens et retourner l'URL de la webview
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthToken, getConnectUrl, getTemporaryCode } from '@/lib/api/powens';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les connexions existantes
    const { data: existingConnections } = await supabase
      .from('bank_connections')
      .select('id, access_token')
      .eq('user_id', user.id);

    const connectionCount = existingConnections?.length || 0;

    // Vérifier la limite selon le plan (Gratuit/Premium = 1, Pro = illimité)
    if (connectionCount >= 1) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .single();

      const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';

      if (!isPro) {
        return NextResponse.json(
          { error: 'Passez au plan Pro pour connecter plusieurs comptes bancaires' },
          { status: 403 },
        );
      }
    }

    let token: string;

    if (existingConnections && existingConnections.length > 0) {
      token = existingConnections[0].access_token;
      // Vérifier que le token est valide en essayant d'obtenir un code
      try {
        await getTemporaryCode(token);
      } catch {
        // Token invalide — supprimer l'ancienne entrée et recréer
        const admin = createAdminClient();
        await admin.from('bank_connections')
          .delete()
          .eq('id', existingConnections[0].id);

        const authResult = await getAuthToken();
        token = authResult.auth_token;
        await admin.from('bank_connections').insert({
          user_id: user.id,
          access_token: token,
          item_id: String(authResult.id_user),
        });
      }
    } else {
      const authResult = await getAuthToken();
      token = authResult.auth_token;

      const admin = createAdminClient();
      await admin.from('bank_connections').insert({
        user_id: user.id,
        access_token: token,
        item_id: String(authResult.id_user),
      });
    }

    const connectUrl = await getConnectUrl(token);

    return NextResponse.json({ connect_url: connectUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur Powens connect:', message);
    console.error('POWENS_DOMAIN:', process.env.POWENS_DOMAIN ? 'set' : 'NOT SET');
    console.error('POWENS_CLIENT_ID:', process.env.POWENS_CLIENT_ID ? 'set' : 'NOT SET');
    console.error('POWENS_CLIENT_SECRET:', process.env.POWENS_CLIENT_SECRET ? 'set' : 'NOT SET');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
