import type { Metadata } from 'next'
import { Archivo_Black, Fragment_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import AppSurfaceBackground from '@/components/AppSurfaceBackground'

const fragmentMono = Fragment_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ecoar.dev'),
  applicationName: 'ECOAR +',
  title: {
    default: 'ECOAR + | Companion digital do RPG ECOAR',
    template: '%s | ECOAR +',
  },
  description:
    'Companion digital do RPG de mesa ECOAR: crie e gerencie fichas de personagem com raças, atributos, escolas marciais, trilhas e singularidades.',
  keywords: ['ECOAR', 'ECOAR +', 'RPG', 'ficha de personagem', 'RPG de mesa', 'companion'],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://ecoar.dev',
    siteName: 'ECOAR +',
    title: 'ECOAR + | Companion digital do RPG ECOAR',
    description:
      'Companion digital do RPG de mesa ECOAR: crie e gerencie fichas de personagem.',
  },
  twitter: {
    card: 'summary',
    title: 'ECOAR + | Companion digital do RPG ECOAR',
    description:
      'Companion digital do RPG de mesa ECOAR: crie e gerencie fichas de personagem.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' as const }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${fragmentMono.variable} ${archivoBlack.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('ecoar-theme') || 'dark';
                var root = document.documentElement;
                if (root) {
                  root.setAttribute('data-theme', theme);
                  root.classList.toggle('dark', theme === 'dark');
                }
                if (document.body) document.body.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="h-[100dvh] overflow-hidden overflow-x-hidden flex flex-col font-body antialiased pb-[env(safe-area-inset-bottom)]">
        <AppSurfaceBackground />
        <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-x-hidden">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}
