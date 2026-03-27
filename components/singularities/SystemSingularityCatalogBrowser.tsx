'use client'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import type {
  SystemSingularity,
  SystemSingularityActivationType,
  SystemSingularityKind,
} from '@/lib/systemSingularities'

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

function tabFromActivationType(a: SystemSingularityActivationType): MainTab {
  if (a === 'complexa') return 'complexas'
  if (a === 'ativa') return 'ativas'
  return 'passivas-condicionais'
}

type SelectionByKind = {
  criacao: string[]
  ecoar: string[]
  marciais: string[]
  raciais: string[]
  /** IDs de desvantagens do livro (ex.: devagar); entram nos conflitos de singularidade de criação. */
  desvantagens: string[]
}

type ConditionalEnabledByKind = {
  criacao: string[]
  ecoar: string[]
  marciais: string[]
  raciais: string[]
}

export interface SystemSingularityCatalogBrowserContext {
  nivelAlma: number
  raceId?: string
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}

interface Props {
  mode: BrowserMode
  singularities: SystemSingularity[]
  selectedIdsByKind: SelectionByKind
  conditionalEnabledIdsByKind: ConditionalEnabledByKind
  saldoPe: number
  context: SystemSingularityCatalogBrowserContext
  urlSync?: boolean
  onToggleSelect?: (args: { id: string; kind: SystemSingularityKind; selected: boolean; cost: number }) => void
  onToggleConditional?: (args: { id: string; kind: SystemSingularityKind; enabled: boolean }) => void
}

function computeMissingRequirements(args: {
  sing: SystemSingularity
  selectedIdsByKind: SelectionByKind
  context: SystemSingularityCatalogBrowserContext
}): string[] {
  const { sing, selectedIdsByKind, context } = args
  const missing: string[] = []

  if (sing.kind === 'criacao') {
    const req = sing.requirements
    if (!('conflictWithIds' in req)) return missing
    const conflictWith = req.conflictWithIds ?? []
    const criacao = selectedIdsByKind.criacao ?? []
    const desvantagens = selectedIdsByKind.desvantagens ?? []
    const hasConflict = conflictWith.some(
      (id) => criacao.includes(id) || desvantagens.includes(id),
    )
    if (hasConflict) missing.push('Conflita com escolhas atuais (singularidades/desvantagens)')
    return missing
  }

  if (sing.kind === 'ecoar') {
    const req = sing.requirements
    if (!req || sing.kind !== 'ecoar') return missing
    const ecoarReq = (req as any).requirements
    if (ecoarReq?.previous) {
      if (!selectedIdsByKind.ecoar.includes(ecoarReq.previous)) {
        missing.push(`Requer anterior: ${ecoarReq.previous}`)
      }
    }
    if (typeof ecoarReq?.nivelAlma === 'number') {
      if (context.nivelAlma < ecoarReq.nivelAlma) missing.push(`Requer Nível de Alma ${ecoarReq.nivelAlma}+`)
    }
    const aptReqs = (ecoarReq?.aptitudes ?? {}) as Record<string, number>
    if (Object.keys(aptReqs).length > 0) {
      for (const [aptId, minValue] of Object.entries(aptReqs)) {
        if ((context.aptitudes[aptId] ?? 0) < minValue) missing.push(`Requer aptidão ${aptId} ${minValue}+`)
      }
    }
    const attrReqs = (ecoarReq?.attributes ?? {}) as Record<string, number>
    if (Object.keys(attrReqs).length > 0) {
      for (const [attr, minValue] of Object.entries(attrReqs)) {
        if ((context.attributes[attr] ?? 0) < minValue) missing.push(`Requer atributo ${attr} ${minValue}+`)
      }
    }
    const skillReqs = (ecoarReq?.skills ?? {}) as Record<string, number>
    if (Object.keys(skillReqs).length > 0) {
      for (const [skillId, minLevel] of Object.entries(skillReqs)) {
        const currentLevel = context.skills[skillId]?.level ?? 0
        if (currentLevel < minLevel) missing.push(`Requer ${skillId} nível ${minLevel}+`)
      }
    }
    return missing
  }

  // marciais
  if (sing.kind === 'marcial') {
    const req = sing.requirements
    const martialReqs = (req as any).requirements
    if (martialReqs?.previous) {
      if (!selectedIdsByKind.marciais.includes(martialReqs.previous)) missing.push('Requer singularidade anterior')
    }
    if (typeof martialReqs?.nivelAlma === 'number') {
      if (context.nivelAlma < martialReqs.nivelAlma) missing.push('Nível de Alma insuficiente')
    }
    const mAptReqs = (martialReqs?.aptitudes ?? {}) as Record<string, number>
    if (Object.keys(mAptReqs).length > 0) {
      for (const [aptId, minValue] of Object.entries(mAptReqs)) {
        if ((context.aptitudes[aptId] ?? 0) < minValue) missing.push(`Requer aptidão ${aptId} ${minValue}+`)
      }
    }
    const mAttrReqs = (martialReqs?.attributes ?? {}) as Record<string, number>
    if (Object.keys(mAttrReqs).length > 0) {
      for (const [attr, minValue] of Object.entries(mAttrReqs)) {
        if ((context.attributes[attr] ?? 0) < minValue) missing.push(`Requer atributo ${attr} ${minValue}+`)
      }
    }
    const mSkillReqs = (martialReqs?.skills ?? {}) as Record<string, number>
    if (Object.keys(mSkillReqs).length > 0) {
      for (const [skillId, minLevel] of Object.entries(mSkillReqs)) {
        const currentLevel = context.skills[skillId]?.level ?? 0
        if (currentLevel < minLevel) missing.push(`Requer ${skillId} nível ${minLevel}+`)
      }
    }
  }

  if (sing.kind === 'racial') {
    const req = sing.requirements
    if (!('raceId' in req)) return missing
    if (context.raceId && req.raceId !== context.raceId) {
      missing.push('Não pertence à raça selecionada')
    }
    const previousIds = req.previousIds ?? []
    if (previousIds.length > 0) {
      const selectedRaciais = selectedIdsByKind.raciais ?? []
      for (const prevId of previousIds) {
        if (!selectedRaciais.includes(prevId)) {
          missing.push('Requer talento racial anterior')
          break
        }
      }
    }
    return missing
  }

  return missing
}

function formatCost(cost: number): string {
  if (!cost) return 'Inata (0 PE)'
  return `${cost} PE`
}

function shortBonusDisplay(s: SystemSingularity): string {
  const b = s.bonusesSimpleExtracted
  if (!b) return 'Sem bônus simples configurado'
  const parts: string[] = []

  const addKV = (k: string, v: number) => {
    if (!v) return
    parts.push(`${k}: ${v >= 0 ? '+' : ''}${v}`)
  }

  for (const [k, v] of Object.entries(b.attributes ?? {})) addKV(k, v)
  for (const [k, v] of Object.entries(b.skills ?? {})) addKV(k, v)
  addKV('Corpo', b.corpo)
  addKV('Mente', b.mente)
  addKV('Fôlego', b.folego)
  addKV('Mana', b.mana)

  return parts.length ? parts.join(' | ') : 'Sem bônus simples configurado'
}

export default function SystemSingularityCatalogBrowser({
  mode,
  singularities,
  selectedIdsByKind,
  conditionalEnabledIdsByKind,
  saldoPe,
  context,
  urlSync: urlSyncProp,
  onToggleSelect,
  onToggleConditional,
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

  const pushQuery = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const p = new URLSearchParams(sp.toString())
      Object.entries(patch).forEach(([k, v]) => {
        if (!v) p.delete(k)
        else p.set(k, v)
      })
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, sp],
  )

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
      const haystack = `${s.name} ${s.description}`.toLowerCase()
      return haystack.includes(deferredSearch)
    })
  }, [deferredSearch, singularities])

  const byTab = useMemo(() => {
    return {
      passivasCondicionais: filtered.filter((s) => {
        const a = s.activationType ?? 'complexa'
        return tabFromActivationType(a) === 'passivas-condicionais'
      }),
      complexas: filtered.filter((s) => tabFromActivationType(s.activationType) === 'complexas'),
      ativas: filtered.filter((s) => tabFromActivationType(s.activationType) === 'ativas'),
    }
  }, [filtered])

  const renderCard = (sing: SystemSingularity) => {
    const kind = sing.kind
    const selectedList = ((selectedIdsByKind as any)[kind === 'marcial' ? 'marciais' : kind === 'racial' ? 'raciais' : kind] ?? []) as string[]
    const conditionalList = ((conditionalEnabledIdsByKind as any)[kind === 'marcial' ? 'marciais' : kind === 'racial' ? 'raciais' : kind] ?? []) as string[]
    const isSelected = selectedList.includes(sing.id)
    const condEnabled = conditionalList.includes(sing.id)

    const canAfford = sing.cost <= saldoPe && (sing.cost === 0 || saldoPe >= sing.cost)
    const missingReqs = computeMissingRequirements({ sing, selectedIdsByKind, context })
    const validReq = missingReqs.length === 0
    const canSelect = isSelected || (mode === 'picker' && validReq && canAfford)

    const showConditionalBox = mode === 'picker' && onToggleConditional && sing.activationType === 'condicional' && isSelected

    const showPickerCheckbox = mode === 'picker' && onToggleSelect

    const disabledReason = !isSelected && mode === 'picker' ? (canAfford ? (validReq ? null : missingReqs[0] ?? 'Requisitos não atendidos') : 'Saldo insuficiente') : null

    return (
      <article
        key={sing.id}
        className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800/50 p-3 space-y-2"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90">{sing.name}</h4>
            <p className="text-xs text-slate-600 dark:text-ecoar-light-900/65">{sing.description}</p>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-ecoar-light-900/55 whitespace-nowrap">{formatCost(sing.cost)}</div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-ecoar-light-900/55">{shortBonusDisplay(sing)}</p>

        {disabledReason && (
          <p className="text-[11px] text-ecoar-magenta dark:text-ecoar-magenta/90">{disabledReason}</p>
        )}

        {showPickerCheckbox && (
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-ecoar-light-900/75">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={!canSelect}
              onChange={(e) => onToggleSelect?.({ id: sing.id, kind, selected: e.target.checked, cost: sing.cost })}
              className="h-3.5 w-3.5 rounded border-slate-300 dark:border-ecoar-light-900/30"
            />
            Selecionada
          </label>
        )}

        {showConditionalBox && onToggleConditional && (
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-ecoar-light-900/75">
            <input
              type="checkbox"
              checked={condEnabled}
              onChange={(e) => onToggleConditional({ id: sing.id, kind, enabled: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300 dark:border-ecoar-light-900/30"
            />
            Condição ativa [X]
          </label>
        )}
      </article>
    )
  }

  const passivasCondicionaisItems = byTab.passivasCondicionais
  const complexasItems = byTab.complexas
  const ativasItems = byTab.ativas

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">Passivas</h3>
            {passivasCondicionaisItems
              .filter((s) => (s.activationType ?? 'complexa') === 'passiva')
              .map((s) => renderCard(s))}
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">Condicionais</h3>
            {passivasCondicionaisItems
              .filter((s) => (s.activationType ?? 'complexa') === 'condicional')
              .map((s) => renderCard(s))}
          </section>
        </div>
      )}

      {tab === 'complexas' && <div className="space-y-2">{complexasItems.map((s) => renderCard(s))}</div>}
      {tab === 'ativas' && <div className="space-y-2">{ativasItems.map((s) => renderCard(s))}</div>}
    </div>
  )
}

