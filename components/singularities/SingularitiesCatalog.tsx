'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Settings2 } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { getAccessToken } from '@/lib/auth/authService'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import SingularityCatalogBrowser from '@/components/singularities/SingularityCatalogBrowser'

type Editable = {
  id: string
  name: string
  description: string
  activationType: 'passiva' | 'condicional' | 'complexa' | 'ativa'
  bonuses?: EcoarSingularity['bonuses']
}

export default function SingularitiesCatalog() {
  const { user, isLoading: authLoading } = useAuth()
  const { ecoarSingularities, source, loading } = useEcoarCatalogData()
  const [showAdminLink, setShowAdminLink] = useState(false)
  const [editing, setEditing] = useState<Editable | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [conditionalEnabled, setConditionalEnabled] = useState<string[]>([])
  const [adminRows, setAdminRows] = useState<EcoarSingularity[] | null>(null)

  useEffect(() => {
    if (authLoading || !user || !getAccessToken()) {
      setShowAdminLink(false)
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
      const data = (await adminRes.json()) as { singularities?: EcoarSingularity[] }
      if (!cancelled && Array.isArray(data.singularities)) setAdminRows(data.singularities)
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, user])

  const displayed = useMemo(() => adminRows ?? ecoarSingularities, [adminRows, ecoarSingularities])

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
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 space-y-6 pb-24">
          {loading && <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">Sincronizando catálogo…</p>}
          {source === 'database' && !loading && (
            <p className="text-xs text-ecoar-teal-700 dark:text-ecoar-teal-400/80">Catálogo carregado do banco de dados.</p>
          )}

          <SingularityCatalogBrowser
            mode="reference"
            urlSync
            singularities={displayed}
            selectedIds={selectedIds}
            conditionalEnabledIds={conditionalEnabled}
            onToggleSelect={(id, selected) =>
              setSelectedIds((prev) => (selected ? [...prev.filter((it) => it !== id), id] : prev.filter((it) => it !== id)))
            }
            onToggleConditional={(id, enabled) =>
              setConditionalEnabled((prev) => (enabled ? [...prev.filter((it) => it !== id), id] : prev.filter((it) => it !== id)))
            }
            onAdminEditItem={
              showAdminLink
                ? (item) =>
                    setEditing({
                      ...item,
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
            <h3 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90">Editar singularidade</h3>
            <input
              value={editing.name}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
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
                  const res = await fetch('/api/ecoar-catalog/admin', {
                    method: 'PUT',
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
                    const data = (await adminRes.json()) as { singularities?: EcoarSingularity[] }
                    if (Array.isArray(data.singularities)) setAdminRows(data.singularities)
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
