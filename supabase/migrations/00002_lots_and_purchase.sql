-- ============================================================================
-- Migration : Ajout des lots et informations d'achat
-- ============================================================================

-- --------------------------------------------------------------------------
-- Table : property_lots (Lots / ensembles de biens)
-- --------------------------------------------------------------------------

CREATE TABLE public.property_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purchase_price NUMERIC,
  monthly_payment NUMERIC,
  payment_months INTEGER,
  loan_rate NUMERIC,
  purchase_date DATE,
  notary_fees NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_property_lots_user_id ON public.property_lots(user_id);

ALTER TABLE public.property_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.property_lots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insert_own ON public.property_lots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own ON public.property_lots
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY delete_own ON public.property_lots
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_property_lots_updated_at
  BEFORE UPDATE ON public.property_lots
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- --------------------------------------------------------------------------
-- Ajout des colonnes financières d'achat sur properties
-- --------------------------------------------------------------------------

ALTER TABLE public.properties
  ADD COLUMN purchase_price NUMERIC,
  ADD COLUMN monthly_payment NUMERIC,
  ADD COLUMN payment_months INTEGER,
  ADD COLUMN loan_rate NUMERIC,
  ADD COLUMN purchase_date DATE,
  ADD COLUMN notary_fees NUMERIC,
  ADD COLUMN lot_id UUID REFERENCES public.property_lots(id) ON DELETE SET NULL;

CREATE INDEX idx_properties_lot_id ON public.properties(lot_id);
