'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check, Pencil } from 'lucide-react'
import {
  ARMOR_RESISTANCE_KEYS,
  type ArmorCatalogEntry,
  type ArmorResistanceKey,
  type UtilityCatalogEntry,
  type WeaponCatalogEntry,
} from '@/types/equipment'
import { formatWeaponDamageDisplay, formatWeaponRangeDisplay } from '@/lib/weaponCatalogDisplay'

type Entry = WeaponCatalogEntry | ArmorCatalogEntry | UtilityCatalogEntry

const RESISTANCE_ABBREV: Record<ArmorResistanceKey, string> = {
  contundente: 'Con',
  cortante: 'Cor',
  perfurante: 'Per',
  balistico: 'Bal',
  esmagador: 'Esm',
  explosivo: 'Exp',
  ardente: 'Ard',
  congelante: 'Conj',
  eletrico: 'Ele',
  corrosivo: 'Corr',
  magico: 'Mag',
  toxico: 'Tox',
}

/** Payload do banco pode omitir `resistances`; nunca acessar propriedades sem fallback. */
function armorResistancesSummary(entry: ArmorCatalogEntry): string {
  const r = entry.resistances
  return ARMOR_RESISTANCE_KEYS.map((key) => {
    const n = Number(r?.[key] ?? 0)
    const v = Number.isFinite(n) ? n : 0
    return `${RESISTANCE_ABBREV[key]} ${v}`
  }).join(' | ')
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="text-xs">
      <span className="text-slate-500 dark:text-ecoar-light-900/50">{label}: </span>
      <span className="text-ecoar-dark-800 dark:text-ecoar-light-900/85">{value}</span>
    </div>
  )
}

export default function CatalogItemCard({
  entry,
  pickerAction,
  adminEditAction,
}: {
  entry: Entry
  pickerAction?: { label: string; disabled: boolean; onClick: () => void }
  adminEditAction?: { onEdit: () => void }
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyName = () => {
    void navigator.clipboard.writeText(entry.name).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isWeapon = entry.kind === 'weapon'
  const isArmor = entry.kind === 'armor'
  const isUtil = entry.kind === 'utility'

  return (
    <article className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/12 bg-white/80 dark:bg-ecoar-dark-800/40 overflow-hidden">
      <div className="flex items-start gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-0.5 p-0.5 rounded text-slate-500 hover:text-ecoar-teal-600 dark:text-ecoar-light-900/50 dark:hover:text-ecoar-teal-400 shrink-0"
          aria-expanded={open}
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">{entry.name}</h4>
            {isWeapon && entry.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ecoar-teal-500/10 text-ecoar-teal-700 dark:text-ecoar-teal-400/90 border border-ecoar-teal-500/20">
                {entry.category}
              </span>
            )}
            {isArmor && entry.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-ecoar-light-900/10 text-slate-600 dark:text-ecoar-light-900/70">
                {entry.category}
              </span>
            )}
            {isUtil && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-ecoar-light-900/10 text-slate-600 dark:text-ecoar-light-900/70">
                {entry.utilityCategory ?? '—'}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-ecoar-light-900/60">
            {isWeapon && <span>{entry.equipmentClass}</span>}
            {entry.costLabel && <span className="tabular-nums">{entry.costLabel}</span>}
            {isWeapon && entry.space && <span>Espaço {entry.space}</span>}
            {isArmor && entry.space && <span>Espaço {entry.space}</span>}
            {isUtil && entry.space && <span>Espaço {entry.space}</span>}
            {isWeapon && entry.durability && <span>Dur. {entry.durability}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {adminEditAction && (
            <button
              type="button"
              onClick={adminEditAction.onEdit}
              className="p-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/15 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10 text-ecoar-teal-700 dark:text-ecoar-teal-300 hover:text-ecoar-teal-900 dark:hover:text-ecoar-teal-200"
              title="Editar item"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {pickerAction && (
            <button
              type="button"
              disabled={pickerAction.disabled}
              onClick={pickerAction.onClick}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-ecoar-teal-500/40 bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 hover:bg-ecoar-teal-500/25 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {pickerAction.label}
            </button>
          )}
          <button
            type="button"
            onClick={copyName}
            className="p-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/15 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10 text-slate-500 dark:text-ecoar-light-900/60"
            title="Copiar nome"
          >
            {copied ? <Check className="w-4 h-4 text-ecoar-teal-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-3 sm:px-4 pb-4 pt-0 pl-11 sm:pl-12 space-y-3 border-t border-slate-100 dark:border-ecoar-light-900/10">
          {isWeapon && (
            <>
              <Field label="Testes de ataque" value={entry.attackTest} />
              <Field label="Evasão" value={entry.evasionTest} />
              <Field label="Alcance em metros" value={formatWeaponRangeDisplay(entry)} />
              <Field label="Dano" value={formatWeaponDamageDisplay(entry)} />
              {(() => {
                const hasStructured =
                  Boolean(entry.classTraitCrit?.trim()) ||
                  Boolean(entry.classTraitTargets?.trim()) ||
                  Boolean(entry.classTraitMaxDamage?.trim())
                if (hasStructured) {
                  return (
                    <>
                      <Field label="Acerto crítico" value={entry.classTraitCrit} />
                      <Field label="Alvos" value={entry.classTraitTargets} />
                      <Field label="Dano máximo" value={entry.classTraitMaxDamage} />
                    </>
                  )
                }
                const legacy = entry.classTraits?.trim()
                return legacy ? <Field label="Traços da classe" value={legacy} /> : null
              })()}
              {Array.isArray(entry.properties) && entry.properties.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-ecoar-light-900/50 mb-1">Propriedades</div>
                  <ul className="text-xs list-disc pl-4 text-ecoar-dark-700 dark:text-ecoar-light-900/75 space-y-0.5">
                    {entry.properties.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {isArmor && (
            <>
              <Field label="Resistências" value={armorResistancesSummary(entry)} />
              <Field label="Defesa de crítico" value={entry.defenseCritico} />
              <Field label="Esquiva" value={entry.esquiva} />
              <Field label="Furtividade" value={entry.furtividade} />
              {entry.flavor && <p className="text-xs text-slate-600 dark:text-ecoar-light-900/65">{entry.flavor}</p>}
              {Array.isArray(entry.propriedades) && entry.propriedades.length > 0 && (
                <ul className="text-xs list-disc pl-4 text-ecoar-dark-700 dark:text-ecoar-light-900/75 space-y-0.5">
                  {entry.propriedades.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </>
          )}
          {isUtil && (
            <>
              <Field label="Cargas" value={entry.charges} />
              {entry.effect && <p className="text-xs text-ecoar-dark-700 dark:text-ecoar-light-900/80 whitespace-pre-wrap">{entry.effect}</p>}
              {entry.flavor && <p className="text-xs text-slate-600 dark:text-ecoar-light-900/65 italic">{entry.flavor}</p>}
            </>
          )}
          {entry.detailSections?.map((s) => (
            <div key={s.title}>
              <div className="text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/85">{s.title}</div>
              <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70 whitespace-pre-wrap">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
