'use client'

import SingularityCard from '@/shared/components/ui/SingularityCard'
import SelectPlate from '@/components/beyond/SelectPlate'
import StampButton from '@/components/beyond/StampButton'
import RangeFrame from '@/components/beyond/RangeFrame'
import { paths, getPathById } from '@/data/paths'
import { getSoulLevelByNivel } from '@/data/soulLevels'
import {
  getPathBaseSingularitiesByPathId,
  getBruxariasByCategory,
  getAllCacadaPowers,
  getCacadaPowerById,
  getCacadaEnhancementsForPower,
  getCacadaEnhancementById,
  getBruxariaMaxSlots,
  getBruxariaExtraCount,
  getBruxariaExtraCostTotal,
  BRUXARIA_FREE_SLOTS,
  BRUXARIA_EXTRA_COST,
  type Bruxaria,
} from '@/data/pathSingularities'
import {
  EsperancaPathExtras,
  PatronosPathExtras,
  ViolenciaPathExtras,
} from '@/components/wizard/steps/pc-spending/PathExtrasPanels'

export function PathSingularitiesTab({
  selectedTrilha,
  selectedPathBase,
  selectedBruxarias,
  selectedCacadaPowers,
  selectedCacadaEnhancements,
  pathExtraIds,
  pathPatronChoice,
  pathHonorCode,
  onTrilhaSelect,
  onPathBaseSelect,
  onBruxariasChange,
  onCacadaPowersChange,
  onCacadaEnhancementsChange,
  onPathExtraIdsChange,
  onPathPatronChoiceChange,
  onPathHonorCodeChange,
  pontosDisponiveis,
  martialSingularityIds = [],
  nivelAlma = 1,
}: {
  selectedTrilha: string
  selectedPathBase: string
  selectedBruxarias: string[]
  selectedCacadaPowers: string[]
  selectedCacadaEnhancements: string[]
  pathExtraIds: string[]
  pathPatronChoice: string
  pathHonorCode: string
  onTrilhaSelect: (id: string) => void
  onPathBaseSelect: (id: string) => void
  onBruxariasChange: (ids: string[]) => void
  onCacadaPowersChange: (ids: string[]) => void
  onCacadaEnhancementsChange: (ids: string[]) => void
  onPathExtraIdsChange: (ids: string[]) => void
  onPathPatronChoiceChange: (id: string) => void
  onPathHonorCodeChange: (id: string) => void
  pontosDisponiveis: number
  martialSingularityIds?: string[]
  nivelAlma?: number
}) {
  const selectedPath = selectedTrilha ? getPathById(selectedTrilha) : null
  const pathBasesForTrilha = selectedTrilha ? getPathBaseSingularitiesByPathId(selectedTrilha) : []
  const nivelPoder = getSoulLevelByNivel(nivelAlma)?.nivelPoder ?? 1
  const bruxariaMaxSlots = getBruxariaMaxSlots(nivelPoder)
  const bruxariaExtraCount = getBruxariaExtraCount(selectedBruxarias.length)
  const bruxariaExtraCost = getBruxariaExtraCostTotal(selectedBruxarias.length)

  const togglePathBase = (id: string) => {
    if (selectedPathBase === id) {
      onPathBaseSelect('')
    } else {
      onPathBaseSelect(id)
    }
  }

  const toggleBruxaria = (id: string) => {
    if (selectedBruxarias.includes(id)) {
      onBruxariasChange(selectedBruxarias.filter((b) => b !== id))
      return
    }
    if (selectedBruxarias.length >= bruxariaMaxSlots) return
    const nextCount = selectedBruxarias.length + 1
    const addedCost = getBruxariaExtraCostTotal(nextCount) - getBruxariaExtraCostTotal(selectedBruxarias.length)
    if (addedCost > 0 && pontosDisponiveis < addedCost) return
    onBruxariasChange([...selectedBruxarias, id])
  }

  const toggleCacadaPower = (id: string) => {
    const power = getCacadaPowerById(id)
    if (!power) return

    const isSelected = selectedCacadaPowers.includes(id)

    if (isSelected) {
      const newPowers = selectedCacadaPowers.filter((p) => p !== id)
      const newEnhancements = selectedCacadaEnhancements.filter((e) => {
        const enh = getCacadaEnhancementById(e)
        return enh?.requirements.powerId !== id
      })
      onCacadaPowersChange(newPowers)
      onCacadaEnhancementsChange(newEnhancements)
      return
    }

    if (selectedCacadaPowers.length >= nivelPoder) return
    if (pontosDisponiveis < power.cost) return
    onCacadaPowersChange([...selectedCacadaPowers, id])
  }

  const toggleCacadaEnhancement = (id: string) => {
    const enhancement = getCacadaEnhancementById(id)
    if (!enhancement) return

    const isSelected = selectedCacadaEnhancements.includes(id)
    const hasPower = selectedCacadaPowers.includes(enhancement.requirements.powerId)

    if (!hasPower) return

    if (isSelected) {
      onCacadaEnhancementsChange(selectedCacadaEnhancements.filter((e) => e !== id))
      return
    }

    const otherEnhancements = selectedCacadaEnhancements.filter((e) => {
      const eData = getCacadaEnhancementById(e)
      return eData?.requirements.powerId === enhancement.requirements.powerId
    })

    if (enhancement.requirements.noOtherEnhancement && otherEnhancements.length > 0) {
      return
    }

    if (pontosDisponiveis < enhancement.cost) return
    onCacadaEnhancementsChange([...selectedCacadaEnhancements, id])
  }

  const clearPath = () => {
    onPathBaseSelect('')
    onBruxariasChange([])
    onCacadaPowersChange([])
    onCacadaEnhancementsChange([])
    onPathExtraIdsChange([])
    onPathPatronChoiceChange('')
    onPathHonorCodeChange('')
    onTrilhaSelect('')
  }

  if (!selectedPath) {
    return (
      <div className="space-y-4">
        <div className="border border-ecoar-teal/40 px-3 py-2.5">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Trilha</p>
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd]">
            Escolha uma trilha para ver singularidades disponíveis.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {paths.map((path, index) => (
            <SelectPlate
              key={path.id}
              index={index}
              title={path.name}
              description={path.description}
              onClick={() => onTrilhaSelect(path.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  const bruxariaCategories: Bruxaria['category'][] = [
    'destruicao',
    'terror',
    'ilusao',
    'agouro',
    'protecao',
    'reparacao',
    'controle',
  ]
  const categoryLabels: Record<Bruxaria['category'], string> = {
    destruicao: 'Bruxarias de Destruição',
    terror: 'Bruxarias de Terror',
    ilusao: 'Bruxarias de Ilusão',
    agouro: 'Bruxarias de Agouro',
    protecao: 'Bruxarias de Proteção',
    reparacao: 'Bruxarias de Reparação',
    controle: 'Bruxarias de Controle',
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border border-ecoar-teal/45 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Trilha ativa</p>
          <h4 className="font-display text-base uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
            {selectedPath.name}
          </h4>
          <p className="text-[11px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd] mt-1">
            {selectedPath.description}
          </p>
        </div>
        <StampButton tone="ghost" onClick={clearPath} className="shrink-0 w-full sm:w-auto">
          Remover trilha
        </StampButton>
      </div>

      {pathBasesForTrilha.length > 0 && (
        <RangeFrame title="Singularidade base" refId="PATH-BASE" bodyClassName="p-3">
          <div className="grid grid-cols-1 gap-2">
            {pathBasesForTrilha.map((pathBaseSingularity) => (
              <SingularityCard
                key={pathBaseSingularity.id}
                name={pathBaseSingularity.name}
                description={pathBaseSingularity.description}
                cost={pathBaseSingularity.cost}
                isSelected={selectedPathBase === pathBaseSingularity.id}
                canAfford={pontosDisponiveis >= pathBaseSingularity.cost}
                canSelect={
                  selectedPathBase === pathBaseSingularity.id ||
                  pontosDisponiveis >= pathBaseSingularity.cost
                }
                onClick={() => togglePathBase(pathBaseSingularity.id)}
                variant="teal"
              />
            ))}
          </div>
        </RangeFrame>
      )}

      {selectedTrilha === 'bruxaria' && selectedPathBase && (
        <RangeFrame title="Bruxarias" refId="PATH-BRX" bodyClassName="p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ecoar-teal">
              {selectedBruxarias.length}/{bruxariaMaxSlots} · {BRUXARIA_FREE_SLOTS} grátis
              {bruxariaExtraCount > 0 ? ` · ${bruxariaExtraCount} extras (${bruxariaExtraCost} PC)` : ''}
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-4">
            Você começa com {BRUXARIA_FREE_SLOTS} bruxarias gratuitas. Pode comprar até {nivelPoder} extras
            (igual ao Nível de Poder) por {BRUXARIA_EXTRA_COST} PC cada.
          </p>
          {bruxariaCategories.map((category) => {
            const categoryBruxarias = getBruxariasByCategory(category)
            if (categoryBruxarias.length === 0) return null

            return (
              <div key={category} className="space-y-2 mb-5 last:mb-0">
                <h5 className="font-display text-xs uppercase tracking-[0.04em] text-ecoar-dark-900 dark:text-ecoar-light-900 border-b border-ecoar-teal/35 pb-1.5">
                  {categoryLabels[category]}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categoryBruxarias.map((bruxaria) => {
                    const isSelected = selectedBruxarias.includes(bruxaria.id)
                    const atCap = !isSelected && selectedBruxarias.length >= bruxariaMaxSlots
                    const nextExtraCost =
                      getBruxariaExtraCostTotal(selectedBruxarias.length + 1) -
                      getBruxariaExtraCostTotal(selectedBruxarias.length)
                    const canAfford = isSelected || nextExtraCost <= 0 || pontosDisponiveis >= nextExtraCost
                    const canSelect = isSelected || (!atCap && canAfford)
                    return (
                      <button
                        key={bruxaria.id}
                        type="button"
                        onClick={() => {
                          if (!canSelect && !isSelected) return
                          toggleBruxaria(bruxaria.id)
                        }}
                        disabled={!canSelect && !isSelected}
                        className={`text-left border p-3 transition-colors ${
                          isSelected
                            ? 'border-ecoar-magenta bg-ecoar-magenta/10'
                            : canSelect
                              ? 'border-ecoar-teal/45 bg-[#0a0a0a]/40 hover:border-ecoar-teal'
                              : 'border-ecoar-teal/25 bg-[#0a0a0a]/25 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h6 className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 leading-tight flex-1">
                            {bruxaria.name}
                          </h6>
                          {isSelected ? (
                            <span className="text-[9px] uppercase tracking-[0.12em] text-ecoar-magenta shrink-0">
                              SEL
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd] line-clamp-2 mb-2">
                          {bruxaria.description}
                        </p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] uppercase tracking-[0.1em] text-ecoar-teal">
                          <span>Mana {bruxaria.manaCost}</span>
                          <span>·</span>
                          <span>{bruxaria.action}</span>
                          {bruxaria.range ? (
                            <>
                              <span>·</span>
                              <span>{bruxaria.range}</span>
                            </>
                          ) : null}
                          {!isSelected && nextExtraCost > 0 ? (
                            <>
                              <span>·</span>
                              <span className="text-ecoar-magenta">{nextExtraCost} PC</span>
                            </>
                          ) : null}
                        </div>
                        <p className="text-[10px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd] mt-2">
                          {bruxaria.effects}
                        </p>
                        {atCap ? (
                          <p className="text-[10px] text-ecoar-magenta mt-2">Limite de bruxarias atingido</p>
                        ) : null}
                        {!atCap && !isSelected && !canAfford ? (
                          <p className="text-[10px] text-ecoar-magenta mt-2">PC insuficiente para extra</p>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </RangeFrame>
      )}

      {selectedTrilha === 'cacada' && selectedPathBase && (
        <RangeFrame title="Poderes da caçada" refId="PATH-CAC" bodyClassName="p-3">
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-4">
            Você pode ter, no máximo, um número de poderes igual ao seu Nível de Poder.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {getAllCacadaPowers().map((power) => {
              const isSelected = selectedCacadaPowers.includes(power.id)
              const canAfford = pontosDisponiveis >= power.cost
              const atPowerCap = !isSelected && selectedCacadaPowers.length >= nivelPoder
              const canSelect = isSelected || (canAfford && !atPowerCap)
              const enhancements = getCacadaEnhancementsForPower(power.id, selectedPathBase)

              return (
                <div key={power.id} className="space-y-2">
                  <SingularityCard
                    name={power.name}
                    description={power.description}
                    cost={power.cost}
                    isSelected={isSelected}
                    canAfford={canAfford}
                    canSelect={canSelect}
                    onClick={() => toggleCacadaPower(power.id)}
                    variant="teal"
                  />
                  {isSelected && enhancements.length > 0 ? (
                    <div className="ml-3 space-y-2 border-l-2 border-ecoar-teal/40 pl-3">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal">Aprimoramentos</p>
                      {enhancements.map((enhancement) => {
                        const isEnhSelected = selectedCacadaEnhancements.includes(enhancement.id)
                        const canAffordEnh = isEnhSelected || pontosDisponiveis >= enhancement.cost
                        const hasOtherEnh = selectedCacadaEnhancements.some((e) => {
                          const eData = getCacadaEnhancementById(e)
                          return eData?.requirements.powerId === power.id && e !== enhancement.id
                        })
                        const canSelectEnh =
                          isEnhSelected ||
                          (canAffordEnh && !(enhancement.requirements.noOtherEnhancement && hasOtherEnh))

                        return (
                          <SingularityCard
                            key={enhancement.id}
                            name={enhancement.name}
                            description={enhancement.description}
                            cost={enhancement.cost}
                            isSelected={isEnhSelected}
                            canAfford={canAffordEnh}
                            canSelect={canSelectEnh}
                            onClick={() => toggleCacadaEnhancement(enhancement.id)}
                            variant="teal"
                            className="text-sm"
                          />
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </RangeFrame>
      )}

      {selectedTrilha === 'esperanca' && selectedPathBase ? (
        <EsperancaPathExtras
          pathSingularityBase={selectedPathBase}
          pathExtraIds={pathExtraIds}
          onPathExtraIdsChange={onPathExtraIdsChange}
          pontosDisponiveis={pontosDisponiveis}
          martialSingularityIds={martialSingularityIds}
          nivelAlma={nivelAlma}
        />
      ) : null}

      {selectedTrilha === 'patronos' && selectedPathBase ? (
        <PatronosPathExtras
          pathSingularityBase={selectedPathBase}
          pathExtraIds={pathExtraIds}
          onPathExtraIdsChange={onPathExtraIdsChange}
          pathPatronChoice={pathPatronChoice}
          onPathPatronChoiceChange={onPathPatronChoiceChange}
          pontosDisponiveis={pontosDisponiveis}
          martialSingularityIds={martialSingularityIds}
          nivelAlma={nivelAlma}
        />
      ) : null}

      {selectedTrilha === 'violencia' && selectedPathBase ? (
        <ViolenciaPathExtras
          pathSingularityBase={selectedPathBase}
          pathExtraIds={pathExtraIds}
          onPathExtraIdsChange={onPathExtraIdsChange}
          pathHonorCode={pathHonorCode}
          onPathHonorCodeChange={onPathHonorCodeChange}
          pontosDisponiveis={pontosDisponiveis}
          martialSingularityIds={martialSingularityIds}
          nivelAlma={nivelAlma}
        />
      ) : null}
    </div>
  )
}
