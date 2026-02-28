// API Route — CRUD des documents locataires
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── Créer une demande de document ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, document_type, notes } = body;

    if (!tenant_id || !document_type) {
      return NextResponse.json(
        { error: 'tenant_id et document_type sont requis' },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: doc, error } = await supabase
      .from('tenant_documents')
      .insert({
        user_id: user.id,
        tenant_id,
        document_type,
        status: 'requested',
        notes: notes || null,
        requested_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: doc.id, success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// ── Mettre à jour un document (statut, file_url) ────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, file_url, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const updates: Record<string, unknown> = {};
    if (status) {
      updates.status = status;
      if (status === 'received') {
        updates.received_at = new Date().toISOString();
      }
    }
    if (file_url !== undefined) updates.file_url = file_url;
    if (notes !== undefined) updates.notes = notes;

    const { error } = await supabase
      .from('tenant_documents')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id, success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// ── Supprimer un document ────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { error } = await supabase
      .from('tenant_documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
