'use client'

import SelectPlate from '@/components/beyond/SelectPlate'
import RangeFrame from '@/components/beyond/RangeFrame'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { getDisturbiosPontosEcoarObtidos } from '@/data/disturbios'
import { EcoarSingularitiesList } from '@/components/wizard/steps/pc-spending/EcoarSingularitiesList'
import { DisturbiosEcoarPanel } from '@/components/disturbios/DisturbiosEcoarPanel'

export function EcoarSelection({
  selectedEcoar,
  singularidadesEcoar,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  disturbios,
  onDisturbiosChange,
  ecoarAcoes,
  onEcoarAcoesChange,
  nivelAlma,
  nivelPoder,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  disturbios: import('@/data/disturbios').DisturbioOwnedEntry[]
  onDisturbiosChange: (entries: import('@/data/disturbios').DisturbioOwnedEntry[]) => void
  ecoarAcoes: string[]
  onEcoarAcoesChange: (ids: string[]) => void
  nivelAlma: number
  nivelPoder: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const { playableEcoarTypes, getEcoarSingularityById } = useEcoarCatalogData()
  const pontosEcoarObtidos = getDisturbiosPontosEcoarObtidos(disturbios)
  const pontosEcoarGastos = singularidadesEcoar.reduce((sum, id) => {
    return sum + (getEcoarSingularityById(id)?.cost ?? 0)
  }, 0)
  const pontosEcoarDisponiveis = pontosEcoarObtidos - pontosEcoarGastos

  return (
    <div className="space-y-5">
      <RangeFrame title="Tipo de Ecoar" refId="ECOAR-TYPE" bodyClassName="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {playableEcoarTypes.map((ecoa, index) => (
            <SelectPlate
              key={ecoa.id}
              index={index}
              title={ecoa.name}
              description={ecoa.description}
              selected={selectedEcoar === ecoa.id}
              onClick={() => {
                if (selectedEcoar === ecoa.id) {
                  onEcoarSelect('')
                  onSingularidadesEcoarChange([])
                  return
                }
                if (selectedEcoar && selectedEcoar !== ecoa.id) {
                  onSingularidadesEcoarChange([])
                }
                onEcoarSelect(ecoa.id)
              }}
            />
          ))}
        </div>
      </RangeFrame>

      {selectedEcoar ? (
        <>
          <DisturbiosEcoarPanel
            entries={disturbios}
            onEntriesChange={onDisturbiosChange}
            ecoarAcoesOwned={ecoarAcoes}
            onEcoarAcoesChange={onEcoarAcoesChange}
            nivelPoder={nivelPoder}
            pontosEcoarGastos={pontosEcoarGastos}
          />
          <EcoarSingularitiesList
            selectedEcoar={selectedEcoar}
            singularidadesEcoar={singularidadesEcoar}
            onSingularidadesEcoarChange={onSingularidadesEcoarChange}
            pontosEcoarDisponiveis={pontosEcoarDisponiveis}
            nivelAlma={nivelAlma}
            attributes={attributes}
            skills={skills}
            aptitudes={aptitudes}
          />
        </>
      ) : null}
    </div>
  )
}
