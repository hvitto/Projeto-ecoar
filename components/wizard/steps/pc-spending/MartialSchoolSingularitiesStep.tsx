'use client'

import { useState, useEffect } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import { PointBanner } from '@/components/beyond/WizardStage'
import RangeFrame from '@/components/beyond/RangeFrame'
import { getMartialSchoolDataByIdResolved } from '@/data/martialSchoolSingularities'

export function MartialSchoolSingularitiesStep({
  escolaMarcialId,
  singularidadesMarciais,
  onSingularidadesChange,
  nivelAlma,
  pontosEvolucao,
}: {
  escolaMarcialId: string
  singularidadesMarciais: string[]
  onSingularidadesChange: (singularidades: string[]) => void
  nivelAlma: number
  pontosEvolucao: number
}) {
  const school = getMartialSchoolDataByIdResolved(escolaMarcialId)
  const [pontosGastos, setPontosGastos] = useState(0)

  useEffect(() => {
    if (!school) return
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = school.singularities.find((s) => s.id === singId)
      return sum + (sing?.cost || 0)
    }, 0)
    setPontosGastos(total)
  }, [singularidadesMarciais, school])

  const pontosDisponiveis = pontosEvolucao - pontosGastos

  const toggleSingularity = (id: string) => {
    if (!school) return

    const singularity = school.singularities.find((s) => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)

    if (isSelected) {
      onSingularidadesChange(singularidadesMarciais.filter((s) => s !== id))
    } else {
      if (singularity.requirements.previous && !singularidadesMarciais.includes(singularity.requirements.previous)) {
        return
      }
      if (singularity.requirements.nivelAlma && nivelAlma < singularity.requirements.nivelAlma) {
        return
      }
      if (pontosDisponiveis >= singularity.cost) {
        onSingularidadesChange([...singularidadesMarciais, id])
      }
    }
  }

  if (!school) {
    return (
      <div className="border border-ecoar-teal/35 px-3 py-8 text-center">
        <p className="text-[11px] text-ecoar-dark-500 dark:text-[#adb5bd]">Escola marcial não encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
      <PointBanner
        label="PE disponíveis"
        value={`${pontosDisponiveis} / ${pontosEvolucao}`}
        danger={pontosDisponiveis < 0}
      />

      <RangeFrame title={school.name} refId="MS-PE" bodyClassName="p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] uppercase tracking-[0.08em] mb-3">
          <div>
            <span className="text-ecoar-teal block mb-0.5">Classe</span>
            <span className="text-ecoar-dark-900 dark:text-ecoar-light-900">{school.class}</span>
          </div>
          <div>
            <span className="text-ecoar-teal block mb-0.5">Aptidão</span>
            <span className="text-ecoar-dark-900 dark:text-ecoar-light-900">{school.aptitude}</span>
          </div>
          <div className="col-span-2">
            <span className="text-ecoar-teal block mb-0.5">Ferramenta</span>
            <span className="text-ecoar-dark-900 dark:text-ecoar-light-900 normal-case tracking-normal text-[11px]">
              {school.tool}
            </span>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-2">{school.description}</p>
        {school.toolNote ? (
          <p className="text-[10px] leading-snug text-ecoar-magenta italic mb-3">↪ {school.toolNote}</p>
        ) : null}
      </RangeFrame>

      <div className="space-y-2">
        <h5 className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 border-b border-ecoar-teal/35 pb-2">
          Singularidades
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {school.singularities.map((singularity) => {
            const isSelected = singularidadesMarciais.includes(singularity.id)
            const canAfford = pontosDisponiveis >= singularity.cost
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
                cost={singularity.cost}
                costLabel="PE"
                isSelected={isSelected}
                canAfford={canAfford}
                canSelect={isSelected || canSelect}
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
    </div>
  )
}
