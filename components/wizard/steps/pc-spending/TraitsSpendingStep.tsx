'use client'

import { useState } from 'react'
import { PointBanner } from '@/components/beyond/WizardStage'
import RangeFrame from '@/components/beyond/RangeFrame'
import { AttributesStep } from '@/components/wizard/steps/AttributesStep'
import { AptitudesStep } from '@/components/wizard/steps/AptitudesStep'

const TABS = [
  { id: 'atributos' as const, label: 'Atributos · 10 PC/pt' },
  { id: 'habilidades' as const, label: 'Habilidades' },
  { id: 'aptidoes' as const, label: 'Aptidões · 20 PC/pt' },
]

export function TraitsSpendingStep({
  attributes,
  skills,
  aptitudes,
  pontosDisponiveis,
  raceBonuses,
  martialSchoolBonuses,
  onAttributesChange,
  onSkillsChange,
  onAptitudesChange,
}: {
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  pontosDisponiveis: number
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  onAttributesChange: (attrs: Record<string, number>) => void
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onAptitudesChange: (apts: Record<string, number>) => void
}) {
  const [activeTab, setActiveTab] = useState<'atributos' | 'habilidades' | 'aptidoes'>('atributos')

  const calculateTotalBasePoints = (attrs: Record<string, number>) => {
    return Object.entries(attrs).reduce((sum, [a, v]) => {
      const rB = raceBonuses[a] || 0
      const mB = martialSchoolBonuses[a] || 0
      const cB = 0
      const totalBonus = rB + mB + cB
      return sum + Math.max(0, v - totalBonus)
    }, 0)
  }

  const calculateAptitudeTotal = (apts: Record<string, number>) => {
    return Object.values(apts).reduce((sum, l) => sum + l, 0)
  }

  const updateAttributeWithPC = (attr: string, newTotalValue: number) => {
    const attrKey = attr as keyof typeof attributes
    const oldValue = attributes[attrKey]
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const classBonus = 0
    const totalBonus = raceBonus + martialSchoolBonus + classBonus

    const maxTotalValue = 3 + totalBonus
    const newValue = Math.max(0, Math.min(maxTotalValue, newTotalValue))

    if (newValue === oldValue) return

    const oldTotalBase = calculateTotalBasePoints(attributes)
    const newAttributes = { ...attributes, [attr]: newValue }
    const newTotalBase = calculateTotalBasePoints(newAttributes)

    const oldPointsOverFree = Math.max(0, oldTotalBase - 12)
    const newPointsOverFree = Math.max(0, newTotalBase - 12)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    const costInPC = pointsOverFreeDiff * 10
    if (costInPC > 0 && pontosDisponiveis < costInPC) return
    onAttributesChange(newAttributes)
  }

  const handleAptitudesChange = (newAptitudes: Record<string, number>) => {
    onAptitudesChange(newAptitudes)
  }

  return (
    <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
      <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />

      <div className="flex flex-wrap gap-px bg-ecoar-teal/40 border border-ecoar-teal/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[6rem] px-3 py-2.5 text-[10px] uppercase tracking-[0.12em] transition-colors ${
              activeTab === tab.id
                ? 'bg-ecoar-magenta text-[var(--ecoar-accent-ink)]'
                : 'bg-[#0a0a0a]/75 text-ecoar-dark-900 dark:text-ecoar-light-900 hover:bg-ecoar-teal/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <RangeFrame title="Traços" refId="PC-TRAÇOS" bodyClassName="p-0">
        {activeTab === 'atributos' && (
          <div className="p-1">
            <AttributesStep
              attributes={attributes}
              attributePoints={0}
              pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: Math.max(0, pontosDisponiveis) }}
              onUpdate={updateAttributeWithPC}
              raceBonuses={raceBonuses}
              martialSchoolBonuses={martialSchoolBonuses}
              classBonuses={{}}
              onRandomize={() => {}}
              onPointsChange={() => {}}
              isEvolutionStep={true}
            />
          </div>
        )}

        {activeTab === 'habilidades' && (
          <div className="p-6 text-center border border-ecoar-teal/35 mx-3 my-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-ecoar-teal mb-2">Em desenvolvimento</p>
            <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd]">
              Funcionalidade de gastar PC em habilidades em desenvolvimento
            </p>
          </div>
        )}

        {activeTab === 'aptidoes' && (
          <div className="p-1">
            <AptitudesStep
              aptitudes={aptitudes}
              pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: Math.max(0, pontosDisponiveis) }}
              onAptitudesChange={handleAptitudesChange}
              onPointsChange={() => {}}
              aptitudePoints={Math.max(0, 3 - calculateAptitudeTotal(aptitudes))}
              onAptitudePointsChange={() => {}}
              isEvolutionStep={true}
            />
          </div>
        )}
      </RangeFrame>
    </div>
  )
}
