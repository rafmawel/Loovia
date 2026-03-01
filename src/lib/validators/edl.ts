// Schéma de validation Zod pour les états des lieux
import { z } from 'zod';

const edlRoomSchema = z.object({
  name: z.string().min(1),
  condition: z.enum(['Bon', 'Correct', 'Usé', 'Dégradé']),
  notes: z.string().max(500).optional().nullable(),
  photos: z.array(z.string().url()).default([]),
});

export const edlSchema = z.object({
  property_id: z.string().uuid('Bien requis'),
  tenant_id: z.string().uuid('Locataire requis'),
  type: z.enum(['entrance', 'exit']),
  rooms: z.array(edlRoomSchema).default([]),
  general_notes: z.string().max(2000).optional().nullable(),
  meter_readings: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const edlUpdateSchema = z.object({
  id: z.string().uuid('Identifiant requis'),
  rooms: z.array(edlRoomSchema).optional(),
  general_notes: z.string().max(2000).optional().nullable(),
  meter_readings: z.record(z.string(), z.unknown()).optional().nullable(),
  signature_landlord: z.string().optional().nullable(),
  signature_tenant: z.string().optional().nullable(),
});

export type EdlFormData = z.infer<typeof edlSchema>;
