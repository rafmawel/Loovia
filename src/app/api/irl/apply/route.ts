// API Route — appliquer une révision IRL à un bail
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { leaseId, newRent, oldIrl, newIrl } = await request.json();

    if (!leaseId || !newRent) {
      return NextResponse.json({ error: 'leaseId et newRent requis' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que le bail appartient à l'utilisateur
    const { data: lease, error } = await supabase
      .from('leases')
      .select('id, monthly_rent, data')
      .eq('id', leaseId)
      .single();

    if (error || !lease) {
      return NextResponse.json({ error: 'Bail non trouvé' }, { status: 404 });
    }

    const admin = createAdminClient();
    const data = (lease.data || {}) as Record<string, unknown>;

    // Mettre à jour le loyer et le trimestre/année de référence IRL
    // pour que la prochaine révision se base sur le nouvel indice
    await admin
      .from('leases')
      .update({
        monthly_rent: newRent,
        data: {
          ...data,
          irl_year: newIrl.year,
          irl_last_revision_date: new Date().toISOString().slice(0, 10),
          irl_last_old_value: oldIrl.value,
          irl_last_new_value: newIrl.value,
          irl_last_old_rent: lease.monthly_rent,
        },
      })
      .eq('id', leaseId);

    // Mettre aussi à jour le loyer sur le bien et le locataire
    const { data: fullLease } = await supabase
      .from('leases')
      .select('property_id, tenant_id, charges_amount')
      .eq('id', leaseId)
      .single();

    if (fullLease) {
      await Promise.all([
        admin
          .from('properties')
          .update({ rent_amount: newRent })
          .eq('id', fullLease.property_id),
        admin
          .from('tenants')
          .update({ rent_amount: newRent + (fullLease.charges_amount || 0) })
          .eq('id', fullLease.tenant_id),
      ]);
    }

    return NextResponse.json({
      success: true,
      previousRent: lease.monthly_rent,
      newRent,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur application IRL:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
