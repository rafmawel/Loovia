/**
 * Client Supabase pour les composants navigateur (Client Components).
 *
 * Utilise createBrowserClient de @supabase/ssr pour creer une instance
 * compatible avec le navigateur. Les cookies de session sont geres
 * automatiquement par le navigateur.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
