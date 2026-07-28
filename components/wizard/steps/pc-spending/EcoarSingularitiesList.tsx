'use client'

import { useCallback } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import { PointBanner } from '@/components/beyond/WizardStage'
import RangeFrame from '@/components/beyond/RangeFrame'
import { getSkillById } from '@/data/skills'
import { getAptitudeById } from '@/data/aptitudes'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { isEcoarPreviousRequirementMet } from '@/lib/ecoarSingularityRequirements'

export function EcoarSingularitiesList({
  selectedEcoar,
  singularidadesEcoar,
  onSingularidadesEcoarChange,
  pontosEcoarDisponiveis,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  pontosEcoarDisponiveis: number
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const { getEcoarSingularitiesByEcoarId, getEcoarSingularityById } = useEcoarCatalogData()
  const ecoarSingularitiesList = selectedEcoar ? getEcoarSingularitiesByEcoarId(selectedEcoar) : []

  const checkRequirements = useCallback(
    (singularity: EcoarSingularity): { valid: boolean; missingReqs: string[] } => {
      const missingReqs: string[] = []

      if (!singularity.requirements) {
        return { valid: true, missingReqs: [] }
      }

      if (singularity.requirements.previous) {
        if (
          !isEcoarPreviousRequirementMet(
            singularity.requirements.previous,
            singularidadesEcoar,
            selectedEcoar,
          )
        ) {
          const prevSing = getEcoarSingularityById(singularity.requirements.previous!)
          missingReqs.push(`Requer: ${prevSing?.name || 'Singularidade anterior'}`)
        }
      }

      if (singularity.requirements.nivelAlma) {
        if (nivelAlma < singularity.requirements.nivelAlma) {
          missingReqs.push(`Requer Nível de Alma ${singularity.requirements.nivelAlma}+`)
        }
      }

      if (singularity.requirements.attributes) {
        Object.entries(singularity.requirements.attributes).forEach(([attr, minValue]) => {
          const currentValue = attributes[attr] || 0
          if (currentValue < minValue) {
            const attrName = attr.charAt(0).toUpperCase() + attr.slice(1)
            missingReqs.push(`Requer ${attrName} ${minValue}+`)
          }
        })
      }

      if (singularity.requirements.skills) {
        Object.entries(singularity.requirements.skills).forEach(([skillId, minLevel]) => {
          const skill = skills[skillId]
          const currentLevel = skill?.level || 0
          if (currentLevel < minLevel) {
            const skillData = getSkillById(skillId)
            missingReqs.push(`Requer ${skillData?.name || skillId} nível ${minLevel}+`)
          }
        })
      }

      if (singularity.requirements.aptitudes) {
        Object.entries(singularity.requirements.aptitudes).forEach(([aptId, minValue]) => {
          const currentValue = aptitudes[aptId] || 0
          if (currentValue < minValue) {
            const aptData = getAptitudeById(aptId)
            missingReqs.push(`Requer ${aptData?.name || aptId} ${minValue}+`)
          }
        })
      }

      return { valid: missingReqs.length === 0, missingReqs }
    },
    [singularidadesEcoar, selectedEcoar, nivelAlma, attributes, skills, aptitudes, getEcoarSingularityById],
  )

  const getRequirementText = useCallback(
    (singularity: EcoarSingularity): string | undefined => {
      const { missingReqs } = checkRequirements(singularity)
      if (missingReqs.length === 0) return undefined
      return missingReqs.join(', ')
    },
    [checkRequirements],
  )

  const toggleSingularity = (id: string) => {
    const singularity = getEcoarSingularityById(id)
    if (!singularity) return

    const isSelected = singularidadesEcoar.includes(id)

    if (isSelected) {
      onSingularidadesEcoarChange(singularidadesEcoar.filter((s) => s !== id))
    } else {
      const { valid } = checkRequirements(singularity)
      if (!valid) return

      if (pontosEcoarDisponiveis >= singularity.cost) {
        onSingularidadesEcoarChange([...singularidadesEcoar, id])
      }
    }
  }

  if (!ecoarSingularitiesList || ecoarSingularitiesList.length === 0) {
    return (
      <RangeFrame title="Singularidades do Ecoar" refId="ECOAR-SING" bodyClassName="p-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-ecoar-teal mb-2">
          Selecione singularidades específicas do seu Ecoar
        </p>
        <div className="border border-ecoar-teal/35 px-3 py-4">
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd]">
            Este ecoar ainda não possui singularidades cadastradas.
          </p>
        </div>
      </RangeFrame>
    )
  }

  return (
    <RangeFrame title="Singularidades do Ecoar" refId="ECOAR-SING" bodyClassName="p-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-ecoar-teal mb-3">
        Custam Pontos de Ecoar obtidos com Distúrbios
      </p>
      <PointBanner
        label="Pontos de Ecoar"
        value={pontosEcoarDisponiveis}
        danger={pontosEcoarDisponiveis < 0}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
        {ecoarSingularitiesList.map((singularity) => {
          const isSelected = singularidadesEcoar.includes(singularity.id)
          const { valid } = checkRequirements(singularity)
          const canAfford = pontosEcoarDisponiveis >= singularity.cost
          const canSelect = isSelected || (valid && (singularity.cost === 0 || canAfford))
          const requirementText = getRequirementText(singularity)

          return (
            <SingularityCard
              key={singularity.id}
              name={singularity.name}
              description={singularity.description}
              cost={singularity.cost}
              costLabel={singularity.cost === 0 ? undefined : 'Pts Ecoar'}
              secondaryCost={singularity.cost === 0 ? 'Inata' : undefined}
              isSelected={isSelected}
              canAfford={canAfford}
              canSelect={canSelect}
              onClick={() => toggleSingularity(singularity.id)}
              effects={singularity.effects}
              variant="teal"
              footer={
                requirementText ? (
                  <div className="text-[10px] text-ecoar-magenta mt-2 pt-2 border-t border-ecoar-teal/25">
                    {requirementText}
                  </div>
                ) : undefined
              }
            />
          )
        })}
      </div>
    </RangeFrame>
  )
}
