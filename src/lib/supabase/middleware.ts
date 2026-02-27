/**
 * Fonction utilitaire pour le middleware Next.js.
 *
 * Rafraichit la session Supabase a chaque requete entrante et
 * gere les redirections d'authentification :
 * - Utilisateur non connecte → redirige vers /login pour les routes protegees
 * - Utilisateur connecte → redirige vers /dashboard depuis /login ou /register
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Routes de l'application qui necessitent une authentification.
 * Si l'utilisateur n'est pas connecte et tente d'acceder a l'une
 * de ces routes, il sera redirige vers la page de connexion.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/biens',
  '/locataires',
  '/baux',
  '/finances',
  '/documents',
  '/parametres',
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT : Ne pas utiliser supabase.auth.getSession() dans le middleware.
  // getUser() envoie une requete au serveur Supabase Auth pour revalider
  // le token, ce qui garantit la securite de la verification.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirection vers /login si l'utilisateur n'est pas connecte
  // et tente d'acceder a une route protegee
  if (
    !user &&
    PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirection vers /dashboard si l'utilisateur est deja connecte
  // et tente d'acceder aux pages de connexion ou d'inscription
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
