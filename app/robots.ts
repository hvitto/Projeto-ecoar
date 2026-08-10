import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/personagens', '/mesas', '/api/'],
    },
    sitemap: 'https://ecoar.dev/sitemap.xml',
    host: 'https://ecoar.dev',
  }
}
