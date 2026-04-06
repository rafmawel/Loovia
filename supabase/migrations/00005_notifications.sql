-- Table notifications — alertes in-app pour les propriétaires
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment_received', 'payment_late', 'lease_expiring', 'irl_revision', 'signature_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_own ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Les inserts se font via admin client (webhooks, crons)
