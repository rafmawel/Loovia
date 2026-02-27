// Schéma de validation Zod pour les baux
import { z } from 'zod';

export const leaseSchema = z.object({
  property_id: z.string().uuid('Sélectionnez un bien'),
  tenant_id: z.string().uuid('Sélectionnez un locataire'),
  status: z.enum(['draft', 'pending_signature', 'signed', 'active', 'terminated']).default('draft'),
  template_id: z.string().uuid().optional().nullable(),
  data: z.record(z.string(), z.unknown()).default({}),
  monthly_rent: z.coerce.number().min(0, 'Le loyer mensuel doit être positif'),
  charges_amount: z.coerce.number().min(0).default(0),
  start_date: z.string().min(1, 'La date de début est requise'),
  end_date: z.string().optional().nullable(),
});

export type LeaseFormData = z.infer<typeof leaseSchema>;
