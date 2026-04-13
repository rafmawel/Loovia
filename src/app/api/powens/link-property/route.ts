// API Route — associer une connexion bancaire à un bien
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { connectionId, propertyId } = await request.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId requis' }, { status: 400 });
    }

    // Mettre à jour l'association (propertyId peut être null pour dissocier)
    const { error } = await supabase
      .from('bank_connections')
      .update({ property_id: propertyId || null })
      .eq('id', connectionId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
