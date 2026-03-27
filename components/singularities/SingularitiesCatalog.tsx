'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus, Settings2 } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { getAccessToken } from '@/lib/auth/authService'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { ecoarTypes } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import { creationSingularities } from '@/data/creationSingularities'
import { singularities as legacyCreationSingularities } from '@/data/singularities'
import { getAllMartialSchools } from '@/data/martialSchoolSingularities'
import { races } from '@/data/races'
import { racialSingularities } from '@/data/racialSingularities'
import SingularityCatalogBrowser from '@/components/singularities/SingularityCatalogBrowser'

type AdminPayload = {
  singularities?: unknown
  count?: number
  rawCount?: number
  normalizedCount?: number
  hasValidRows?: boolean
  schemaMissing?: boolean
}
type AdminSystemType = 'ecoar' | 'criacao' | 'marcial' | 'racial'
const VAMPIRE_FAMILIES = ['ravenborne', 'abyssaux', 'kriegshetzer', 'rocha', 'estrella', 'stigia', 'grekhonov', 'orfao'] as const

function parseBonusesSimple(value: unknown): EcoarSingularity['bonuses'] | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as EcoarSingularity['bonuses']
    } catch {
      return undefined
    }
  }
  if (typeof value === 'object') return value as EcoarSingularity['bonuses']
  return undefined
}

function inferActivationTypeSimple(textInput: string): 'passiva' | 'condicional' | 'complexa' | 'ativa' {
  const text = textInput.toLowerCase()
  if (
    text.includes('com uma ação') ||
    text.includes('ação completa') ||
    text.includes('ação menor') ||
    text.includes('ação curta') ||
    text.includes('ação longa') ||
    text.includes('reação')
  ) {
    return 'ativa'
  }
  if (text.includes('enquanto') || text.includes('se ') || text.includes('quando ') || text.includes('sempre')) {
    return 'condicional'
  }
  if (text.includes('placeholder') || text.includes('resistido') || text.includes('tabela')) {
    return 'complexa'
  }
  return 'passiva'
}

function toLabelCase(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

function inferVampireFamily(value: { id: string; sourceGroup?: string; groupLabel?: string }): string | null {
  const lowerCandidates = [value.id, value.sourceGroup ?? '', value.groupLabel ?? ''].map((v) => v.toLowerCase())
  for (const family of VAMPIRE_FAMILIES) {
    if (lowerCandidates.some((candidate) => candidate.includes(family))) return family
  }
  return null
}

function withGroupingMeta(
  row: EcoarSingularity,
  names: { ecoarNameById: Map<string, string>; martialNameById: Map<string, string> },
): EcoarSingularity {
  const systemType = row.systemType ?? 'ecoar'
  if (systemType === 'marcial') {
    const schoolId = row.sourceGroup?.replace('sistema-marcial-', '') ?? row.ecoarId.replace('sistema-marcial-', '')
    const schoolName = names.martialNameById.get(schoolId) ?? toLabelCase(schoolId)
    return {
      ...row,
      groupKey: `marcial:${schoolId}`,
      groupLabel: `Escola Marcial: ${schoolName}`,
      originLabel: `Marcial • ${schoolName}`,
    }
  }
  if (systemType === 'criacao') {
    const group = row.sourceGroup ?? 'sistema-criacao'
    const groupLabel = group === 'sistema-criacao' ? 'Criação' : `Criação: ${toLabelCase(group.replace('sistema-', ''))}`
    return {
      ...row,
      groupKey: `criacao:${group}`,
      groupLabel,
      originLabel: `Criação • ${groupLabel}`,
    }
  }
  if (systemType === 'racial') {
    const raceId = row.sourceGroup?.replace(/^racial-/, '') ?? row.ecoarId.replace(/^racial-/, '')
    const raceName = races.find((r) => r.id === raceId)?.name ?? toLabelCase(raceId)
    return {
      ...row,
      groupKey: `racial:${raceId}`,
      groupLabel: `Racial: ${raceName}`,
      originLabel: `Racial • ${raceName}`,
    }
  }
  const ecoarName = names.ecoarNameById.get(row.ecoarId) ?? toLabelCase(row.ecoarId)
  const family = row.ecoarId === 'vampiro' ? inferVampireFamily(row) : null
  if (family) {
    const familyName = toLabelCase(family)
    return {
      ...row,
      groupKey: `ecoar:vampiro:${family}`,
      groupLabel: `Vampiro • Família ${familyName}`,
      originLabel: `Ecoar • Vampiro • ${familyName}`,
    }
  }
  return {
    ...row,
    groupKey: `ecoar:${row.ecoarId}`,
    groupLabel: `Ecoar: ${ecoarName}`,
    originLabel: `Ecoar • ${ecoarName}`,
  }
}

function normalizeAdminRows(rows: unknown): EcoarSingularity[] {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row): EcoarSingularity | null => {
      if (!row || typeof row !== 'object') return null
      const raw = row as Record<string, unknown>
      const id = typeof raw.id === 'string' ? raw.id : null
      const systemType =
        raw.systemType === 'ecoar' || raw.systemType === 'criacao' || raw.systemType === 'marcial' || raw.systemType === 'racial'
          ? raw.systemType
          : raw.system_type === 'ecoar' || raw.system_type === 'criacao' || raw.system_type === 'marcial' || raw.system_type === 'racial'
            ? raw.system_type
            : 'ecoar'
      const ecoarId =
        typeof raw.ecoarId === 'string'
          ? raw.ecoarId
          : typeof raw.ecoar_id === 'string'
            ? raw.ecoar_id
            : typeof raw.sourceGroup === 'string'
              ? raw.sourceGroup
              : `sistema-${systemType}`
      const name = typeof raw.name === 'string' ? raw.name : null
      const description = typeof raw.description === 'string' ? raw.description : null
      if (!id || !ecoarId || !name || !description) return null

      const activationTypeRaw =
        raw.activationType ?? raw.activation_type
      const activationType =
        activationTypeRaw === 'passiva' ||
        activationTypeRaw === 'condicional' ||
        activationTypeRaw === 'complexa' ||
        activationTypeRaw === 'ativa'
          ? activationTypeRaw
          : 'complexa'

      const cost = typeof raw.cost === 'number' ? raw.cost : 0
      return {
        id,
        ecoarId,
        systemType,
        sourceGroup: typeof raw.sourceGroup === 'string' ? raw.sourceGroup : typeof raw.source_group === 'string' ? raw.source_group : undefined,
        name,
        description,
        cost,
        activationType,
        bonuses: parseBonusesSimple(raw.bonuses ?? raw.bonuses_simple),
      }
    })
    .filter((item): item is EcoarSingularity => item !== null)
}

function resolveAdminResult(data: AdminPayload): { rows: EcoarSingularity[] | null; notice: string | null } {
  const normalized = normalizeAdminRows(data.singularities)
  const validRows =
    typeof data.hasValidRows === 'boolean'
      ? data.hasValidRows
      : typeof data.normalizedCount === 'number'
        ? data.normalizedCount > 0
        : normalized.length > 0

  if (validRows && normalized.length > 0) {
    return { rows: normalized, notice: null }
  }

  if (data.schemaMissing) {
    return {
      rows: null,
      notice: 'Modo admin indisponível: schema do catálogo ausente.',
    }
  }

  const candidateCount = typeof data.count === 'number' ? data.count : data.rawCount
  if (typeof candidateCount === 'number' && candidateCount === 0) {
    return { rows: null, notice: null }
  }

  return {
    rows: null,
    notice: 'Modo admin retornou dados inválidos; exibindo catálogo padrão.',
  }
}

type Editable = {
  id?: string
  ecoarId: string
  systemType: AdminSystemType
  name: string
  description: string
  cost: number
  activationType: 'passiva' | 'condicional' | 'complexa' | 'ativa'
  bonuses?: EcoarSingularity['bonuses']
}

function getStaticSystemRows(): EcoarSingularity[] {
  const out: EcoarSingularity[] = []
  const seen = new Set<string>()
  const pushUnique = (item: EcoarSingularity) => {
    if (seen.has(item.id)) return
    seen.add(item.id)
    out.push(item)
  }

  for (const sing of [...creationSingularities, ...legacyCreationSingularities]) {
    pushUnique({
      id: sing.id,
      ecoarId: 'sistema-criacao',
      systemType: 'criacao',
      sourceGroup: 'sistema-criacao',
      name: sing.name,
      description: sing.description,
      cost: sing.cost,
      activationType: inferActivationTypeSimple(`${sing.name} ${sing.description}`),
      bonuses: {
        attributes: {
          ...(sing.bonuses?.attributes ?? {}),
          ...(sing.penalties?.attributes ?? {}),
        },
        skills: sing.bonuses?.skills ?? undefined,
        corpo: sing.bonuses?.corpo,
        mente: sing.bonuses?.mente,
        folego: sing.bonuses?.folego,
        mana: sing.bonuses?.mana,
      },
    })
  }

  for (const school of getAllMartialSchools()) {
    const sourceGroup = `sistema-marcial-${school.id}`
    for (const sing of school.singularities) {
      pushUnique({
        id: sing.id,
        ecoarId: sourceGroup,
        systemType: 'marcial',
        sourceGroup,
        name: sing.name,
        description: `${sing.description}${sing.effects ? ` ${sing.effects}` : ''}`,
        cost: sing.cost,
        activationType: inferActivationTypeSimple(`${sing.name} ${sing.description} ${sing.effects ?? ''}`),
      })
    }
  }
  for (const sing of racialSingularities) {
    const race = races.find((r) => r.id === sing.raceId)
    pushUnique({
      id: sing.id,
      ecoarId: `racial-${sing.raceId}`,
      systemType: 'racial',
      sourceGroup: `racial-${sing.raceId}`,
      name: sing.name,
      description: `${sing.description}${sing.effects ? ` ${sing.effects}` : ''}`,
      cost: sing.cost,
      activationType: sing.activationType,
      bonuses: sing.bonuses,
      groupKey: `racial:${sing.raceId}`,
      groupLabel: `Racial: ${race?.name ?? sing.raceId}`,
      originLabel: `Racial • ${race?.name ?? sing.raceId}`,
    })
  }

  return out
}

export default function SingularitiesCatalog() {
  const { user, isLoading: authLoading } = useAuth()
  const { ecoarSingularities, source, loading } = useEcoarCatalogData()
  const [showAdminLink, setShowAdminLink] = useState(false)
  const [editing, setEditing] = useState<Editable | null>(null)
  const [adminRows, setAdminRows] = useState<EcoarSingularity[] | null>(null)
  const [adminNotice, setAdminNotice] = useState<string | null>(null)
  const groupNames = useMemo(() => {
    const ecoarNameById = new Map<string, string>()
    for (const eco of ecoarTypes) ecoarNameById.set(eco.id, eco.name)
    const martialNameById = new Map<string, string>()
    for (const school of getAllMartialSchools()) martialNameById.set(school.id, school.name)
    return { ecoarNameById, martialNameById }
  }, [])
  const staticSystemRows = useMemo(() => getStaticSystemRows(), [])

  useEffect(() => {
    if (authLoading || !user || !getAccessToken()) {
      setShowAdminLink(false)
      setAdminRows(null)
      setAdminNotice(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/ecoar-catalog/admin/ping', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        cache: 'no-store',
      })
      if (!cancelled) setShowAdminLink(res.ok)
      if (!res.ok) return
      const adminRes = await fetch('/api/ecoar-catalog/admin', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        cache: 'no-store',
      })
      if (!adminRes.ok) return
      const data = (await adminRes.json()) as AdminPayload
      if (cancelled) return
      const result = resolveAdminResult(data)
      setAdminRows(result.rows)
      setAdminNotice(result.notice)
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  const displayed = useMemo(() => {
    const base = adminRows ?? ecoarSingularities
    const merged = new Map<string, EcoarSingularity>()
    for (const row of base) merged.set(row.id, row)

    // Se o banco ainda não tiver Criação/Marciais, mantém visibilidade via dados estáticos.
    const hasCriacao = base.some((s) => s.systemType === 'criacao')
    const hasMarcial = base.some((s) => s.systemType === 'marcial')
    const hasRacial = base.some((s) => s.systemType === 'racial')
    if (!hasCriacao || !hasMarcial || !hasRacial) {
      for (const row of staticSystemRows) {
        if (!merged.has(row.id)) merged.set(row.id, row)
      }
    }
    return Array.from(merged.values()).map((row) => withGroupingMeta(row, groupNames))
  }, [adminRows, ecoarSingularities, staticSystemRows, groupNames])

  const effectiveNotice = useMemo(() => {
    if (adminNotice) return adminNotice
    if (!adminRows) return null
    const hasCriacao = adminRows.some((s) => s.systemType === 'criacao')
    const hasMarcial = adminRows.some((s) => s.systemType === 'marcial')
    const hasRacial = adminRows.some((s) => s.systemType === 'racial')
    if (!hasCriacao || !hasMarcial || !hasRacial) {
      return 'Criação, Marciais e Raciais ainda não estão completas na base administrativa — a lista abaixo inclui complemento dos arquivos do repositório. As singularidades Ecoar já vêm do banco (API pública).'
    }
    return null
  }, [adminNotice, adminRows])

  return (
    <div className="min-h-0 flex-1 flex flex-col bg-slate-50/80 dark:bg-ecoar-dark-900/50">
      <header className="shrink-0 border-b border-slate-200 dark:border-ecoar-light-900/10 bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 dark:text-ecoar-light-900/65">
              <ArrowLeft className="w-4 h-4" />
              Início
            </Link>
            <div className="h-5 w-px bg-slate-200 dark:bg-ecoar-light-900/15 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 truncate">
                  Singularidades
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-ecoar-light-900/50">
                  Catálogo completo de singularidades e filtros por tipo
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showAdminLink && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70">
                <Settings2 className="w-3.5 h-3.5" />
                Edição admin habilitada
              </span>
            )}
            {showAdminLink && (
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ecoarId: 'sistema-criacao',
                    systemType: 'criacao',
                    name: '',
                    description: '',
                    cost: 0,
                    activationType: 'complexa',
                    bonuses: {},
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-ecoar-teal-300/60 text-ecoar-teal-700 dark:text-ecoar-teal-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova singularidade
              </button>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-6 pb-24">
          {loading && <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">Sincronizando catálogo…</p>}
          {/* Ecoar (API pública): mensagem verde só quando não há aviso de complemento estático, para não soar contraditório. */}
          {source === 'database' && !loading && !effectiveNotice && (
            <p className="text-xs text-ecoar-teal-700 dark:text-ecoar-teal-400/80">
              Singularidades Ecoar carregadas do banco de dados (API pública).
            </p>
          )}
          {effectiveNotice && (
            <p className="text-xs text-amber-700 dark:text-amber-300/90">{effectiveNotice}</p>
          )}

          <SingularityCatalogBrowser
            urlSync
            singularities={displayed}
            onAdminEditItem={
              showAdminLink
                ? (item) =>
                    setEditing({
                      ...item,
                      ecoarId: item.ecoarId,
                      systemType: (item as any).systemType ?? 'ecoar',
                      cost: item.cost,
                      activationType: item.activationType ?? 'complexa',
                    })
                : undefined
            }
          />
        </div>
      </div>

      {editing && showAdminLink && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-ecoar-dark-800 border border-slate-200 dark:border-ecoar-light-900/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90">
              {editing.id ? 'Editar singularidade' : 'Nova singularidade'}
            </h3>
            <input
              value={editing.id ?? ''}
              disabled={Boolean(editing.id)}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, id: e.target.value } : prev))}
              placeholder="ID único (ex: criacao-nome)"
              className="w-full px-3 py-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm disabled:opacity-60"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={editing.systemType}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, systemType: e.target.value as AdminSystemType } : prev))}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm"
              >
                <option value="ecoar">Ecoar</option>
                <option value="criacao">Criação</option>
                <option value="marcial">Marcial</option>
                <option value="racial">Racial</option>
              </select>
              <input
                value={editing.ecoarId}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, ecoarId: e.target.value } : prev))}
                placeholder="Grupo/Origem (ex: sistema-criacao)"
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm"
              />
            </div>
            <input
              value={editing.name}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              className="w-full px-3 py-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm"
            />
            <input
              type="number"
              value={editing.cost}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, cost: Number(e.target.value) || 0 } : prev))}
              className="w-full px-3 py-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm"
            />
            <textarea
              rows={4}
              value={editing.description}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
              className="w-full px-3 py-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm"
            />
            <select
              value={editing.activationType}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, activationType: e.target.value as Editable['activationType'] } : prev))}
              className="w-full px-3 py-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm"
            >
              <option value="passiva">Passiva</option>
              <option value="condicional">Condicional</option>
              <option value="complexa">Complexa</option>
              <option value="ativa">Ativa</option>
            </select>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/85 uppercase tracking-wider">
                Bônus simples
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    'forca',
                    'carisma',
                    'finesse',
                    'inteligencia',
                    'percepcao',
                    'vitalidade',
                    'vontade',
                  ] as const
                ).map((key) => (
                  <label key={key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 dark:text-ecoar-light-900/70 capitalize">{key}</span>
                    <input
                      type="number"
                      step="1"
                      value={editing.bonuses?.attributes?.[key] ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value
                        const value = raw === '' ? undefined : Number(raw)
                        setEditing((prev) => {
                          if (!prev) return prev
                          const attributes = { ...(prev.bonuses?.attributes ?? {}) }
                          if (value === undefined || Number.isNaN(value)) {
                            delete attributes[key]
                          } else {
                            attributes[key] = value
                          }
                          return { ...prev, bonuses: { ...(prev.bonuses ?? {}), attributes } }
                        })
                      }}
                      className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-xs"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['atencao', 'raciocinio', 'reflexos', 'compostura'] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 dark:text-ecoar-light-900/70">{key}</span>
                    <input
                      type="number"
                      step="1"
                      value={editing.bonuses?.skills?.[key] ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value
                        const value = raw === '' ? undefined : Number(raw)
                        setEditing((prev) => {
                          if (!prev) return prev
                          const skills = { ...(prev.bonuses?.skills ?? {}) }
                          if (value === undefined || Number.isNaN(value)) {
                            delete skills[key]
                          } else {
                            skills[key] = value
                          }
                          return { ...prev, bonuses: { ...(prev.bonuses ?? {}), skills } }
                        })
                      }}
                      className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-xs"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['corpo', 'mente', 'folego', 'mana'] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 dark:text-ecoar-light-900/70">{key}</span>
                    <input
                      type="number"
                      step="1"
                      value={(editing.bonuses as any)?.[key] ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value
                        const value = raw === '' ? undefined : Number(raw)
                        setEditing((prev) => {
                          if (!prev) return prev
                          const nextBonuses = { ...(prev.bonuses ?? {}) } as any
                          if (value === undefined || Number.isNaN(value)) delete nextBonuses[key]
                          else nextBonuses[key] = value
                          return { ...prev, bonuses: nextBonuses }
                        })
                      }}
                      className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-xs"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 rounded border text-sm">
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const isCreate = !editing.id
                  const res = await fetch('/api/ecoar-catalog/admin', {
                    method: isCreate ? 'POST' : 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${getAccessToken()}`,
                    },
                    body: JSON.stringify(editing),
                  })
                  if (!res.ok) return
                  const adminRes = await fetch('/api/ecoar-catalog/admin', {
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                    cache: 'no-store',
                  })
                  if (adminRes.ok) {
                    const data = (await adminRes.json()) as AdminPayload
                    const result = resolveAdminResult(data)
                    setAdminRows(result.rows)
                    setAdminNotice(result.notice ?? 'Atualização salva e catálogo sincronizado.')
                  }
                  setEditing(null)
                }}
                className="px-3 py-2 rounded bg-ecoar-teal-600 text-white text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
