'use client'

import { useEffect } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import { PointBanner } from '@/components/beyond/WizardStage'
import StampButton from '@/components/beyond/StampButton'
import type { MartialSchoolData } from '@/data/martialSchoolSingularities'

export function MartialSchoolSingularitiesPurchase({
  escolaMarcial,
  singularidadesMarciais,
  onSingularidadesChange,
  pontosDisponiveis,
  onPointsChange,
  nivelAlma,
  onBack,
}: {
  escolaMarcial: MartialSchoolData
  singularidadesMarciais: string[]
  onSingularidadesChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  nivelAlma: number
  onBack: () => void
}) {
  useEffect(() => {
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = escolaMarcial.singularities.find((s) => s.id === singId)
      return sum + (sing ? sing.cost : 0)
    }, 0)
    onPointsChange(total)
  }, [singularidadesMarciais, escolaMarcial, onPointsChange])

  const toggleSingularity = (id: string) => {
    const singularity = escolaMarcial.singularities.find((s) => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)
    const costInPC = singularity.cost

    if (isSelected) {
      onSingularidadesChange(singularidadesMarciais.filter((s) => s !== id))
    } else {
      if (singularity.requirements.previous && !singularidadesMarciais.includes(singularity.requirements.previous)) {
        return
      }
      if (singularity.requirements.nivelAlma && nivelAlma < singularity.requirements.nivelAlma) {
        return
      }
      if (pontosDisponiveis >= costInPC) {
        onSingularidadesChange([...singularidadesMarciais, id])
      }
    }
  }

  return (
    <div className="space-y-4 flex flex-col h-full max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
      <div className="border-b border-ecoar-teal/40 pb-3">
        <StampButton tone="ghost" onClick={onBack} className="mb-3 w-full sm:w-auto">
          ← Voltar para detalhes da escola
        </StampButton>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Compra</p>
            <h3 className="font-display text-lg uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
              Singularidades · {escolaMarcial.name}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.1em] text-ecoar-teal mt-0.5">Custo oficial em PC</p>
          </div>
          <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
        {escolaMarcial.singularities.map((singularity) => {
          const isSelected = singularidadesMarciais.includes(singularity.id)
          const costInPC = singularity.cost
          const canAfford = pontosDisponiveis >= costInPC
          const hasPrevious =
            !singularity.requirements.previous ||
            singularidadesMarciais.includes(singularity.requirements.previous)
          const hasNivelAlma =
            !singularity.requirements.nivelAlma || nivelAlma >= singularity.requirements.nivelAlma
          const canSelect = canAfford && hasPrevious && hasNivelAlma

          return (
            <SingularityCard
              key={singularity.id}
              name={singularity.name}
              description={singularity.description}
              cost={costInPC}
              costLabel="PC"
              isSelected={isSelected}
              canAfford={canAfford}
              canSelect={canSelect}
              onClick={() => toggleSingularity(singularity.id)}
              level={singularity.level}
              effects={singularity.effects}
              variant="teal"
              footer={
                <div className="text-[10px] text-ecoar-dark-500 dark:text-[#adb5bd] mt-2 space-y-0.5">
                  {singularity.requirements.nivelAlma ? (
                    <div className={hasNivelAlma ? '' : 'text-ecoar-magenta'}>
                      Requer Nível de Alma {singularity.requirements.nivelAlma}+
                    </div>
                  ) : null}
                  {singularity.requirements.previous && !hasPrevious ? (
                    <div className="text-ecoar-magenta">Requer singularidade anterior</div>
                  ) : null}
                </div>
              }
            />
          )
        })}
      </div>
    </div>
  )
}
