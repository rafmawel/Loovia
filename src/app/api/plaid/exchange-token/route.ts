// API Route — échange d'un public token Plaid contre un access token
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangePublicToken } from '@/lib/api/plaid';

export async function POST(request: NextRequest) {
  try {
    const { publicToken, institutionName } = await request.json();

    if (!publicToken) {
      return NextResponse.json({ error: 'publicToken requis' }, { status: 400 });
    }

    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Échanger le token
    const { access_token, item_id } = await exchangePublicToken(publicToken);

    // Sauvegarder la connexion bancaire
    const { data, error } = await supabase
      .from('bank_connections')
      .insert({
        user_id: user.id,
        access_token,
        item_id,
        institution_name: institutionName || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde de la connexion' }, { status: 500 });
    }

    return NextResponse.json({ success: true, connectionId: data.id });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'échange du token bancaire' }, { status: 500 });
  }
}
