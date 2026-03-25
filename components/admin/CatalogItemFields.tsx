'use client'

import { useMemo } from 'react'
import type { ArmorCatalogEntry, CatalogEntry, EquipmentDetailSection, UtilityCatalogEntry, WeaponCatalogEntry } from '@/types/equipment'
import { Textarea } from '@/components/ui'
import { Input } from '@/components/ui'
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

  // `CatalogEntry` é uma união; para simplificar a edição por kind, usamos update dinâmico
  // e deixamos a validação estrutural para o `parseCatalogPayload` na API.
  const update = (key: string, nextValue: unknown) => {
    onChange({ ...value, [key]: nextValue } as CatalogEntry)
  }

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
          {common}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">Macro-seção</label>
              <select
                value={w.macroSection}
                onChange={(e) => update('macroSection', e.target.value as any)}
                className="w-full input-field"
              >
                {weaponMacroSectionOrder.map((id) => (
                  <option key={id} value={id}>
                    {weaponMacroSectionLabels[id]}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Classe de equipamento" value={w.equipmentClass ?? ''} onChange={(e) => update('equipmentClass', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Categoria" value={w.category ?? ''} onChange={(e) => update('category', e.target.value)} />
            <Input label="Durabilidade" value={w.durability ?? ''} onChange={(e) => update('durability', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Espaço" value={w.space ?? ''} onChange={(e) => update('space', e.target.value)} />
            <Input label="Custo (costLabel)" value={w.costLabel ?? ''} onChange={(e) => update('costLabel', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Teste de ataque" value={w.attackTest ?? ''} onChange={(e) => update('attackTest', e.target.value)} />
            <Input label="Alcance" value={w.rangeNotes ?? ''} onChange={(e) => update('rangeNotes', e.target.value)} />
          </div>

          <Input label="Dano / traços" value={w.damageNotes ?? ''} onChange={(e) => update('damageNotes', e.target.value)} />

          <Input label="Traços da classe" value={w.classTraits ?? ''} onChange={(e) => update('classTraits', e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Munição" value={w.ammoCategory ?? ''} onChange={(e) => update('ammoCategory', e.target.value)} />
            <Input label="Custo munição" value={w.ammoCostPerUnit ?? ''} onChange={(e) => update('ammoCostPerUnit', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Recarga" value={w.reloadNotes ?? ''} onChange={(e) => update('reloadNotes', e.target.value)} />
            <Input label="Capacidade" value={w.capacity ?? ''} onChange={(e) => update('capacity', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Tecnologia" value={w.technology ?? ''} onChange={(e) => update('technology', e.target.value)} />
            <Input label="Flavour" value={w.flavor ?? ''} onChange={(e) => update('flavor', e.target.value)} />
          </div>

          <Textarea
            label="Propriedades (uma por linha)"
            value={multilineTextFromArray(w.properties)}
            onChange={(e) => update('properties', arrayFromMultilineText(e.target.value))}
            className="min-h-[120px]"
          />

          <div>
            <label className="label text-ecoar-dark-700 dark:text-ecoar-light-900 mb-2">Detalhes (seções)</label>
            <DetailSectionsEditor
              value={w.detailSections}
              onChange={(next) => update('detailSections', next)}
            />
          </div>
        </div>
      )
    }

    if (kind === 'armor') {
      const a = value as ArmorCatalogEntry
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
            <Input label="Categoria" value={a.category ?? ''} onChange={(e) => update('category', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Espaço" value={a.space ?? ''} onChange={(e) => update('space', e.target.value)} />
            <Input label="Custo (costLabel)" value={a.costLabel ?? ''} onChange={(e) => update('costLabel', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Resistências" value={a.resistances ?? ''} onChange={(e) => update('resistances', e.target.value)} />
            <Input label="Defesa de crítico" value={a.defenseCritico ?? ''} onChange={(e) => update('defenseCritico', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Esquiva" value={a.esquiva ?? ''} onChange={(e) => update('esquiva', e.target.value)} />
            <Input label="Furtividade" value={a.furtividade ?? ''} onChange={(e) => update('furtividade', e.target.value)} />
          </div>

          <Input label="Flavour" value={a.flavor ?? ''} onChange={(e) => update('flavor', e.target.value)} />

          <Textarea
            label="Propriedades (uma por linha)"
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

