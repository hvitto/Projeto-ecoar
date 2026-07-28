'use client'

import { useMemo } from 'react'
import { Info } from 'lucide-react'
import { getRaceById } from '@/data/races'
import { getPathById } from '@/data/paths'
import { getSkillById } from '@/data/skills'
import { getLocationById } from '@/data/locations'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { getSoulLevelByNivel } from '@/data/soulLevels'
import { calculateCharacterLimits } from '@/lib/calculations'
import type { CharacterCreationData } from '@/components/wizard/CharacterCreationWizard'
import { martialSchoolCreationLabel } from '@/components/wizard/shared/wizardHelpers'

export function FinalReviewVisualizer({
  data,
}: {
  data: Partial<CharacterCreationData>
}) {
  const { getEcoarById } = useEcoarCatalogData()
  const selectedRace = data.raca ? getRaceById(data.raca) : null
  const martialSchoolLabel = martialSchoolCreationLabel(data.escolaMarcial)
  const selectedPath = data.trilha ? getPathById(data.trilha) : null
  const selectedLocation = data.localizacao ? getLocationById(data.localizacao) : null
  const selectedEcoar = data.ecoar ? getEcoarById(data.ecoar) : null

  const reviewLimits = useMemo(() => {
    if (data.corpo && data.mente && data.folego && data.mana) {
      return {
        corpoMax: data.corpo.max,
        menteMax: data.mente.max,
        folegoMax: data.folego.max,
        manaMax: data.mana.max,
      }
    }
    const nivelPoder = data.nivelPoder ?? getSoulLevelByNivel(data.nivelAlma ?? 1)?.nivelPoder ?? 3
    return calculateCharacterLimits({
      vitalidade: data.attributes?.vitalidade ?? 0,
      vontade: data.attributes?.vontade ?? 0,
      nivelPoder,
    })
  }, [data])

  const reviewCardClasses =
    'p-6 rounded-none border border-ecoar-dark/50 bg-gray-900/40 dark:bg-ecoar-light-900/10 dark:border-ecoar-light-900/20 backdrop-blur-sm'

  return (
    <div className="space-y-8 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-2 font-serif">Revisão Final</h3>
        <p className="text-slate-600 dark:text-ecoar-light-900/70">Revise todas as escolhas do seu personagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Informações Básicas</h4>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Nome:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.nome || 'Não definido'}</span></div>
            {selectedRace && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Raça:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedRace.name}</span></div>}
            {martialSchoolLabel && (
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60">Escola Marcial:</span>{' '}
                <span className="text-slate-900 dark:text-ecoar-light-900">{martialSchoolLabel.name}</span>
              </div>
            )}
            {selectedLocation && (
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60">Região:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedLocation.name}</span>
                {selectedLocation.nation && (
                  <div className="text-slate-400 dark:text-ecoar-light-900/50 text-xs mt-1 ml-4">{selectedLocation.nation}</div>
                )}
                {selectedLocation.region && (
                  <div className="text-ecoar-teal/70 text-xs mt-1 ml-4">{selectedLocation.region}</div>
                )}
              </div>
            )}
            {selectedPath && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Trilha:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedPath.name}</span></div>}
            {selectedEcoar && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Ecoar:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedEcoar.name}</span></div>}
          </div>
        </div>

        {/* Attributes Summary */}
        {data.attributes && (
          <div className={reviewCardClasses}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Atributos</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(data.attributes).map(([attr, value]) => (
                <div key={attr}>
                  <span className="text-slate-500 dark:text-ecoar-light-900/60 capitalize">{attr}:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Limites</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Corpo:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{reviewLimits.corpoMax}</span></div>
            <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Mente:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{reviewLimits.menteMax}</span></div>
            <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Fôlego:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{reviewLimits.folegoMax}</span></div>
            <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Mana:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{reviewLimits.manaMax}</span></div>
          </div>
        </div>

        {/* Skills Summary */}
        {data.skills && Object.keys(data.skills).length > 0 && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Habilidades</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(data.skills).map(([skillId, skillData]) => {
                const skill = getSkillById(skillId)
                if (!skill || skillData.level === 0) return null
                return (
                  <div key={skillId}>
                    <span className="text-slate-500 dark:text-ecoar-light-900/60">{skill.name}:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{skillData.level}</span>
                    {skillData.specialization && (
                      <span className="text-ecoar-magenta/60 text-xs ml-1">({skillData.specialization})</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Background */}
        {(data.backstory || data.personalidade) && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Background</h4>
            <div className="space-y-3 text-sm">
              {data.backstory && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">História:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.backstory}</span></div>}
              {data.personalidade && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Personalidade:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.personalidade}</span></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

