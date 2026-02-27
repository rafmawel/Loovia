-- ============================================================================
-- Loovia : Migration initiale
-- Fichier : 00001_initial_schema.sql
-- Description : Creation de toutes les tables, index, politiques RLS
--               et triggers pour le projet Loovia.
-- ============================================================================


-- ============================================================================
-- 1. FONCTION TRIGGER : mise a jour automatique de updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 2. TABLES
-- ============================================================================


-- --------------------------------------------------------------------------
-- Table : properties (Biens immobiliers)
-- --------------------------------------------------------------------------

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  door TEXT,
  property_type TEXT NOT NULL DEFAULT 'Appartement',
  furnished_type TEXT NOT NULL DEFAULT 'Location vide',
  surface NUMERIC,
  number_of_rooms INTEGER,
  kitchen_type TEXT,
  kitchen_equipment JSONB DEFAULT '[]',
  has_cellar BOOLEAN DEFAULT false,
  cellar_number TEXT,
  has_parking BOOLEAN DEFAULT false,
  parking_type TEXT,
  parking_number TEXT,
  has_balcony BOOLEAN DEFAULT false,
  balcony_surface NUMERIC,
  has_terrace BOOLEAN DEFAULT false,
  terrace_surface NUMERIC,
  has_garden BOOLEAN DEFAULT false,
  garden_surface NUMERIC,
  garden_type TEXT,
  has_attic BOOLEAN DEFAULT false,
  heating_type TEXT,
  heating_energy TEXT,
  hot_water_type TEXT,
  hot_water_energy TEXT,
  charges_included JSONB DEFAULT '[]',
  charges_other TEXT,
  glazing_type TEXT,
  shutters_type TEXT,
  has_intercom BOOLEAN DEFAULT false,
  has_fiber BOOLEAN DEFAULT false,
  rent_amount NUMERIC NOT NULL DEFAULT 0,
  charges_amount NUMERIC DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  image_url TEXT,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------------------------
-- Table : tenants (Locataires)
-- --------------------------------------------------------------------------

CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT,
  profession TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount NUMERIC NOT NULL DEFAULT 0,
  co_tenants JSONB DEFAULT '[]',
  relationship_type TEXT,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('paid', 'pending', 'late')),
  last_known_iban TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------------------------
-- Table : leases (Baux / Contrats de location)
-- --------------------------------------------------------------------------

CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_signature', 'signed', 'active', 'terminated')),
  template_id UUID,
  data JSONB DEFAULT '{}',
  monthly_rent NUMERIC NOT NULL DEFAULT 0,
  charges_amount NUMERIC DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  firma_request_id TEXT,
  firma_status TEXT,
  sent_for_signature_at TIMESTAMPTZ,
  signature_landlord_status TEXT DEFAULT 'pending',
  signature_landlord_date TIMESTAMPTZ,
  signature_tenant_status TEXT DEFAULT 'pending',
  signature_tenant_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------------------------
-- Table : payments (Paiements de loyer)
-- --------------------------------------------------------------------------

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount_expected NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'partial', 'late')),
  payment_date TIMESTAMPTZ,
  sent_receipt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------------------------
-- Table : bank_connections (Connexions bancaires)
-- --------------------------------------------------------------------------

CREATE TABLE public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name TEXT,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL,
  cursor TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------------------------
-- Table : bank_transactions (Transactions bancaires)
-- --------------------------------------------------------------------------

CREATE TABLE public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Autre',
  status TEXT DEFAULT 'unmatched'
    CHECK (status IN ('unmatched', 'suggestion', 'matched', 'categorized')),
  matched_payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  sender_iban TEXT,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------------------------
-- Table : maintenance_requests (Demandes de maintenance)
-- --------------------------------------------------------------------------

CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------------------------
-- Table : tenant_documents (Documents des locataires)
-- --------------------------------------------------------------------------

CREATE TABLE public.tenant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  status TEXT DEFAULT 'requested'
    CHECK (status IN ('requested', 'received', 'validated', 'rejected')),
  file_url TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  received_at TIMESTAMPTZ,
  notes TEXT
);


-- --------------------------------------------------------------------------
-- Table : edl_reports (Etats des lieux)
-- --------------------------------------------------------------------------

CREATE TABLE public.edl_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrance', 'exit')),
  data JSONB NOT NULL DEFAULT '{}',
  signature_landlord TEXT,
  signature_tenant TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================================
-- 3. INDEX (Amelioration des performances de recherche)
-- ============================================================================

-- Index sur properties
CREATE INDEX idx_properties_user_id ON public.properties(user_id);

-- Index sur tenants
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX idx_tenants_property_id ON public.tenants(property_id);

-- Index sur leases
CREATE INDEX idx_leases_user_id ON public.leases(user_id);
CREATE INDEX idx_leases_property_id ON public.leases(property_id);
CREATE INDEX idx_leases_tenant_id ON public.leases(tenant_id);
CREATE INDEX idx_leases_status ON public.leases(status);

-- Index sur payments
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_lease_id ON public.payments(lease_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Index sur bank_connections
CREATE INDEX idx_bank_connections_user_id ON public.bank_connections(user_id);

-- Index sur bank_transactions
CREATE INDEX idx_bank_transactions_user_id ON public.bank_transactions(user_id);
CREATE INDEX idx_bank_transactions_connection_id ON public.bank_transactions(connection_id);
CREATE INDEX idx_bank_transactions_status ON public.bank_transactions(status);
CREATE INDEX idx_bank_transactions_matched_payment_id ON public.bank_transactions(matched_payment_id);

-- Index sur maintenance_requests
CREATE INDEX idx_maintenance_requests_user_id ON public.maintenance_requests(user_id);
CREATE INDEX idx_maintenance_requests_property_id ON public.maintenance_requests(property_id);
CREATE INDEX idx_maintenance_requests_tenant_id ON public.maintenance_requests(tenant_id);

-- Index sur tenant_documents
CREATE INDEX idx_tenant_documents_user_id ON public.tenant_documents(user_id);
CREATE INDEX idx_tenant_documents_tenant_id ON public.tenant_documents(tenant_id);

-- Index sur edl_reports
CREATE INDEX idx_edl_reports_user_id ON public.edl_reports(user_id);
CREATE INDEX idx_edl_reports_property_id ON public.edl_reports(property_id);
CREATE INDEX idx_edl_reports_tenant_id ON public.edl_reports(tenant_id);


-- ============================================================================
-- 4. ROW LEVEL SECURITY (Securite au niveau des lignes)
-- Chaque utilisateur ne peut acceder qu'a ses propres donnees.
-- ============================================================================


-- --------------------------------------------------------------------------
-- RLS : properties
-- --------------------------------------------------------------------------

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.properties
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : tenants
-- --------------------------------------------------------------------------

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.tenants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.tenants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.tenants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.tenants
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : leases
-- --------------------------------------------------------------------------

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.leases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.leases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.leases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.leases
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : payments
-- --------------------------------------------------------------------------

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.payments
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : bank_connections
-- --------------------------------------------------------------------------

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.bank_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.bank_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.bank_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.bank_connections
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : bank_transactions
-- --------------------------------------------------------------------------

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.bank_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.bank_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.bank_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.bank_transactions
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : maintenance_requests
-- --------------------------------------------------------------------------

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.maintenance_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.maintenance_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.maintenance_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.maintenance_requests
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : tenant_documents
-- --------------------------------------------------------------------------

ALTER TABLE public.tenant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.tenant_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.tenant_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.tenant_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.tenant_documents
  FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- RLS : edl_reports
-- --------------------------------------------------------------------------

ALTER TABLE public.edl_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own ON public.edl_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own ON public.edl_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own ON public.edl_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own ON public.edl_reports
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================================
-- 5. TRIGGERS : mise a jour automatique de updated_at
-- Appliques aux tables qui possedent une colonne updated_at.
-- ============================================================================

-- Trigger sur properties
CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger sur tenants
CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger sur leases
CREATE TRIGGER set_leases_updated_at
  BEFORE UPDATE ON public.leases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger sur maintenance_requests
CREATE TRIGGER set_maintenance_requests_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
