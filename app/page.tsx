import type { Metadata } from 'next'
import HomePageClient from '@/app/HomePageClient'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: 'https://ecoar.dev',
  },
}

export default function Home() {
  return <HomePageClient />
}
