'use client'

import { formatWeaponDamageDisplay, formatWeaponRangeDisplay } from '@/lib/weaponCatalogDisplay'
import { resolveWeaponAttackAutoText } from '@/lib/equippedWeaponAttack'
import {
  deriveWeaponTraitDisplays,
  formatWeaponDamageTypesList,
} from '@/lib/weaponSlotDerivations'
import type { EquippedWeaponSlotId, EquippedWeaponState } from '@/shared/types/equipment'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetFieldCompact, sheetLabel } from '@/features/character/sheet/sheetChrome'
import { useDiceRoll } from '@/features/dice/DiceRollProvider'

function skillBonusFromAggregates(
  skillId: string,
  singularity: Record<string, number> | undefined,
  equipment: Record<string, number> | undefined,
  book: Record<string, number> | undefined,
): number {
  return (singularity?.[skillId] ?? 0) + (equipment?.[skillId] ?? 0) + (book?.[skillId] ?? 0)
}

export function CombatWeaponsWidget() {
  const {
    characterData,
    isEditing,
    weaponCatalogById,
    setEquippedWeaponSlot,
    toggleEquipWeaponInstance,
    singularityBonuses,
    equipmentMechanicalBonuses,
    bookDisadvantageBonuses,
    effectiveAttributesByKey,
    tableId,
    characterId,
  } = useSheetRuntime()
  const { roll } = useDiceRoll()

  const eqSkills = (equipmentMechanicalBonuses as { skills?: Record<string, number> }).skills
  const bookSkills = (bookDisadvantageBonuses as { skills?: Record<string, number> }).skills
  const characterName = characterData.nome?.trim() || 'Personagem'

  return (
    <div className="grid grid-cols-1 gap-2 p-2 sm:p-2.5 lg:grid-cols-2">
      {(['slot1', 'slot2'] as EquippedWeaponSlotId[]).map((slotId) => {
        const slotLabel = slotId === 'slot1' ? 'Arma 1' : 'Arma 2'
        const slotState = characterData.equippedWeapons?.[slotId] as EquippedWeaponState | undefined
        const owned = slotState
          ? characterData.itensCatalogo.find((i) => i.instanceId === slotState.instanceId)
          : undefined
        const entry = owned ? weaponCatalogById.get(owned.catalogId) : undefined
        const traits = deriveWeaponTraitDisplays(entry, entry?.properties ?? [])
        const singAttack = singularityBonuses.attack ?? 0
        const singDamage = singularityBonuses.damage ?? 0
        const singCrit = singularityBonuses.crit ?? 0
        const singMaxDamage = singularityBonuses.maxDamage ?? 0
        const attackBonus = (slotState?.attackBonus ?? 0) + singAttack
        const attackOverride = slotState?.overrides?.attackText?.trim()
        const attackAuto = resolveWeaponAttackAutoText({
          entry,
          characterData,
          getAttributeMod: (key) =>
            effectiveAttributesByKey[key]?.effectiveMod ??
            ((characterData[key as keyof typeof characterData] as { mod?: number } | undefined)?.mod ??
              0),
          getSkillBonus: (skillId) =>
            skillBonusFromAggregates(skillId, singularityBonuses.skills, eqSkills, bookSkills),
          extraAttackBonus: attackBonus,
        })
        const attackText = attackOverride || attackAuto || entry?.attackTest || '—'
        const rangeText =
          slotState?.overrides?.rangeText ?? (entry ? formatWeaponRangeDisplay(entry) : '—')
        const damageBase =
          slotState?.overrides?.damageText ?? (entry ? formatWeaponDamageDisplay(entry) : '—')
        const damageText =
          damageBase !== '—' && singDamage !== 0
            ? `${damageBase} (${singDamage > 0 ? '+' : ''}${singDamage})`
            : singDamage !== 0 && damageBase === '—'
              ? `(${singDamage > 0 ? '+' : ''}${singDamage} cálculos de dano)`
              : damageBase
        const damageTypes = formatWeaponDamageTypesList(entry)
        const critRaw = traits.crit?.kind === 'number' ? traits.crit.value + singCrit : traits.crit?.value
        const critText = critRaw == null ? '—' : String(critRaw)
        const maxDamageRaw =
          traits.maxDamage?.kind === 'number'
            ? traits.maxDamage.value + singMaxDamage
            : traits.maxDamage?.value
        const maxDamageText = maxDamageRaw == null ? '—' : String(maxDamageRaw)

        return (
          <div
            key={slotId}
            className="rounded-sm border border-slate-300/60 dark:border-ecoar-light-900/15"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 px-2 py-1.5 dark:border-ecoar-light-900/15">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-ecoar-light-900/50">
                  {slotLabel}
                </div>
                <div className="truncate text-xs font-semibold text-slate-900 dark:text-ecoar-light-900/90">
                  {entry?.name ?? 'Não equipada'}
                </div>
              </div>
              {slotState && isEditing ? (
                <button
                  type="button"
                  onClick={() => toggleEquipWeaponInstance(slotState.instanceId, false)}
                  className="shrink-0 text-[10px] text-ecoar-magenta hover:underline"
                >
                  Desequipar
                </button>
              ) : null}
            </div>

            {entry ? (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 p-2 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-2">
                  <div className={sheetLabel}>Ataque</div>
                  {attackText !== '—' ? (
                    <button
                      type="button"
                      title={`Rolar ataque (${entry?.name ?? slotLabel})`}
                      aria-label={`Rolar ataque ${entry?.name ?? slotLabel}: ${attackText}`}
                      onClick={() =>
                        void roll({
                          label: `${characterName} · Ataque · ${entry?.name ?? slotLabel}`,
                          expression: attackText,
                          tableId,
                          characterId,
                          characterName,
                        })
                      }
                      className="text-left text-[11px] font-medium leading-snug text-ecoar-teal-700 underline-offset-2 transition-colors hover:underline dark:text-ecoar-teal-300"
                    >
                      {attackText}
                    </button>
                  ) : (
                    <div className="text-[11px] font-medium leading-snug text-slate-900 dark:text-ecoar-light-900/90">
                      {attackText}
                    </div>
                  )}
                </div>
                <div>
                  <div className={sheetLabel}>Dano</div>
                  <div className="text-[11px] font-medium text-slate-900 dark:text-ecoar-light-900/90">
                    {damageText}
                  </div>
                </div>
                <div>
                  <div className={sheetLabel}>Tipos</div>
                  <div className="text-[11px] text-slate-700 dark:text-ecoar-light-900/80">{damageTypes}</div>
                </div>
                <div>
                  <div className={sheetLabel}>Alcance</div>
                  <div className="text-[11px] text-slate-700 dark:text-ecoar-light-900/80">{rangeText}</div>
                </div>
                <div>
                  <div className={sheetLabel}>Evasão</div>
                  <div className="text-[11px] text-slate-700 dark:text-ecoar-light-900/80">
                    {entry.evasionTest ?? '—'}
                  </div>
                </div>
                <div>
                  <div className={sheetLabel}>Crítico</div>
                  <div className="text-[11px] text-slate-700 dark:text-ecoar-light-900/80">{critText}</div>
                </div>
                <div>
                  <div className={sheetLabel}>Dano máx.</div>
                  <div className="text-[11px] text-slate-700 dark:text-ecoar-light-900/80">{maxDamageText}</div>
                </div>
                <div>
                  <div className={sheetLabel}>Espaço</div>
                  <div className="text-[11px] text-slate-700 dark:text-ecoar-light-900/80">
                    {entry.space ?? '—'}
                  </div>
                </div>
                {isEditing && slotState ? (
                  <div className="col-span-2 sm:col-span-4 grid grid-cols-3 gap-1.5 pt-1">
                    <div>
                      <div className={sheetLabel}>Bônus atq.</div>
                      <input
                        type="number"
                        value={slotState.attackBonus ?? 0}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10)
                          setEquippedWeaponSlot(slotId, {
                            ...slotState,
                            attackBonus: Number.isFinite(n) ? n : 0,
                          })
                        }}
                        className={sheetFieldCompact}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className={sheetLabel}>Override ataque</div>
                      <input
                        type="text"
                        value={slotState.overrides?.attackText ?? ''}
                        onChange={(e) => {
                          const v = e.target.value
                          setEquippedWeaponSlot(slotId, {
                            ...slotState,
                            overrides: { ...(slotState.overrides ?? {}), attackText: v || undefined },
                          })
                        }}
                        className={sheetFieldCompact}
                        placeholder="opcional"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="px-2 py-3 text-[11px] text-slate-500 dark:text-ecoar-light-900/55">
                Equipe uma arma pela Mochila.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CombatWeaponsWidget
