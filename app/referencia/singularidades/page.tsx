import { Suspense } from 'react'
import SingularitiesCatalog from '@/components/singularities/SingularitiesCatalog'

export const metadata = {
  title: 'Singularidades',
  description: 'Catálogo de singularidades com filtros por tipo de ativação.',
  alternates: {
    canonical: '/referencia/singularidades',
  },
  openGraph: {
    url: 'https://ecoar.dev/referencia/singularidades',
    title: 'Singularidades | ECOAR +',
    description: 'Catálogo de singularidades com filtros por tipo de ativação.',
  },
}

function CatalogFallback() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center text-slate-600 dark:text-ecoar-light-900/60 text-sm">
      Carregando singularidades...
    </div>
  )
}

export default function SingularidadesPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Suspense fallback={<CatalogFallback />}>
        <SingularitiesCatalog />
      </Suspense>
    </div>
  )
}
