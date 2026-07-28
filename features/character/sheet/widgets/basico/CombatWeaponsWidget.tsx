'use client'

import { resolveWeaponAttackAutoText } from '@/lib/equippedWeaponAttack'
import { getWeaponQualityCombatModifiers } from '@/lib/equipmentQuality'
import { buildWeaponFichaMeta, type WeaponFichaMeta } from '@/lib/weaponSheetLayout'
import type { EquippedWeaponSlotId, EquippedWeaponState } from '@/shared/types/equipment'
import { useDiceRoll } from '@/features/dice/DiceRollProvider'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetAttackRollBlock,
  sheetAttackRollBlockQuiet,
  sheetCoord,
  sheetData,
  sheetFieldCompact,
  sheetLabel,
  sheetMeta,
  sheetStatCell,
  sheetTextLink,
} from '@/features/character/sheet/sheetChrome'

function skillBonusFromAggregates(
  skillId: string,
  singularity: Record<string, number> | undefined,
  equipment: Record<string, number> | undefined,
  book: Record<string, number> | undefined,
): number {
  return (singularity?.[skillId] ?? 0) + (equipment?.[skillId] ?? 0) + (book?.[skillId] ?? 0)
}

function isBlank(value: string | undefined): boolean {
  const v = value?.trim()
  return !v || v === '—'
}

function StatCell({ label, value }: { label: string; value: string }) {
  if (isBlank(value)) return null
  return (
    <div className="min-w-0">
      <div className={`${sheetMeta} mb-0.5 text-ecoar-teal/85`}>{label}</div>
      <div className={`break-words ${sheetData}`}>{value}</div>
    </div>
  )
}

function RangeWeaponCard({
  slotLabel,
  meta,
  attackText,
  isEditing,
  canUnequip,
  onUnequip,
  onRoll,
  attackBonus,
  attackOverride,
  onAttackBonusChange,
  onAttackOverrideChange,
}: {
  slotLabel: string
  meta: WeaponFichaMeta
  attackText: string
  isEditing: boolean
  canUnequip: boolean
  onUnequip: () => void
  onRoll: () => void
  attackBonus: number
  attackOverride: string
  onAttackBonusChange: (n: number) => void
  onAttackOverrideChange: (v: string) => void
}) {
  const identityBits = [
    meta.categoria,
    meta.qualidadeLabel,
    [meta.habilidade, meta.especialidade, meta.atributo].filter((x) => !isBlank(x)).join(' · '),
  ].filter((x) => !isBlank(x) && x.length > 0)

  const secondaryBits = [
    !isBlank(meta.durabilidade) ? `Durab. ${meta.durabilidade}` : null,
    !isBlank(meta.municao) ? `Mun. ${meta.municao}` : null,
  ].filter(Boolean) as string[]

  const propriedades = meta.propriedades.filter((p) => !/^Capacidade\b/i.test(p))
  const hasRange =
    !isBlank(meta.rangeNear) || !isBlank(meta.rangeEffective) || !isBlank(meta.rangeFar)
  const hasDamage = meta.damageLines.length > 0
  const hasExtras =
    !isBlank(meta.acertoCritico) || !isBlank(meta.alvos) || !isBlank(meta.danoMaximo)
  const hasProps = propriedades.length > 0
  const hasCombatGrid = hasRange || hasDamage || hasExtras || hasProps
  const hasLoadout =
    !isBlank(meta.recarga) || !isBlank(meta.capacidade) || !isBlank(meta.estoque)
  const canRoll = !isBlank(attackText)

  return (
    <article className={`${sheetStatCell} flex min-w-0 flex-col !bg-[#0a0a0a]/80`}>
      <header className="flex items-start justify-between gap-2 border-b border-ecoar-teal/30 px-3 pb-2 pt-2.5">
        <div className="min-w-0">
          <div className={sheetCoord}>{slotLabel}</div>
          <h4 className="mt-1 break-words font-display text-base uppercase leading-[1.05] tracking-[-0.02em] text-[#f5f5f5] sm:text-lg">
            {meta.name}
          </h4>
          {identityBits.length > 0 ? (
            <p className="mt-1.5 break-words font-mono text-xs leading-snug text-[#adb5bd]">
              {identityBits.join(' · ')}
            </p>
          ) : null}
          {secondaryBits.length > 0 ? (
            <p className="mt-0.5 font-mono text-xs leading-snug text-[#adb5bd]/85">
              {secondaryBits.join(' · ')}
            </p>
          ) : null}
        </div>
        {canUnequip ? (
          <button type="button" onClick={onUnequip} className={`shrink-0 ${sheetTextLink}`}>
            Desequipar
          </button>
        ) : null}
      </header>

      <div className="border-b border-ecoar-teal/30 bg-[#0a0a0a] px-2.5 py-2.5">
        {canRoll ? (
          <button
            type="button"
            title={`Rolar ataque (${meta.name})`}
            aria-label={`Rolar ataque ${meta.name}: ${attackText}`}
            onClick={onRoll}
            className={isEditing ? sheetAttackRollBlockQuiet : sheetAttackRollBlock}
          >
            <span
              className={`${sheetMeta} mb-0.5 block tracking-[0.1em] ${
                isEditing ? 'text-ecoar-teal/80' : 'text-[var(--ecoar-accent-ink)]/75'
              }`}
            >
              Teste de ataque
            </span>
            <span className="block font-mono text-base font-semibold tabular-nums tracking-normal sm:text-lg">
              {attackText}
            </span>
          </button>
        ) : (
          <div className="rounded-none border border-dashed border-ecoar-teal/30 px-2.5 py-2">
            <div className={sheetLabel}>Teste de ataque</div>
            <p className="font-mono text-sm text-[#adb5bd]">—</p>
          </div>
        )}

        {isEditing ? (
          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            <div>
              <div className={sheetLabel}>Bônus atq.</div>
              <input
                type="number"
                value={attackBonus}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10)
                  onAttackBonusChange(Number.isFinite(n) ? n : 0)
                }}
                className={sheetFieldCompact}
              />
            </div>
            <div className="sm:col-span-2">
              <div className={sheetLabel}>Texto do ataque</div>
              <input
                type="text"
                value={attackOverride}
                onChange={(e) => onAttackOverrideChange(e.target.value)}
                className={sheetFieldCompact}
                placeholder="ex.: 2d10+3"
                aria-label="Texto do ataque personalizado"
              />
            </div>
          </div>
        ) : null}
      </div>

      {hasCombatGrid ? (
        <div className="grid grid-cols-2 gap-px bg-ecoar-teal/25 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
          {hasRange ? (
            <div className="space-y-1.5 bg-[#0a0a0a] px-2.5 py-2">
              <div className={`${sheetCoord} mb-1`}>Alcance</div>
              <StatCell label="Perto" value={meta.rangeNear} />
              <StatCell label="Efetivo" value={meta.rangeEffective} />
              <StatCell label="Longe" value={meta.rangeFar} />
            </div>
          ) : null}
          {hasDamage ? (
            <div className="space-y-1.5 bg-[#0a0a0a] px-2.5 py-2">
              <div className={`${sheetCoord} mb-1`}>Dano</div>
              {meta.damageLines.map((line) => (
                <StatCell key={`${line.label}-${line.amount}`} label={line.label} value={line.amount} />
              ))}
            </div>
          ) : null}
          {hasExtras ? (
            <div className="space-y-1.5 bg-[#0a0a0a] px-2.5 py-2">
              <div className={`${sheetCoord} mb-1`}>Extras</div>
              <StatCell label="Crítico" value={meta.acertoCritico} />
              <StatCell label="Alvos" value={meta.alvos} />
              <StatCell label="Dano máx." value={meta.danoMaximo} />
            </div>
          ) : null}
          {hasProps ? (
            <div className="space-y-1 bg-[#0a0a0a] px-2.5 py-2">
              <div className={`${sheetCoord} mb-1`}>Propriedades</div>
              <ul className="space-y-1">
                {propriedades.map((p) => (
                  <li key={p} className="break-words font-mono text-xs leading-snug text-[#f5f5f5]">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {hasLoadout ? (
        <div className="flex flex-wrap gap-px border-t border-ecoar-teal/25 bg-ecoar-teal/25">
          {!isBlank(meta.recarga) ? (
            <div className="min-w-[6rem] flex-1 bg-[#0a0a0a] px-2.5 py-1.5">
              <StatCell label="Recarga" value={meta.recarga} />
            </div>
          ) : null}
          {!isBlank(meta.capacidade) ? (
            <div className="min-w-[6rem] flex-1 bg-[#0a0a0a] px-2.5 py-1.5">
              <StatCell label="Capacidade" value={meta.capacidade} />
            </div>
          ) : null}
          {!isBlank(meta.estoque) ? (
            <div className="min-w-[6rem] flex-1 bg-[#0a0a0a] px-2.5 py-1.5">
              <StatCell label="Estoque" value={meta.estoque} />
            </div>
          ) : null}
        </div>
      ) : null}

      {meta.versatilNote ? (
        <p className="border-t border-ecoar-teal/25 px-2.5 py-1.5 font-mono text-xs leading-snug text-[#adb5bd]">
          Versátil (duas mãos): +1 dano, crítico e alvos; +3 dano máximo.
        </p>
      ) : null}
    </article>
  )
}

export function CombatWeaponsWidget() {
  const {
    characterData,
    isEditing,
    canMutateMesa,
    weaponCatalogById,
    setEquippedWeaponSlot,
    toggleEquipWeaponInstance,
    singularityBonuses,
    equipmentMechanicalBonuses,
    bookDisadvantageBonuses,
    effectiveAttributesByKey,
    requestConfirm,
    characterId,
    tableId,
  } = useSheetRuntime()
  const { roll } = useDiceRoll()

  const eqSkills = (equipmentMechanicalBonuses as { skills?: Record<string, number> }).skills
  const bookSkills = (bookDisadvantageBonuses as { skills?: Record<string, number> }).skills
  const characterName = characterData.nome?.trim() || 'Sem nome'

  return (
    <div className="grid grid-cols-1 gap-4 p-2.5 lg:grid-cols-2 sm:p-3">
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
              className="flex min-h-[7.5rem] flex-col justify-center rounded-none border border-dashed border-ecoar-teal/35 bg-[#0a0a0a]/50 px-3 py-4"
            >
              <div className={`${sheetCoord}`}>{slotLabel}</div>
              <p className="mt-1 font-mono text-xs text-[#adb5bd]/85">
                Slot livre. Na Mochila, marque Equipar.
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
          <RangeWeaponCard
            key={slotId}
            slotLabel={slotLabel}
            meta={meta}
            attackText={attackText}
            isEditing={isEditing}
            canUnequip={canMutateMesa}
            attackBonus={slotState.attackBonus ?? 0}
            attackOverride={slotState.overrides?.attackText ?? ''}
            onUnequip={() => {
              void (async () => {
                const nome = owned.nome?.trim() || 'esta arma'
                const ok = await requestConfirm({
                  title: 'Desequipar arma?',
                  body: `“${nome}” volta para a Mochila.`,
                  confirmLabel: 'Desequipar',
                  cancelLabel: 'Manter',
                })
                if (!ok) return
                toggleEquipWeaponInstance(slotState.instanceId, false)
              })()
            }}
            onRoll={() =>
              void roll({
                label: `${characterName} · Ataque · ${meta.name}`,
                expression: attackText,
                tableId,
                characterId,
                characterName,
              })
            }
            onAttackBonusChange={(n) => {
              setEquippedWeaponSlot(slotId, {
                ...slotState,
                attackBonus: n,
              })
            }}
            onAttackOverrideChange={(v) => {
              setEquippedWeaponSlot(slotId, {
                ...slotState,
                overrides: { ...(slotState.overrides ?? {}), attackText: v || undefined },
              })
            }}
          />
        )
      })}
    </div>
  )
}

export default CombatWeaponsWidget
