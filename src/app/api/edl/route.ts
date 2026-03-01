// API Route — CRUD des états des lieux
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── Créer un état des lieux ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, tenant_id, type, data, signature_landlord, signature_tenant } = body;

    if (!property_id || !tenant_id || !type) {
      return NextResponse.json(
        { error: 'property_id, tenant_id et type sont requis' },
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

    const { data: edl, error } = await supabase
      .from('edl_reports')
      .insert({
        user_id: user.id,
        property_id,
        tenant_id,
        type,
        data: data || {},
        signature_landlord: signature_landlord || null,
        signature_tenant: signature_tenant || null,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }

    return NextResponse.json({ id: edl.id, success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// ── Mettre à jour un état des lieux ──────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, data, signature_landlord, signature_tenant } = body;

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
    if (type) updates.type = type;
    if (data) updates.data = data;
    if (signature_landlord !== undefined) updates.signature_landlord = signature_landlord;
    if (signature_tenant !== undefined) updates.signature_tenant = signature_tenant;

    const { error } = await supabase
      .from('edl_reports')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }

    return NextResponse.json({ id, success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
