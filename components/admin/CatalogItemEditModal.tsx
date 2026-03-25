'use client'

import { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'
import type { CatalogEntry } from '@/types/equipment'
import { parseCatalogPayload } from '@/lib/equipmentCatalogSchemas'
import { getAccessToken } from '@/lib/auth/authService'
import CatalogItemFields from '@/components/admin/CatalogItemFields'

type AdminRow = {
  id: string
  kind: 'weapon' | 'armor' | 'utility'
  is_active: boolean
  updated_at: string
  payload: unknown
}

export default function CatalogItemEditModal({
  open,
  row,
  onClose,
  onSaved,
}: {
  open: boolean
  row: AdminRow
  onClose: () => void
  onSaved: () => Promise<void> | void
}) {
  const [draft, setDraft] = useState<CatalogEntry | null>(null)
  const [active, setActive] = useState<boolean>(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDraft(row.payload as CatalogEntry)
    setActive(row.is_active)
    setFeedback(null)
  }, [open, row.id])

  if (!open) return null
  if (!draft) return null

  const save = async () => {
    setSaving(true)
    setFeedback(null)

    const v = parseCatalogPayload(row.kind, draft)
    if (!v.ok) {
      setFeedback(v.error)
      setSaving(false)
      return
    }

    const token = getAccessToken()
    const res = await fetch(`/api/equipment-catalog/items/${encodeURIComponent(row.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        payload: v.data,
        is_active: active,
        kind: row.kind,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setFeedback(typeof data.error === 'string' ? data.error : 'Erro ao salvar')
      setSaving(false)
      return
    }

    await onSaved()
    onClose()
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-5xl rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white/90 dark:bg-ecoar-dark-800/80 shadow-xl overflow-hidden">
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-ecoar-light-900/15">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 truncate">
              Editar item do catálogo — {draft.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">
              id: <span className="font-mono">{row.id}</span> · kind: {row.kind}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(100dvh-200px)] space-y-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-300"
            />
            Ativo no catálogo público
          </label>

          <CatalogItemFields value={draft} onChange={setDraft} />

          {feedback && <p className="text-xs text-amber-800 dark:text-amber-200">{feedback}</p>}
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-ecoar-light-900/15 bg-white/70 dark:bg-ecoar-dark-900/30">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 text-sm text-slate-700 dark:text-ecoar-light-900/80 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ecoar-teal-600 text-white text-sm disabled:opacity-50"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

