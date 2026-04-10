// API Route — créer une session Stripe Checkout pour passer au Pro
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const stripeClient = getStripe();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body.plan || 'pro';
    const promoCode: string | undefined = body.promoCode || undefined;

    // Déterminer le price ID
    const priceId = plan === 'multi_sci'
      ? process.env.STRIPE_MULTI_SCI_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID!
      : process.env.STRIPE_PRO_PRICE_ID!;

    // Vérifier si un customer Stripe existe déjà
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Créer un customer Stripe si nécessaire
    if (!customerId) {
      const customer = await stripeClient.customers.create({
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

    // Résoudre le code promo si fourni
    let promotionCodeId: string | undefined;
    if (promoCode) {
      const promotionCodes = await stripeClient.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      });
      if (promotionCodes.data.length > 0) {
        promotionCodeId = promotionCodes.data[0].id;
      } else {
        return NextResponse.json({ error: 'Code promo invalide ou expiré' }, { status: 400 });
      }
    }

    // Créer la session Checkout
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : { allow_promotion_codes: true }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/parametres?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/parametres`,
      metadata: { user_id: user.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur Stripe Checkout:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
