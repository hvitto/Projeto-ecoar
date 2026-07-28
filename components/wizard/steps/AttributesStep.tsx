'use client'

import { useState } from 'react'
import { getAttributeModifier } from '@/lib/calculations'
import WizardStage, { PointBanner, LevelStepper } from '@/components/beyond/WizardStage'
import StampButton from '@/components/beyond/StampButton'

export function AttributesStep({
  attributes,
  attributePoints,
  pontosCriacao,
  onUpdate,
  raceBonuses,
  martialSchoolBonuses,
  classBonuses,
  onRandomize,
  onPointsChange,
  isEvolutionStep = false,
}: {
  attributes: Record<string, number>
  attributePoints: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onUpdate: (attr: string, value: number) => void
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  classBonuses?: Record<string, number>
  onRandomize: () => void
  onPointsChange: (gastos: number) => void
  isEvolutionStep?: boolean
}) {
  const attributeLabels: Record<string, string> = {
    carisma: 'Carisma',
    finesse: 'Finesse',
    forca: 'Força',
    inteligencia: 'Inteligência',
    percepcao: 'Percepção',
    vitalidade: 'Vitalidade',
    vontade: 'Vontade',
  }

  const attributeDescriptions: Record<string, string> = {
    carisma: 'Liderança, persuasão e influência social.',
    finesse: 'Agilidade e precisão.',
    forca: 'Poder físico bruto.',
    inteligencia: 'Raciocínio, conhecimento e magia.',
    percepcao: 'Atenção e consciência do ambiente.',
    vitalidade: 'Resistência física e saúde.',
    vontade: 'Determinação e resistência mental.',
  }

  const [expandedAttribute, setExpandedAttribute] = useState<string | null>(null)

  const getAttributeRowData = (attr: string) => {
    const value = attributes[attr]
    const modifier = getAttributeModifier(value)
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const classBonus = 0
    const totalBonus = raceBonus + martialSchoolBonus + classBonus
    const baseValue = value - totalBonus
    const maxValue = (isEvolutionStep ? 8 : 3) + totalBonus
    const canDecrease = baseValue > 0
    const canIncrease = (() => {
      if (value >= maxValue) return false
      if (isEvolutionStep) {
        const currentTotalBase = Object.entries(attributes).reduce((sum, [a, v]) => {
          const rB = raceBonuses[a] || 0
          const mB = martialSchoolBonuses[a] || 0
          return sum + Math.max(0, v - (rB + mB + classBonus))
        }, 0)
        const newTotalBase = currentTotalBase - baseValue + (baseValue + 1)
        const currentPointsOverFree = Math.max(0, currentTotalBase - 12)
        const newPointsOverFree = Math.max(0, newTotalBase - 12)
        const costInPC = (newPointsOverFree - currentPointsOverFree) * 10
        if (costInPC <= 0) return true
        return pontosCriacao.disponiveis >= costInPC
      }
      return attributePoints > 0
    })()
    const pcCost = (() => {
      if (!isEvolutionStep) return 0
      const currentTotalBase = Object.entries(attributes).reduce((sum, [a, v]) => {
        const rB = raceBonuses[a] || 0
        const mB = martialSchoolBonuses[a] || 0
        return sum + Math.max(0, v - (rB + mB + classBonus))
      }, 0)
      const newTotalBase = currentTotalBase - baseValue + (baseValue + 1)
      const currentPointsOverFree = Math.max(0, currentTotalBase - 12)
      const newPointsOverFree = Math.max(0, newTotalBase - 12)
      return (newPointsOverFree - currentPointsOverFree) * 10
    })()
    return {
      value,
      modifier,
      totalBonus,
      maxValue,
      canDecrease,
      canIncrease,
      pcCost,
    }
  }

  void onPointsChange
  void classBonuses

  return (
    <WizardStage
      title={isEvolutionStep ? 'Evoluir Atributos' : 'Atributos'}
      refId="STEP-02"
      lede={
        isEvolutionStep
          ? 'Melhore atributos com PC. Cada ponto além da base custa 10 PC.'
          : '12 pontos gratuitos para distribuir entre os sete atributos.'
      }
      hero="circuit"
    >
      <PointBanner
        label={!isEvolutionStep ? 'Pontos restantes' : 'PC disponíveis'}
        value={!isEvolutionStep ? attributePoints : pontosCriacao.disponiveis}
        danger={
          !isEvolutionStep ? attributePoints < 0 : pontosCriacao.disponiveis < 0
        }
        action={
          !isEvolutionStep ? (
            <StampButton tone="grid" onClick={onRandomize}>
              Aleatório
            </StampButton>
          ) : null
        }
      />

      {(Object.keys(raceBonuses).length > 0 || Object.keys(martialSchoolBonuses).length > 0) && (
        <div className="mb-3 border border-ecoar-teal/40 px-3 py-2">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Bônus aplicados</p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-ecoar-dark-500 dark:text-[#adb5bd]">
            {Object.entries(raceBonuses).map(([attr, bonus]) => (
              <span key={attr} className="mr-3">
                {attributeLabels[attr]} <span className="text-ecoar-magenta">+{bonus}</span>
              </span>
            ))}
            {Object.entries(martialSchoolBonuses).map(([attr, bonus]) => (
              <span key={`m-${attr}`} className="mr-3">
                {attributeLabels[attr]} <span className="text-ecoar-teal">+{bonus}</span>
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="border border-ecoar-teal/45 dark:border-ecoar-teal/55">
        <div
          className={`grid gap-2 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-ecoar-teal border-b border-ecoar-teal/35 ${
            isEvolutionStep ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto]'
          }`}
        >
          <span>Atributo</span>
          <span className="w-24 text-center">Valor</span>
          <span className="w-10 text-right">Mod</span>
          {isEvolutionStep ? <span className="w-14 text-right">Custo</span> : null}
        </div>

        {Object.keys(attributes).map((attr) => {
          const row = getAttributeRowData(attr)
          const isExpanded = expandedAttribute === attr
          return (
            <div key={attr} className="border-b border-ecoar-teal/25 last:border-b-0">
              <div
                className={`grid gap-2 items-center px-3 py-2.5 ${
                  isEvolutionStep ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedAttribute((prev) => (prev === attr ? null : attr))}
                  className="text-left min-w-0"
                >
                  <span className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
                    {attributeLabels[attr]}
                  </span>
                  {row.totalBonus !== 0 ? (
                    <span className="ml-2 text-[9px] uppercase tracking-[0.1em] text-ecoar-teal">
                      +{row.totalBonus}
                    </span>
                  ) : null}
                </button>
                <LevelStepper
                  value={row.value}
                  canDecrease={row.canDecrease}
                  canIncrease={row.canIncrease}
                  onDecrease={() => onUpdate(attr, row.value - 1)}
                  onIncrease={() => {
                    if (row.canIncrease && row.value + 1 <= row.maxValue) onUpdate(attr, row.value + 1)
                  }}
                />
                <span
                  className={`w-10 text-right text-[11px] tabular-nums ${
                    row.modifier >= 0 ? 'text-ecoar-teal' : 'text-ecoar-dark-500 dark:text-[#adb5bd]'
                  }`}
                >
                  {row.modifier >= 0 ? '+' : ''}
                  {row.modifier}
                </span>
                {isEvolutionStep ? (
                  <span className="w-14 text-right text-[9px] uppercase tracking-[0.1em] text-ecoar-magenta">
                    {row.canIncrease && row.pcCost > 0 ? `${row.pcCost} PC` : '—'}
                  </span>
                ) : null}
              </div>
              {isExpanded ? (
                <p className="px-3 pb-2.5 text-[10px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd]">
                  {attributeDescriptions[attr]}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </WizardStage>
  )
}
