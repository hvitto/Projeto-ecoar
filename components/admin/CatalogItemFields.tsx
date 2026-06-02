'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ARMOR_RESISTANCE_KEYS,
  DAMAGE_TYPE_LABELS_PT,
  type ArmorCatalogEntry,
  type ArmorResistanceKey,
  type ArmorResistanceValues,
  type CatalogEntry,
  type EquipmentDetailSection,
  type UtilityCatalogEntry,
  type WeaponCatalogEntry,
  type WeaponDamageEntry,
} from '@/shared/types/equipment'
import { Textarea } from '@/shared/components/ui'
import { Input } from '@/shared/components/ui'
import {
  vestuarioTabLabels,
  vestuarioTabOrder,
  weaponMacroSectionLabels,
  weaponMacroSectionOrder,
} from '@/data/equipment'

type Props = {
  value: CatalogEntry
  onChange: (next: CatalogEntry) => void
}

function arrayFromMultilineText(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function multilineTextFromArray(arr?: string[]): string {
  if (!arr || arr.length === 0) return ''
  return arr.join('\n')
}

function withCompleteArmorResistances(values?: Partial<ArmorResistanceValues>): ArmorResistanceValues {
  return ARMOR_RESISTANCE_KEYS.reduce((acc, key) => {
    const raw = values?.[key]
    acc[key] = Number.isFinite(raw) ? Number(raw) : 0
    return acc
  }, {} as ArmorResistanceValues)
}

function DetailSectionsEditor({
  value,
  onChange,
}: {
  value?: EquipmentDetailSection[]
  onChange: (next: EquipmentDetailSection[]) => void
}) {
  const items = value ?? []

  return (
    <div className="space-y-3">
      {items.map((s, idx) => (
        <div key={`${s.title}-${idx}`} className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 p-3 space-y-2 bg-white/60 dark:bg-ecoar-dark-800/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              label="Título"
              value={s.title}
              onChange={(e) => {
                const next = [...items]
                next[idx] = { ...next[idx], title: e.target.value }
                onChange(next)
              }}
            />
            <div className="flex items-end justify-end">
              <button
                type="button"
                className="px-3 py-2 rounded-lg text-xs border border-red-300/60 hover:bg-red-50/70 dark:border-red-500/40 dark:hover:bg-red-500/10 text-red-700 dark:text-red-400"
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx)
                  onChange(next)
                }}
              >
                Remover
              </button>
            </div>
          </div>
          <Textarea
            label="Corpo"
            value={s.body}
            onChange={(e) => {
              const next = [...items]
              next[idx] = { ...next[idx], body: e.target.value }
              onChange(next)
            }}
            className="min-h-[120px]"
          />
        </div>
      ))}

      <button
        type="button"
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 text-sm text-slate-700 dark:text-ecoar-light-900/80 hover:bg-slate-50 dark:hover:bg-ecoar-dark-700"
        onClick={() => {
          onChange([...items, { title: '', body: '' }])
        }}
      >
        Adicionar seção
      </button>
    </div>
  )
}

export default function CatalogItemFields({ value, onChange }: Props) {
  const kind = value.kind
  const [armorResistanceDraft, setArmorResistanceDraft] = useState<Partial<Record<ArmorResistanceKey, string>>>({})

  // `CatalogEntry` é uma união; para simplificar a edição por kind, usamos update dinâmico
  // e deixamos a validação estrutural para o `parseCatalogPayload` na API.
  const update = (key: string, nextValue: unknown) => {
    onChange({ ...value, [key]: nextValue } as CatalogEntry)
  }

  useEffect(() => {
    if (kind !== 'armor') return
    const a = value as ArmorCatalogEntry
    const complete = withCompleteArmorResistances(a.resistances)
    const nextDraft: Partial<Record<ArmorResistanceKey, string>> = {}
    ARMOR_RESISTANCE_KEYS.forEach((key) => {
      nextDraft[key] = String(complete[key])
    })
    setArmorResistanceDraft(nextDraft)
  }, [kind, value])

  const common = (
    <div className="space-y-3">
      <Input label="Nome" value={value.name} onChange={(e) => update('name', e.target.value)} />
    </div>
  )

  const formByKind = useMemo(() => {
    if (kind === 'weapon') {
      const w = value as WeaponCatalogEntry
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Classe" value={w.equipmentClass ?? ''} onChange={(e) => update('equipmentClass', e.target.value)} />
            <Input label="Testes de ataque" value={w.attackTest ?? ''} onChange={(e) => update('attackTest', e.target.value)} />
            <Input label="Evasão" value={w.evasionTest ?? ''} onChange={(e) => update('evasionTest', e.target.value)} />
          </div>

          <div className="rounded-lg border border-slate-200/80 dark:border-ecoar-light-900/15 px-3 py-2.5 bg-slate-50/50 dark:bg-ecoar-dark-800/20">
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/55 mb-1.5">
              Macro-seção (organização no catálogo)
            </label>
            <select
              value={w.macroSection}
              onChange={(e) => update('macroSection', e.target.value as WeaponCatalogEntry['macroSection'])}
              className="w-full input-field text-sm"
            >
              {weaponMacroSectionOrder.map((id) => (
                <option key={id} value={id}>
                  {weaponMacroSectionLabels[id]}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 p-3 space-y-3 bg-white/40 dark:bg-ecoar-dark-800/25">
            <div className="text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider">
              Traços da arma
            </div>
            <Input label="Nome do equipamento" value={w.name} onChange={(e) => update('name', e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Categoria" value={w.category ?? ''} onChange={(e) => update('category', e.target.value)} />
              <Input label="Durabilidade" value={w.durability ?? ''} onChange={(e) => update('durability', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Espaços" value={w.space ?? ''} onChange={(e) => update('space', e.target.value)} />
              <Input label="Custo" value={w.costLabel ?? ''} onChange={(e) => update('costLabel', e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 p-3 space-y-3 bg-white/40 dark:bg-ecoar-dark-800/25">
            <div className="text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider">
              Alcance em metros
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Desfavorável (perto)"
                value={w.rangeDisadvantageNear ?? ''}
                onChange={(e) => update('rangeDisadvantageNear', e.target.value)}
              />
              <Input
                label="Alcance efetivo"
                value={w.rangeEffective ?? ''}
                onChange={(e) => update('rangeEffective', e.target.value)}
              />
              <Input
                label="Desfavorável (longe)"
                value={w.rangeDisadvantageFar ?? ''}
                onChange={(e) => update('rangeDisadvantageFar', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider">
              Dano
            </div>
            {w.damageNotes?.trim() && !(w.damageEntries && w.damageEntries.length > 0) && (
              <div className="rounded-lg border border-dashed border-slate-300/90 dark:border-ecoar-light-900/25 px-3 py-2.5 bg-slate-50/60 dark:bg-ecoar-dark-800/25">
                <div className="text-[11px] font-medium text-slate-500 dark:text-ecoar-light-900/55 mb-1">
                  Texto legado (apenas leitura)
                </div>
                <p className="text-sm text-slate-700 dark:text-ecoar-light-900/85 whitespace-pre-wrap">{w.damageNotes}</p>
              </div>
            )}
            {(w.damageEntries ?? []).map((row: WeaponDamageEntry, idx: number) => (
              <div
                key={idx}
                className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 p-3 bg-white/50 dark:bg-ecoar-dark-800/20"
              >
                <div className="flex-1 min-w-[160px]">
                  <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">Tipo</label>
                  <select
                    value={row.type}
                    onChange={(e) => {
                      const next = [...(w.damageEntries ?? [])]
                      next[idx] = { ...next[idx], type: e.target.value as ArmorResistanceKey }
                      update('damageEntries', next)
                    }}
                    className="w-full input-field"
                  >
                    {ARMOR_RESISTANCE_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {DAMAGE_TYPE_LABELS_PT[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-28">
                  <Input
                    label="Quantidade"
                    inputMode="numeric"
                    value={String(row.amount)}
                    onChange={(e) => {
                      const raw = e.target.value.trim()
                      if (!/^-?\d*$/.test(raw)) return
                      const n = raw === '' || raw === '-' ? 0 : parseInt(raw, 10)
                      const next = [...(w.damageEntries ?? [])]
                      next[idx] = { ...next[idx], amount: Number.isFinite(n) ? n : 0 }
                      update('damageEntries', next)
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg text-xs border border-red-300/60 hover:bg-red-50/70 dark:border-red-500/40 dark:hover:bg-red-500/10 text-red-700 dark:text-red-400 shrink-0"
                  onClick={() => {
                    const next = (w.damageEntries ?? []).filter((_, i) => i !== idx)
                    update('damageEntries', next.length > 0 ? next : undefined)
                  }}
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 text-sm text-slate-700 dark:text-ecoar-light-900/80 hover:bg-slate-50 dark:hover:bg-ecoar-dark-700"
              onClick={() => {
                const next: WeaponDamageEntry[] = [...(w.damageEntries ?? []), { type: 'contundente', amount: 0 }]
                update('damageEntries', next)
              }}
            >
              Adicionar dano
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 p-3 space-y-3 bg-white/40 dark:bg-ecoar-dark-800/25">
            <div className="text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider">
              Traços da classe
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Acerto crítico"
                value={w.classTraitCrit ?? ''}
                onChange={(e) => update('classTraitCrit', e.target.value)}
              />
              <Input
                label="Alvos"
                value={w.classTraitTargets ?? ''}
                onChange={(e) => update('classTraitTargets', e.target.value)}
              />
              <Input
                label="Dano máximo"
                value={w.classTraitMaxDamage ?? ''}
                onChange={(e) => update('classTraitMaxDamage', e.target.value)}
              />
            </div>
          </div>

          <Textarea
            label="Propriedades (uma por linha)"
            value={multilineTextFromArray(w.properties)}
            onChange={(e) => update('properties', arrayFromMultilineText(e.target.value))}
            className="min-h-[120px]"
          />
        </div>
      )
    }

    if (kind === 'armor') {
      const a = value as ArmorCatalogEntry
      const resistances = withCompleteArmorResistances(a.resistances)
      return (
        <div className="space-y-4">
          {common}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">Aba</label>
              <select
                value={a.vestuarioTab}
                onChange={(e) => update('vestuarioTab', e.target.value as any)}
                className="w-full input-field"
              >
                {vestuarioTabOrder.map((id) => (
                  <option key={id} value={id}>
                    {vestuarioTabLabels[id]}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Categoria *" required value={a.category ?? ''} onChange={(e) => update('category', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Espaço *" required value={a.space ?? ''} onChange={(e) => update('space', e.target.value)} />
            <Input label="Custo (costLabel) *" required value={a.costLabel ?? ''} onChange={(e) => update('costLabel', e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
              Resistências *
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ARMOR_RESISTANCE_KEYS.map((key) => (
                <Input
                  key={key}
                  label={DAMAGE_TYPE_LABELS_PT[key]}
                  required
                  inputMode="numeric"
                  value={armorResistanceDraft[key] ?? String(resistances[key])}
                  onChange={(e) => {
                    const raw = e.target.value.trim()
                    if (!/^-?\d*$/.test(raw)) return
                    setArmorResistanceDraft((prev) => ({ ...prev, [key]: raw }))
                  }}
                  onBlur={() => {
                    const next = withCompleteArmorResistances(a.resistances)
                    const raw = (armorResistanceDraft[key] ?? '').trim()
                    if (raw === '' || raw === '-') {
                      next[key] = 0
                    } else {
                      const parsed = parseInt(raw, 10)
                      next[key] = Number.isFinite(parsed) ? parsed : 0
                    }
                    update('resistances', next)
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Defesa de crítico *" required value={a.defenseCritico ?? ''} onChange={(e) => update('defenseCritico', e.target.value)} />
            <Input label="Esquiva *" required value={a.esquiva ?? ''} onChange={(e) => update('esquiva', e.target.value)} />
          </div>

          <Input label="Furtividade *" required value={a.furtividade ?? ''} onChange={(e) => update('furtividade', e.target.value)} />

          <Input label="Descrição / Flavour *" required value={a.flavor ?? ''} onChange={(e) => update('flavor', e.target.value)} />

          <Textarea
            label="Propriedades (uma por linha) *"
            value={multilineTextFromArray(a.propriedades)}
            onChange={(e) => update('propriedades', arrayFromMultilineText(e.target.value))}
            className="min-h-[120px]"
          />

          <div>
            <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">Detalhes (seções)</label>
            <DetailSectionsEditor
              value={a.detailSections}
              onChange={(next) => update('detailSections', next)}
            />
          </div>
        </div>
      )
    }

    const u = value as UtilityCatalogEntry
    return (
      <div className="space-y-4">
        {common}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Categoria" value={u.utilityCategory ?? ''} onChange={(e) => update('utilityCategory', e.target.value)} />
          <Input label="Espaço" value={u.space ?? ''} onChange={(e) => update('space', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Custo (costLabel)" value={u.costLabel ?? ''} onChange={(e) => update('costLabel', e.target.value)} />
          <Input label="Cargas" value={u.charges ?? ''} onChange={(e) => update('charges', e.target.value)} />
        </div>

        <Textarea
          label="Efeito"
          value={u.effect ?? ''}
          onChange={(e) => update('effect', e.target.value)}
          className="min-h-[160px]"
        />

        <Input label="Flavour" value={u.flavor ?? ''} onChange={(e) => update('flavor', e.target.value)} />

        <div>
          <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">Detalhes (seções)</label>
          <DetailSectionsEditor
            value={u.detailSections}
            onChange={(next) => update('detailSections', next)}
          />
        </div>
      </div>
    )
  }, [common, kind, onChange, update, value])

  return formByKind
}

