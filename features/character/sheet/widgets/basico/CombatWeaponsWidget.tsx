'use client'

import { resolveWeaponAttackAutoText } from '@/lib/equippedWeaponAttack'
import { getWeaponQualityCombatModifiers } from '@/lib/equipmentQuality'
import { buildWeaponFichaMeta } from '@/lib/weaponSheetLayout'
import WeaponFichaLayout from '@/components/equipment/WeaponFichaLayout'
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
    <div className="grid grid-cols-1 gap-3 p-2 sm:p-2.5">
      {(['slot1', 'slot2'] as EquippedWeaponSlotId[]).map((slotId) => {
        const slotLabel = slotId === 'slot1' ? 'Arma 1' : 'Arma 2'
        const slotState = characterData.equippedWeapons?.[slotId] as EquippedWeaponState | undefined
        const owned = slotState
          ? characterData.itensCatalogo.find((i) => i.instanceId === slotState.instanceId)
          : undefined
        const entry = owned ? weaponCatalogById.get(owned.catalogId) : undefined

        if (!entry || !owned || !slotState) {
          return (
            <div
              key={slotId}
              className="rounded-lg border border-dashed border-slate-300/70 px-3 py-4 dark:border-ecoar-light-900/20"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-ecoar-light-900/50">
                {slotLabel}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-ecoar-light-900/55">
                Equipe uma arma pela Mochila.
              </p>
            </div>
          )
        }

        const qualityMods = getWeaponQualityCombatModifiers(owned.qualidadeNivel ?? 0)
        const singAttack = singularityBonuses.attack ?? 0
        const attackBonus = (slotState.attackBonus ?? 0) + singAttack + qualityMods.attackBonus
        const attackOverride = slotState.overrides?.attackText?.trim()
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
        const attackText = attackOverride || attackAuto || entry.attackTest || '—'

        const metaBase = buildWeaponFichaMeta({
          entry,
          name: owned.nome,
          qualidadeNivel: owned.qualidadeNivel ?? 0,
        })
        const meta = { ...metaBase }
        if (singularityBonuses.maxDamage) {
          const base = Number.parseInt(meta.danoMaximo, 10)
          if (Number.isFinite(base)) {
            meta.danoMaximo = String(base + singularityBonuses.maxDamage)
          }
        }
        if (singularityBonuses.crit) {
          const base = Number.parseInt(meta.acertoCritico, 10)
          if (Number.isFinite(base)) {
            meta.acertoCritico = String(base + singularityBonuses.crit)
          }
        }

        return (
          <WeaponFichaLayout
            key={slotId}
            meta={meta}
            headerRight={
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-ecoar-light-900/50">
                  {slotLabel}
                </span>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => toggleEquipWeaponInstance(slotState.instanceId, false)}
                    className="text-[10px] text-ecoar-magenta hover:underline"
                  >
                    Desequipar
                  </button>
                ) : null}
              </div>
            }
            footer={
              <div className="space-y-2">
                <div>
                  <div className={sheetLabel}>Teste de ataque</div>
                  {attackText !== '—' ? (
                    <button
                      type="button"
                      title={`Rolar ataque (${owned.nome})`}
                      aria-label={`Rolar ataque ${owned.nome}: ${attackText}`}
                      onClick={() =>
                        void roll({
                          label: `${characterName} · Ataque · ${owned.nome}`,
                          expression: attackText,
                          tableId,
                          characterId,
                          characterName,
                        })
                      }
                      className="text-left text-sm font-semibold text-ecoar-teal-700 underline-offset-2 hover:underline dark:text-ecoar-teal-300"
                    >
                      {attackText}
                    </button>
                  ) : (
                    <div className="text-sm text-slate-400">—</div>
                  )}
                </div>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
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
                    <div className="sm:col-span-2">
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
            }
          />
        )
      })}
    </div>
  )
}

export default CombatWeaponsWidget
