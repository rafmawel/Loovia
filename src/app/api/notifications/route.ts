// API Route — liste des notifications + marquer comme lues
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET — récupérer les notifications (non lues par défaut)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const all = request.nextUrl.searchParams.get('all') === 'true';

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!all) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ notifications: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — marquer des notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { ids, all } = await request.json();

    if (all) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    } else if (ids && ids.length > 0) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', ids);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
