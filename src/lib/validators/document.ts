// Schéma de validation Zod pour les documents locataires
import { z } from 'zod';

export const documentSchema = z.object({
  tenant_id: z.string().uuid('Locataire requis'),
  document_type: z.string().min(1, 'Le type de document est requis'),
  label: z.string().min(1, 'Le libellé est requis').max(200),
});

export const documentUpdateSchema = z.object({
  id: z.string().uuid('Identifiant requis'),
  status: z.enum(['requested', 'uploaded', 'validated', 'rejected']).optional(),
  file_url: z.string().url('URL invalide').optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;
