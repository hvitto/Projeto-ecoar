'use client'

import { ReactNode } from 'react'
import { EquipmentCatalogProvider } from '@/shared/contexts/EquipmentCatalogContext'
import { EcoarCatalogProvider } from '@/lib/ecoarCatalogClient'
import { CatalogBootstrapGate } from '@/shared/components/CatalogBootstrapGate'
import Header from '@/components/Header'

export default function ReferenciaLayout({ children }: { children: ReactNode }) {
  return (
    <EquipmentCatalogProvider>
      <EcoarCatalogProvider>
        <CatalogBootstrapGate>
          <div className="h-full min-h-0 flex flex-col">
            <Header />
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>
          </div>
        </CatalogBootstrapGate>
      </EcoarCatalogProvider>
    </EquipmentCatalogProvider>
  )
}
