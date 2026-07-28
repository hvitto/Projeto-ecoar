'use client'

import { useState, useEffect } from 'react'
import { PointBanner } from '@/components/beyond/WizardStage'
import SelectPlate from '@/components/beyond/SelectPlate'
import StampButton from '@/components/beyond/StampButton'
import RangeFrame from '@/components/beyond/RangeFrame'
import { getAllMartialSchools, getMartialSchoolDataByIdResolved } from '@/data/martialSchoolSingularities'
import { MartialSchoolSingularitiesPurchase } from '@/components/wizard/steps/pc-spending/MartialSchoolSingularitiesPurchase'

export function MartialSchoolPCSpendingStep({
  selectedEscolaMarcial,
  onSelect,
  singularidadesMarciais,
  onSingularidadesChange,
  pontosDisponiveis,
  onPointsChange,
  nivelAlma,
}: {
  selectedEscolaMarcial: string
  onSelect: (id: string) => void
  singularidadesMarciais: string[]
  onSingularidadesChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  nivelAlma: number
}) {
  const allMartialSchools = getAllMartialSchools()
  const [showSingularities, setShowSingularities] = useState(false)
  const school = selectedEscolaMarcial ? getMartialSchoolDataByIdResolved(selectedEscolaMarcial) : null

  useEffect(() => {
    if (!selectedEscolaMarcial || !school) {
      onPointsChange(0)
      return
    }
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = school.singularities.find((s) => s.id === singId)
      return sum + (sing ? sing.cost : 0)
    }, 0)
    onPointsChange(total)
  }, [singularidadesMarciais, selectedEscolaMarcial, school, onPointsChange])

  if (!selectedEscolaMarcial) {
    return (
      <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
        <div className="border border-ecoar-teal/40 px-3 py-2.5">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Escola marcial</p>
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd]">
            Escolha sua escola marcial e compre singularidades com Pontos de Criação
          </p>
        </div>
        <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {allMartialSchools.map((schoolItem, index) => (
            <SelectPlate
              key={schoolItem.id}
              index={index}
              title={schoolItem.name}
              description={schoolItem.description}
              onClick={() => {
                onSelect(schoolItem.id)
                setShowSingularities(false)
              }}
              meta={
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.1em] text-ecoar-teal">
                  <span>{schoolItem.class}</span>
                  <span>{schoolItem.aptitude}</span>
                  <span>{schoolItem.singularities.length} sing.</span>
                </div>
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (!school) return null

  if (showSingularities) {
    return (
      <MartialSchoolSingularitiesPurchase
        escolaMarcial={school}
        singularidadesMarciais={singularidadesMarciais}
        onSingularidadesChange={onSingularidadesChange}
        pontosDisponiveis={pontosDisponiveis}
        onPointsChange={onPointsChange}
        nivelAlma={nivelAlma}
        onBack={() => setShowSingularities(false)}
      />
    )
  }

  const currentIndex = allMartialSchools.findIndex((s) => s.id === selectedEscolaMarcial)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelect(allMartialSchools[currentIndex - 1].id)
    } else {
      onSelect(allMartialSchools[allMartialSchools.length - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIndex < allMartialSchools.length - 1) {
      onSelect(allMartialSchools[currentIndex + 1].id)
    } else {
      onSelect(allMartialSchools[0].id)
    }
  }

  return (
    <div className="space-y-4 flex flex-col h-full max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
      <div className="border-b border-ecoar-teal/40 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <StampButton tone="ghost" onClick={() => onSelect('')} className="w-full sm:w-auto">
            ← Voltar para seleção
          </StampButton>
          <div className="flex items-center gap-2">
            <StampButton tone="grid" onClick={handlePrevious} className="min-w-[2.5rem] px-3">
              ‹
            </StampButton>
            <span className="text-[10px] uppercase tracking-[0.12em] text-ecoar-teal tabular-nums">
              {currentIndex + 1} / {allMartialSchools.length}
            </span>
            <StampButton tone="grid" onClick={handleNext} className="min-w-[2.5rem] px-3">
              ›
            </StampButton>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Escola marcial</p>
            <h3 className="font-display text-lg uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
              {school.name}
            </h3>
          </div>
          <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />
        </div>
        <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mt-2">
          {school.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
        <div className="border border-ecoar-teal/40 bg-[#0a0a0a]/40 min-h-[280px] flex items-center justify-center">
          <span className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal/60">Imagem PNG</span>
        </div>

        <div className="space-y-3">
          <RangeFrame title="Informações" refId="MS-INFO" bodyClassName="p-3">
            <div className="grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.08em] mb-3">
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
            {school.toolNote ? (
              <p className="text-[10px] leading-snug text-ecoar-magenta border border-ecoar-magenta/30 px-2 py-1.5 italic">
                ↪ {school.toolNote}
              </p>
            ) : null}
          </RangeFrame>

          <div className="border border-ecoar-teal/45 p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
                  Singularidades
                </h4>
                <p className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal mt-0.5">
                  {school.singularities.length} disponíveis · custo oficial em PC
                </p>
              </div>
              <StampButton onClick={() => setShowSingularities(true)} className="w-full sm:w-auto shrink-0">
                Comprar
              </StampButton>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ecoar-teal/35 pt-3">
        <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-2">Navegação rápida</p>
        <div className="flex flex-wrap gap-1">
          {allMartialSchools.map((s) => {
            const isActive = s.id === selectedEscolaMarcial
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                title={s.name}
                className={`px-2 py-1.5 text-[9px] uppercase tracking-[0.1em] border transition-colors ${
                  isActive
                    ? 'border-ecoar-magenta bg-ecoar-magenta/15 text-ecoar-magenta'
                    : 'border-ecoar-teal/45 text-ecoar-teal hover:border-ecoar-teal'
                }`}
              >
                {s.name.split(' ')[0]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
