import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// Police Inter — variable CSS utilisée par le design system (--font-inter)
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

// Métadonnées SEO de l'application
export const metadata: Metadata = {
  title: 'Loovia — Gestion Locative',
  description:
    'Plateforme SaaS de gestion locative pour propriétaires bailleurs',
}

/**
 * Layout racine de l'application Loovia.
 *
 * - Applique la police Inter et la classe antialiased au body.
 * - Intègre le Toaster de Sonner pour les notifications toast.
 * - Langue définie en français (lang="fr").
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>
        {children}
        {/* Toaster Sonner — notifications positionnées en haut à droite */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
