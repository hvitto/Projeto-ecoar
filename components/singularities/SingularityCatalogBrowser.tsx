'use client'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import type { EcoarSingularity } from '@/data/ecoarSingularities'

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

type GroupedSingularities = {
  key: string
  label: string
  items: EcoarSingularity[]
}

function groupByOrigin(items: EcoarSingularity[]): GroupedSingularities[] {
  const grouped = new Map<string, GroupedSingularities>()
  for (const item of items) {
    const key = item.groupKey ?? `${item.systemType ?? 'ecoar'}:${item.sourceGroup ?? item.ecoarId}`
    const label =
      item.groupLabel ??
      (item.systemType === 'marcial'
        ? `Escola Marcial: ${item.sourceGroup ?? item.ecoarId}`
        : item.systemType === 'criacao'
          ? 'Criação'
          : `Ecoar: ${item.ecoarId}`)
    if (!grouped.has(key)) grouped.set(key, { key, label, items: [] })
    grouped.get(key)!.items.push(item)
  }
  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

type SingularidadeEditavel = Pick<EcoarSingularity, 'id' | 'ecoarId' | 'systemType' | 'name' | 'description' | 'cost' | 'activationType' | 'bonuses'>

interface Props {
  singularities: EcoarSingularity[]
  onAdminEditItem?: (item: SingularidadeEditavel) => void
  urlSync?: boolean
}

export default function SingularityCatalogBrowser({
  singularities,
  onAdminEditItem,
  urlSync: urlSyncProp,
}: Props) {
  const urlSync = urlSyncProp ?? true
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

  const passiveItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'passiva')
  const conditionalItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'condicional')
  const complexItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'complexa')
  const activeItems = filtered.filter((s) => (s.activationType ?? 'complexa') === 'ativa')
  const passiveGroups = useMemo(() => groupByOrigin(passiveItems), [passiveItems])
  const conditionalGroups = useMemo(() => groupByOrigin(conditionalItems), [conditionalItems])
  const complexGroups = useMemo(() => groupByOrigin(complexItems), [complexItems])
  const activeGroups = useMemo(() => groupByOrigin(activeItems), [activeItems])

  const renderCard = (s: EcoarSingularity, showConditionalBox: boolean) => {
    return (
      <article key={s.id} className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800/50 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-ecoar-teal-700 dark:text-ecoar-teal-300">{s.originLabel ?? 'Origem não categorizada'}</p>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90">{s.name}</h4>
            <p className="text-xs text-slate-600 dark:text-ecoar-light-900/65">{s.description}</p>
          </div>
          {onAdminEditItem && (
            <button
              type="button"
              onClick={() =>
                onAdminEditItem({
                  id: s.id,
                  ecoarId: s.ecoarId,
                  systemType: s.systemType,
                  name: s.name,
                  description: s.description,
                  cost: s.cost,
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
        {showConditionalBox && <span className="text-[11px] text-slate-500 dark:text-ecoar-light-900/55">Ativação condicional.</span>}
      </article>
    )
  }

  const renderGroupedSection = (groups: GroupedSingularities[], showConditionalBox: boolean) => {
    if (groups.length === 0) {
      return <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Nenhuma singularidade encontrada para este filtro.</p>
    }
    return (
      <div className="space-y-3">
        {groups.map((group) => (
          <section key={group.key} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-ecoar-light-900/70">{group.label}</h4>
            {group.items.map((s) => renderCard(s, showConditionalBox))}
          </section>
        ))}
      </div>
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
              {renderGroupedSection(passiveGroups, false)}
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">Condicionais</h3>
              {renderGroupedSection(conditionalGroups, true)}
            </section>
          </div>

        </>
      )}

      {tab === 'complexas' && <div className="space-y-2">{renderGroupedSection(complexGroups, false)}</div>}
      {tab === 'ativas' && <div className="space-y-2">{renderGroupedSection(activeGroups, false)}</div>}
    </div>
  )
}
