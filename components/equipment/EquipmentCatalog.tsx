'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Settings2 } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import { useEquipmentCatalog } from '@/contexts/EquipmentCatalogContext'
import { useAuth } from '@/contexts/AuthContext'
import { getAccessToken } from '@/lib/auth/authService'
import type { ArmorCatalogEntry, CatalogEntry, CostMultiplierTable, UtilityCatalogEntry, WeaponCatalogEntry } from '@/types/equipment'
import CatalogItemEditModal from '@/components/admin/CatalogItemEditModal'

type AdminItem = {
  id: string
  kind: 'weapon' | 'armor' | 'utility'
  is_active: boolean
  updated_at: string
  payload: unknown
}

export default function EquipmentCatalog() {
  const { weapons, armor, utilities, multiplierTables, loading, error, dataSource } = useEquipmentCatalog()
  const { user, isLoading: authLoading } = useAuth()
  const [showAdminLink, setShowAdminLink] = useState(false)
  const [adminData, setAdminData] = useState<null | {
    items: AdminItem[]
    multiplierTables: CostMultiplierTable[]
    schemaMissing?: boolean
    hint?: string
  }>(null)
  const [editingRow, setEditingRow] = useState<AdminItem | null>(null)

  useEffect(() => {
    if (authLoading || !user || !getAccessToken()) {
      setShowAdminLink(false)
      setAdminData(null)
      setEditingRow(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/equipment-catalog/admin/ping', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        cache: 'no-store',
      })
      if (!cancelled) setShowAdminLink(res.ok)

      if (!res.ok) {
        if (!cancelled) setAdminData(null)
        return
      }

      const adminRes = await fetch('/api/equipment-catalog/admin', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        cache: 'no-store',
      })

      if (!adminRes.ok) {
        if (!cancelled) setAdminData(null)
        return
      }

      const data = (await adminRes.json()) as {
        items: AdminItem[]
        multiplierTables: CostMultiplierTable[]
        schemaMissing?: boolean
        hint?: string
      }
      if (!cancelled) setAdminData(data)
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  // Separar:
  // - `canAdminUseEditor`: o usuário tem permissão e o endpoint admin não indicou schema ausente.
  // - `hasAdminItems`: o endpoint admin já trouxe itens (evita o "aparece e some" trocando listas).
  const canAdminUseEditor = Boolean(adminData && !adminData.schemaMissing)
  const hasAdminItems = Boolean(adminData && !adminData.schemaMissing && adminData.items.length > 0)
  const adminWeapons: WeaponCatalogEntry[] = hasAdminItems
    ? adminData!.items
        .filter((i) => i.kind === 'weapon')
        .map((i) => i.payload as WeaponCatalogEntry)
    : weapons

  const adminArmor: ArmorCatalogEntry[] = hasAdminItems
    ? adminData!.items
        .filter((i) => i.kind === 'armor')
        .map((i) => i.payload as ArmorCatalogEntry)
    : armor

  const adminUtilities: UtilityCatalogEntry[] = hasAdminItems
    ? adminData!.items
        .filter((i) => i.kind === 'utility')
        .map((i) => i.payload as UtilityCatalogEntry)
    : utilities

  const displayMultiplierTables = hasAdminItems ? adminData!.multiplierTables : multiplierTables

  const onAdminEditItem = (entry: CatalogEntry) => {
    if (!canAdminUseEditor) return
    const row = adminData!.items.find((r) => r.id === entry.id)
    if (!row) return
    setEditingRow(row)
  }
  return (
    <div className="min-h-0 flex-1 flex flex-col bg-slate-50/80 dark:bg-ecoar-dark-900/50">
      <header className="shrink-0 border-b border-slate-200 dark:border-ecoar-light-900/10 bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-ecoar-light-900/65 hover:text-ecoar-teal-600 dark:hover:text-ecoar-teal-400 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Início
            </Link>
            <div className="h-5 w-px bg-slate-200 dark:bg-ecoar-light-900/15 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 truncate">
                  Aquisição de equipamentos
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-ecoar-light-900/50">
                  Ecoar RPG (playtest) — referência de custos e traços
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showAdminLink && (
              <Link
                href="/admin/equipamentos"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Gerenciar catálogo
              </Link>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-6 pb-24">
          <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70 leading-relaxed">
            Armas alinham-se ao estilo de luta; poucas escolas marciais causam dano relevante sem uma boa arma. Os multiplicadores
            abaixo aplicam-se ao custo base conforme o grupo e o estilo (Reclusa, Vapor-Alquímico, Darenferrum, Imaculada, Páginas).
            Conferir sempre o PDF oficial para dúvidas.
          </p>

          {loading && (
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">Sincronizando catálogo com o servidor…</p>
          )}
          {error && (
            <p className="text-xs text-amber-700 dark:text-amber-400/90">
              Não foi possível carregar o catálogo remoto ({error}). Exibindo dados locais.
            </p>
          )}
          {dataSource === 'database' && !loading && (
            <p className="text-xs text-ecoar-teal-700 dark:text-ecoar-teal-400/80">Catálogo carregado do banco de dados.</p>
          )}

          <EquipmentCatalogBrowser
            mode="reference"
            urlSync
            showCostMultiplierTables
            weaponCatalog={adminWeapons}
            armorCatalog={adminArmor}
            utilityCatalog={adminUtilities}
            costMultiplierTables={displayMultiplierTables}
          onAdminEditItem={canAdminUseEditor ? onAdminEditItem : undefined}
          />
        </div>
      </div>

      {editingRow && canAdminUseEditor && (
        <CatalogItemEditModal
          open
          row={editingRow}
          onClose={() => setEditingRow(null)}
          onSaved={async () => {
            const adminRes = await fetch('/api/equipment-catalog/admin', {
              headers: { Authorization: `Bearer ${getAccessToken()}` },
              cache: 'no-store',
            })
            if (!adminRes.ok) return
            const data = (await adminRes.json()) as {
              items: AdminItem[]
              multiplierTables: CostMultiplierTable[]
              schemaMissing?: boolean
              hint?: string
            }
            setAdminData(data)
            setEditingRow(null)
          }}
        />
      )}
    </div>
  )
}
