// Types TypeScript pour toutes les entités Loovia

export interface Property {
  id: string;
  user_id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  building?: string | null;
  floor?: string | null;
  door?: string | null;
  property_type: string;
  furnished_type: string;
  surface?: number | null;
  number_of_rooms?: number | null;
  kitchen_type?: string | null;
  kitchen_equipment: string[];
  has_cellar: boolean;
  cellar_number?: string | null;
  has_parking: boolean;
  parking_type?: string | null;
  parking_number?: string | null;
  has_balcony: boolean;
  balcony_surface?: number | null;
  has_terrace: boolean;
  terrace_surface?: number | null;
  has_garden: boolean;
  garden_surface?: number | null;
  garden_type?: string | null;
  has_attic: boolean;
  heating_type?: string | null;
  heating_energy?: string | null;
  hot_water_type?: string | null;
  hot_water_energy?: string | null;
  charges_included: string[];
  charges_other?: string | null;
  glazing_type?: string | null;
  shutters_type?: string | null;
  has_intercom: boolean;
  has_fiber: boolean;
  rent_amount: number;
  charges_amount: number;
  deposit_amount: number;
  purchase_price?: number | null;
  monthly_payment?: number | null;
  payment_months?: number | null;
  loan_rate?: number | null;
  purchase_date?: string | null;
  notary_fees?: number | null;
  lot_id?: string | null;
  image_url?: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface PropertyLot {
  id: string;
  user_id: string;
  name: string;
  purchase_price?: number | null;
  monthly_payment?: number | null;
  payment_months?: number | null;
  loan_rate?: number | null;
  purchase_date?: string | null;
  notary_fees?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  user_id: string;
  property_id?: string | null;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  nationality?: string | null;
  profession?: string | null;
  email: string;
  phone?: string | null;
  start_date: string;
  end_date?: string | null;
  rent_amount: number;
  co_tenants: CoTenant[];
  relationship_type?: string | null;
  payment_status: 'paid' | 'pending' | 'late';
  last_known_iban?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoTenant {
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  relationship_type?: 'Colocation' | 'Couple' | 'Famille' | null;
  email?: string;
  phone?: string;
}

export type LeaseStatus = 'draft' | 'pending_signature' | 'signed' | 'active' | 'terminated';

export interface Lease {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  status: LeaseStatus;
  template_id?: string | null;
  data: Record<string, unknown>;
  monthly_rent: number;
  charges_amount: number;
  start_date: string;
  end_date?: string | null;
  firma_request_id?: string | null;
  firma_status?: string | null;
  sent_for_signature_at?: string | null;
  signature_landlord_status: string;
  signature_landlord_date?: string | null;
  signature_tenant_status: string;
  signature_tenant_date?: string | null;
  created_at: string;
  updated_at: string;
  // Relations jointes
  property?: Property;
  tenant?: Tenant;
}

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'late';

export interface Payment {
  id: string;
  user_id: string;
  lease_id: string;
  period_start: string;
  period_end: string;
  amount_expected: number;
  amount_paid: number;
  status: PaymentStatus;
  payment_date?: string | null;
  sent_receipt_at?: string | null;
  created_at: string;
  // Relations jointes
  lease?: Lease;
}

export interface BankConnection {
  id: string;
  user_id: string;
  institution_name?: string | null;
  access_token: string;
  item_id: string;
  cursor?: string | null;
  created_at: string;
}

export type TransactionStatus = 'unmatched' | 'suggestion' | 'matched' | 'categorized';

export interface BankTransaction {
  id: string;
  user_id: string;
  connection_id: string;
  amount: number;
  date: string;
  description?: string | null;
  category: string;
  status: TransactionStatus;
  matched_payment_id?: string | null;
  sender_iban?: string | null;
  raw_data: Record<string, unknown>;
  created_at: string;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface MaintenanceRequest {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id?: string | null;
  title: string;
  description?: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export type DocumentStatus = 'requested' | 'received' | 'validated' | 'rejected';

export interface TenantDocument {
  id: string;
  user_id: string;
  tenant_id: string;
  document_type: string;
  status: DocumentStatus;
  file_url?: string | null;
  requested_at: string;
  received_at?: string | null;
  notes?: string | null;
}

export type EdlType = 'entrance' | 'exit';

export interface EdlReport {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  type: EdlType;
  data: Record<string, unknown>;
  signature_landlord?: string | null;
  signature_tenant?: string | null;
  pdf_url?: string | null;
  created_at: string;
}

// Types utilitaires pour les formulaires
export type PropertyInsert = Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type PropertyUpdate = Partial<PropertyInsert>;

export type TenantInsert = Omit<Tenant, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type TenantUpdate = Partial<TenantInsert>;

export type LeaseInsert = Omit<Lease, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'property' | 'tenant'>;
export type LeaseUpdate = Partial<LeaseInsert>;

export type PaymentInsert = Omit<Payment, 'id' | 'user_id' | 'created_at' | 'lease'>;
export type PaymentUpdate = Partial<PaymentInsert>;

// Types pour les abonnements Stripe
export type SubscriptionPlan = 'free' | 'pro';
export type SubscriptionStatus = 'inactive' | 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  totalProperties: number;
  activeTenants: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

export interface AlertItem {
  id: string;
  tenantName: string;
  propertyName: string;
  amount: number;
  dueDate: string;
}

export interface ActivityItem {
  id: string;
  type: 'payment' | 'lease' | 'maintenance';
  description: string;
  date: string;
  status?: string;
}
