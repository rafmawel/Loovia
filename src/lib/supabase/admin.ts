/**
 * Client Supabase administrateur avec la cle de service (Service Role Key).
 *
 * ATTENTION : Ce client contourne les politiques RLS (Row Level Security).
 * A utiliser uniquement cote serveur pour les operations administratives
 * necessitant un acces complet a la base de donnees.
 *
 * Ne jamais exposer la cle de service cote client.
 */

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
