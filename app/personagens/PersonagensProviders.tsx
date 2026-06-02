'use client'

import { ReactNode } from 'react'
import { EquipmentCatalogProvider } from '@/shared/contexts/EquipmentCatalogContext'

export default function PersonagensProviders({ children }: { children: ReactNode }) {
  return <EquipmentCatalogProvider>{children}</EquipmentCatalogProvider>
}
