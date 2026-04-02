import Stripe from 'stripe';

// Initialisation lazy : Stripe n'est instancié que quand on l'utilise,
// pour éviter de crasher au build si STRIPE_SECRET_KEY n'est pas encore défini.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY non défini dans les variables d\'environnement');
    }
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

// Re-export pour compatibilité (usage : import { stripe } from '@/lib/stripe')
// Utilise un Proxy pour différer l'initialisation au moment de l'appel réel
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
