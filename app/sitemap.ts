import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ecoar.dev'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/referencia/singularidades`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/referencia/aquisicao-equipamentos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
