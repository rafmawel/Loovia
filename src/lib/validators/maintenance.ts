// Schéma de validation Zod pour les demandes de maintenance
import { z } from 'zod';

export const maintenanceSchema = z.object({
  property_id: z.string().uuid('Bien requis'),
  tenant_id: z.string().uuid().optional().nullable(),
  title: z.string().min(2, 'Le titre doit faire au moins 2 caractères').max(200),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  photos: z.array(z.string().url('URL invalide')).default([]),
});

export const maintenanceUpdateSchema = z.object({
  id: z.string().uuid('Identifiant requis'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  photos: z.array(z.string().url()).optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
