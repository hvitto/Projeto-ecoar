'use client'

import type { ReactNode } from 'react'
import { formatWeaponDamageDisplay, formatWeaponRangeDisplay } from '@/lib/weaponCatalogDisplay'
import { resolveWeaponAttackAutoText } from '@/lib/equippedWeaponAttack'
import {
  deriveWeaponTraitDisplays,
  formatWeaponDamageTypesList,
  type TraitFieldDisplay,
} from '@/lib/weaponSlotDerivations'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import type {
  CatalogOwnedItem,
  EquippedWeaponSlotId,
  EquippedWeaponState,
  WeaponCatalogEntry,
} from '@/types/equipment'
import type { AttackResolutionCharacterData } from '@/lib/equippedWeaponAttack'

export type EquippedWeaponSlotPanelProps = {
  variant: 'sheet' | 'panel'
  slotId: EquippedWeaponSlotId
  slotLabel: string
  slotState: EquippedWeaponState | undefined
  owned: CatalogOwnedItem | undefined
  entry: WeaponCatalogEntry | undefined
  /** Estado mínimo do personagem para resolver dado de ataque */
  characterData: AttackResolutionCharacterData
  isEditing: boolean
  showEditControls: boolean
  onSetSlot: (slot: EquippedWeaponSlotId, next: EquippedWeaponState | undefined) => void
  onToggleEquipInstance: (instanceId: string, shouldEquip: boolean) => void
}

const lbl = 'text-[11px] text-slate-500 dark:text-ecoar-light-900/60'

function valueClass(raw: string): string {
  const empty = raw === '—' || raw.trim() === ''
  return empty
    ? 'text-sm text-slate-400 dark:text-ecoar-light-900/45 break-words'
    : 'text-sm font-medium text-slate-900 dark:text-ecoar-light-900/90 break-words'
}

function WeaponInfoBlock({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-lg border border-slate-200/80 dark:border-ecoar-light-900/20 bg-slate-50/50 dark:bg-ecoar-dark-900/35 p-2.5 sm:p-3 ${className}`}
    >
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-ecoar-light-900/55 mb-2">
        {title}
      </h4>
      {children}
    </section>
  )
}

function formatTraitWithBonuses(
  trait: TraitFieldDisplay | null,
  extrasOverride: boolean,
  numberBonus: number,
): string {
  if (extrasOverride) return '—'
  if (!trait) return '—'
  if (trait.kind === 'text') return trait.value
  const v = trait.value + numberBonus
  return String(v)
}

export default function EquippedWeaponSlotPanel({
  variant,
  slotId,
  slotLabel,
  slotState,
  owned,
  entry,
  characterData,
  isEditing,
  showEditControls,
  onSetSlot,
  onToggleEquipInstance,
}: EquippedWeaponSlotPanelProps) {
  const properties = entry?.properties ?? []
  const traits = deriveWeaponTraitDisplays(entry, properties)
  const extrasOverride = !!slotState?.overrides?.extrasText?.trim()

  const attackBonus = slotState?.attackBonus ?? 0
  const attackAutoText = resolveWeaponAttackAutoText({ entry, characterData })
  const attackOverrideText = slotState?.overrides?.attackText?.trim()
  const attackBase =
    attackOverrideText && attackOverrideText.length > 0
      ? attackOverrideText
      : attackAutoText ?? entry?.attackTest ?? '—'

  const attackText =
    attackBase !== '—' && attackBonus !== 0
      ? `${attackBase} ${attackBonus > 0 ? '+' : '-'} ${Math.abs(attackBonus)}`
      : attackBase

  const rangeText =
    slotState?.overrides?.rangeText ?? (entry ? formatWeaponRangeDisplay(entry) : '—')
  const damageText =
    slotState?.overrides?.damageText ?? (entry ? formatWeaponDamageDisplay(entry) : '—')
  const damageTypesText = formatWeaponDamageTypesList(entry)

  const critBonus = slotState?.critBonus ?? 0
  const damageBonus = slotState?.damageBonus ?? 0

  const attackCatalog = entry?.attackTest ?? '—'
  const evasion = entry?.evasionTest ?? '—'
  const targetsDisplay = extrasOverride
    ? '—'
    : traits.targets
      ? traits.targets.kind === 'text'
        ? traits.targets.value
        : String(traits.targets.value)
      : '—'

  const shellClass =
    variant === 'panel'
      ? 'p-3 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800/40'
      : 'bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-3 shadow-sm overflow-hidden'

  const headerTitleClass =
    variant === 'panel'
      ? 'text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90'
      : 'text-[11px] font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider'

  const nameClass =
    variant === 'panel'
      ? 'text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 break-words'
      : 'text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-3'

  const blocks = (
    <div className="space-y-3 text-xs">
      <WeaponInfoBlock title="Combate">
        <div className="space-y-2.5">
          <div>
            <div className="text-[11px] font-medium text-slate-600 dark:text-ecoar-light-900/80 break-words leading-snug">
              {attackCatalog !== '—' ? attackCatalog : '—'}
            </div>
            <div
              className={
                attackText === '—' || !String(attackText).trim()
                  ? 'mt-1.5 text-sm text-slate-400 dark:text-ecoar-light-900/45'
                  : 'mt-1.5 text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 break-words'
              }
            >
              {attackText}
            </div>
            {showEditControls && slotState && (
              <div className="mt-1.5 grid grid-cols-12 gap-2">
                <input
                  type="number"
                  disabled={!isEditing}
                  value={slotState.attackBonus ?? 0}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    const nextBonus = Number.isFinite(n) ? n : 0
                    onSetSlot(slotId, { ...slotState, attackBonus: nextBonus })
                  }}
                  className="col-span-4 px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                  placeholder="Bônus"
                />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={slotState.overrides?.attackText ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    onSetSlot(slotId, {
                      ...slotState,
                      overrides: { ...(slotState.overrides ?? {}), attackText: v || undefined },
                    })
                  }}
                  className="col-span-8 px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                  placeholder="Override do ataque (opcional)"
                />
              </div>
            )}
          </div>
        </div>
      </WeaponInfoBlock>

      <WeaponInfoBlock title="Defesa e alcance">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">
          <div>
            <div className={lbl}>Evasão</div>
            <div className={valueClass(evasion)}>{evasion}</div>
          </div>
          <div className="sm:col-span-2">
            <div className={lbl}>Alcance em metros</div>
            <div className={valueClass(rangeText)}>{rangeText}</div>
            {showEditControls && slotState && (
              <input
                type="text"
                disabled={!isEditing}
                value={slotState.overrides?.rangeText ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  onSetSlot(slotId, {
                    ...slotState,
                    overrides: { ...(slotState.overrides ?? {}), rangeText: v || undefined },
                  })
                }}
                className="mt-1.5 w-full px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                placeholder="Override do alcance (opcional)"
              />
            )}
          </div>
        </div>
      </WeaponInfoBlock>

      <WeaponInfoBlock title="Dano">
        <div className="space-y-2.5">
          <div>
            <div className={lbl}>Dano</div>
            <div className={valueClass(damageText)}>{damageText}</div>
            {showEditControls && slotState && (
              <input
                type="text"
                disabled={!isEditing}
                value={slotState.overrides?.damageText ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  onSetSlot(slotId, {
                    ...slotState,
                    overrides: { ...(slotState.overrides ?? {}), damageText: v || undefined },
                  })
                }}
                className="mt-1.5 w-full px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                placeholder="Override do dano (opcional)"
              />
            )}
          </div>
          <div>
            <div className={lbl}>Tipo(s) de dano</div>
            <div className={valueClass(damageTypesText)}>{damageTypesText}</div>
          </div>
        </div>
      </WeaponInfoBlock>

      <WeaponInfoBlock title="Custo e carga">
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">
            <div>
              <div className={lbl}>Custo (catálogo)</div>
              <div className={valueClass(entry?.costLabel ?? '—')}>{entry?.costLabel ?? '—'}</div>
            </div>
            {owned && (
              <div>
                <div className={lbl}>Custo pago (ficha)</div>
                <div className="text-sm font-medium text-slate-900 dark:text-ecoar-light-900/90 tabular-nums">
                  {formatCerosDisplay(owned.custoCeros)}
                </div>
              </div>
            )}
          </div>
          {variant !== 'sheet' && (
            <div>
              <div className={lbl}>Categoria</div>
              <div className={valueClass(entry?.category ?? '—')}>{entry?.category ?? '—'}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            <div>
              <div className={lbl}>Durabilidade</div>
              <div className={valueClass(entry?.durability ?? '—')}>{entry?.durability ?? '—'}</div>
            </div>
            <div>
              <div className={lbl}>Espaço</div>
              <div className={valueClass(entry?.space ?? '—')}>{entry?.space ?? '—'}</div>
            </div>
          </div>
        </div>
      </WeaponInfoBlock>

      <WeaponInfoBlock title="Traços e munição">
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <div className={lbl}>Acerto crítico</div>
              <div className={valueClass(formatTraitWithBonuses(traits.crit, extrasOverride, critBonus))}>
                {formatTraitWithBonuses(traits.crit, extrasOverride, critBonus)}
              </div>
            </div>
            <div>
              <div className={lbl}>Alvos</div>
              <div className={valueClass(targetsDisplay)}>{targetsDisplay}</div>
            </div>
            <div>
              <div className={lbl}>Dano máximo</div>
              <div className={valueClass(formatTraitWithBonuses(traits.maxDamage, extrasOverride, damageBonus))}>
                {formatTraitWithBonuses(traits.maxDamage, extrasOverride, damageBonus)}
              </div>
            </div>
            <div>
              <div className={lbl}>Munição</div>
              <div className={valueClass(entry?.ammoCategory ?? '—')}>{entry?.ammoCategory ?? '—'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div className={lbl}>Recarga</div>
              <div
                className={valueClass(
                  extrasOverride ? '—' : traits.reloadText ?? entry?.reloadNotes ?? '—',
                )}
              >
                {extrasOverride ? '—' : traits.reloadText ?? entry?.reloadNotes ?? '—'}
              </div>
            </div>
            <div>
              <div className={lbl}>Capacidade</div>
              <div
                className={valueClass(
                  extrasOverride
                    ? '—'
                    : traits.capacityText ?? (entry?.capacity ? `Capacidade: ${entry.capacity}` : '—'),
                )}
              >
                {extrasOverride
                  ? '—'
                  : traits.capacityText ?? (entry?.capacity ? `Capacidade: ${entry.capacity}` : '—')}
              </div>
            </div>
          </div>
          {showEditControls && slotState && (
            <input
              type="text"
              disabled={!isEditing}
              value={slotState.overrides?.extrasText ?? ''}
              onChange={(e) => {
                const v = e.target.value
                onSetSlot(slotId, {
                  ...slotState,
                  overrides: { ...(slotState.overrides ?? {}), extrasText: v || undefined },
                })
              }}
              className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
              placeholder="Override de extras (opcional, texto livre)"
            />
          )}
        </div>
      </WeaponInfoBlock>

      <WeaponInfoBlock title="Propriedades">
        <div className="flex flex-wrap gap-1.5">
          {(entry?.properties ?? []).length > 0 ? (
            (entry?.properties ?? []).map((p) => (
              <span
                key={p}
                className="px-2 py-1 rounded-full text-[11px] bg-slate-100 dark:bg-ecoar-light-900/10 text-slate-800 dark:text-ecoar-light-900/80 border border-slate-200 dark:border-ecoar-light-900/15"
              >
                {p}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400 dark:text-ecoar-light-900/45">—</span>
          )}
        </div>
      </WeaponInfoBlock>
    </div>
  )

  if (variant === 'sheet') {
    return (
      <div className={`${shellClass} space-y-3`}>
        <div className="flex items-center justify-between gap-2">
          <h3 className={headerTitleClass}>{slotLabel}</h3>
          <span className="text-[11px] text-slate-500 dark:text-ecoar-light-900/60">{entry?.category ?? '—'}</span>
        </div>
        <div className={nameClass}>{entry?.name ?? 'Não equipada'}</div>
        {!slotState?.instanceId ? (
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
            Equipe uma arma no Inventário para ela aparecer aqui.
          </div>
        ) : !entry ? (
          <div className="text-xs text-ecoar-magenta">Não foi possível carregar os dados do catálogo para este item.</div>
        ) : (
          blocks
        )}
      </div>
    )
  }

  return (
    <div className={`${shellClass} space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={headerTitleClass}>{slotLabel}</div>
          <div className={nameClass}>{entry?.name ?? owned?.nome ?? 'Nenhuma arma equipada'}</div>
        </div>
        {slotState?.instanceId && (
          <button
            type="button"
            onClick={() => onToggleEquipInstance(slotState.instanceId, false)}
            disabled={!isEditing}
            className="shrink-0 px-2 py-1 rounded-md text-[11px] border border-slate-200 dark:border-ecoar-light-900/20 disabled:opacity-60"
          >
            Desequipar
          </button>
        )}
      </div>

      {!slotState?.instanceId ? (
        <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Equipe uma arma no Inventário para ela aparecer aqui.</div>
      ) : !entry ? (
        <div className="text-xs text-ecoar-magenta">Não foi possível carregar os dados do catálogo para este item.</div>
      ) : (
        blocks
      )}
    </div>
  )
}
