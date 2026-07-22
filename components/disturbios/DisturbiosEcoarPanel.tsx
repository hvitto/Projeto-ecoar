'use client'

import { useMemo, useState } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import {
  attributeChoicesTaken,
  countOwnedDisturbios,
  disturbioIdentityEfeitos,
  disturbioIdentityGatilhos,
  disturbioIdentityPenalidades,
  disturbiosComuns,
  ecoarAcoes,
  getDisturbiosPontosEcoarObtidos,
  getIdentityPontosEcoar,
  hasIdentityDisturbio,
  isComumOwned,
  ownedEntryKey,
  type DisturbioIdentidadeSelection,
  type DisturbioOwnedEntry,
} from '@/data/disturbios'

type Props = {
  entries: DisturbioOwnedEntry[]
  onEntriesChange: (entries: DisturbioOwnedEntry[]) => void
  ecoarAcoesOwned: string[]
  onEcoarAcoesChange: (ids: string[]) => void
  nivelPoder: number
  pontosEcoarGastos: number
  lockedKeys?: Set<string>
  allowRemoveLocked?: boolean
  costLabel?: string
}

export function DisturbiosEcoarPanel({
  entries,
  onEntriesChange,
  ecoarAcoesOwned,
  onEcoarAcoesChange,
  nivelPoder,
  pontosEcoarGastos,
  lockedKeys,
  allowRemoveLocked = false,
  costLabel = 'Pts Ecoar',
}: Props) {
  const [draftIdentity, setDraftIdentity] = useState<Partial<DisturbioIdentidadeSelection>>({})
  const maxDisturbios = Math.max(1, nivelPoder)
  const ownedCount = countOwnedDisturbios(entries)
  const atCap = ownedCount >= maxDisturbios
  const pontosObtidos = getDisturbiosPontosEcoarObtidos(entries)
  const pontosDisponiveis = pontosObtidos - pontosEcoarGastos
  const identityOwned = hasIdentityDisturbio(entries)
  const identityEntry = entries.find((e) => e.kind === 'identidade')
  const identityKey = identityEntry ? ownedEntryKey(identityEntry) : ''
  const identityLocked = identityKey ? Boolean(lockedKeys?.has(identityKey)) : false

  const draftIdentityComplete =
    draftIdentity.gatilhoId && draftIdentity.efeitoId && draftIdentity.penalidadeId
      ? (draftIdentity as DisturbioIdentidadeSelection)
      : null
  const draftIdentityPoints = getIdentityPontosEcoar(draftIdentityComplete)

  const addComum = (id: string, choiceId?: string) => {
    if (atCap) return
    if (isComumOwned(entries, id, choiceId)) return
    const next: DisturbioOwnedEntry = choiceId
      ? { kind: 'comum', id, choiceId }
      : { kind: 'comum', id }
    onEntriesChange([...entries, next])
  }

  const removeByKey = (key: string) => {
    if (lockedKeys?.has(key) && !allowRemoveLocked) return
    onEntriesChange(entries.filter((e) => ownedEntryKey(e) !== key))
  }

  const confirmIdentity = () => {
    if (!draftIdentityComplete || identityOwned || atCap) return
    onEntriesChange([
      ...entries,
      {
        kind: 'identidade',
        gatilhoId: draftIdentityComplete.gatilhoId,
        efeitoId: draftIdentityComplete.efeitoId,
        penalidadeId: draftIdentityComplete.penalidadeId,
      },
    ])
    setDraftIdentity({})
  }

  const removeIdentity = () => {
    if (identityLocked && !allowRemoveLocked) return
    onEntriesChange(entries.filter((e) => e.kind !== 'identidade'))
  }

  const toggleAcao = (id: string) => {
    const acao = ecoarAcoes.find((a) => a.id === id)
    if (!acao || acao.universal) return
    if (ecoarAcoesOwned.includes(id)) {
      onEcoarAcoesChange(ecoarAcoesOwned.filter((x) => x !== id))
    } else {
      onEcoarAcoesChange([...ecoarAcoesOwned, id])
    }
  }

  const prejudicadoTaken = useMemo(
    () => attributeChoicesTaken(entries, 'atributo-prejudicado'),
    [entries],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 p-4 rounded-xl border border-ecoar-teal/30 bg-ecoar-teal/10">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">
            Distúrbios do Ecoar
          </div>
          <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70 mt-1 max-w-xl">
            Concedem Pontos de Ecoar para singularidades do Eco. Máximo de Distúrbios = Nível de Poder
            ({maxDisturbios}). Ao usar uma Ação do Ecoar, adquira um Distúrbio (exceto se já estiver no máximo).
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500">Distúrbios</div>
          <div className="text-lg font-semibold text-ecoar-teal">
            {ownedCount}/{maxDisturbios}
          </div>
          <div className="text-xs text-slate-500">
            {pontosObtidos} obtidos · {pontosEcoarGastos} gastos ·{' '}
            <span className={pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}>
              {pontosDisponiveis} disponíveis
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
          Distúrbio de Identidade (máx. 1)
        </h4>
        {identityOwned && identityEntry && identityEntry.kind === 'identidade' ? (
          <div className="p-4 rounded-lg border border-ecoar-teal/40 bg-ecoar-teal/10 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900 dark:text-ecoar-light-900">
                  Distúrbio de Identidade
                </div>
                <div className="text-xs text-slate-600 dark:text-ecoar-light-900/70 mt-1">
                  Gatilho: {disturbioIdentityGatilhos.find((g) => g.id === identityEntry.gatilhoId)?.name} ·
                  Efeito: {disturbioIdentityEfeitos.find((g) => g.id === identityEntry.efeitoId)?.name} ·
                  Penalidade:{' '}
                  {disturbioIdentityPenalidades.find((g) => g.id === identityEntry.penalidadeId)?.name}
                </div>
              </div>
              <div className="text-sm font-semibold text-ecoar-teal whitespace-nowrap">
                +{getIdentityPontosEcoar(identityEntry)} {costLabel}
              </div>
            </div>
            {(!identityLocked || allowRemoveLocked) && (
              <button
                type="button"
                onClick={removeIdentity}
                className="text-xs text-ecoar-magenta hover:underline"
              >
                Remover
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(
              [
                ['Gatilho', disturbioIdentityGatilhos, 'gatilhoId'],
                ['Efeito', disturbioIdentityEfeitos, 'efeitoId'],
                ['Penalidade', disturbioIdentityPenalidades, 'penalidadeId'],
              ] as const
            ).map(([label, list, field]) => (
              <div key={field} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {list.map((part) => {
                    const selected = draftIdentity[field] === part.id
                    return (
                      <SingularityCard
                        key={part.id}
                        name={part.name}
                        description={part.description}
                        cost={part.pontosEcoar}
                        costLabel={costLabel}
                        isSelected={selected}
                        canAfford
                        canSelect={!atCap || selected}
                        onClick={() =>
                          setDraftIdentity((prev) => ({
                            ...prev,
                            [field]: selected ? undefined : part.id,
                          }))
                        }
                        variant="teal"
                      />
                    )
                  })}
                </div>
              </div>
            ))}
            <button
              type="button"
              disabled={!draftIdentityComplete || atCap}
              onClick={confirmIdentity}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-ecoar-teal/20 text-ecoar-teal border border-ecoar-teal/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmar Identidade (+{draftIdentityPoints} {costLabel})
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
          Distúrbios Comuns
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {disturbiosComuns.map((d) => {
            if (d.repeatableByAttribute && d.choices) {
              return (
                <div key={d.id} className="space-y-2 col-span-full">
                  <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">
                    {d.name}{' '}
                    <span className="text-ecoar-teal font-normal">
                      +{d.pontosEcoar} {costLabel} cada
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70">{d.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {d.choices.map((choice) => {
                      const owned = prejudicadoTaken.includes(choice.id)
                      const key = ownedEntryKey({ kind: 'comum', id: d.id, choiceId: choice.id })
                      const locked = Boolean(lockedKeys?.has(key))
                      return (
                        <SingularityCard
                          key={choice.id}
                          name={choice.name}
                          description={`−1 em ${choice.name}`}
                          cost={d.pontosEcoar}
                          costLabel={costLabel}
                          isSelected={owned}
                          canAfford
                          canSelect={owned ? !locked || allowRemoveLocked : !atCap}
                          onClick={() => {
                            if (owned) removeByKey(key)
                            else addComum(d.id, choice.id)
                          }}
                          variant="teal"
                          className="text-sm"
                        />
                      )
                    })}
                  </div>
                </div>
              )
            }

            const owned = isComumOwned(entries, d.id)
            const key = ownedEntryKey({ kind: 'comum', id: d.id })
            const locked = Boolean(lockedKeys?.has(key))
            return (
              <SingularityCard
                key={d.id}
                name={d.name}
                description={d.description}
                cost={d.pontosEcoar}
                costLabel={costLabel}
                isSelected={owned}
                canAfford
                canSelect={owned ? !locked || allowRemoveLocked : !atCap}
                onClick={() => {
                  if (owned) removeByKey(key)
                  else addComum(d.id)
                }}
                variant="teal"
              />
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
          Ações do Ecoar
        </h4>
        <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70">
          Usar uma ação exige adquirir um Distúrbio (exceto no máximo de Distúrbios). Ressurreição é
          universal.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ecoarAcoes.map((acao) => {
            const selected = acao.universal || ecoarAcoesOwned.includes(acao.id)
            return (
              <SingularityCard
                key={acao.id}
                name={acao.name}
                description={acao.description}
                cost={0}
                secondaryCost={acao.universal ? 'Universal' : 'Desbloqueio'}
                isSelected={selected}
                canAfford
                canSelect={!acao.universal}
                onClick={() => toggleAcao(acao.id)}
                variant="teal"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
