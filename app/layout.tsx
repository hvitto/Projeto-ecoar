import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import LoginBackgroundLoader from '@/components/LoginBackgroundLoader'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ECOAR Beyond - Character Sheet',
  description: 'Sistema de criação e gerenciamento de personagens para o RPG ECOAR',
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' as const }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('ecoar-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
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
        <LoginBackgroundLoader />
        <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-x-hidden">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}
