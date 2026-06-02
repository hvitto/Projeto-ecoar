'use client'

import { ReactNode } from 'react'
import { EquipmentCatalogProvider } from '@/shared/contexts/EquipmentCatalogContext'

export default function ReferenciaLayout({ children }: { children: ReactNode }) {
  return <EquipmentCatalogProvider>{children}</EquipmentCatalogProvider>
}
