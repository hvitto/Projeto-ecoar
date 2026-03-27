'use client'

import { useMemo, useState } from 'react'
import type { CharacterData } from '@/types/auth'
import SingularityCard from '@/components/ui/SingularityCard'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { getCreationSingularityById } from '@/data/creationSingularities'
import { getSingularityById } from '@/data/singularities'
import { getMartialSchoolSingularityById } from '@/data/martialSchoolSingularities'
import { getRacialSingularityById } from '@/data/racialSingularities'
import { getSkillById } from '@/data/skills'
import { formatModifier } from '@/lib/calculations'
import type { SingularitiesBonusAggregate } from '@/lib/singularityBonuses'
import { partitionSignedBonuses } from '@/lib/characterBonuses'
import type { CharacterSingularitySelectionSlice } from '@/lib/characterBonuses'
import { emptySingularityBonuses } from '@/lib/singularityBonuses'
import { buildSystemSingularities } from '@/lib/systemSingularities'
import type {
  SystemSingularity,
  SystemSingularityActivationType,
  SystemSingularityKind,
} from '@/lib/systemSingularities'
type MainTab = 'passivas-condicionais' | 'complexas' | 'ativas'

const TAB_LABELS: Record<MainTab, string> = {
  'passivas-condicionais': 'Passivas e Condicionais',
  complexas: 'Complexas',
  ativas: 'Ativas',
}

const TAB_INTRO: Record<MainTab, string> = {
  'passivas-condicionais':
    'Passivas: efeitos numéricos simples entram na ficha automaticamente. Condicionais só entram no cálculo quando a condição está ativa na ficha — marque quando valer no teste ou na cena.',
  complexas:
    'Não são somadas automaticamente na ficha. Leia a descrição e aplique na mesa ou no teste quando fizer sentido.',
  ativas: 'Costumam exigir gastar ações ou ativar o efeito; não entram no agregado numérico automático da ficha.',
}

function tabFromActivationType(a: SystemSingularityActivationType): MainTab {
  if (a === 'complexa') return 'complexas'
  if (a === 'ativa') return 'ativas'
  return 'passivas-condicionais'
}

function kindLabel(kind: SystemSingularityKind): string {
  switch (kind) {
    case 'criacao':
      return 'Criação'
    case 'ecoar':
      return 'Ecoar'
    case 'marcial':
      return 'Marcial'
    case 'racial':
      return 'Racial'
  }
}

function conditionalEnabledForKind(
  slice: CharacterSingularitySelectionSlice,
  id: string,
  kind: SystemSingularityKind,
): boolean {
  if (kind === 'criacao') return slice.singularidadesCondicionaisCriacaoAtivas.includes(id)
  if (kind === 'ecoar') return slice.singularidadesCondicionaisAtivas.includes(id)
  if (kind === 'marcial') return slice.singularidadesCondicionaisMarciaisAtivas.includes(id)
  return slice.singularidadesCondicionaisRaciaisAtivas.includes(id)
}

type SelectedEntry = { id: string; kind: SystemSingularityKind; reactKey: string }

interface Props {
  characterData: CharacterData
  /** Abas alinhadas ao catálogo (tipo de ativação). */
  initialTab?: MainTab
  compact?: boolean
  /** Agregado da ficha (passivas + condicionais ativas). Se omitido, o resumo numérico não é exibido. */
  singularityBonuses?: SingularitiesBonusAggregate | null
}

export default function PlayerSingularitiesViewer({
  characterData,
  initialTab,
  compact,
  singularityBonuses: singularityBonusesProp,
}: Props) {
  const { getEcoarSingularityById, ecoarSingularities } = useEcoarCatalogData()

  const selectionSlice = useMemo((): CharacterSingularitySelectionSlice => {
    return {
      singularidades: (characterData.singularidades as string[] | undefined) ?? [],
      singularidadesEcoar: (characterData.singularidadesEcoar as string[] | undefined) ?? [],
      singularidadesMarciais: (characterData.singularidadesMarciais as string[] | undefined) ?? [],
      singularidadesRaciais: (characterData.singularidadesRaciais as string[] | undefined) ?? [],
      singularidadesCondicionaisCriacaoAtivas:
        (characterData.singularidadesCondicionaisCriacaoAtivas as string[] | undefined) ?? [],
      singularidadesCondicionaisAtivas:
        (characterData.singularidadesCondicionaisAtivas as string[] | undefined) ?? [],
      singularidadesCondicionaisMarciaisAtivas:
        (characterData.singularidadesCondicionaisMarciaisAtivas as string[] | undefined) ?? [],
      singularidadesCondicionaisRaciaisAtivas:
        (characterData.singularidadesCondicionaisRaciaisAtivas as string[] | undefined) ?? [],
    }
  }, [
    characterData.singularidades,
    characterData.singularidadesEcoar,
    characterData.singularidadesMarciais,
    characterData.singularidadesRaciais,
    characterData.singularidadesCondicionaisCriacaoAtivas,
    characterData.singularidadesCondicionaisAtivas,
    characterData.singularidadesCondicionaisMarciaisAtivas,
    characterData.singularidadesCondicionaisRaciaisAtivas,
  ])

  const singularityBonuses = singularityBonusesProp ?? emptySingularityBonuses()

  const systemSingularities = useMemo(() => buildSystemSingularities(ecoarSingularities), [ecoarSingularities])
  const systemSingularityById = useMemo(() => {
    const map = new Map<string, SystemSingularity>()
    for (const s of systemSingularities) map.set(s.id, s)
    return map
  }, [systemSingularities])

  const [tab, setTab] = useState<MainTab>(initialTab ?? 'passivas-condicionais')

  const resolveNameById = useMemo(() => {
    return (id: string) => {
      return (
        getCreationSingularityById(id)?.name ||
        getEcoarSingularityById(id)?.name ||
        getMartialSchoolSingularityById(id)?.name ||
        getSingularityById(id)?.name ||
        id
      )
    }
  }, [getEcoarSingularityById])

  const getSimpleRequirementText = (req: { previous?: string; nivelAlma?: number } | undefined): string | undefined => {
    if (!req) return undefined
    const parts: string[] = []
    if (req.previous) parts.push(`Requer: ${resolveNameById(req.previous)}`)
    if (typeof req.nivelAlma === 'number' && !Number.isNaN(req.nivelAlma)) {
      parts.push(`Nível de Alma ${req.nivelAlma}+`)
    }
    return parts.length ? parts.join(', ') : undefined
  }

  const formatAttributePenaltiesFromSource = (penalties?: { attributes?: Record<string, number> }) => {
    const attrs = penalties?.attributes
    if (!attrs || Object.keys(attrs).length === 0) return null
    return Object.entries(attrs)
      .map(([k, v]) => `${k} ${formatModifier(v)}`)
      .join(', ')
  }

  const buttonBase =
    'flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors min-w-[8rem]'
  const buttonActive =
    'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30'
  const buttonIdle =
    'bg-white dark:bg-ecoar-dark-800/40 text-slate-700 dark:text-ecoar-light-900/80 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10'

  const signedEffects = useMemo(
    () => (singularityBonuses ? partitionSignedBonuses(singularityBonuses) : null),
    [singularityBonuses],
  )

  const hasNumericEffects =
    singularityBonuses &&
    signedEffects &&
    (Object.keys(signedEffects.bonusAttributes).length > 0 ||
      Object.keys(signedEffects.penaltyAttributes).length > 0 ||
      Object.keys(signedEffects.bonusSkills).length > 0 ||
      Object.keys(signedEffects.penaltySkills).length > 0 ||
      singularityBonuses.corpo !== 0 ||
      singularityBonuses.mente !== 0 ||
      singularityBonuses.folego !== 0 ||
      singularityBonuses.mana !== 0)

  const selectedEntries = useMemo((): SelectedEntry[] => {
    const out: SelectedEntry[] = []
    let seq = 0
    const push = (id: string, kind: SystemSingularityKind) => {
      out.push({ id, kind, reactKey: `sing-${kind}-${id}-${seq++}` })
    }
    for (const id of selectionSlice.singularidades) push(id, 'criacao')
    for (const id of selectionSlice.singularidadesEcoar) push(id, 'ecoar')
    for (const id of selectionSlice.singularidadesMarciais) push(id, 'marcial')
    for (const id of selectionSlice.singularidadesRaciais) push(id, 'racial')
    return out
  }, [selectionSlice])

  const resolvedSelected = useMemo(() => {
    return selectedEntries.map(({ id, kind, reactKey }) => ({
      id,
      kind,
      reactKey,
      sys: systemSingularityById.get(id),
    }))
  }, [selectedEntries, systemSingularityById])

  const byActivationTab = useMemo(() => {
    const passivas: typeof resolvedSelected = []
    const condicionais: typeof resolvedSelected = []
    const complexas: typeof resolvedSelected = []
    const ativas: typeof resolvedSelected = []

    for (const row of resolvedSelected) {
      const a = row.sys?.activationType ?? 'complexa'
      const main = tabFromActivationType(a)
      if (main === 'complexas') complexas.push(row)
      else if (main === 'ativas') ativas.push(row)
      else if (a === 'passiva') passivas.push(row)
      else condicionais.push(row)
    }

    const sortByName = (a: (typeof resolvedSelected)[number], b: (typeof resolvedSelected)[number]) =>
      (a.sys?.name ?? a.id).localeCompare(b.sys?.name ?? b.id, 'pt-BR')

    passivas.sort(sortByName)
    condicionais.sort(sortByName)
    complexas.sort(sortByName)
    ativas.sort(sortByName)

    return { passivas, condicionais, complexas, ativas }
  }, [resolvedSelected])

  const renderFooter = (kind: SystemSingularityKind, activationType: SystemSingularityActivationType, id: string) => {
    const condOn = conditionalEnabledForKind(selectionSlice, id, kind)
    return (
      <div className="space-y-1 text-left w-full mt-1.5 pt-1.5 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06]">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/55">{kindLabel(kind)}</div>
        {activationType === 'condicional' && (
          <p
            className={`text-[11px] leading-snug ${
              condOn
                ? 'text-ecoar-teal-800 dark:text-ecoar-teal-300'
                : 'text-amber-800 dark:text-amber-200/90'
            }`}
          >
            {condOn
              ? 'Incluída no cálculo automático da ficha (condição ativa).'
              : 'Não está no cálculo automático; ative na ficha quando a condição valer no teste ou na cena.'}
          </p>
        )}
      </div>
    )
  }

  const renderCard = (row: (typeof resolvedSelected)[number]) => {
    const { id, kind, sys, reactKey } = row
    const activationType = sys?.activationType ?? 'complexa'

    if (!sys) {
      return (
        <div key={reactKey} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
          Singularidade não encontrada no catálogo: {id}
        </div>
      )
    }

    if (kind === 'criacao') {
      const sing = getCreationSingularityById(id) || getSingularityById(id)
      if (!sing) {
        return (
          <div key={reactKey} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
            Singularidade não encontrada: {id}
          </div>
        )
      }
      const restrictionsText =
        sing.requirements && sing.requirements.length > 0
          ? `Não pode possuir: ${sing.requirements.map((reqId) => resolveNameById(reqId)).join(', ')}`
          : undefined
      const penaltyLine = formatAttributePenaltiesFromSource(sing.penalties)
      return (
        <div key={reactKey} className="space-y-1">
          <SingularityCard
            name={sing.name}
            description={sing.description}
            cost={sing.cost}
            isSelected={true}
            canAfford={true}
            canSelect={false}
            onClick={() => {}}
            variant="teal"
            requirementsText={restrictionsText}
            footer={renderFooter(kind, activationType, id)}
          />
          {penaltyLine && (
            <p className="text-[11px] text-ecoar-magenta-700 dark:text-ecoar-magenta-300/90 pl-0.5">
              Penalidades (atributos): {penaltyLine}
            </p>
          )}
        </div>
      )
    }

    if (kind === 'ecoar') {
      const sing = getEcoarSingularityById(id)
      if (!sing) {
        return (
          <div key={reactKey} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
            Singularidade não encontrada: {id}
          </div>
        )
      }
      const penaltyLine = formatAttributePenaltiesFromSource(sing.penalties)
      return (
        <div key={reactKey} className="space-y-1">
          <SingularityCard
            name={sing.name}
            description={sing.description}
            cost={sing.cost}
            costLabel="PC"
            secondaryCost={sing.cost === 0 ? 'Inata' : undefined}
            effects={sing.effects || undefined}
            isSelected={true}
            canAfford={true}
            canSelect={false}
            onClick={() => {}}
            variant="teal"
            requirementsText={getSimpleRequirementText(sing.requirements)}
            footer={renderFooter(kind, activationType, id)}
          />
          {penaltyLine && (
            <p className="text-[11px] text-ecoar-magenta-700 dark:text-ecoar-magenta-300/90 pl-0.5">
              Penalidades (atributos): {penaltyLine}
            </p>
          )}
        </div>
      )
    }

    if (kind === 'marcial') {
      const sing = getMartialSchoolSingularityById(id)
      // Custo em PE: catálogo unificado (DB/API quando existir) — alinhado a buildSystemSingularities / migrações.
      const peCost = typeof sys.cost === 'number' && !Number.isNaN(sys.cost) ? sys.cost : sing?.cost ?? 0
      if (!sing) {
        return (
          <SingularityCard
            key={reactKey}
            name={sys.name}
            description={sys.description}
            cost={peCost * 10}
            costLabel="PC"
            secondaryCost={`${peCost} PE`}
            isSelected={true}
            canAfford={true}
            canSelect={false}
            onClick={() => {}}
            variant="teal"
            footer={renderFooter(kind, activationType, id)}
          />
        )
      }
      return (
        <SingularityCard
          key={reactKey}
          name={sing.name}
          description={sing.description}
          cost={peCost * 10}
          costLabel="PC"
          secondaryCost={`${peCost} PE`}
          level={sing.level}
          effects={sing.effects || undefined}
          isSelected={true}
          canAfford={true}
          canSelect={false}
          onClick={() => {}}
          variant="teal"
          requirementsText={getSimpleRequirementText(sing.requirements)}
          footer={renderFooter(kind, activationType, id)}
        />
      )
    }

    const sing = getRacialSingularityById(id)
    if (!sing) {
      return (
        <div key={reactKey} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
          Singularidade não encontrada: {id}
        </div>
      )
    }
    return (
      <SingularityCard
        key={reactKey}
        name={sing.name}
        description={sing.description}
        cost={sing.cost}
        costLabel={sing.cost === 0 ? undefined : 'PC'}
        secondaryCost={sing.cost === 0 ? 'Inata' : undefined}
        effects={sing.effects}
        isSelected={true}
        canAfford={true}
        canSelect={false}
        onClick={() => {}}
        variant="teal"
        footer={renderFooter(kind, activationType, id)}
      />
    )
  }

  const emptyMsg = 'Nenhuma singularidade deste tipo entre as selecionadas.'

  return (
    <div className="space-y-3">
      {hasNumericEffects && singularityBonuses && signedEffects && (
        <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/80 dark:bg-ecoar-dark-900/40 p-3 space-y-2 text-xs">
          <div className="font-semibold text-slate-800 dark:text-ecoar-light-900/90">Efeitos numéricos (singularidades)</div>
          <p className="text-[11px] text-slate-600 dark:text-ecoar-light-900/65 leading-relaxed">
            Refletem apenas <strong className="font-medium">passivas</strong> e <strong className="font-medium">condicionais com condição ativa</strong> na ficha (mesma regra do cálculo automático).
          </p>
          {(Object.keys(signedEffects.bonusAttributes).length > 0 ||
            Object.keys(signedEffects.bonusSkills).length > 0 ||
            singularityBonuses.corpo > 0 ||
            singularityBonuses.mente > 0 ||
            singularityBonuses.folego > 0 ||
            singularityBonuses.mana > 0) && (
            <div className="p-2 rounded border border-ecoar-teal/30 bg-ecoar-teal/5 dark:bg-ecoar-teal-900/15">
              <div className="font-medium text-ecoar-teal-800 dark:text-ecoar-teal-300 mb-1">Bônus</div>
              <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/85">
                {Object.entries(signedEffects.bonusAttributes).map(([k, v]) => (
                  <li key={`ba-${k}`}>
                    Atributo {k}: {formatModifier(v)}
                  </li>
                ))}
                {Object.entries(signedEffects.bonusSkills).map(([id, v]) => (
                  <li key={`bs-${id}`}>
                    {getSkillById(id)?.name ?? id}: {formatModifier(v)}
                  </li>
                ))}
                {singularityBonuses.corpo > 0 && <li>Corpo: {formatModifier(singularityBonuses.corpo)}</li>}
                {singularityBonuses.mente > 0 && <li>Mente: {formatModifier(singularityBonuses.mente)}</li>}
                {singularityBonuses.folego > 0 && <li>Fôlego: {formatModifier(singularityBonuses.folego)}</li>}
                {singularityBonuses.mana > 0 && <li>Mana: {formatModifier(singularityBonuses.mana)}</li>}
              </ul>
            </div>
          )}
          {(Object.keys(signedEffects.penaltyAttributes).length > 0 ||
            Object.keys(signedEffects.penaltySkills).length > 0 ||
            singularityBonuses.corpo < 0 ||
            singularityBonuses.mente < 0 ||
            singularityBonuses.folego < 0 ||
            singularityBonuses.mana < 0) && (
            <div className="p-2 rounded border border-ecoar-magenta/35 bg-ecoar-magenta/5 dark:bg-ecoar-magenta-900/15">
              <div className="font-medium text-ecoar-magenta-800 dark:text-ecoar-magenta-300 mb-1">Desvantagens</div>
              <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/85">
                {Object.entries(signedEffects.penaltyAttributes).map(([k, v]) => (
                  <li key={`pa-${k}`}>
                    Atributo {k}: {formatModifier(v)}
                  </li>
                ))}
                {Object.entries(signedEffects.penaltySkills).map(([id, v]) => (
                  <li key={`ps-${id}`}>
                    {getSkillById(id)?.name ?? id}: {formatModifier(v)}
                  </li>
                ))}
                {singularityBonuses.corpo < 0 && <li>Corpo: {formatModifier(singularityBonuses.corpo)}</li>}
                {singularityBonuses.mente < 0 && <li>Mente: {formatModifier(singularityBonuses.mente)}</li>}
                {singularityBonuses.folego < 0 && <li>Fôlego: {formatModifier(singularityBonuses.folego)}</li>}
                {singularityBonuses.mana < 0 && <li>Mana: {formatModifier(singularityBonuses.mana)}</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-2 ${compact ? 'max-w-full' : ''}`}>
        {(Object.keys(TAB_LABELS) as MainTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`${buttonBase} ${tab === t ? buttonActive : buttonIdle}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-600 dark:text-ecoar-light-900/60 leading-relaxed">{TAB_INTRO[tab]}</p>

      {tab === 'passivas-condicionais' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">
              Passivas
            </h3>
            {byActivationTab.passivas.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">{emptyMsg}</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">{byActivationTab.passivas.map((r) => renderCard(r))}</div>
            )}
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">
              Condicionais
            </h3>
            {byActivationTab.condicionais.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">{emptyMsg}</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">{byActivationTab.condicionais.map((r) => renderCard(r))}</div>
            )}
          </section>
        </div>
      )}

      {tab === 'complexas' && (
        <div className="space-y-2">
          {byActivationTab.complexas.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">{emptyMsg}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">{byActivationTab.complexas.map((r) => renderCard(r))}</div>
          )}
        </div>
      )}

      {tab === 'ativas' && (
        <div className="space-y-2">
          {byActivationTab.ativas.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">{emptyMsg}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">{byActivationTab.ativas.map((r) => renderCard(r))}</div>
          )}
        </div>
      )}
    </div>
  )
}
