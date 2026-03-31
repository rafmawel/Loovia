-- Table subscriptions — gestion des abonnements Stripe
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('inactive', 'active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent lire que leur propre abonnement
CREATE POLICY select_own ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Les écritures passent par createAdminClient (bypass RLS) dans le webhook
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
