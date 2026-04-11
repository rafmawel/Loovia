// Webhook Stripe — réception des événements d'abonnement
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (!userId) break;

      const plan = session.metadata?.plan === 'pro' ? 'pro' : 'premium';

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          status: 'active',
        },
        { onConflict: 'user_id' },
      );
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const periodEnd = (sub as unknown as Record<string, number>).current_period_end;

      const statusMap: Record<string, string> = {
        active: 'active',
        past_due: 'past_due',
        canceled: 'canceled',
        trialing: 'trialing',
        unpaid: 'past_due',
        incomplete: 'inactive',
        incomplete_expired: 'canceled',
        paused: 'inactive',
      };

      await supabase
        .from('subscriptions')
        .update({
          status: statusMap[sub.status] || 'inactive',
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({ plan: 'free', status: 'canceled' })
        .eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as unknown as Record<string, unknown>).subscription as string | null;
      if (subId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
