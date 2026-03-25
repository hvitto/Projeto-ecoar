import { Suspense } from 'react'
import EquipmentCatalog from '@/components/equipment/EquipmentCatalog'

export const metadata = {
  title: 'Aquisição de equipamentos | ECOAR Beyond',
  description: 'Catálogo de referência de armas, vestuário e utilitários — Ecoar RPG (playtest).',
}

function CatalogFallback() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center text-slate-600 dark:text-ecoar-light-900/60 text-sm">
      Carregando catálogo…
    </div>
  )
}

export default function AquisicaoEquipamentosPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Suspense fallback={<CatalogFallback />}>
        <EquipmentCatalog />
      </Suspense>
    </div>
  )
}
