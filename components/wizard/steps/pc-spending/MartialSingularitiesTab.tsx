'use client'

import { useCallback } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import { PointBanner } from '@/components/beyond/WizardStage'
import SelectPlate from '@/components/beyond/SelectPlate'
import StampButton from '@/components/beyond/StampButton'
import { getSkillById } from '@/data/skills'
import { getAptitudeById } from '@/data/aptitudes'
import {
  getAllMartialSchools,
  getMartialSchoolDataByIdResolved,
  type MartialSchoolSingularity,
} from '@/data/martialSchoolSingularities'

export function MartialSingularitiesTab({
  selectedEscolaMarcial,
  onEscolaMarcialSelect,
  todasSingularidades,
  singularidadesMarciais,
  onSingularidadesMarciaisChange,
  pontosDisponiveis,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEscolaMarcial: string
  onEscolaMarcialSelect: (id: string) => void
  todasSingularidades: string[]
  singularidadesMarciais: string[]
  onSingularidadesMarciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const allMartialSchools = getAllMartialSchools()
  const school = selectedEscolaMarcial ? getMartialSchoolDataByIdResolved(selectedEscolaMarcial) : null

  const checkRequirements = useCallback(
    (singularity: MartialSchoolSingularity): { valid: boolean; missingReqs: string[] } => {
      const missingReqs: string[] = []

      if (singularity.requirements.previous) {
        if (!todasSingularidades.includes(singularity.requirements.previous)) {
          const prevSing = school?.singularities.find((s) => s.id === singularity.requirements.previous)
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
    [todasSingularidades, nivelAlma, attributes, skills, aptitudes, school],
  )

  const toggleSingularity = (id: string) => {
    if (!school) return

    const singularity = school.singularities.find((s) => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)
    const costInPC = singularity.cost

    if (isSelected) {
      onSingularidadesMarciaisChange(singularidadesMarciais.filter((s) => s !== id))
    } else {
      const { valid } = checkRequirements(singularity)
      if (!valid) return

      if (pontosCriacao.disponiveis >= costInPC) {
        onSingularidadesMarciaisChange([...singularidadesMarciais, id])
      }
    }
  }

  if (!selectedEscolaMarcial || !school) {
    return (
      <div className="space-y-4">
        <div className="border border-ecoar-teal/40 px-3 py-2.5 mb-2">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Escolas marciais</p>
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd]">
            Você pode comprar singularidades de várias escolas. Escolha uma escola, gaste PC e volte aqui para
            adicionar outra — nada é apagado ao trocar de escola.
          </p>
        </div>

        <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {allMartialSchools.map((schoolItem, index) => {
            const purchasedHere = schoolItem.singularities.filter((s) => todasSingularidades.includes(s.id)).length
            return (
              <SelectPlate
                key={schoolItem.id}
                index={index}
                title={schoolItem.name}
                description={schoolItem.description}
                onClick={() => onEscolaMarcialSelect(schoolItem.id)}
                meta={
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.1em] text-ecoar-teal">
                    <span>{schoolItem.class}</span>
                    <span>{schoolItem.aptitude}</span>
                    <span>{schoolItem.singularities.length} sing.</span>
                    {purchasedHere > 0 ? (
                      <span className="text-ecoar-magenta">{purchasedHere} compradas</span>
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Escola ativa</p>
          <h3 className="font-display text-lg uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
            {school.name}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.1em] text-ecoar-teal mt-0.5">Custo oficial em PC</p>
        </div>
        <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />
      </div>

      <StampButton tone="ghost" onClick={() => onEscolaMarcialSelect('')} className="w-full sm:w-auto">
        ← Trocar escola marcial
      </StampButton>
      <p className="text-[10px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd] -mt-2">
        Volta à grade para escolher outra escola. O que você já comprou em outras escolas continua valendo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {school.singularities.map((singularity) => {
          const isSelected = singularidadesMarciais.includes(singularity.id)
          const costInPC = singularity.cost
          const canAfford = pontosCriacao.disponiveis >= costInPC
          const { valid, missingReqs } = checkRequirements(singularity)
          const canSelect = valid && canAfford
          const requirementText = missingReqs.length > 0 ? missingReqs.join(', ') : undefined

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
    </div>
  )
}
