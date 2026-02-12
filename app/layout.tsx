import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'ECOAR Beyond - Character Sheet',
  description: 'Sistema de criação e gerenciamento de personagens para o RPG ECOAR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
      <body className="flex flex-col min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
