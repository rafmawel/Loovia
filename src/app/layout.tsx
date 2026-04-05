import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// Police Inter — variable CSS utilisée par le design system (--font-inter)
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

// Viewport et thème PWA
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#e2725b',
}

// Métadonnées SEO + PWA
export const metadata: Metadata = {
  title: 'Loovia — Gestion Locative',
  description:
    'Plateforme SaaS de gestion locative pour propriétaires bailleurs',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Loovia',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon.svg' },
    ],
  },
}

/**
 * Layout racine de l'application Loovia.
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
        <Toaster richColors position="top-right" />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

/** Enregistrement du service worker côté client */
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `,
      }}
    />
  );
}
