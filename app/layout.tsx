import type { Metadata } from 'next'
import './globals.css'
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
                const theme = localStorage.getItem('ecoar-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.body.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <ThemeProviderWrapper>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
