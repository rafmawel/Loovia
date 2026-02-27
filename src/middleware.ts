/**
 * Middleware Next.js principal.
 *
 * Intercepte chaque requete entrante pour rafraichir la session
 * Supabase et gerer les redirections d'authentification.
 *
 * Le matcher exclut les fichiers statiques, les images optimisees
 * et les ressources publiques pour ne traiter que les requetes
 * de navigation.
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Intercepter toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icone du navigateur)
     * - Images et ressources publiques (svg, png, jpg, jpeg, gif, webp, ico)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
