'use client'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import CostMultiplierTables from '@/components/equipment/CostMultiplierTables'
import CatalogItemCard from '@/components/equipment/CatalogItemCard'
import {
  filterArmor,
  filterUtilities,
  filterWeapons,
  getUtilityCategories,
  vestuarioTabLabels,
  vestuarioTabOrder,
  weaponMacroSectionLabels,
  weaponMacroSectionOrder,
} from '@/data/equipment'
import type { ArmorCatalogEntry, CatalogEntry, CostMultiplierTable, UtilityCatalogEntry, WeaponCatalogEntry } from '@/shared/types/equipment'
import type { VestuarioTabId, WeaponMacroSectionId } from '@/shared/types/equipment'
import { formatCerosDisplay, parseCostLabelToCeros } from '@/lib/equipmentCost'

export type EquipmentCatalogBrowserMode = 'reference' | 'picker'

type MainTab = 'armas' | 'vestuario' | 'utilitarios'

const TAB_LABELS: Record<MainTab, string> = {
  armas: 'Armas',
  vestuario: 'Vestuário',
  utilitarios: 'Utilitários',
}

function parseMainTab(v: string | null): MainTab {
  if (v === 'vestuario' || v === 'utilitarios') return v
  return 'armas'
}

function parseWeaponSection(v: string | null): WeaponMacroSectionId | null {
  if (!v) return null
  if (weaponMacroSectionOrder.includes(v as WeaponMacroSectionId)) return v as WeaponMacroSectionId
  return null
}

function parseVestuarioTab(v: string | null): VestuarioTabId {
  if (v === 'capacetes' || v === 'acessorios') return v
  return 'armaduras'
}

export interface EquipmentCatalogBrowserProps {
  mode: EquipmentCatalogBrowserMode
  weaponCatalog: WeaponCatalogEntry[]
  armorCatalog: ArmorCatalogEntry[]
  utilityCatalog: UtilityCatalogEntry[]
  costMultiplierTables: CostMultiplierTable[]
  /** Sincroniza abas/busca com a URL (página de referência). */
  urlSync?: boolean
  saldoDisponivel?: number
  onPickItem?: (entry: CatalogEntry, custoCeros: number) => void
  /** Habilita ícone de edição no card (somente admin). */
  onAdminEditItem?: (entry: CatalogEntry) => void
  showCostMultiplierTables?: boolean
  className?: string
}

export default function EquipmentCatalogBrowser({
  mode,
  weaponCatalog,
  armorCatalog,
  utilityCatalog,
  costMultiplierTables,
  urlSync: urlSyncProp,
  saldoDisponivel = 0,
  onPickItem,
  onAdminEditItem,
  showCostMultiplierTables = true,
  className = '',
}: EquipmentCatalogBrowserProps) {
  const urlSync = urlSyncProp ?? mode === 'reference'
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [mainTabInner, setMainTabInner] = useState<MainTab>('armas')
  const [searchInner, setSearchInner] = useState('')
  const [weaponSectionInner, setWeaponSectionInner] = useState<WeaponMacroSectionId | null>(null)
  const [vestuarioTabInner, setVestuarioTabInner] = useState<VestuarioTabId>('armaduras')
  const [utilCategoryInner, setUtilCategoryInner] = useState<string | null>(null)

  const mainTab = urlSync ? parseMainTab(sp.get('tab')) : mainTabInner
  const search = urlSync ? sp.get('q') ?? '' : searchInner
  const deferredSearch = useDeferredValue(search)
  const weaponSection = urlSync ? parseWeaponSection(sp.get('secao')) : weaponSectionInner
  const vestuarioTab = urlSync ? parseVestuarioTab(sp.get('vestuario')) : vestuarioTabInner
  const utilCategory = urlSync ? sp.get('categoria') : utilCategoryInner

  const pushQuery = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const p = new URLSearchParams(sp.toString())
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') p.delete(k)
        else p.set(k, v)
      })
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, sp]
  )

  const setMainTabWrapped = (t: MainTab) => {
    if (urlSync) {
      pushQuery({ tab: t })
    } else {
      setMainTabInner(t)
    }
  }

  const setSearchWrapped = (q: string) => {
    if (urlSync) {
      pushQuery({ q: q.trim() || null })
    } else {
      setSearchInner(q)
    }
  }

  const setWeaponSectionWrapped = (s: WeaponMacroSectionId | null) => {
    if (urlSync) {
      pushQuery({ secao: s ?? null })
    } else {
      setWeaponSectionInner(s)
    }
  }

  const setVestuarioTabWrapped = (v: VestuarioTabId) => {
    if (urlSync) {
      pushQuery({ vestuario: v })
    } else {
      setVestuarioTabInner(v)
    }
  }

  const setUtilCategoryWrapped = (c: string | null) => {
    if (urlSync) {
      pushQuery({ categoria: c })
    } else {
      setUtilCategoryInner(c)
    }
  }

  const filteredWeapons = useMemo(
    () => filterWeapons(weaponCatalog, deferredSearch, weaponSection),
    [weaponCatalog, deferredSearch, weaponSection]
  )

  const filteredArmor = useMemo(
    () => filterArmor(armorCatalog, deferredSearch, vestuarioTab),
    [armorCatalog, deferredSearch, vestuarioTab]
  )

  const filteredUtils = useMemo(
    () => filterUtilities(utilityCatalog, deferredSearch, utilCategory),
    [utilityCatalog, deferredSearch, utilCategory]
  )

  const utilCategories = useMemo(() => getUtilityCategories(utilityCatalog), [utilityCatalog])

  const tablesForTab = useMemo(() => {
    if (!showCostMultiplierTables) return []
    if (mainTab === 'armas') return costMultiplierTables.filter((t) => t.id === 'weapons')
    if (mainTab === 'vestuario') return costMultiplierTables.filter((t) => t.id === 'clothing')
    return []
  }, [mainTab, showCostMultiplierTables, costMultiplierTables])

  const handlePick = useCallback((entry: CatalogEntry) => {
    if (!onPickItem || mode !== 'picker') return
    const custo = parseCostLabelToCeros(entry.costLabel)
    if (custo === null) return
    onPickItem(entry, custo)
  }, [mode, onPickItem])

  const renderPickerAction = useCallback((entry: CatalogEntry) => {
    if (mode !== 'picker' || !onPickItem) return undefined
    const custo = parseCostLabelToCeros(entry.costLabel)
    const canBuy = custo !== null && custo <= saldoDisponivel
    const disabled = custo === null || !canBuy
    let label = 'Adicionar'
    if (custo === null) label = 'Sem preço'
    else if (custo > saldoDisponivel) label = 'Saldo insuficiente'
    return {
      label,
      disabled,
      onClick: () => handlePick(entry),
    }
  }, [handlePick, mode, onPickItem, saldoDisponivel])

  const renderedWeaponCards = useMemo(
    () =>
      filteredWeapons.map((w) => (
        <CatalogItemCard
          key={w.id}
          entry={w}
          pickerAction={renderPickerAction(w)}
          adminEditAction={onAdminEditItem ? { onEdit: () => onAdminEditItem(w) } : undefined}
        />
      )),
    [filteredWeapons, onAdminEditItem, renderPickerAction]
  )

  const renderedArmorCards = useMemo(
    () =>
      filteredArmor.map((a) => (
        <CatalogItemCard
          key={a.id}
          entry={a}
          pickerAction={renderPickerAction(a)}
          adminEditAction={onAdminEditItem ? { onEdit: () => onAdminEditItem(a) } : undefined}
        />
      )),
    [filteredArmor, onAdminEditItem, renderPickerAction]
  )

  const renderedUtilityCards = useMemo(
    () =>
      filteredUtils.map((u) => (
        <CatalogItemCard
          key={u.id}
          entry={u}
          pickerAction={renderPickerAction(u)}
          adminEditAction={onAdminEditItem ? { onEdit: () => onAdminEditItem(u) } : undefined}
        />
      )),
    [filteredUtils, onAdminEditItem, renderPickerAction]
  )

  return (
    <div className={className}>
      {mode === 'picker' && (
        <div className="mb-4 p-3 rounded-lg border border-ecoar-teal-500/30 bg-ecoar-teal-500/10">
          <p className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
            Saldo disponível: <span className="tabular-nums">{formatCerosDisplay(saldoDisponivel)}</span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-ecoar-light-900/15 pb-3 mb-4">
        {(Object.keys(TAB_LABELS) as MainTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMainTabWrapped(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mainTab === t
                ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border border-ecoar-teal-500/30'
                : 'text-slate-600 dark:text-ecoar-light-900/60 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tablesForTab.length > 0 && <CostMultiplierTables tables={tablesForTab} />}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-ecoar-light-900/40" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearchWrapped(e.target.value)}
          placeholder="Buscar por nome, categoria ou propriedade…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/60 text-sm text-ecoar-dark-900 dark:text-ecoar-light-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ecoar-teal-500/30"
        />
      </div>

      {mainTab === 'armas' && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <nav className="lg:w-56 shrink-0 space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-ecoar-light-900/50 uppercase tracking-wide mb-2">
              Seções
            </div>
            <button
              type="button"
              onClick={() => setWeaponSectionWrapped(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                weaponSection === null
                  ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300'
                  : 'text-slate-600 dark:text-ecoar-light-900/70 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10'
              }`}
            >
              Todas
            </button>
            {weaponMacroSectionOrder.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setWeaponSectionWrapped(id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  weaponSection === id
                    ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300'
                    : 'text-slate-600 dark:text-ecoar-light-900/70 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10'
                }`}
              >
                {weaponMacroSectionLabels[id]}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">{filteredWeapons.length} item(ns)</p>
            {renderedWeaponCards}
            {filteredWeapons.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-ecoar-light-900/50 py-8 text-center">Nenhum resultado.</p>
            )}
          </div>
        </div>
      )}

      {mainTab === 'vestuario' && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <nav className="lg:w-48 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {vestuarioTabOrder.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setVestuarioTabWrapped(id)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                  vestuarioTab === id
                    ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300'
                    : 'text-slate-600 dark:text-ecoar-light-900/70 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10'
                }`}
              >
                {vestuarioTabLabels[id]}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">{filteredArmor.length} item(ns)</p>
            {renderedArmorCards}
            {filteredArmor.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-ecoar-light-900/50 py-8 text-center">Nenhum resultado.</p>
            )}
          </div>
        </div>
      )}

      {mainTab === 'utilitarios' && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <nav className="lg:w-52 shrink-0 flex flex-row lg:flex-col gap-1 flex-wrap lg:flex-nowrap">
            <button
              type="button"
              onClick={() => setUtilCategoryWrapped(null)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm ${
                utilCategory === null
                  ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300'
                  : 'text-slate-600 dark:text-ecoar-light-900/70 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10'
              }`}
            >
              Todas categorias
            </button>
            {utilCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setUtilCategoryWrapped(c)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm text-left ${
                  utilCategory === c
                    ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300'
                    : 'text-slate-600 dark:text-ecoar-light-900/70 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10'
                }`}
              >
                {c}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">{filteredUtils.length} item(ns)</p>
            {renderedUtilityCards}
            {filteredUtils.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-ecoar-light-900/50 py-8 text-center">Nenhum resultado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
