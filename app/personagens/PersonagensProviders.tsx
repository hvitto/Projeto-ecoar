'use client'

import { ReactNode } from 'react'
import { EquipmentCatalogProvider } from '@/shared/contexts/EquipmentCatalogContext'
import { EcoarCatalogProvider } from '@/lib/ecoarCatalogClient'
import { CatalogBootstrapGate } from '@/shared/components/CatalogBootstrapGate'

export default function PersonagensProviders({ children }: { children: ReactNode }) {
  return (
    <EquipmentCatalogProvider>
      <EcoarCatalogProvider>
        <CatalogBootstrapGate>{children}</CatalogBootstrapGate>
      </EcoarCatalogProvider>
    </EquipmentCatalogProvider>
  )
}
