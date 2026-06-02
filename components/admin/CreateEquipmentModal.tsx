'use client'

import { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'
import type { CatalogEntry } from '@/shared/types/equipment'
import { parseCatalogPayload } from '@/lib/equipmentCatalogSchemas'
import { getAccessToken } from '@/lib/auth/authService'
import CatalogItemFields from '@/components/admin/CatalogItemFields'
import { createDefaultCatalogEntry } from '@/lib/equipmentCatalogDefaults'

type Kind = 'weapon' | 'armor' | 'utility'

export default function CreateEquipmentModal({
  open,
  onClose,
  onCreated,
  existingIds = [],
}: {
  open: boolean
  onClose: () => void
  onCreated: () => Promise<void> | void
  /** Ids já usados no catálogo (evita rascunho duplicado antes do POST). */
  existingIds?: string[]
}) {
  const [kind, setKind] = useState<Kind>('weapon')
  const [newId, setNewId] = useState('')
  const [draft, setDraft] = useState<CatalogEntry | null>(null)
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setKind('weapon')
    setNewId('')
    setDraft(null)
    setActive(true)
    setFeedback(null)
  }, [open])

  const startDraft = () => {
    setFeedback(null)
    const id = newId.trim()
    if (!id) {
      setFeedback('Informe um id único para o equipamento.')
      return
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(id)) {
      setFeedback('Use apenas letras, números, ponto, hífen e sublinhado no id.')
      return
    }
    if (existingIds.includes(id)) {
      setFeedback('Já existe um item com este id.')
      return
    }
    setDraft(createDefaultCatalogEntry(kind, id))
  }

  const save = async () => {
    if (!draft) return
    setSaving(true)
    setFeedback(null)

    const v = parseCatalogPayload(draft.kind, draft)
    if (!v.ok) {
      setFeedback(v.error)
      setSaving(false)
      return
    }

    const token = getAccessToken()
    const res = await fetch('/api/equipment-catalog/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        id: v.data.id,
        kind: v.data.kind,
        payload: v.data,
        is_active: active,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (res.status === 409) {
        setFeedback(typeof data.error === 'string' ? data.error : 'ID já existe no banco.')
      } else {
        setFeedback(typeof data.error === 'string' ? data.error : 'Erro ao criar')
      }
      setSaving(false)
      return
    }

    await onCreated()
    onClose()
    setSaving(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-equipment-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-5xl max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white/95 dark:bg-ecoar-dark-800/95 shadow-xl overflow-hidden">
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-ecoar-light-900/15">
          <h2 id="create-equipment-title" className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">
            Novo equipamento no catálogo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {!draft ? (
            <div className="space-y-3 max-w-md">
              <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70">
                Escolha o tipo e um id único. Depois você preenche os traços do item.
              </p>
              <div>
                <label className="text-xs text-slate-500 dark:text-ecoar-light-900/55 block mb-1">Tipo</label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as Kind)}
                  className="w-full rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 text-sm px-3 py-2"
                >
                  <option value="weapon">Arma</option>
                  <option value="armor">Armadura / vestuário</option>
                  <option value="utility">Utilitário</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-ecoar-light-900/55 block mb-1">Id (único)</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="ex.: minha-espada-01"
                  className="w-full rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 text-sm px-3 py-2"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              {feedback && <p className="text-xs text-amber-800 dark:text-amber-200">{feedback}</p>}
              <button
                type="button"
                onClick={startDraft}
                className="px-4 py-2 rounded-lg bg-ecoar-teal-600 text-white text-sm"
              >
                Continuar
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-ecoar-light-900/55">
                <span>
                  id: <span className="font-mono text-slate-700 dark:text-ecoar-light-900/80">{draft.id}</span> · kind:{' '}
                  {draft.kind}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(null)
                    setFeedback(null)
                  }}
                  className="text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline"
                >
                  Alterar tipo / id
                </button>
              </div>

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
            </>
          )}
        </div>

        {draft && (
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
              {saving ? 'Criando…' : 'Criar no banco'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
