'use client'

import { useState, useEffect } from 'react'
import { skills as skillsData, getSkillsByCategory, getSkillById, Skill } from '@/data/skills'
import { getSkillDice } from '@/lib/calculations'
import WizardStage, { PointBanner, LevelStepper } from '@/components/beyond/WizardStage'
import StampButton from '@/components/beyond/StampButton'

export function SkillsStep({
  skills,
  skillPoints,
  pontosCriacao,
  onSkillsChange,
  onSkillPointsChange,
  onPointsChange,
  isEvolutionStep = false,
}: {
  skills: Record<string, { level: number; specialization?: string }>
  skillPoints: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onSkillPointsChange: (points: number) => void
  onPointsChange: (gastos: number) => void
  isEvolutionStep?: boolean
}) {
  void onPointsChange

  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Skill['category']>('combate')

  useEffect(() => {
    const categorySkills = getSkillsByCategory(selectedCategory)
    if (categorySkills.length > 0 && (!selectedSkill || !categorySkills.find((s) => s.id === selectedSkill))) {
      setSelectedSkill(categorySkills[0].id)
    }
  }, [selectedCategory, selectedSkill])

  const categories: Skill['category'][] = [
    'combate',
    'primarias',
    'artisticas',
    'cientificas',
    'motoras',
    'sociais',
    'gerais',
  ]

  const categoryLabels: Record<Skill['category'], string> = {
    combate: 'Combate',
    primarias: 'Primárias',
    artisticas: 'Artísticas',
    cientificas: 'Científicas',
    motoras: 'Motoras',
    sociais: 'Sociais',
    gerais: 'Gerais',
  }

  const getSkillFreeCost = (category: Skill['category']): number => {
    if (category === 'combate' || category === 'primarias') return 2
    return 1
  }

  const getSkillPCCost = (category: Skill['category']): number => {
    if (category === 'combate' || category === 'primarias') return 10
    return 5
  }

  const getMaxLevel = () => (isEvolutionStep ? 8 : 3)

  const normalizeSkillState = (level: number, specialization?: string) => {
    const sanitizedLevel = Math.max(0, level)
    return {
      level: sanitizedLevel,
      specialization: sanitizedLevel > 0 ? specialization : undefined,
    }
  }

  const getSkillTotalCost = (
    skillId: string,
    skillState: { level: number; specialization?: string },
  ) => {
    const skillData = getSkillById(skillId)
    if (!skillData) return 0

    const normalizedState = normalizeSkillState(skillState.level, skillState.specialization)
    const costPerLevel = getSkillFreeCost(skillData.category)
    return normalizedState.level * costPerLevel + (normalizedState.specialization ? costPerLevel : 0)
  }

  const calculateFreePointsUsed = () => {
    return Object.entries(skills).reduce((total, [skillId, skillData]) => {
      return total + getSkillTotalCost(skillId, skillData)
    }, 0)
  }

  const calculatePCUsed = () => {
    const freeUsed = calculateFreePointsUsed()
    const overFree = Math.max(0, freeUsed - 48)
    if (overFree === 0) return 0

    let estimatedPC = 0
    let totalPointsInSkills = 0

    Object.entries(skills).forEach(([skillId, skill]) => {
      if (skill.level > 0) {
        const skillData = getSkillById(skillId)
        if (skillData) {
          const freeCost = getSkillFreeCost(skillData.category)
          const pcCost = getSkillPCCost(skillData.category)
          const skillCost = skill.level * freeCost + (skill.specialization ? freeCost : 0)
          totalPointsInSkills += skillCost
          estimatedPC += skill.level * pcCost + (skill.specialization ? pcCost : 0)
        }
      }
    })

    if (totalPointsInSkills <= 48) return 0

    const ratio = overFree / totalPointsInSkills
    return estimatedPC * ratio
  }

  void calculatePCUsed

  const updateSkill = (skillId: string, level: number, specialization?: string) => {
    const skill = getSkillById(skillId)
    if (!skill) return

    const currentSkill = normalizeSkillState(
      skills[skillId]?.level || 0,
      skills[skillId]?.specialization,
    )
    const maxLevel = getMaxLevel()
    const nextSkill = normalizeSkillState(Math.min(level, maxLevel), specialization)

    const oldCost = getSkillTotalCost(skillId, currentSkill)
    const newCost = getSkillTotalCost(skillId, nextSkill)

    const currentFreeUsed = calculateFreePointsUsed()
    const newFreeUsed = currentFreeUsed - oldCost + newCost

    if (newFreeUsed > 48) {
      return
    }

    if (skillPoints + oldCost >= newCost && nextSkill.level <= maxLevel) {
      onSkillsChange({
        ...skills,
        [skillId]: nextSkill,
      })
      onSkillPointsChange(Math.max(0, Math.min(48, 48 - newFreeUsed)))
    }
  }

  const randomizeSkills = () => {
    const maxLevel = getMaxLevel()
    const allSkills = skillsData
    const newSkills: Record<string, { level: number; specialization?: string }> = {}
    let remainingPoints = 48

    const availableSkills = allSkills.map((skill) => ({
      skill,
      costPerLevel: getSkillFreeCost(skill.category),
    }))

    const shuffledSkills = [...availableSkills].sort(() => Math.random() - 0.5)

    let attempts = 0
    const maxAttempts = 500

    while (remainingPoints > 0 && attempts < maxAttempts) {
      attempts++
      let distributed = false

      for (const { skill, costPerLevel } of shuffledSkills) {
        if (remainingPoints < costPerLevel) continue

        const currentLevel = newSkills[skill.id]?.level || 0
        if (currentLevel >= maxLevel) continue

        if (Math.random() < 0.6 && remainingPoints >= costPerLevel) {
          const newLevel = Math.min(currentLevel + 1, maxLevel)
          const cost = costPerLevel

          if (remainingPoints >= cost) {
            newSkills[skill.id] = { level: newLevel }
            remainingPoints -= cost
            distributed = true
            break
          }
        }
      }

      if (!distributed) break
    }

    const skillsWithLevels = Object.entries(newSkills)
      .filter(([_, data]) => data.level > 0)
      .map(([skillId]) => {
        const skill = getSkillById(skillId)
        return skill ? { skillId, skill } : null
      })
      .filter(Boolean) as Array<{ skillId: string; skill: Skill }>

    const shuffledWithLevels = [...skillsWithLevels].sort(() => Math.random() - 0.5)

    for (const { skillId, skill } of shuffledWithLevels) {
      if (remainingPoints <= 0) break

      if (!newSkills[skillId].specialization && skill.specializations.length > 0) {
        const costPerLevel = getSkillFreeCost(skill.category)

        if (Math.random() < 0.4 && remainingPoints >= costPerLevel) {
          const randomSpec = skill.specializations[Math.floor(Math.random() * skill.specializations.length)]
          newSkills[skillId] = {
            ...newSkills[skillId],
            specialization: randomSpec.id,
          }
          remainingPoints -= costPerLevel
        }
      }
    }

    if (remainingPoints > 0) {
      for (const { skill, costPerLevel } of shuffledSkills) {
        if (remainingPoints < costPerLevel) continue

        const currentLevel = newSkills[skill.id]?.level || 0
        if (currentLevel >= maxLevel) {
          if (!newSkills[skill.id]?.specialization && skill.specializations.length > 0 && remainingPoints >= costPerLevel) {
            const randomSpec = skill.specializations[Math.floor(Math.random() * skill.specializations.length)]
            newSkills[skill.id] = {
              level: currentLevel,
              specialization: randomSpec.id,
            }
            remainingPoints -= costPerLevel
          }
        } else {
          if (remainingPoints >= costPerLevel) {
            const newLevel = Math.min(currentLevel + 1, maxLevel)
            newSkills[skill.id] = { level: newLevel }
            remainingPoints -= costPerLevel
          }
        }

        if (remainingPoints <= 0) break
      }
    }

    const freeUsed = Object.entries(newSkills).reduce((total, [skillId, skillData]) => {
      return total + getSkillTotalCost(skillId, skillData)
    }, 0)

    onSkillsChange(newSkills)
    onSkillPointsChange(Math.max(0, Math.min(48, 48 - freeUsed)))
  }

  const getCanIncrease = (skillId: string) => {
    const skill = getSkillById(skillId)
    if (!skill) return false

    const skillData = skills[skillId] || { level: 0, specialization: undefined }
    const freeCostPerLevel = getSkillFreeCost(skill.category)
    const maxLevel = getMaxLevel()
    const currentCost = skillData.level * freeCostPerLevel + (skillData.specialization ? freeCostPerLevel : 0)

    const currentFreeUsed = calculateFreePointsUsed()
    const newCostIfIncrease = currentCost + freeCostPerLevel
    const newFreeUsed = currentFreeUsed - currentCost + newCostIfIncrease

    if (newFreeUsed <= 48) {
      return skillPoints >= freeCostPerLevel && skillData.level < maxLevel
    }

    const pointsOverFree = newFreeUsed - 48
    const pcCostPerLevel = getSkillPCCost(selectedCategory)
    const pcCost = pointsOverFree * (pcCostPerLevel / freeCostPerLevel)
    return pontosCriacao.disponiveis >= pcCost && skillData.level < maxLevel
  }

  const selectedSkillData = selectedSkill ? getSkillById(selectedSkill) : null
  const selectedSkillState = selectedSkill
    ? skills[selectedSkill] || { level: 0, specialization: undefined }
    : null

  return (
    <WizardStage
      title={isEvolutionStep ? 'Evoluir Habilidades' : 'Habilidades'}
      refId="STEP-03"
      lede="48 pontos gratuitos. Combate/Primárias custam 2 pt por nível; demais categorias, 1 pt. Especialidade custa o mesmo que um nível."
      hero="glitch"
    >
      <PointBanner
        label="Pontos gratuitos"
        value={skillPoints}
        danger={skillPoints < 0}
        action={
          <StampButton tone="grid" onClick={randomizeSkills}>
            Aleatório
          </StampButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(7rem,0.75fr)_1.4fr_minmax(14rem,1fr)] gap-px bg-ecoar-teal/40 border border-ecoar-teal/50">
        <div className="bg-[#0a0a0a]/75 flex flex-col">
          {categories.map((category) => {
            const categorySkills = getSkillsByCategory(category)
            if (categorySkills.length === 0) return null

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category)
                  const firstSkill = categorySkills[0]
                  if (firstSkill) setSelectedSkill(firstSkill.id)
                }}
                className={`text-left px-3 py-2.5 border-b border-ecoar-teal/30 last:border-b-0 transition-colors ${
                  selectedCategory === category
                    ? 'bg-ecoar-magenta text-[var(--ecoar-accent-ink)]'
                    : 'text-ecoar-dark-900 dark:text-ecoar-light-900 hover:bg-ecoar-teal/10'
                }`}
              >
                <span className="font-display text-[11px] uppercase tracking-[-0.01em] leading-tight block">
                  {categoryLabels[category]}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-[0.12em] mt-0.5 block ${
                    selectedCategory === category ? 'text-[var(--ecoar-accent-ink)]/80' : 'text-ecoar-teal'
                  }`}
                >
                  {categorySkills.length} itens
                </span>
              </button>
            )
          })}
        </div>

        <div className="bg-[#0a0a0a]/75 border-x border-ecoar-teal/30 lg:border-x-0">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-ecoar-teal border-b border-ecoar-teal/35">
            <span>Habilidade</span>
            <span className="w-16 text-center">Dado</span>
            <span className="w-[7.5rem] text-center">Nível</span>
          </div>

          <div className="max-h-[min(520px,60vh)] overflow-y-auto custom-scrollbar">
            {getSkillsByCategory(selectedCategory).map((skill) => {
              const skillData = skills[skill.id] || { level: 0, specialization: undefined }
              const freeCostPerLevel = getSkillFreeCost(skill.category)
              const currentCost =
                skillData.level * freeCostPerLevel + (skillData.specialization ? freeCostPerLevel : 0)
              const isSelected = selectedSkill === skill.id
              const canIncrease = getCanIncrease(skill.id)

              return (
                <div
                  key={skill.id}
                  className={`grid grid-cols-[1fr_auto_auto] gap-2 items-center px-3 py-2 border-b border-ecoar-teal/20 last:border-b-0 ${
                    isSelected ? 'bg-ecoar-magenta/10' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSkill(skill.id)}
                    className="text-left min-w-0"
                  >
                    <span className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 block truncate">
                      {skill.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.1em] text-ecoar-teal">
                      {currentCost} pt
                    </span>
                  </button>
                  <span className="w-16 text-center text-[10px] uppercase tracking-[0.1em] text-ecoar-teal tabular-nums">
                    {getSkillDice(skillData.level)}
                  </span>
                  <div className="w-[7.5rem] flex justify-center">
                    <LevelStepper
                      value={skillData.level}
                      canDecrease={skillData.level > 0}
                      canIncrease={canIncrease}
                      onDecrease={() =>
                        updateSkill(skill.id, Math.max(0, skillData.level - 1), skillData.specialization)
                      }
                      onIncrease={() => updateSkill(skill.id, skillData.level + 1, skillData.specialization)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#0a0a0a]/75 p-3 sm:p-4 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l border-ecoar-teal/30">
          {selectedSkillData && selectedSkillState ? (
            <>
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1">Detalhe</p>
                <h3 className="font-display text-base uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
                  {selectedSkillData.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] uppercase tracking-[0.12em]">
                  <span className="text-ecoar-teal">
                    Dado <span className="text-ecoar-magenta">{getSkillDice(selectedSkillState.level)}</span>
                  </span>
                  <span className="text-ecoar-teal">
                    Custo{' '}
                    <span className="text-ecoar-magenta">
                      {getSkillFreeCost(selectedSkillData.category)} pt/nível
                    </span>
                  </span>
                  <span className="text-ecoar-teal">
                    Máx <span className="text-ecoar-magenta">{getMaxLevel()}</span>
                  </span>
                </div>
              </div>

              {selectedSkillData.specializations.length > 0 ? (
                <div className="mt-auto border-t border-ecoar-teal/30 pt-3">
                  <label
                    htmlFor={`spec-${selectedSkillData.id}`}
                    className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1.5 block"
                  >
                    Especialidade (+{getSkillFreeCost(selectedSkillData.category)} pt)
                  </label>
                  <select
                    id={`spec-${selectedSkillData.id}`}
                    value={selectedSkillState.specialization || ''}
                    onChange={(e) => {
                      if (selectedSkillState.level === 0) {
                        updateSkill(selectedSkillData.id, 0, undefined)
                        return
                      }
                      updateSkill(
                        selectedSkillData.id,
                        selectedSkillState.level,
                        e.target.value || undefined,
                      )
                    }}
                    disabled={selectedSkillState.level === 0}
                    className="w-full px-2.5 py-2 bg-[#0a0a0a]/60 border border-ecoar-teal/50 text-ecoar-dark-900 dark:text-ecoar-light-900 text-[11px] focus:outline-none focus:border-ecoar-magenta disabled:opacity-40"
                  >
                    <option value="">Nenhuma</option>
                    {selectedSkillData.specializations.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-[10px] uppercase tracking-[0.12em] text-ecoar-dark-500 dark:text-[#adb5bd]">
              Selecione uma habilidade
            </p>
          )}
        </div>
      </div>
    </WizardStage>
  )
}
