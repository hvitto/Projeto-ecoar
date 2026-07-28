'use client'

import { getSkillDice, formatDiceWithModifier } from '@/lib/calculations'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetLabel, sheetStatCellInteractive } from '@/features/character/sheet/sheetChrome'
import { useDiceRoll } from '@/features/dice/DiceRollProvider'

export function CommonTestsWidget() {
  const { characterData, derivedValues, tableId, characterId } = useSheetRuntime()
  const { roll } = useDiceRoll()

  const sizeModifier = typeof characterData.tamanho === 'number' ? characterData.tamanho : 0
  const weightModifier = typeof characterData.peso === 'number' ? characterData.peso : 0
  const sizeWeightPenalty = -(sizeModifier + weightModifier)
  const hasSizeWeightEffect = sizeModifier !== 0 || weightModifier !== 0

  const skillLevelOf = (id: string) => {
    const raw = characterData.skills?.[id]?.level
    return typeof raw === 'number' ? raw : parseInt(String(raw ?? 0), 10) || 0
  }

  const skillHasSpec = (skillId: string, specializationId: string) =>
    characterData.skills?.[skillId]?.specialization === specializationId

  const characterName = characterData.nome?.trim() || 'Personagem'

  const tests = [
    {
      key: 'arredores',
      label: 'Arredores',
      desc: skillHasSpec('atencao', 'arredores')
        ? 'Percepção + Atenção (Esp. Arredores +1)'
        : 'Percepção + Atenção',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('atencao')),
        derivedValues.commonTests.arredores,
      ),
    },
    {
      key: 'iniciativa',
      label: 'Iniciativa',
      desc: skillHasSpec('raciocinio', 'iniciativa')
        ? 'Percepção + Raciocínio (Esp. Iniciativa +1)'
        : 'Percepção + Raciocínio',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('raciocinio')),
        derivedValues.commonTests.iniciativa,
      ),
    },
    {
      key: 'esquiva',
      label: 'Esquiva',
      desc: hasSizeWeightEffect
        ? `Percepção + Reflexos ${sizeWeightPenalty >= 0 ? '+' : ''}${sizeWeightPenalty} (T/P)`
        : skillHasSpec('reflexos', 'esquiva')
          ? 'Percepção + Reflexos (Esp. Esquiva +1)'
          : 'Percepção + Reflexos',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('reflexos')),
        derivedValues.commonTests.esquiva,
      ),
    },
    {
      key: 'coragem',
      label: 'Coragem',
      desc: skillHasSpec('compostura', 'coragem')
        ? 'Vontade + Compostura (Esp. Coragem +1)'
        : 'Vontade + Compostura',
      display: formatDiceWithModifier(
        getSkillDice(skillLevelOf('compostura')),
        derivedValues.commonTests.coragem,
      ),
    },
  ]

  return (
    <div className="grid h-full w-full grid-cols-2 gap-1.5 p-2.5 sm:grid-cols-4 sm:grid-rows-1 sm:p-3">
      {tests.map((test) => (
        <button
          key={test.key}
          type="button"
          title={`Rolar ${test.label}`}
          aria-label={`Rolar ${test.label}: ${test.display}`}
          onClick={() =>
            void roll({
              label: `${characterName} · ${test.label}`,
              expression: test.display,
              tableId,
              characterId,
              characterName,
            })
          }
          className={`${sheetStatCellInteractive} flex h-full min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1.5 py-1.5 text-center`}
        >
          <div className={`${sheetLabel} mb-0 w-full truncate text-center`}>{test.label}</div>
          <div className="font-mono text-xs font-semibold tabular-nums text-ecoar-teal">
            {test.display}
          </div>
          <div
            className="w-full truncate font-mono text-[9px] leading-tight text-[#adb5bd]"
            title={test.desc}
          >
            {test.desc}
          </div>
        </button>
      ))}
    </div>
  )
}

export default CommonTestsWidget
