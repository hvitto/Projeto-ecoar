'use client'

import Image from 'next/image'
import { getRaceById } from '@/data/races'
import { paths } from '@/data/paths'
import { getSkillDice, formatDiceWithModifier } from '@/lib/calculations'
import { resolveWeaponAttackAutoText } from '@/lib/equippedWeaponAttack'
import { getWeaponQualityCombatModifiers } from '@/lib/equipmentQuality'
import type { EquippedWeaponSlotId, EquippedWeaponState } from '@/shared/types/equipment'
import CoordLabel from '@/components/beyond/CoordLabel'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetAttackRoll,
  sheetAttackRollQuiet,
  sheetBtnCompact,
  sheetBtnGhost,
  sheetBtnTeal,
  sheetBtnTealStrong,
  sheetEditChip,
  sheetModeChipMesa,
  sheetFocusRing,
  sheetGridTexture,
  sheetHint,
  sheetLabel,
  sheetLimitInput,
  sheetMeta,
  sheetStripMicro,
} from '@/features/character/sheet/sheetChrome'
import { useDiceRoll } from '@/features/dice/DiceRollProvider'

function skillBonusFromAggregates(
  skillId: string,
  singularity: Record<string, number> | undefined,
  equipment: Record<string, number> | undefined,
  book: Record<string, number> | undefined,
): number {
  return (singularity?.[skillId] ?? 0) + (equipment?.[skillId] ?? 0) + (book?.[skillId] ?? 0)
}

function formatClock(atMs: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(atMs))
}

function PersistStatusBar() {
  const { persistStatus, dismissPersistStatus, isSaving } = useSheetRuntime()

  if (persistStatus.state === 'idle') return null

  const toneClass =
    persistStatus.state === 'error'
      ? 'border-[#adb5bd]/45 bg-[#0a0a0a] text-[#f5f5f5]'
      : persistStatus.state === 'saved'
        ? 'border-ecoar-teal/40 bg-ecoar-teal/10 text-ecoar-teal'
        : 'border-ecoar-teal/30 bg-[#0a0a0a]/80 text-[#adb5bd]'

  const text =
    persistStatus.state === 'saved'
      ? `${persistStatus.label} · ${formatClock(persistStatus.atMs)}`
      : persistStatus.label

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`relative flex flex-wrap items-center justify-between gap-2 border-b px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] sm:px-2.5 sm:py-1 sm:text-[10px] ${toneClass}`}
    >
      <span className="min-w-0 break-words">
        {persistStatus.state === 'error' ? (
          <span className="mr-2 text-[#adb5bd]">Falha ·</span>
        ) : null}
        {text}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        {persistStatus.state === 'error' && persistStatus.onRetry ? (
          <button
            type="button"
            onClick={persistStatus.onRetry}
            disabled={isSaving}
            className={`${sheetBtnTeal} ${sheetBtnCompact}`}
          >
            Tentar de novo
          </button>
        ) : null}
        {persistStatus.state === 'error' ? (
          <button
            type="button"
            onClick={dismissPersistStatus}
            className={`${sheetBtnGhost} ${sheetBtnCompact}`}
          >
            Fechar
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function SessionStrip() {
  const {
    characterData,
    updateField,
    isEditing,
    isDirty,
    canEditSheet,
    derivedValues,
    markLimitsUserTriggered,
    weaponCatalogById,
    singularityBonuses,
    equipmentMechanicalBonuses,
    bookDisadvantageBonuses,
    effectiveAttributesByKey,
    tableId,
    characterId,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    isSaving,
    canMutateMesa,
  } = useSheetRuntime()
  const { roll } = useDiceRoll()

  const characterName = characterData.nome?.trim() || 'Sem nome'
  const race = getRaceById(characterData.raca)
  const raceName = race?.name ?? '—'
  const racePortrait = race?.image?.src
  const pathName = paths.find((p) => p.id === characterData.trilha)?.name ?? '—'
  const refId = characterId ? `FICHA-${characterId.slice(0, 8).toUpperCase()}` : 'FICHA-NOVA'

  const skillLevelOf = (id: string) => {
    const raw = characterData.skills?.[id]?.level
    return typeof raw === 'number' ? raw : parseInt(String(raw ?? 0), 10) || 0
  }

  const limits = [
    { key: 'corpo', label: 'Corpo', max: derivedValues.corpoMax },
    { key: 'mente', label: 'Mente', max: derivedValues.menteMax },
    { key: 'folego', label: 'Fôlego', max: derivedValues.folegoMax },
    { key: 'mana', label: 'Mana', max: derivedValues.manaMax },
  ] as const

  const tests = [
    {
      key: 'arredores',
      label: 'Arred',
      fullLabel: 'Arredores',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('atencao')),
        derivedValues.commonTests.arredores,
      ),
    },
    {
      key: 'iniciativa',
      label: 'Inic',
      fullLabel: 'Iniciativa',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('raciocinio')),
        derivedValues.commonTests.iniciativa,
      ),
    },
    {
      key: 'esquiva',
      label: 'Esq',
      fullLabel: 'Esquiva',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('reflexos')),
        derivedValues.commonTests.esquiva,
      ),
    },
    {
      key: 'coragem',
      label: 'Corag',
      fullLabel: 'Coragem',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('compostura')),
        derivedValues.commonTests.coragem,
      ),
    },
  ]

  const eqSkills = (equipmentMechanicalBonuses as { skills?: Record<string, number> }).skills
  const bookSkills = (bookDisadvantageBonuses as { skills?: Record<string, number> }).skills

  const weapons = (['slot1', 'slot2'] as EquippedWeaponSlotId[]).map((slotId) => {
    const slotLabel = slotId === 'slot1' ? 'Arma 1' : 'Arma 2'
    const slotState = characterData.equippedWeapons?.[slotId] as EquippedWeaponState | undefined
    const owned = slotState
      ? characterData.itensCatalogo.find((i) => i.instanceId === slotState.instanceId)
      : undefined
    const entry = owned ? weaponCatalogById.get(owned.catalogId) : undefined
    if (!entry || !owned || !slotState) {
      return { slotId, slotLabel, empty: true as const }
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
    return {
      slotId,
      slotLabel,
      empty: false as const,
      name: owned.nome,
      attackText,
    }
  })

  const compactAction = sheetBtnCompact

  return (
    <section
      aria-label="Painel da mesa"
      className="relative overflow-hidden border border-ecoar-teal/50 bg-[#1a1d21] text-[#f5f5f5]"
    >
      <div className={sheetGridTexture} aria-hidden />

      <PersistStatusBar />

      <div className="relative flex items-center gap-1 border-b border-ecoar-teal/35 px-1 py-0.5 sm:gap-2.5 sm:px-2 sm:py-1">
        <div className="relative hidden h-8 w-8 shrink-0 overflow-hidden border border-ecoar-teal/40 sm:block sm:h-9 sm:w-9">
          {racePortrait ? (
            <Image
              src={racePortrait}
              alt={raceName}
              width={36}
              height={36}
              className="h-full w-full object-cover object-top grayscale contrast-125"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]/80">
              <span className={`${sheetMeta}`}>—</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0">
            <h2
              className="max-w-[9.5rem] truncate font-display text-[13px] uppercase leading-none tracking-[-0.03em] text-[#f5f5f5] sm:max-w-full sm:text-base"
              title={characterName}
            >
              {characterName}
            </h2>
            {isEditing ? (
              <span
                className={sheetEditChip}
                title={
                  isDirty
                    ? 'Ficha: edição com alterações — Salvar (Ctrl+S) ou Cancelar (Esc)'
                    : 'Ficha: edite e Salve. Limites da mesa ainda atualizam.'
                }
                aria-live="polite"
              >
                {isDirty ? (
                  <span className="h-1.5 w-1.5 shrink-0 bg-ecoar-teal" aria-hidden />
                ) : null}
                Editando
                {isDirty ? <span className="sr-only"> com alterações</span> : null}
              </span>
            ) : (
              <span
                className={sheetModeChipMesa}
                title="Mesa: ajuste limites sem Editar. Use Editar para mudar a ficha."
              >
                Mesa
              </span>
            )}
            <p
              className={`hidden truncate sm:inline ${sheetMeta}`}
              title={`${raceName} · ${pathName}`}
            >
              {raceName}
              <span className="mx-1 text-ecoar-teal/70">·</span>
              {pathName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <CoordLabel refId={refId} className="hidden text-right lg:block" />
          {canEditSheet && !isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              title="Editar ficha (E)"
              className={`${sheetBtnTeal} ${compactAction}`}
            >
              Editar
            </button>
          ) : null}
          {canEditSheet && isEditing ? (
            <>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={isSaving || !isDirty}
                aria-busy={isSaving}
                title={
                  isSaving
                    ? 'A guardar…'
                    : isDirty
                      ? 'Salvar alterações (Ctrl+S)'
                      : 'Sem alterações para guardar (Ctrl+S)'
                }
                className={`${sheetBtnTealStrong} ${compactAction}`}
              >
                {isSaving ? (
                  'Salvando…'
                ) : (
                  <>
                    {isDirty ? (
                      <span className="h-1.5 w-1.5 shrink-0 bg-[#1a1d21]" aria-hidden />
                    ) : null}
                    Salvar
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => void handleCancelEdit()}
                disabled={isSaving}
                title={
                  isDirty
                    ? 'Descartar alterações (Esc)'
                    : 'Sair da edição (Esc)'
                }
                className={`${sheetBtnGhost} ${compactAction}`}
              >
                Cancelar
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-1 p-1 sm:grid-cols-2 sm:gap-1.5 sm:p-1.5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="order-1 min-w-0 border border-ecoar-teal/55 bg-[#0a0a0a]/95 px-1.5 py-1.5 sm:col-span-2 sm:px-2 sm:py-2 lg:col-span-1">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <div className={`${sheetLabel} mb-0 text-ecoar-teal`}>Limites</div>
            <span className={sheetHint} title="Limites atualizam na mesa sem entrar em Editar">
              Sem Editar
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
            {limits.map((limit) => {
              const current = characterData[limit.key] as { atual: number; max: number }
              return (
                <div
                  key={limit.key}
                  className="flex min-h-9 min-w-0 flex-col items-center justify-center gap-0.5 sm:min-h-11 [@media(pointer:coarse)]:min-h-10"
                >
                  <span className={`${sheetStripMicro} text-ecoar-teal/90`}>{limit.label}</span>
                  <div className="flex items-center gap-0.5">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={current.atual}
                      disabled={!canMutateMesa}
                      aria-label={`${limit.label} atual`}
                      onChange={(e) => {
                        if (!isEditing) markLimitsUserTriggered()
                        const raw = parseInt(e.target.value, 10)
                        const next = Number.isFinite(raw)
                          ? Math.max(0, Math.min(limit.max, raw))
                          : 0
                        updateField(`${limit.key}.atual`, next)
                      }}
                      min={0}
                      max={limit.max}
                      className={`${sheetLimitInput} !h-7 !w-9 !text-[11px] sm:!h-8 sm:!w-10 sm:!text-xs`}
                    />
                    <span className="font-mono text-[10px] leading-none text-[#adb5bd] sm:text-xs">/</span>
                    <span className="font-mono text-[10px] font-semibold tabular-nums text-[#f5f5f5] sm:text-xs">
                      {limit.max}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="order-2 min-w-0 border border-ecoar-teal/20 bg-[#0a0a0a]/60 px-1 py-0.5 sm:px-1.5 sm:py-1">
          <div className={`${sheetLabel} mb-0.5 text-[#adb5bd]`}>Armas</div>
          <div className="grid grid-cols-2 gap-0.5 sm:gap-1 lg:grid-cols-1 xl:grid-cols-2">
            {weapons.map((weapon) =>
              weapon.empty ? (
                <div
                  key={weapon.slotId}
                  className="flex min-h-7 items-center gap-1 border border-dashed border-ecoar-teal/20 px-1 py-0.5 sm:min-h-8 sm:px-1.5 [@media(pointer:coarse)]:min-h-9"
                  aria-label={`${weapon.slotLabel}: sem arma equipada`}
                >
                  <p className={`truncate ${sheetMeta} text-[#adb5bd]/70`}>
                    {weapon.slotLabel} · sem arma
                  </p>
                </div>
              ) : (
                <div
                  key={weapon.slotId}
                  className="flex min-h-7 min-w-0 flex-col justify-center gap-0.5 border border-ecoar-teal/20 px-1 py-0.5 sm:min-h-8 sm:gap-1 sm:px-1.5 [@media(pointer:coarse)]:min-h-9"
                >
                  <span
                    className="line-clamp-2 min-w-0 break-words font-display text-[8px] uppercase leading-tight tracking-[-0.02em] text-[#f5f5f5] sm:text-[10px]"
                    title={`${weapon.slotLabel}: ${weapon.name}`}
                  >
                    {weapon.name}
                  </span>
                  {weapon.attackText !== '—' ? (
                    <button
                      type="button"
                      title={`Rolar ataque (${weapon.name})`}
                      aria-label={`Rolar ataque ${weapon.name}: ${weapon.attackText}`}
                      onClick={() =>
                        void roll({
                          label: `${characterName} · Ataque · ${weapon.name}`,
                          expression: weapon.attackText,
                          tableId,
                          characterId,
                          characterName,
                        })
                      }
                      className={`w-full shrink-0 truncate !min-h-7 !px-1 !text-[8px] sm:!min-h-8 sm:!px-1.5 sm:!text-[10px] [@media(pointer:coarse)]:!min-h-9 ${
                        isEditing ? sheetAttackRollQuiet : sheetAttackRoll
                      }`}
                    >
                      {weapon.attackText}
                    </button>
                  ) : null}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="order-3 min-w-0 border border-ecoar-teal/20 bg-[#0a0a0a]/60 px-1 py-0.5 sm:px-1.5 sm:py-1">
          <div className={`${sheetLabel} mb-0.5 text-[#adb5bd]`}>Testes</div>
          <div className="grid grid-cols-4 gap-0.5">
            {tests.map((test) => (
              <button
                key={test.key}
                type="button"
                title={`Rolar ${test.fullLabel}`}
                aria-label={`Rolar ${test.fullLabel}: ${test.display}`}
                onClick={() =>
                  void roll({
                    label: `${characterName} · ${test.fullLabel}`,
                    expression: test.display,
                    tableId,
                    characterId,
                    characterName,
                  })
                }
                className={`flex min-h-7 flex-col items-center justify-center gap-0 border border-ecoar-teal/15 px-0.5 py-0 transition-colors hover:border-ecoar-teal/45 hover:bg-ecoar-teal/10 sm:min-h-8 [@media(pointer:coarse)]:min-h-9 ${sheetFocusRing}`}
              >
                <span className={`${sheetStripMicro} !text-[7px] text-[#adb5bd] sm:!text-[8px]`}>
                  <span className="lg:hidden">{test.label}</span>
                  <span className="hidden lg:inline">{test.fullLabel}</span>
                </span>
                <span className="font-mono text-[8px] font-semibold tabular-nums leading-none text-ecoar-teal sm:text-[10px]">
                  {test.display}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SessionStrip
