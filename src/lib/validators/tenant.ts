// Schéma de validation Zod pour les locataires
import { z } from 'zod';

const coTenantSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  date_of_birth: z.string().optional().nullable(),
  relationship_type: z.enum(['Colocation', 'Couple', 'Famille']).optional().nullable(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
});

export const tenantSchema = z.object({
  property_id: z.string().uuid().optional().nullable(),
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  date_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional().nullable(),
  start_date: z.string().min(1, "La date d'entrée est requise"),
  end_date: z.string().optional().nullable(),
  rent_amount: z.coerce.number().positive('Le loyer doit être supérieur à 0'),
  co_tenants: z.array(coTenantSchema).default([]),
  relationship_type: z.string().optional().nullable(),
  payment_status: z.enum(['paid', 'pending', 'late']).default('pending'),
  last_known_iban: z.string().optional().nullable(),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
