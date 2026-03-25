'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAccessToken } from '@/lib/auth/authService'
import { parseCatalogPayload, parseMultiplierTables } from '@/lib/equipmentCatalogSchemas'
import CostMultiplierTables from '@/components/equipment/CostMultiplierTables'
import type { CatalogEntry, CostMultiplierTable } from '@/types/equipment'
import CatalogItemFields from '@/components/admin/CatalogItemFields'

type AdminItem = {
  id: string
  kind: 'weapon' | 'armor' | 'utility'
  is_active: boolean
  updated_at: string
  payload: unknown
}

function authHeaders(): HeadersInit {
  const t = getAccessToken()
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

export default function AdminEquipamentosPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'forbidden' | 'unauthorized' | 'error' | 'ready'>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [items, setItems] = useState<AdminItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draftPayload, setDraftPayload] = useState<CatalogEntry | null>(null)
  const [editorActive, setEditorActive] = useState(true)
  const [itemFeedback, setItemFeedback] = useState<string | null>(null)
  const [itemSaving, setItemSaving] = useState(false)

  const [multJson, setMultJson] = useState('')
  const [multFeedback, setMultFeedback] = useState<string | null>(null)
  const [multSaving, setMultSaving] = useState(false)
  const [schemaHint, setSchemaHint] = useState<string | null>(null)

  const parsedMultipliers = useMemo((): { ok: true; data: CostMultiplierTable[] } | { ok: false; error: string } => {
    try {
      const raw = JSON.parse(multJson) as unknown
      return parseMultiplierTables(raw)
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'JSON inválido' }
    }
  }, [multJson])

  const loadAdmin = useCallback(async () => {
    setLoadState('loading')
    setLoadError(null)
    const res = await fetch('/api/equipment-catalog/admin', { headers: authHeaders(), cache: 'no-store' })
    if (res.status === 401) {
      setLoadState('unauthorized')
      return
    }
    if (res.status === 403) {
      setLoadState('forbidden')
      return
    }
    if (!res.ok) {
      setLoadState('error')
      setLoadError(`Erro ${res.status}`)
      return
    }
    const data = (await res.json()) as {
      items: AdminItem[]
      multiplierTables: CostMultiplierTable[]
      schemaMissing?: boolean
      hint?: string
    }
    setItems(data.items ?? [])
    setMultJson(JSON.stringify(data.multiplierTables ?? [], null, 2))
    setSchemaHint(data.schemaMissing && data.hint ? data.hint : null)
    setLoadState('ready')
    const first = data.items?.[0]
    setSelectedId(first ? first.id : null)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user || !getAccessToken()) {
      setLoadState('unauthorized')
      return
    }
    void loadAdmin()
  }, [authLoading, user, loadAdmin])

  useEffect(() => {
    if (!selectedId) {
      setDraftPayload(null)
      setEditorActive(true)
      return
    }
    const row = items.find((i) => i.id === selectedId)
    if (!row) return
    const payload = row.payload as CatalogEntry
    setDraftPayload(payload)
    setEditorActive(row.is_active)
    setItemFeedback(null)
  }, [selectedId, items])

  const saveItem = async () => {
    const row = items.find((i) => i.id === selectedId)
    if (!row) return
    setItemSaving(true)
    setItemFeedback(null)
    if (!draftPayload) {
      setItemFeedback('Selecione um item válido.')
      setItemSaving(false)
      return
    }

    const v = parseCatalogPayload(row.kind, draftPayload)
    if (!v.ok) {
      setItemFeedback(v.error)
      setItemSaving(false)
      return
    }
    const res = await fetch(`/api/equipment-catalog/items/${encodeURIComponent(row.id)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ payload: v.data, is_active: editorActive, kind: row.kind }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setItemFeedback(typeof data.error === 'string' ? data.error : 'Falha ao salvar')
      setItemSaving(false)
      return
    }
    setItemFeedback('Salvo.')
    await loadAdmin()
    setItemSaving(false)
  }

  const softDeleteItem = async () => {
    const row = items.find((i) => i.id === selectedId)
    if (!row || !confirm(`Desativar "${row.id}" no catálogo? (soft delete)`)) return
    setItemSaving(true)
    setItemFeedback(null)
    const res = await fetch(`/api/equipment-catalog/items/${encodeURIComponent(row.id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) {
      setItemFeedback('Falha ao desativar')
      setItemSaving(false)
      return
    }
    await loadAdmin()
    setItemSaving(false)
  }

  const saveMultipliers = async () => {
    setMultSaving(true)
    setMultFeedback(null)
    if (!parsedMultipliers.ok) {
      setMultFeedback(parsedMultipliers.error)
      setMultSaving(false)
      return
    }
    const res = await fetch('/api/equipment-catalog/multipliers', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(parsedMultipliers.data),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMultFeedback(typeof data.details === 'string' ? data.details : data.error || 'Falha ao salvar')
      setMultSaving(false)
      return
    }
    setMultFeedback('Tabelas salvas.')
    setMultSaving(false)
  }

  if (authLoading || loadState === 'idle' || loadState === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-slate-600 dark:text-ecoar-light-900/60 text-sm">
        Carregando…
      </div>
    )
  }

  if (loadState === 'unauthorized') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-700 dark:text-ecoar-light-900/80">Faça login para acessar esta página.</p>
        <Link href="/" className="text-ecoar-teal-600 dark:text-ecoar-teal-400 text-sm underline">
          Voltar ao início
        </Link>
      </div>
    )
  }

  if (loadState === 'forbidden') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-700 dark:text-ecoar-light-900/80">Sem permissão para gerenciar o catálogo de equipamentos.</p>
        <Link href="/referencia/aquisicao-equipamentos" className="text-ecoar-teal-600 dark:text-ecoar-teal-400 text-sm underline">
          Voltar à referência
        </Link>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-700 dark:text-red-400/90">{loadError ?? 'Erro ao carregar'}</p>
        <button
          type="button"
          onClick={() => void loadAdmin()}
          className="text-sm text-ecoar-teal-600 dark:text-ecoar-teal-400 underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-ecoar-dark-900 text-ecoar-dark-900 dark:text-ecoar-light-900">
      <header className="border-b border-slate-200 dark:border-ecoar-light-900/15 bg-white/90 dark:bg-ecoar-dark-800/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/referencia/aquisicao-equipamentos"
              className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-ecoar-light-900/65 hover:text-ecoar-teal-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Referência
            </Link>
            <h1 className="text-base font-semibold">Admin — catálogo de equipamentos</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">
            Não altere o campo <code className="text-[11px]">id</code> nas fichas já salvas; desative com &quot;ativo&quot; em vez de apagar.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        {schemaHint && (
          <div
            role="alert"
            className="rounded-lg border border-amber-400/50 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200/90"
          >
            <strong className="font-semibold">Banco sem tabelas do catálogo.</strong> {schemaHint}
          </div>
        )}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-ecoar-light-900/60">Itens</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-64 shrink-0">
              <label className="text-xs text-slate-500 dark:text-ecoar-light-900/50 block mb-1">ID</label>
              <select
                className="w-full rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 text-sm px-2 py-2"
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
              >
                {items.length === 0 && <option value="">(nenhum item)</option>}
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.is_active ? '' : '⏸ '}
                    {i.id}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 dark:text-ecoar-light-900/45 mt-2">{items.length} item(ns)</p>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {selectedId && items.some((i) => i.id === selectedId) && (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editorActive}
                        onChange={(e) => setEditorActive(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      Ativo no catálogo público
                    </label>
                    <span className="text-xs text-slate-500">
                      kind: {items.find((i) => i.id === selectedId)?.kind}
                    </span>
                  </div>
                  {draftPayload ? (
                    <CatalogItemFields value={draftPayload} onChange={setDraftPayload} />
                  ) : (
                    <p className="text-xs text-slate-500">Selecione um item.</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={itemSaving}
                      onClick={() => void saveItem()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ecoar-teal-600 text-white text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      Salvar item
                    </button>
                    <button
                      type="button"
                      disabled={itemSaving}
                      onClick={() => void softDeleteItem()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Desativar (soft)
                    </button>
                  </div>
                  {itemFeedback && <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70">{itemFeedback}</p>}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-200 dark:border-ecoar-light-900/15 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-ecoar-light-900/60">
            Tabelas de multiplicadores (JSON)
          </h2>
          <textarea
            value={multJson}
            onChange={(e) => setMultJson(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[200px] font-mono text-xs rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 p-3"
          />
          <button
            type="button"
            disabled={multSaving}
            onClick={() => void saveMultipliers()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ecoar-teal-600 text-white text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Salvar multiplicadores
          </button>
          {multFeedback && <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70">{multFeedback}</p>}
          {parsedMultipliers.ok ? (
            <div className="pt-4">
              <p className="text-xs text-slate-500 mb-2">Pré-visualização</p>
              <CostMultiplierTables tables={parsedMultipliers.data} />
            </div>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-400/90">Pré-visualização indisponível: {parsedMultipliers.error}</p>
          )}
        </section>
      </div>
    </div>
  )
}
