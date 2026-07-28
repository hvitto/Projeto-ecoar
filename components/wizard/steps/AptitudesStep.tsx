'use client'

import { aptitudes as aptitudesData } from '@/data/aptitudes'
import { getAptitudeDice } from '@/lib/calculations'
import WizardStage, { PointBanner, LevelStepper } from '@/components/beyond/WizardStage'

export function AptitudesStep({
  aptitudes,
  pontosCriacao,
  onAptitudesChange,
  onPointsChange,
  aptitudePoints,
  onAptitudePointsChange,
  isEvolutionStep = false,
}: {
  aptitudes: Record<string, number>
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onAptitudesChange: (aptitudes: Record<string, number>) => void
  onPointsChange: (gastos: number) => void
  aptitudePoints: number
  onAptitudePointsChange: (points: number) => void
  isEvolutionStep?: boolean
}) {
  void onPointsChange

  const getMaxLevel = () => (isEvolutionStep ? 8 : 3)

  const calculateFreePointsUsed = () => {
    return Object.values(aptitudes).reduce((sum, level) => sum + level, 0)
  }

  const updateAptitude = (aptitudeId: string, level: number) => {
    const currentLevel = aptitudes[aptitudeId] || 0
    const maxLevel = getMaxLevel()

    if (level < 0 || level > maxLevel) return

    const currentTotal = calculateFreePointsUsed()
    const newTotal = currentTotal - currentLevel + level
    const oldPointsOverFree = Math.max(0, currentTotal - 3)
    const newPointsOverFree = Math.max(0, newTotal - 3)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    const costInPC = pointsOverFreeDiff * 20

    if (newTotal <= 3) {
      if (level > currentLevel) {
        const pointsNeeded = level - currentLevel
        if (aptitudePoints < pointsNeeded) {
          if (isEvolutionStep) {
            onAptitudesChange({ ...aptitudes, [aptitudeId]: level })
            onAptitudePointsChange(3 - newTotal)
          }
          return
        }
      } else if (level < currentLevel) {
        if (isEvolutionStep && costInPC < 0) {
          onAptitudesChange({ ...aptitudes, [aptitudeId]: level })
          onAptitudePointsChange(3 - newTotal)
          return
        }
      }

      onAptitudesChange({ ...aptitudes, [aptitudeId]: level })
      onAptitudePointsChange(3 - newTotal)
    } else {
      if (!isEvolutionStep) return

      if (level > currentLevel) {
        if (pontosCriacao.disponiveis < costInPC) return
        onAptitudesChange({ ...aptitudes, [aptitudeId]: level })
        onAptitudePointsChange(0)
      } else if (level < currentLevel) {
        const newFreeUsed = Math.min(3, newTotal)
        onAptitudesChange({ ...aptitudes, [aptitudeId]: level })
        onAptitudePointsChange(3 - newFreeUsed)
      }
    }
  }

  return (
    <WizardStage
      title={isEvolutionStep ? 'Evoluir Aptidões' : 'Aptidões'}
      refId="STEP-04"
      lede="3 pontos gratuitos. Arcana, Lethalis, Natura e Vox."
      hero="blocks"
    >
      <PointBanner
        label="Pontos gratuitos"
        value={aptitudePoints}
        danger={aptitudePoints < 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ecoar-teal/40 border border-ecoar-teal/50">
        {aptitudesData.map((aptitude) => {
          const level = aptitudes[aptitude.id] || 0
          const dice = getAptitudeDice(level)
          const maxLevel = getMaxLevel()
          const totalPointsUsed = Object.values(aptitudes).reduce((sum, l) => sum + l, 0)
          const newTotalIfIncrease = totalPointsUsed - level + (level + 1)

          let canIncrease = false
          if (level >= maxLevel) {
            canIncrease = false
          } else if (newTotalIfIncrease <= 3) {
            if (aptitudePoints > 0) canIncrease = true
            else if (isEvolutionStep) canIncrease = true
          } else if (isEvolutionStep) {
            canIncrease = pontosCriacao.disponiveis >= 20
          }

          return (
            <div key={aptitude.id} className="bg-[#0a0a0a]/75 p-3 sm:p-4 flex flex-col gap-3">
              <div>
                <h3 className="font-display text-base uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
                  {aptitude.name}
                </h3>
                <p className="mt-1 text-[10px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd]">
                  {aptitude.description}
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-ecoar-teal">
                  {dice} · Nv {level}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-ecoar-teal/30 pt-3">
                <span className="text-[9px] uppercase tracking-[0.14em] text-ecoar-magenta">Gratuito</span>
                <LevelStepper
                  value={level}
                  canDecrease={level > 0}
                  canIncrease={canIncrease}
                  onDecrease={() => updateAptitude(aptitude.id, Math.max(0, level - 1))}
                  onIncrease={() => updateAptitude(aptitude.id, level + 1)}
                  suffix="nível"
                />
              </div>
            </div>
          )
        })}
      </div>
    </WizardStage>
  )
}
