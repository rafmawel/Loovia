// API Route — activer un accès beta (Pro gratuit pour les testeurs)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Codes beta valides — à gérer via env var ou base de données
const VALID_BETA_CODES = (process.env.BETA_CODES || 'LOOVIA-BETA-2026').split(',').map(c => c.trim().toUpperCase());

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || !VALID_BETA_CODES.includes(code.trim().toUpperCase())) {
      return NextResponse.json({ error: 'Code beta invalide' }, { status: 400 });
    }

    // Activer le plan Pro gratuitement
    const admin = createAdminClient();
    const { error } = await admin.from('subscriptions').upsert(
      {
        user_id: user.id,
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
        cancel_at_period_end: false,
      },
      { onConflict: 'user_id' },
    );

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Accès beta Pro activé !' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
