'use client'

import SingularityCard from '@/shared/components/ui/SingularityCard'
import { PointBanner } from '@/components/beyond/WizardStage'
import { getRaceById } from '@/data/races'
import {
  getRacialSingularitiesByRaceId,
  getRacialSingularityById,
  pruneRacialSingularitiesToValidRequirements,
} from '@/data/racialSingularities'

export function RacialSingularitiesTab({
  selectedRaca,
  singularidadesRaciais,
  onSingularidadesRaciaisChange,
  pontosDisponiveis,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedRaca: string
  singularidadesRaciais: string[]
  onSingularidadesRaciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  void nivelAlma
  void attributes
  void skills
  void aptitudes

  const race = selectedRaca ? getRaceById(selectedRaca) : null
  const racialList = selectedRaca ? getRacialSingularitiesByRaceId(selectedRaca) : []

  const toggleRacial = (id: string) => {
    const singularity = getRacialSingularityById(id)
    if (!singularity) return
    const isSelected = singularidadesRaciais.includes(id)
    if (isSelected) {
      onSingularidadesRaciaisChange(
        pruneRacialSingularitiesToValidRequirements(singularidadesRaciais.filter((s) => s !== id)),
      )
      return
    }
    const hasRequirements = (singularity.requirements ?? []).every((reqId) => singularidadesRaciais.includes(reqId))
    if (!hasRequirements) return
    if (pontosCriacao.disponiveis < singularity.cost) return
    onSingularidadesRaciaisChange([...singularidadesRaciais, id])
  }

  if (!selectedRaca || !race) {
    return (
      <div className="space-y-4">
        <div className="border border-ecoar-teal/40 px-3 py-2.5">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Singularidades raciais</p>
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd]">
            Selecione uma raça na Etapa 1 para ver singularidades raciais disponíveis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Raça</p>
          <h3 className="font-display text-lg uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
            {race.name}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.1em] text-ecoar-teal mt-0.5">Talentos raciais</p>
        </div>
        <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {racialList.map((singularity) => {
          const isSelected = singularidadesRaciais.includes(singularity.id)
          const hasRequirements = (singularity.requirements ?? []).every((reqId) =>
            singularidadesRaciais.includes(reqId),
          )
          const canAfford = pontosCriacao.disponiveis >= singularity.cost
          const canSelect = isSelected || (hasRequirements && canAfford)
          return (
            <SingularityCard
              key={singularity.id}
              name={singularity.name}
              description={singularity.description}
              cost={singularity.cost}
              costLabel={singularity.cost === 0 ? undefined : 'PC'}
              secondaryCost={singularity.cost === 0 ? 'Inata' : undefined}
              isSelected={isSelected}
              canAfford={canAfford}
              canSelect={canSelect}
              onClick={() => toggleRacial(singularity.id)}
              effects={singularity.effects}
              requirementsText={!hasRequirements ? 'Requer talento racial anterior' : undefined}
              variant="teal"
            />
          )
        })}
      </div>
    </div>
  )
}
