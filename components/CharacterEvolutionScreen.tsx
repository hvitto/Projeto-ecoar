'use client'

import { useMemo, useState, useCallback } from 'react'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { saveCharacter } from '@/lib/storage/characterStorage'
import { useAuth } from '@/contexts/AuthContext'
import { getSoulLevelByPontosEvolucao } from '@/data/soulLevels'
import { getSkillDice } from '@/lib/calculations'
import { getRaceById } from '@/data/races'
import {
  getRacialSingularitiesByRaceId,
  getRacialSingularityById,
  pruneRacialSingularitiesToValidRequirements,
} from '@/data/racialSingularities'
import { getSkillsByCategory, getSkillById, type Skill } from '@/data/skills'
import { aptitudes as aptitudesData, type Aptitude } from '@/data/aptitudes'
import {
  creationSingularities,
  getCreationSingularitiesByCategory,
  type CreationSingularity,
} from '@/data/creationSingularities'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import {
  getAllMartialSchools,
  getMartialSchoolDataById,
  type MartialSchoolSingularity,
} from '@/data/martialSchoolSingularities'
import { getMartialSchoolById } from '@/data/martialSchools'
import SingularityCard from '@/components/ui/SingularityCard'

type EvolutionTab = 'tracos' | 'singularidades'
type TraitsSubTab = 'atributos' | 'habilidades' | 'aptidoes'
type SingularitiesSubTab = 'criacao' | 'ecoa' | 'marciais' | 'raciais'

type AttributeKey = 'carisma' | 'finesse' | 'forca' | 'inteligencia' | 'percepcao' | 'vitalidade' | 'vontade'

const ATTRIBUTE_KEYS: AttributeKey[] = [
  'carisma',
  'finesse',
  'forca',
  'inteligencia',
  'percepcao',
  'vitalidade',
  'vontade',
]

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  carisma: 'Carisma',
  finesse: 'Finesse',
  forca: 'Força',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
  vitalidade: 'Vitalidade',
  vontade: 'Vontade',
}

function shallowCopyRecord<T extends Record<string, any>>(v: T): T {
  return { ...v }
}

function isPositiveFinite(n: any): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

type CreationSingularityCategory = CreationSingularity['category']

interface CharacterEvolutionScreenProps {
  initialCharacterData: any
  isTableGmEditor?: boolean
  onCancel: () => void
  onSaved: (saved: any) => void
}

export default function CharacterEvolutionScreen({
  initialCharacterData,
  isTableGmEditor = false,
  onCancel,
  onSaved,
}: CharacterEvolutionScreenProps) {
  const { getEcoarSingularitiesByEcoarId, getEcoarSingularityById } = useEcoarCatalogData()
  const { user } = useAuth()

  const initialPontosEvolucao = initialCharacterData?.pontosEvolucao ?? { atual: 0, max: 0 }
  const pontosEvolucaoDisponivelInicial = isPositiveFinite(initialPontosEvolucao.atual)
    ? initialPontosEvolucao.atual
    : 0

  const soulLevel = useMemo(
    () => getSoulLevelByPontosEvolucao(initialPontosEvolucao?.max ?? 0),
    [initialPontosEvolucao?.max]
  )
  const nivelAlma = soulLevel?.nivel ?? 1
  const nivelPoder = soulLevel?.nivelPoder ?? 3
  const poderCapBase = Math.min(nivelPoder, 8)

  const selectedRaca: string = initialCharacterData?.raca ?? ''
  const selectedEscolaMarcial: string = initialCharacterData?.escolaMarcial ?? ''
  const selectedEcoar: string = initialCharacterData?.ecoar ?? ''

  const raceBonuses = useMemo(() => {
    if (!selectedRaca) return {} as Record<string, number>
    const race = getRaceById(selectedRaca)
    if (!race?.bonuses) return {} as Record<string, number>

    const manual = race.bonuses.attributes ?? {}
    const sizeModifier = race.bonuses.sizeModifier ?? 0
    const weightModifier = race.bonuses.weightModifier ?? 0

    const automatic: Record<string, number> = {}
    if (sizeModifier !== 0) automatic.forca = sizeModifier
    if (weightModifier !== 0) automatic.vitalidade = weightModifier

    return { ...manual, ...automatic }
  }, [selectedRaca])

  const martialSchoolBonuses = useMemo(() => {
    if (!selectedEscolaMarcial) return {} as Record<string, number>
    const school = getMartialSchoolById(selectedEscolaMarcial)
    return school?.bonuses?.attributes ?? {}
  }, [selectedEscolaMarcial])

  // Baseline (o que já existia quando abriu a tela)
  const baselineAttributes = useMemo<Record<AttributeKey, number>>(() => {
    const attrs = initialCharacterData?.attributes ?? {}
    return ATTRIBUTE_KEYS.reduce((acc, key) => {
      const v = attrs?.[key]
      acc[key] = isPositiveFinite(v) ? v : 0
      return acc
    }, {} as Record<AttributeKey, number>)
  }, [initialCharacterData?.attributes])

  const baselineSkills = useMemo(() => {
    const s = initialCharacterData?.skills ?? {}
    return shallowCopyRecord(s)
  }, [initialCharacterData?.skills])

  const baselineAptitudes = useMemo(() => {
    const a = initialCharacterData?.aptitudes ?? {}
    return shallowCopyRecord(a)
  }, [initialCharacterData?.aptitudes])

  const baselineSingularidadesCriacao = useMemo<string[]>(
    () => Array.isArray(initialCharacterData?.singularidades) ? initialCharacterData.singularidades : [],
    [initialCharacterData?.singularidades]
  )

  const baselineSingularidadesEcoar = useMemo<string[]>(
    () => Array.isArray(initialCharacterData?.singularidadesEcoar) ? initialCharacterData.singularidadesEcoar : [],
    [initialCharacterData?.singularidadesEcoar]
  )

  const baselineSingularidadesMarciais = useMemo<string[]>(
    () => Array.isArray(initialCharacterData?.singularidadesMarciais) ? initialCharacterData.singularidadesMarciais : [],
    [initialCharacterData?.singularidadesMarciais]
  )
  const baselineSingularidadesRaciais = useMemo<string[]>(
    () => Array.isArray(initialCharacterData?.singularidadesRaciais) ? initialCharacterData.singularidadesRaciais : [],
    [initialCharacterData?.singularidadesRaciais]
  )

  const baselineCreationSet = useMemo(() => new Set(baselineSingularidadesCriacao), [baselineSingularidadesCriacao])
  const baselineEcoarSet = useMemo(() => new Set(baselineSingularidadesEcoar), [baselineSingularidadesEcoar])
  const baselineMartialSet = useMemo(() => new Set(baselineSingularidadesMarciais), [baselineSingularidadesMarciais])
  const baselineRacialSet = useMemo(() => new Set(baselineSingularidadesRaciais), [baselineSingularidadesRaciais])

  // Draft (estado temporário)
  const [tab, setTab] = useState<EvolutionTab>('tracos')
  const [traitsSubTab, setTraitsSubTab] = useState<TraitsSubTab>('atributos')
  const [singSubTab, setSingSubTab] = useState<SingularitiesSubTab>('criacao')
  const [creationCategory, setCreationCategory] = useState<CreationSingularityCategory>('atributos')

  const [draftAttributes, setDraftAttributes] = useState<Record<AttributeKey, number>>(baselineAttributes)
  const [draftSkills, setDraftSkills] = useState<Record<string, { level: number; specialization?: string }>>(baselineSkills)
  const [draftAptitudes, setDraftAptitudes] = useState<Record<string, number>>(baselineAptitudes)

  const [draftSingularidadesCriacao, setDraftSingularidadesCriacao] = useState<string[]>(baselineSingularidadesCriacao)
  const [draftSingularidadesEcoar, setDraftSingularidadesEcoar] = useState<string[]>(baselineSingularidadesEcoar)
  const [draftSingularidadesMarciais, setDraftSingularidadesMarciais] = useState<string[]>(baselineSingularidadesMarciais)
  const [draftSingularidadesRaciais, setDraftSingularidadesRaciais] = useState<string[]>(baselineSingularidadesRaciais)

  const [selectedSkillCategory, setSelectedSkillCategory] = useState<Skill['category']>('combate')
  const hasMasterOverride = isTableGmEditor
  const [selectedSkillId, setSelectedSkillId] = useState<string>(() => {
    const first = getSkillsByCategory('combate')[0]
    return first?.id ?? ''
  })

  const skillListByCategory = useMemo(() => getSkillsByCategory(selectedSkillCategory), [selectedSkillCategory])
  const selectedSkill = useMemo(() => getSkillById(selectedSkillId), [selectedSkillId])

  // Custos de PE (sempre delta vs baseline)
  const costAttributesPE = useMemo(() => {
    return ATTRIBUTE_KEYS.reduce((sum, key) => {
      const delta = (draftAttributes[key] ?? 0) - (baselineAttributes[key] ?? 0)
      return sum + Math.max(0, delta) * 10
    }, 0)
  }, [baselineAttributes, draftAttributes])

  const costAptitudesPE = useMemo(() => {
    return Object.keys(draftAptitudes).reduce((sum, aptId) => {
      const current = draftAptitudes[aptId] ?? 0
      const base = baselineAptitudes[aptId] ?? 0
      const delta = current - base
      return sum + Math.max(0, delta) * 20
    }, 0)
  }, [baselineAptitudes, draftAptitudes])

  const getSkillCategoryPECost = useCallback((category: Skill['category']): number => {
    if (category === 'combate' || category === 'primarias') return 10
    return 5
  }, [])

  const costSkillsPE = useMemo(() => {
    return Object.entries(draftSkills).reduce((sum, [skillId, v]) => {
      const currentLevel = v?.level ?? 0
      const currentSpec = v?.specialization
      const baseV = baselineSkills[skillId] ?? { level: 0, specialization: undefined }
      const baseLevel = baseV?.level ?? 0
      const baseSpec = baseV?.specialization

      const skillData = getSkillById(skillId)
      if (!skillData) return sum

      const categoryCost = getSkillCategoryPECost(skillData.category)

      const deltaLevel = currentLevel - baseLevel
      const addedSpec = (!baseSpec && !!currentSpec) ? 1 : 0

      return sum + Math.max(0, deltaLevel) * categoryCost + addedSpec * categoryCost
    }, 0)
  }, [baselineSkills, draftSkills, getSkillCategoryPECost])

  const costSingularidadesCriacaoPE = useMemo(() => {
    const costById = new Map<string, number>()
    creationSingularities.forEach((s) => costById.set(s.id, s.cost))

    return draftSingularidadesCriacao.reduce((sum, id) => {
      if (baselineCreationSet.has(id)) return sum
      return sum + (costById.get(id) ?? 0)
    }, 0)
  }, [baselineCreationSet, draftSingularidadesCriacao])

  const costSingularidadesEcoarPE = useMemo(() => {
    const map = new Map<string, number>()
    getEcoarSingularitiesByEcoarId(selectedEcoar).forEach((s) => map.set(s.id, s.cost))
    return draftSingularidadesEcoar.reduce((sum, id) => {
      if (baselineEcoarSet.has(id)) return sum
      return sum + (map.get(id) ?? 0)
    }, 0)
  }, [baselineEcoarSet, draftSingularidadesEcoar, selectedEcoar])

  const costSingularidadesMarciaisPE = useMemo(() => {
    // Index global por id para não depender do school selecionado.
    const map = new Map<string, number>()
    getAllMartialSchools().forEach((school) => {
      school.singularities.forEach((s) => map.set(s.id, s.cost))
    })
    return draftSingularidadesMarciais.reduce((sum, id) => {
      if (baselineMartialSet.has(id)) return sum
      return sum + (map.get(id) ?? 0)
    }, 0)
  }, [baselineMartialSet, draftSingularidadesMarciais])
  const costSingularidadesRaciaisPE = useMemo(() => {
    const map = new Map<string, number>()
    getRacialSingularitiesByRaceId(selectedRaca).forEach((s) => map.set(s.id, s.cost))
    return draftSingularidadesRaciais.reduce((sum, id) => {
      if (baselineRacialSet.has(id)) return sum
      return sum + (map.get(id) ?? 0)
    }, 0)
  }, [baselineRacialSet, draftSingularidadesRaciais, selectedRaca])

  const totalCostPE = useMemo(() => {
    return (
      costAttributesPE +
      costSkillsPE +
      costAptitudesPE +
      costSingularidadesCriacaoPE +
      costSingularidadesEcoarPE +
      costSingularidadesMarciaisPE +
      costSingularidadesRaciaisPE
    )
  }, [
    costAptitudesPE,
    costAttributesPE,
    costSkillsPE,
    costSingularidadesCriacaoPE,
    costSingularidadesEcoarPE,
    costSingularidadesMarciaisPE,
    costSingularidadesRaciaisPE,
  ])

  const pontosDisponiveisAtual = pontosEvolucaoDisponivelInicial - totalCostPE

  const hasAnyDraftChange = useMemo(() => {
    const eqArr = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v) => b.includes(v))

    if (!eqArr(draftSingularidadesCriacao, baselineSingularidadesCriacao)) return true
    if (!eqArr(draftSingularidadesEcoar, baselineSingularidadesEcoar)) return true
    if (!eqArr(draftSingularidadesMarciais, baselineSingularidadesMarciais)) return true
    if (!eqArr(draftSingularidadesRaciais, baselineSingularidadesRaciais)) return true

    for (const k of ATTRIBUTE_KEYS) {
      if ((draftAttributes[k] ?? 0) !== (baselineAttributes[k] ?? 0)) return true
    }

    // Aptidões (comparamos todos os aptidões conhecidos)
    for (const apt of aptitudesData) {
      const id = apt.id
      if ((draftAptitudes[id] ?? 0) !== (baselineAptitudes[id] ?? 0)) return true
    }

    // Habilidades (comparamos união de keys)
    const skillIds = new Set<string>([
      ...Object.keys(draftSkills),
      ...Object.keys(baselineSkills),
    ])
    let hasSkillDiff = false
    Array.from(skillIds).forEach((id) => {
      if (hasSkillDiff) return
      const d = draftSkills[id]
      const b = baselineSkills[id]
      const dLevel = d?.level ?? 0
      const bLevel = b?.level ?? 0
      const dSpec = d?.specialization
      const bSpec = b?.specialization
      if (dLevel !== bLevel) {
        hasSkillDiff = true
        return
      }
      if ((dSpec ?? null) !== (bSpec ?? null)) {
        hasSkillDiff = true
        return
      }
    })
    if (hasSkillDiff) return true

    return false
  }, [
    baselineAptitudes,
    baselineAttributes,
    baselineSkills,
    baselineSingularidadesCriacao,
    baselineSingularidadesEcoar,
    baselineSingularidadesMarciais,
    baselineSingularidadesRaciais,
    draftAptitudes,
    draftAttributes,
    draftSkills,
    draftSingularidadesCriacao,
    draftSingularidadesEcoar,
    draftSingularidadesMarciais,
    draftSingularidadesRaciais,
  ])

  const updateAttribute = (key: AttributeKey, nextTotalValue: number) => {
    setDraftAttributes((prev) => ({ ...prev, [key]: nextTotalValue }))
  }

  const updateSkillLevel = (skillId: string, nextLevel: number) => {
    setDraftSkills((prev) => {
      const current = prev[skillId] ?? { level: 0, specialization: undefined }
      const next = { ...current, level: nextLevel }
      return { ...prev, [skillId]: next }
    })
  }

  const updateSkillSpecialization = (skillId: string, specializationId?: string) => {
    setDraftSkills((prev) => {
      const current = prev[skillId] ?? { level: 0, specialization: undefined }
      return {
        ...prev,
        [skillId]: { ...current, specialization: specializationId },
      }
    })
  }

  const updateAptitude = (aptitudeId: string, nextLevel: number) => {
    setDraftAptitudes((prev) => ({ ...prev, [aptitudeId]: nextLevel }))
  }

  const toggleCreationSingularity = (id: string) => {
    const isBaselineLocked = baselineCreationSet.has(id)
    setDraftSingularidadesCriacao((prev) => {
      const has = prev.includes(id)
      if (has) {
        if (isBaselineLocked && !hasMasterOverride) return prev
        return prev.filter((x) => x !== id)
      }

      const sing = creationSingularities.find((s) => s.id === id)
      if (!sing) return prev

      if (!hasMasterOverride && sing.requirements?.some((reqId) => prev.includes(reqId))) return prev
      const addCost = sing.cost ?? 0
      if (!hasMasterOverride && pontosDisponiveisAtual < addCost) return prev

      return [...prev, id]
    })
  }

  const checkEcoarRequirements = useCallback(
    (singularity: EcoarSingularity, current: {
      attributes: Record<string, number>
      skills: Record<string, { level: number; specialization?: string }>
      aptitudes: Record<string, number>
      singularidadesEcoar: string[]
    }) => {
      const missingReqs: string[] = []
      if (!singularity.requirements) return { valid: true, missingReqs }

      if (singularity.requirements.previous) {
        if (!current.singularidadesEcoar.includes(singularity.requirements.previous)) {
          missingReqs.push(`Requer anterior: ${singularity.requirements.previous}`)
        }
      }
      if (singularity.requirements.nivelAlma) {
        if (nivelAlma < singularity.requirements.nivelAlma) {
          missingReqs.push(`Requer Nível de Alma ${singularity.requirements.nivelAlma}+`)
        }
      }
      if (singularity.requirements.attributes) {
        Object.entries(singularity.requirements.attributes).forEach(([attr, minValue]) => {
          if ((current.attributes[attr] ?? 0) < minValue) {
            missingReqs.push(`Requer ${attr} ${minValue}+`)
          }
        })
      }
      if (singularity.requirements.skills) {
        Object.entries(singularity.requirements.skills).forEach(([skillId, minLevel]) => {
          const currentLevel = current.skills[skillId]?.level ?? 0
          if (currentLevel < minLevel) {
            missingReqs.push(`Requer ${skillId} nível ${minLevel}+`)
          }
        })
      }
      if (singularity.requirements.aptitudes) {
        Object.entries(singularity.requirements.aptitudes).forEach(([aptId, minValue]) => {
          if ((current.aptitudes[aptId] ?? 0) < minValue) {
            missingReqs.push(`Requer ${aptId} ${minValue}+`)
          }
        })
      }

      return { valid: missingReqs.length === 0, missingReqs }
    },
    [nivelAlma]
  )

  const toggleEcoarSingularity = (id: string) => {
    const isBaselineLocked = baselineEcoarSet.has(id)
    setDraftSingularidadesEcoar((prev) => {
      const has = prev.includes(id)
      if (has) {
        if (isBaselineLocked && !hasMasterOverride) return prev
        return prev.filter((x) => x !== id)
      }

      const sing = getEcoarSingularityById(id)
      if (!sing) return prev

      const currentTraitsForCheck: Parameters<typeof checkEcoarRequirements>[1] = {
        attributes: draftAttributes,
        skills: draftSkills,
        aptitudes: draftAptitudes,
        singularidadesEcoar: prev,
      }
      const { valid } = checkEcoarRequirements(sing, currentTraitsForCheck)
      if (!hasMasterOverride && !valid) return prev

      const addCost = sing.cost ?? 0
      if (!hasMasterOverride && pontosDisponiveisAtual < addCost) return prev
      return [...prev, id]
    })
  }

  const toggleMartialSingularity = (id: string) => {
    const isBaselineLocked = baselineMartialSet.has(id)
    setDraftSingularidadesMarciais((prev) => {
      const has = prev.includes(id)
      if (has) {
        if (isBaselineLocked && !hasMasterOverride) return prev
        return prev.filter((x) => x !== id)
      }

      const school = selectedEscolaMarcial ? getMartialSchoolDataById(selectedEscolaMarcial) : null
      const sing: MartialSchoolSingularity | undefined = school?.singularities.find((s) => s.id === id)
      if (!sing) return prev

      // Requisitos (mesma lógica do wizard, com os valores atuais dos traços)
      const missingReqs: string[] = []
      if (sing.requirements?.previous) {
        if (!prev.includes(sing.requirements.previous)) missingReqs.push('Requer anterior')
      }
      if (sing.requirements?.nivelAlma) {
        if (nivelAlma < sing.requirements.nivelAlma) missingReqs.push('Nível de Alma insuficiente')
      }
      if (sing.requirements?.attributes) {
        Object.entries(sing.requirements.attributes).forEach(([attr, minValue]) => {
          if ((draftAttributes as any)[attr] < minValue) missingReqs.push(`Requer ${attr}`)
        })
      }
      if (sing.requirements?.skills) {
        Object.entries(sing.requirements.skills).forEach(([skillId, minLevel]) => {
          const currentLevel = draftSkills[skillId]?.level ?? 0
          if (currentLevel < minLevel) missingReqs.push(`Requer ${skillId}`)
        })
      }
      if (sing.requirements?.aptitudes) {
        Object.entries(sing.requirements.aptitudes).forEach(([aptId, minValue]) => {
          if ((draftAptitudes as any)[aptId] < minValue) missingReqs.push(`Requer ${aptId}`)
        })
      }
      if (!hasMasterOverride && missingReqs.length > 0) return prev

      const addCost = sing.cost ?? 0
      if (!hasMasterOverride && pontosDisponiveisAtual < addCost) return prev
      return [...prev, id]
    })
  }
  const toggleRacialSingularity = (id: string) => {
    const isBaselineLocked = baselineRacialSet.has(id)
    setDraftSingularidadesRaciais((prev) => {
      const has = prev.includes(id)
      if (has) {
        if (isBaselineLocked && !hasMasterOverride) return prev
        const next = pruneRacialSingularitiesToValidRequirements(prev.filter((x) => x !== id))
        if (!hasMasterOverride) {
          const baselineInPrev = Array.from(baselineRacialSet).filter((b) => prev.includes(b))
          if (!baselineInPrev.every((b) => next.includes(b))) return prev
        }
        return next
      }
      const sing = getRacialSingularityById(id)
      if (!sing) return prev
      const requiredIds = sing.requirements ?? []
      if (!hasMasterOverride && requiredIds.some((reqId) => !prev.includes(reqId))) return prev
      const addCost = sing.cost ?? 0
      if (!hasMasterOverride && pontosDisponiveisAtual < addCost) return prev
      return [...prev, id]
    })
  }

  const draftAttributesForReqCheck: Record<string, number> = draftAttributes
  const draftSkillsForReqCheck = draftSkills
  const draftAptitudesForReqCheck = draftAptitudes

  const canSave = hasMasterOverride || pontosDisponiveisAtual >= 0

  const handleSave = useCallback(async () => {
    if (!user) return
    if (!canSave) return

    const updated = {
      ...initialCharacterData,
      pontosEvolucao: {
        ...initialPontosEvolucao,
        atual: hasMasterOverride
          ? pontosEvolucaoDisponivelInicial
          : Math.max(0, pontosEvolucaoDisponivelInicial - totalCostPE),
      },
      attributes: { ...draftAttributes },
      skills: shallowCopyRecord(draftSkills),
      aptitudes: shallowCopyRecord(draftAptitudes),
      singularidades: draftSingularidadesCriacao,
      singularidadesEcoar: draftSingularidadesEcoar,
      singularidadesMarciais: draftSingularidadesMarciais,
      singularidadesRaciais: draftSingularidadesRaciais,
    }

    const saved = await saveCharacter(user.id, updated)
    onSaved(saved)
  }, [
    canSave,
    hasMasterOverride,
    user,
    initialCharacterData,
    initialPontosEvolucao,
    pontosEvolucaoDisponivelInicial,
    totalCostPE,
    draftAttributes,
    draftSkills,
    draftAptitudes,
    draftSingularidadesCriacao,
    draftSingularidadesEcoar,
    draftSingularidadesMarciais,
    draftSingularidadesRaciais,
    onSaved,
  ])

  const handleSkillCategoryChange = (cat: Skill['category']) => {
    setSelectedSkillCategory(cat)
    const first = getSkillsByCategory(cat)[0]
    if (first) setSelectedSkillId(first.id)
  }

  // ===== Render helpers =====
  const renderTraitsTab = () => {
    return (
      <div className="space-y-5">
        {/* Tabs de Traços */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20">
          {(['atributos', 'habilidades', 'aptidoes'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTraitsSubTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                traitsSubTab === t
                  ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                  : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:hover:text-ecoar-light-900/80'
              }`}
            >
              {t === 'atributos' ? 'Atributos' : t === 'habilidades' ? 'Habilidades' : 'Aptidões'}
            </button>
          ))}
        </div>

        {traitsSubTab === 'atributos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ATTRIBUTE_KEYS.map((key) => {
              const baseBonus = (raceBonuses[key] ?? 0) + (martialSchoolBonuses[key] ?? 0)
              const currentTotal = draftAttributes[key] ?? 0
              const baselineTotal = baselineAttributes[key] ?? 0

              const currentBase = currentTotal - baseBonus
              const maxBase = poderCapBase
              const maxTotal = maxBase + baseBonus

              const canMinus = hasMasterOverride || currentTotal > baselineTotal
              const canPlus = hasMasterOverride || (currentBase < maxBase && pontosDisponiveisAtual >= 10)

              return (
                <div
                  key={key}
                  className="p-4 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 truncate">
                      {ATTRIBUTE_LABELS[key]}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                      Nv. {currentTotal} • Base {currentBase} / {maxBase}
                    </div>
                    <div className="text-xs text-ecoar-teal/80 font-semibold">+1 custa 10 PE</div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      disabled={!canMinus}
                      onClick={() => updateAttribute(key, currentTotal - 1)}
                      className="w-9 h-9 rounded-lg border border-ecoar-magenta/20 bg-ecoar-magenta/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-ecoar-light-900 font-bold"
                    >
                      -
                    </button>
                    <div className="text-center min-w-[56px]">
                      <div className="text-2xl font-bold text-slate-900 dark:text-ecoar-light-900">{currentTotal}</div>
                      <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/60">total</div>
                    </div>
                    <button
                      type="button"
                      disabled={!canPlus}
                      onClick={() => updateAttribute(key, currentTotal + 1)}
                      className="w-9 h-9 rounded-lg border border-ecoar-teal/20 bg-ecoar-teal/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-ecoar-light-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {traitsSubTab === 'habilidades' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lista de categorias */}
            <div className="space-y-2">
              {(['combate', 'primarias', 'artisticas', 'cientificas', 'motoras', 'sociais', 'gerais'] as const).map((cat) => {
                const count = getSkillsByCategory(cat).length
                const isActive = selectedSkillCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSkillCategoryChange(cat)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'border-ecoar-teal bg-ecoar-teal/10 shadow-sm'
                        : 'border-slate-200 bg-slate-50 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-700 hover:border-ecoar-teal/30'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-ecoar-light-900 text-sm">
                      {cat === 'combate'
                        ? 'Combate'
                        : cat === 'primarias'
                        ? 'Primárias'
                        : cat === 'artisticas'
                        ? 'Artísticas'
                        : cat === 'cientificas'
                        ? 'Científicas'
                        : cat === 'motoras'
                        ? 'Motoras'
                        : cat === 'sociais'
                        ? 'Sociais'
                        : 'Gerais'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-1">
                      {count} habilidades
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Lista e detalhes */}
            <div className="space-y-3">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {skillListByCategory.map((s) => {
                  const v = draftSkills[s.id] ?? { level: 0, specialization: undefined }
                  const effective = v.level + (v.specialization ? 1 : 0)
                  const baselineV = baselineSkills[s.id] ?? { level: 0, specialization: undefined }
                  const costPerLevel = getSkillCategoryPECost(s.category)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSkillId(s.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedSkillId === s.id
                          ? 'border-ecoar-teal bg-ecoar-teal/10 shadow-sm'
                        : 'border-slate-200 bg-slate-50 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-700 hover:border-ecoar-teal/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 truncate">{s.name}</div>
                          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                            {getSkillDice(v.level)} • Nv. {v.level}
                            {v.specialization ? ' + Esp.' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-ecoar-teal">{v.level}</div>
                          <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/60">
                            Esp. {v.specialization ? 'sim' : 'não'} • +1 = {costPerLevel} PE
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/60 mt-2">
                        Efetivo: {effective} / {nivelPoder} (teto)
                      </div>
                      {/* Baseline lock indicator */}
                      {v.level > (baselineV.level ?? 0) || (v.specialization && !baselineV.specialization) ? (
                        <div className="text-[10px] text-ecoar-magenta font-semibold mt-1">Comprado nesta sessão</div>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              {selectedSkill && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10">
                  {(() => {
                    const v = draftSkills[selectedSkill.id] ?? { level: 0, specialization: undefined }
                    const baselineV = baselineSkills[selectedSkill.id] ?? { level: 0, specialization: undefined }
                    const costPerLevel = getSkillCategoryPECost(selectedSkill.category)

                    const hasSpec = !!v.specialization
                    const effective = v.level + (hasSpec ? 1 : 0)
                    const maxEffective = Math.min(nivelPoder, 8)

                    const baselineHasSpec = !!baselineV.specialization

                    const canMinus = hasMasterOverride || v.level > (baselineV.level ?? 0)
                    const canPlus = hasMasterOverride || (v.level + 1 <= 8 && effective + 1 <= maxEffective && pontosDisponiveisAtual >= costPerLevel)

                    return (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900">{selectedSkill.name}</div>
                              <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                                Efetivo: {effective} / {nivelPoder}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-ecoar-teal">Nv. {v.level}</div>
                              <div className="text-[11px] text-slate-500 dark:text-ecoar-light-900/60">
                                {hasSpec ? 'Especializada' : 'Sem especialização'} • +1 = {costPerLevel} PE
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-5">
                          <button
                            type="button"
                            disabled={!canMinus}
                            onClick={() => updateSkillLevel(selectedSkill.id, v.level - 1)}
                            className="w-10 h-10 rounded-lg border border-ecoar-magenta/20 bg-ecoar-magenta/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                          >
                            -
                          </button>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-slate-900 dark:text-ecoar-light-900">{v.level}</div>
                            <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">nível</div>
                          </div>
                          <button
                            type="button"
                            disabled={!canPlus}
                            onClick={() => updateSkillLevel(selectedSkill.id, v.level + 1)}
                            className="w-10 h-10 rounded-lg border border-ecoar-teal/20 bg-ecoar-teal/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                          >
                            +
                          </button>
                        </div>

                        {/* Especialização */}
                        {selectedSkill.specializations.length > 0 && (
                          <div className="pt-3 border-t border-slate-200 dark:border-ecoar-light-900/20">
                            <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 mb-2">
                              Especialização <span className="text-ecoar-teal/80">(+{costPerLevel} PE)</span>
                            </div>

                            <select
                              value={v.specialization || ''}
                              onChange={(e) => {
                                const nextSpec = e.target.value || undefined
                                const baselineSpec = baselineV.specialization
                                const nextHasSpec = !!nextSpec
                                const baselineHasSpec = !!baselineSpec
                                const currentHasSpec = !!v.specialization

                                // Lock: não permitir remover especialização que já existia na baseline.
                                if (!hasMasterOverride && baselineHasSpec && !nextHasSpec) return

                                // Lock: não permitir adicionar se estourar o teto efetivo.
                                const nextEffective = v.level + (nextHasSpec ? 1 : 0)
                                if (!hasMasterOverride && nextEffective > maxEffective) return

                                // Afford: adicionar (baseline sem spec -> com spec) custa PE.
                                if (!hasMasterOverride && !baselineHasSpec && !currentHasSpec && nextHasSpec && pontosDisponiveisAtual < costPerLevel) return

                                updateSkillSpecialization(selectedSkill.id, nextSpec)
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-slate-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:ring-2 focus:ring-ecoar-teal/30"
                            >
                              {/* Só mostra 'nenhuma' se a baseline não tinha especialização */}
                              {(hasMasterOverride || !baselineHasSpec) && <option value="">Nenhuma</option>}
                              {selectedSkill.specializations.map((spec) => (
                                <option key={spec.id} value={spec.id}>
                                  {spec.name}
                                </option>
                              ))}
                            </select>

                            <div className="text-[11px] text-slate-500 dark:text-ecoar-light-900/60 mt-2">
                              Efetivo considera especialização: `nivel + 1` quando especializada.
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {traitsSubTab === 'aptidoes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aptitudesData.map((apt: Aptitude) => {
              const current = draftAptitudes[apt.id] ?? 0
              const baseline = baselineAptitudes[apt.id] ?? 0

              const maxLevel = Math.min(nivelPoder, 8)

              const canMinus = hasMasterOverride || current > baseline
              const canPlus = hasMasterOverride || (current < maxLevel && pontosDisponiveisAtual >= 20)

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 truncate">{apt.name}</div>
                    <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                      Nv. {current} / {maxLevel} (teto pelo Poder)
                    </div>
                    <div className="text-xs text-ecoar-teal/80 font-semibold">+1 custa 20 PE</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      disabled={!canMinus}
                      onClick={() => updateAptitude(apt.id, current - 1)}
                      className="w-9 h-9 rounded-lg border border-ecoar-magenta/20 bg-ecoar-magenta/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-ecoar-light-900 font-bold"
                    >
                      -
                    </button>
                    <div className="text-center min-w-[56px]">
                      <div className="text-2xl font-bold text-slate-900 dark:text-ecoar-light-900">{current}</div>
                      <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/60">nível</div>
                    </div>
                    <button
                      type="button"
                      disabled={!canPlus}
                      onClick={() => updateAptitude(apt.id, current + 1)}
                      className="w-9 h-9 rounded-lg border border-ecoar-teal/20 bg-ecoar-teal/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-ecoar-light-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderSingularitiesTab = () => {
    const canShowMartial = !!selectedEscolaMarcial
    const martialSchool = selectedEscolaMarcial ? getMartialSchoolDataById(selectedEscolaMarcial) : null
    const ecoarSingularities = selectedEcoar ? getEcoarSingularitiesByEcoarId(selectedEcoar) : []

    return (
      <div className="space-y-5">
        {/* Tabs de Singularidades */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20">
          {(['criacao', 'ecoa', 'marciais', 'raciais'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSingSubTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                singSubTab === t
                  ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                  : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:hover:text-ecoar-light-900/80'
              }`}
            >
              {t === 'criacao'
                ? 'Criação'
                : t === 'ecoa'
                ? 'Ecoar'
                : t === 'marciais'
                ? 'Marciais'
                : 'Raciais'}
            </button>
          ))}
        </div>

        {singSubTab === 'criacao' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(['atributos', 'habilidades', 'genetica', 'talentos'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCreationCategory(c)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                    creationCategory === c
                      ? 'border-ecoar-teal bg-ecoar-teal/10 text-ecoar-teal'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-ecoar-teal/30'
                  }`}
                >
                  {c === 'atributos' ? 'Atributos' : c === 'habilidades' ? 'Habilidades' : c === 'genetica' ? 'Genética' : 'Talentos'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getCreationSingularitiesByCategory(creationCategory).map((sing) => {
                const isSelected = draftSingularidadesCriacao.includes(sing.id)
                const isBaselineLocked = baselineCreationSet.has(sing.id)
                const hasConflict = (sing.requirements ?? []).some((reqId) => draftSingularidadesCriacao.includes(reqId))

                const addCost = sing.cost ?? 0
                const canAfford = pontosDisponiveisAtual >= addCost
                const canSelect = !isSelected && (!isBaselineLocked || hasMasterOverride) && (!hasConflict || hasMasterOverride) && (canAfford || hasMasterOverride)

                return (
                  <SingularityCard
                    key={sing.id}
                    name={sing.name}
                    description={sing.description}
                    cost={sing.cost ?? 0}
                    costLabel="PE"
                    isSelected={isSelected}
                    canAfford={canAfford}
                    canSelect={canSelect || (isSelected && (!isBaselineLocked || hasMasterOverride))}
                    onClick={() => toggleCreationSingularity(sing.id)}
                    requirementsText={hasConflict ? 'Conflito com singularidade atual' : undefined}
                    variant="teal"
                  />
                )
              })}
            </div>
          </div>
        )}

        {singSubTab === 'ecoa' && (
          <div className="space-y-4">
            {!selectedEcoar ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-600">Este personagem não tem `Ecoar` selecionado.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ecoarSingularities.map((sing) => {
                  const isSelected = draftSingularidadesEcoar.includes(sing.id)
                  const isBaselineLocked = baselineEcoarSet.has(sing.id)

                  const currentTraitsForCheck = {
                    attributes: draftAttributesForReqCheck,
                    skills: draftSkillsForReqCheck,
                    aptitudes: draftAptitudesForReqCheck,
                    singularidadesEcoar: draftSingularidadesEcoar,
                  }

                  const { valid } = checkEcoarRequirements(sing, currentTraitsForCheck)
                  const addCost = sing.cost ?? 0
                  const canAfford = pontosDisponiveisAtual >= addCost
                  const canSelect = !isSelected && (!isBaselineLocked || hasMasterOverride) && (valid || hasMasterOverride) && (addCost === 0 || canAfford || hasMasterOverride)

                  return (
                    <SingularityCard
                      key={sing.id}
                      name={sing.name}
                      description={sing.description}
                      cost={sing.cost ?? 0}
                      costLabel={sing.cost === 0 ? undefined : 'PE'}
                      secondaryCost={sing.cost === 0 ? 'Inata' : undefined}
                      isSelected={isSelected}
                      canAfford={canAfford}
                      canSelect={canSelect || (isSelected && (!isBaselineLocked || hasMasterOverride))}
                      onClick={() => toggleEcoarSingularity(sing.id)}
                      requirementsText={!valid ? 'Requisitos não atendidos' : undefined}
                      variant="teal"
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {singSubTab === 'marciais' && (
          <div className="space-y-4">
            {!canShowMartial || !martialSchool ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-600">Este personagem não tem `Escola Marcial` selecionada.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {martialSchool.singularities.map((sing) => {
                  const isSelected = draftSingularidadesMarciais.includes(sing.id)
                  const isBaselineLocked = baselineMartialSet.has(sing.id)

                  // Requisitos (usando draft atual)
                  const missingReqs: string[] = []
                  if (sing.requirements?.previous && !draftSingularidadesMarciais.includes(sing.requirements.previous)) {
                    missingReqs.push('Requer anterior')
                  }
                  if (sing.requirements?.nivelAlma && nivelAlma < sing.requirements.nivelAlma) {
                    missingReqs.push('Nível de Alma insuficiente')
                  }
                  if (sing.requirements?.attributes) {
                    Object.entries(sing.requirements.attributes).forEach(([attr, min]) => {
                      if ((draftAttributesForReqCheck as any)[attr] < min) missingReqs.push('Atributo insuficiente')
                    })
                  }
                  if (sing.requirements?.skills) {
                    Object.entries(sing.requirements.skills).forEach(([skillId, min]) => {
                      if ((draftSkillsForReqCheck[skillId]?.level ?? 0) < min) missingReqs.push('Habilidade insuficiente')
                    })
                  }
                  if (sing.requirements?.aptitudes) {
                    Object.entries(sing.requirements.aptitudes).forEach(([aptId, min]) => {
                      if ((draftAptitudesForReqCheck as any)[aptId] < min) missingReqs.push('Aptidão insuficiente')
                    })
                  }

                  const valid = missingReqs.length === 0
                  const addCost = sing.cost ?? 0
                  const canAfford = pontosDisponiveisAtual >= addCost
                  const canSelect = !isSelected && (!isBaselineLocked || hasMasterOverride) && (valid || hasMasterOverride) && (addCost === 0 || canAfford || hasMasterOverride)

                  return (
                    <SingularityCard
                      key={sing.id}
                      name={sing.name}
                      description={sing.description}
                      cost={sing.cost ?? 0}
                      costLabel="PE"
                      isSelected={isSelected}
                      canAfford={canAfford}
                      canSelect={canSelect || (isSelected && (!isBaselineLocked || hasMasterOverride))}
                      onClick={() => toggleMartialSingularity(sing.id)}
                      requirementsText={!valid ? 'Requisitos não atendidos' : undefined}
                      level={sing.level}
                      variant="teal"
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {singSubTab === 'raciais' && (
          <div className="space-y-4">
            {!selectedRaca ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-600">Este personagem não tem `Raça` selecionada.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getRacialSingularitiesByRaceId(selectedRaca).map((sing) => {
                  const isSelected = draftSingularidadesRaciais.includes(sing.id)
                  const isBaselineLocked = baselineRacialSet.has(sing.id)
                  const hasRequirements = (sing.requirements ?? []).every((reqId) => draftSingularidadesRaciais.includes(reqId))
                  const addCost = sing.cost ?? 0
                  const canAfford = pontosDisponiveisAtual >= addCost
                  const canSelect =
                    !isSelected &&
                    (!isBaselineLocked || hasMasterOverride) &&
                    (hasRequirements || hasMasterOverride) &&
                    (addCost === 0 || canAfford || hasMasterOverride)
                  return (
                    <SingularityCard
                      key={sing.id}
                      name={sing.name}
                      description={sing.description}
                      cost={sing.cost ?? 0}
                      costLabel={sing.cost === 0 ? undefined : 'PE'}
                      secondaryCost={sing.cost === 0 ? 'Inata' : undefined}
                      isSelected={isSelected}
                      canAfford={canAfford}
                      canSelect={canSelect || (isSelected && (!isBaselineLocked || hasMasterOverride))}
                      onClick={() => toggleRacialSingularity(sing.id)}
                      effects={sing.effects}
                      requirementsText={!hasRequirements ? 'Requer talento racial anterior' : undefined}
                      variant="teal"
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const draftSummaryText = useMemo(() => {
    const used = totalCostPE
    return `Usado nesta sessão: ${used} PE`
  }, [totalCostPE])

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 bg-ecoar-light/95 dark:bg-ecoar-dark-900/95 border-b border-slate-200 dark:border-ecoar-light-900/20">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm text-ecoar-teal dark:text-ecoar-teal-400 hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex-1 min-w-0 text-right">
          <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/80 uppercase tracking-wider">
            Evolução do Personagem
          </div>
          <div className="text-sm text-slate-600 dark:text-ecoar-light-900/60 mt-1">
            {draftSummaryText}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="py-4 px-3 sm:px-4 md:px-6">
          <div className="max-w-[1100px] mx-auto space-y-6">
            {/* Info header */}
            <div className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/12 rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">Gastar Pontos de Evolução</div>
                    <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-1">
                      Poder máximo para traços: {nivelPoder} • Alma: {nivelAlma}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-2">
                      Custos do anexo: Atributos 10 PE • Habilidades 10/5 PE • Aptidões 20 PE
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500 dark:text-ecoar-light-900/60 uppercase tracking-wider">
                    PE disponíveis
                  </div>
                  <div className={`text-2xl font-semibold mt-1 ${pontosDisponiveisAtual >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
                    {pontosDisponiveisAtual}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-1">baseline bloqueada • desfazer reembolsa</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20">
              {(['tracos', 'singularidades'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t ? 'text-ecoar-teal border-b-2 border-ecoar-teal' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'tracos' ? 'Traços' : 'Singularidades'}
                </button>
              ))}
            </div>

            {tab === 'tracos' ? renderTraitsTab() : renderSingularitiesTab()}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-100 text-slate-700 dark:text-ecoar-light-900/70 rounded-lg transition-colors border border-slate-200/70 dark:border-slate-700/40"
              >
                Cancelar (descartar)
              </button>

              <button
                type="button"
                disabled={!canSave || !hasAnyDraftChange}
                onClick={() => {
                  void handleSave()
                }}
                className="px-5 py-2 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal/20 dark:hover:bg-ecoar-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-ecoar-teal dark:text-ecoar-teal-300 rounded-lg transition-all border border-ecoar-teal/20 dark:border-ecoar-teal-500/20 font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

