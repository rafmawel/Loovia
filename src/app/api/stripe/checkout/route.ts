// API Route — créer une session Stripe Checkout pour passer au Pro
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si un customer Stripe existe déjà
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Créer un customer Stripe si nécessaire
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Upsert la ligne subscription avec le customer ID
      const admin = createAdminClient();
      await admin.from('subscriptions').upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          plan: 'free',
          status: 'inactive',
        },
        { onConflict: 'user_id' },
      );
    }

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/parametres?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/parametres`,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur Stripe Checkout:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
