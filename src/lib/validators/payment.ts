// Schéma de validation Zod pour les paiements
import { z } from 'zod';

export const paymentSchema = z.object({
  lease_id: z.string().uuid('Sélectionnez un bail'),
  period_start: z.string().min(1, 'La date de début de période est requise'),
  period_end: z.string().min(1, 'La date de fin de période est requise'),
  amount_expected: z.coerce.number().positive('Le montant attendu doit être positif'),
  amount_paid: z.coerce.number().min(0).default(0),
  status: z.enum(['pending', 'paid', 'partial', 'late']).default('pending'),
  payment_date: z.string().optional().nullable(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
