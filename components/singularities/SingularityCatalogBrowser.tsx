'use client'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import { aggregateSimpleBonuses } from '@/lib/singularityBonuses'

type BrowserMode = 'reference' | 'picker'
type MainTab = 'passivas-condicionais' | 'complexas' | 'ativas'

const TAB_LABELS: Record<MainTab, string> = {
  'passivas-condicionais': 'Passivas e Condicionais',
  complexas: 'Complexas',
  ativas: 'Ativas',
}

function parseTab(v: string | null): MainTab {
  if (v === 'complexas' || v === 'ativas') return v
  return 'passivas-condicionais'
}

function bonusSummary(s: EcoarSingularity): string {
  const bonuses = s.bonuses
  if (!bonuses) return 'Sem bônus simples configurado.'
  const out: string[] = []
  if (bonuses.attributes) {
    Object.entries(bonuses.attributes).forEach(([k, v]) => out.push(`${k}: ${v >= 0 ? '+' : ''}${v}`))
  }
  if (bonuses.skills) {
    Object.entries(bonuses.skills).forEach(([k, v]) => out.push(`${k}: ${v >= 0 ? '+' : ''}${v}`))
  }
  if (typeof bonuses.corpo === 'number') out.push(`Corpo ${bonuses.corpo >= 0 ? '+' : ''}${bonuses.corpo}`)
  if (typeof bonuses.mente === 'number') out.push(`Mente ${bonuses.mente >= 0 ? '+' : ''}${bonuses.mente}`)
  if (typeof bonuses.folego === 'number') out.push(`Fôlego ${bonuses.folego >= 0 ? '+' : ''}${bonuses.folego}`)
  if (typeof bonuses.mana === 'number') out.push(`Mana ${bonuses.mana >= 0 ? '+' : ''}${bonuses.mana}`)
  return out.length ? out.join(' | ') : 'Sem bônus simples configurado.'
}

type SingularidadeEditavel = Pick<EcoarSingularity, 'id' | 'name' | 'description' | 'activationType' | 'bonuses'>

interface Props {
  mode: BrowserMode
  singularities: EcoarSingularity[]
  selectedIds: string[]
  conditionalEnabledIds: string[]
  onToggleSelect?: (id: string, selected: boolean) => void
  onToggleConditional?: (id: string, enabled: boolean) => void
  onAdminEditItem?: (item: SingularidadeEditavel) => void
  urlSync?: boolean
}

export default function SingularityCatalogBrowser({
  mode,
  singularities,
  selectedIds,
  conditionalEnabledIds,
  onToggleSelect,
  onToggleConditional,
  onAdminEditItem,
  urlSync: urlSyncProp,
}: Props) {
  const urlSync = urlSyncProp ?? mode === 'reference'
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [searchInner, setSearchInner] = useState('')
  const [tabInner, setTabInner] = useState<MainTab>('passivas-condicionais')
  const tab = urlSync ? parseTab(sp.get('tab')) : tabInner
  const search = urlSync ? sp.get('q') ?? '' : searchInner
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  const pushQuery = useCallback((patch: Record<string, string | null | undefined>) => {
    const p = new URLSearchParams(sp.toString())
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) p.delete(k)
      else p.set(k, v)
    })
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [pathname, router, sp])

  const setTabWrapped = (next: MainTab) => {
    if (urlSync) pushQuery({ tab: next })
    else setTabInner(next)
  }
  const setSearchWrapped = (next: string) => {
    if (urlSync) pushQuery({ q: next.trim() || null })
    else setSearchInner(next)
  }

  const filtered = useMemo(() => {
    return singularities.filter((s) => {
      if (!deferredSearch) return true
      return `${s.name} ${s.description}`.toLowerCase().includes(deferredSearch)
    })
  }, [deferredSearch, singularities])

  const singularityByIdForTotals = useMemo(() => {
    const map = new Map<string, EcoarSingularity>()
    for (const s of singularities) map.set(s.id, s)
    return map
  }, [singularities])

  const passiveConditionalTotals = useMemo(() => {
    return aggregateSimpleBonuses({
      selectedSingularityIds: selectedIds,
      conditionalEnabledIds: conditionalEnabledIds,
      getEcoarSingularityById: (id) => singularityByIdForTotals.get(id),
    })
  }, [conditionalEnabledIds, selectedIds, singularityByIdForTotals])

  const passiveItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'passiva')
  const conditionalItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'condicional')
  const complexItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'complexa')
  const activeItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'ativa')

  const renderCard = (s: EcoarSingularity, showConditionalBox: boolean) => {
    const selected = selectedIds.includes(s.id)
    const conditionalEnabled = conditionalEnabledIds.includes(s.id)
    return (
      <article key={s.id} className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800/50 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90">{s.name}</h4>
            <p className="text-xs text-slate-600 dark:text-ecoar-light-900/65">{s.description}</p>
          </div>
          {onAdminEditItem && (
            <button
              type="button"
              onClick={() =>
                onAdminEditItem({
                  id: s.id,
                  name: s.name,
                  description: s.description,
                  activationType: s.activationType ?? 'complexa',
                  bonuses: s.bonuses,
                })
              }
              className="px-2 py-1 rounded text-[11px] border border-slate-200 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/65"
            >
              Editar
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-ecoar-light-900/55">{bonusSummary(s)}</p>
        {mode === 'picker' && onToggleSelect && (
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-ecoar-light-900/75">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onToggleSelect(s.id, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 dark:border-ecoar-light-900/30"
            />
            Selecionada
          </label>
        )}
        {showConditionalBox && onToggleConditional && (
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-ecoar-light-900/75">
            <input
              type="checkbox"
              checked={conditionalEnabled}
              onChange={(e) => onToggleConditional(s.id, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 dark:border-ecoar-light-900/30"
            />
            Condição ativa [X]
          </label>
        )}
      </article>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-ecoar-light-900/15 pb-3">
        {(Object.keys(TAB_LABELS) as MainTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTabWrapped(t)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              tab === t
                ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30'
                : 'text-slate-600 dark:text-ecoar-light-900/60 border-slate-200 dark:border-ecoar-light-900/15'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-ecoar-light-900/40" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearchWrapped(e.target.value)}
          placeholder="Buscar singularidade..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/60 text-sm"
        />
      </div>

      {tab === 'passivas-condicionais' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">Passivas</h3>
              {passiveItems.map((s) => renderCard(s, false))}
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">Condicionais</h3>
              {conditionalItems.map((s) => renderCard(s, true))}
            </section>
          </div>

          {mode === 'picker' && (Object.keys(passiveConditionalTotals.attributes).length > 0 ||
            Object.keys(passiveConditionalTotals.skills).length > 0 ||
            passiveConditionalTotals.corpo !== 0 ||
            passiveConditionalTotals.mente !== 0 ||
            passiveConditionalTotals.folego !== 0 ||
            passiveConditionalTotals.mana !== 0) && (
            <div className="p-3 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/60 dark:bg-ecoar-light-900/10 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/85 uppercase tracking-wider">
                Tabela de bônus simples (ativos)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(passiveConditionalTotals.attributes)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <span className="text-slate-600 dark:text-ecoar-light-900/70 capitalize">{k}</span>
                      <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{v >= 0 ? `+${v}` : v}</span>
                    </div>
                  ))}
                {Object.entries(passiveConditionalTotals.skills)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <span className="text-slate-600 dark:text-ecoar-light-900/70">{k}</span>
                      <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{v >= 0 ? `+${v}` : v}</span>
                    </div>
                  ))}
                {passiveConditionalTotals.corpo !== 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-ecoar-light-900/70">corpo</span>
                    <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{passiveConditionalTotals.corpo >= 0 ? `+${passiveConditionalTotals.corpo}` : passiveConditionalTotals.corpo}</span>
                  </div>
                )}
                {passiveConditionalTotals.mente !== 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-ecoar-light-900/70">mente</span>
                    <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{passiveConditionalTotals.mente >= 0 ? `+${passiveConditionalTotals.mente}` : passiveConditionalTotals.mente}</span>
                  </div>
                )}
                {passiveConditionalTotals.folego !== 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-ecoar-light-900/70">folego</span>
                    <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{passiveConditionalTotals.folego >= 0 ? `+${passiveConditionalTotals.folego}` : passiveConditionalTotals.folego}</span>
                  </div>
                )}
                {passiveConditionalTotals.mana !== 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-ecoar-light-900/70">mana</span>
                    <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{passiveConditionalTotals.mana >= 0 ? `+${passiveConditionalTotals.mana}` : passiveConditionalTotals.mana}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'complexas' && <div className="space-y-2">{complexItems.map((s) => renderCard(s, false))}</div>}
      {tab === 'ativas' && <div className="space-y-2">{activeItems.map((s) => renderCard(s, false))}</div>}
    </div>
  )
}
