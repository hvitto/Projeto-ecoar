'use client'

import { races } from '@/data/races'
import { paths } from '@/data/paths'
import { locations } from '@/data/locations'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetField,
  sheetFieldCompact,
  sheetLabel,
  sheetMeta,
  sheetBtnTeal,
  sheetBtnTealStrong,
  sheetBtnCompact,
  sheetStatCell,
} from '@/features/character/sheet/sheetChrome'

function ReadValue({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${sheetStatCell} min-w-0 px-1.5 py-1.5`}>
      <div className={`${sheetLabel} mb-0.5`}>{label}</div>
      <p className="truncate font-mono text-sm text-[#f5f5f5]" title={value || '—'}>
        {value || '—'}
      </p>
    </div>
  )
}

function LevelPills({
  alma,
  poder,
  trilha,
}: {
  alma: number
  poder: number
  trilha: number
}) {
  return (
    <div
      className="flex shrink-0 items-stretch gap-1"
      role="group"
      aria-label="Níveis de Alma, Poder e Trilha"
    >
      {(
        [
          { label: 'Alma', value: alma },
          { label: 'Poder', value: poder },
          { label: 'Trilha', value: trilha },
        ] as const
      ).map((n) => (
        <div
          key={n.label}
          className={`${sheetStatCell} min-w-[2.75rem] px-1.5 py-1 text-center`}
        >
          <div className={`${sheetLabel} mb-0`}>{n.label}</div>
          <div className="font-mono text-sm font-semibold tabular-nums leading-none text-[#f5f5f5]">
            {n.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export function IdentityWidget() {
  const {
    characterData,
    setCharacterData,
    updateField,
    isEditing,
    canEditSheet,
    hasMasterOverride,
    onOpenEvolution,
    peToAdd,
    setPeToAdd,
    peToAddNumber,
    nivelAlma,
    nivelPoder,
    nivelTrilha,
    coerceInt,
    applyRaceBonuses,
    requestConfirm,
  } = useSheetRuntime()

  const locationName =
    locations.find((l) => l.id === characterData.localizacao)?.name ?? '—'

  const peDisponivel = characterData.pontosEvolucao.atual
  const peAcumulado = characterData.pontosEvolucao.max
  const canEvolve = peDisponivel > 0

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-2.5 p-2.5 sm:p-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <LevelPills alma={nivelAlma} poder={nivelPoder} trilha={nivelTrilha} />
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0">
              <div className={`${sheetLabel} mb-0.5`}>PE</div>
              {hasMasterOverride ? (
                <div className="flex items-center gap-1" title="Somente leitura — some PE em Editar">
                  <input
                    type="number"
                    value={peDisponivel}
                    readOnly
                    tabIndex={-1}
                    aria-label="PE disponíveis"
                    aria-readonly="true"
                    className={`${sheetFieldCompact} w-14 cursor-default border-ecoar-teal/40 text-ecoar-teal opacity-55`}
                  />
                  <span className={sheetMeta}>/</span>
                  <input
                    type="number"
                    value={peAcumulado}
                    readOnly
                    tabIndex={-1}
                    aria-label="PE acumulados"
                    aria-readonly="true"
                    className={`${sheetFieldCompact} w-14 cursor-default opacity-55`}
                  />
                </div>
              ) : (
                <p
                  className="font-mono text-sm font-semibold tabular-nums leading-none text-[#f5f5f5]"
                  aria-label={`${peDisponivel} PE disponíveis de ${peAcumulado} acumulados`}
                  title="Disponível / acumulado"
                >
                  <span className="text-ecoar-teal">{peDisponivel}</span>
                  <span className="mx-1 font-normal text-[#adb5bd]">/</span>
                  <span className="font-normal text-[#adb5bd]">{peAcumulado}</span>
                </p>
              )}
            </div>
            {canEditSheet ? (
              <button
                type="button"
                disabled={!canEvolve}
                onClick={() => onOpenEvolution?.()}
                title={
                  canEvolve
                    ? 'Gastar PE em singularidades, atributos e trilha'
                    : 'Sem PE disponíveis. Adicione na edição ou peça ao mestre.'
                }
                aria-label={
                  canEvolve
                    ? 'Evoluir personagem com PE'
                    : 'Evoluir indisponível: sem PE'
                }
                className={`${canEvolve ? sheetBtnTealStrong : sheetBtnTeal} ${sheetBtnCompact}`}
              >
                Evoluir
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <ReadValue label="Traço +" value={characterData.tracoPositivo} />
          <ReadValue label="Traço −" value={characterData.tracoNegativo} />
          <ReadValue label="Personalidade" value={characterData.personalidade} />
          <ReadValue label="Localização" value={locationName} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 p-2.5 sm:p-3">
      <div className="min-w-0 space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <label className={sheetLabel}>Nome</label>
            <input
              type="text"
              value={characterData.nome}
              onChange={(e) => updateField('nome', e.target.value)}
              placeholder="Nome"
              className={sheetField}
            />
          </div>
          <div className="min-w-0">
            <label className={sheetLabel}>Raça</label>
            <select
              value={characterData.raca}
              onChange={(e) => {
                const next = e.target.value
                if (next === characterData.raca) return
                void (async () => {
                  const ok = await requestConfirm({
                    title: 'Trocar raça?',
                    body: 'Ajustes raciais e bônus podem mudar. Confirme para continuar.',
                    confirmLabel: 'Trocar raça',
                  })
                  if (!ok) return
                  updateField('raca', next)
                  applyRaceBonuses(next)
                })()
              }}
              className={sheetField}
            >
              <option value="">—</option>
              {races.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className={sheetLabel}>Localização</label>
            <select
              value={characterData.localizacao}
              onChange={(e) => updateField('localizacao', e.target.value)}
              className={sheetField}
            >
              <option value="">—</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className={sheetLabel}>Trilha</label>
            <select
              value={characterData.trilha}
              onChange={(e) => {
                const next = e.target.value
                if (next === characterData.trilha) return
                void (async () => {
                  const ok = await requestConfirm({
                    title: 'Trocar trilha?',
                    body: 'A trilha define progressão e opções de evolução. Confirme para continuar.',
                    confirmLabel: 'Trocar trilha',
                  })
                  if (!ok) return
                  updateField('trilha', next)
                })()
              }}
              className={sheetField}
            >
              <option value="">—</option>
              {paths.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-1.5 xl:col-span-6">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <label className={`${sheetLabel} mb-0.5`}>PE</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <div
                    className="flex items-center gap-1"
                    title="Totais somente leitura — use Somar para acrescentar PE"
                  >
                    <input
                      type="number"
                      value={characterData.pontosEvolucao.atual}
                      readOnly
                      tabIndex={-1}
                      aria-label="PE disponíveis"
                      aria-readonly="true"
                      className={`${sheetFieldCompact} w-14 cursor-default border-ecoar-teal/40 text-ecoar-teal opacity-55`}
                    />
                    <span className={sheetMeta}>/</span>
                    <input
                      type="number"
                      value={characterData.pontosEvolucao.max}
                      readOnly
                      tabIndex={-1}
                      aria-label="PE acumulados"
                      aria-readonly="true"
                      className={`${sheetFieldCompact} w-14 cursor-default opacity-55`}
                    />
                  </div>
                  <div className="w-16 shrink-0">
                    <label className={`${sheetLabel} mb-0.5`} htmlFor="sheet-pe-to-add">
                      Somar
                    </label>
                    <input
                      id="sheet-pe-to-add"
                      type="number"
                      min="0"
                      value={peToAdd}
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') {
                          setPeToAdd('')
                          return
                        }
                        setPeToAdd(raw)
                      }}
                      placeholder="0"
                      aria-label="Quantidade de PE a somar"
                      className={sheetFieldCompact}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={peToAddNumber <= 0}
                    onClick={() => {
                      if (peToAddNumber <= 0) return
                      setCharacterData((prev) => ({
                        ...prev,
                        pontosEvolucao: {
                          atual: Math.max(0, prev.pontosEvolucao.atual + peToAddNumber),
                          max: Math.max(0, prev.pontosEvolucao.max + peToAddNumber),
                        },
                      }))
                      setPeToAdd('')
                    }}
                    className={`${peToAddNumber > 0 ? sheetBtnTealStrong : sheetBtnTeal} ${sheetBtnCompact}`}
                  >
                    Somar
                  </button>
                </div>
              </div>
              <LevelPills alma={nivelAlma} poder={nivelPoder} trilha={nivelTrilha} />
            </div>
            <p className={sheetMeta}>
              Soma ao disponível e ao acumulado. Depois Salve. Para gastar, saia da edição e use
              Evoluir.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 xl:col-span-6">
            <div className="min-w-0">
              <label className={sheetLabel}>Traço +</label>
              <input
                type="text"
                value={characterData.tracoPositivo}
                onChange={(e) => updateField('tracoPositivo', e.target.value)}
                placeholder="ex.: Corajoso"
                className={sheetField}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Traço −</label>
              <input
                type="text"
                value={characterData.tracoNegativo}
                onChange={(e) => updateField('tracoNegativo', e.target.value)}
                placeholder="ex.: Impulsivo"
                className={sheetField}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Personalidade</label>
              <input
                type="text"
                value={characterData.personalidade}
                onChange={(e) => updateField('personalidade', e.target.value)}
                placeholder="ex.: Leal à trilha"
                className={sheetField}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 xl:col-span-12">
            <div className="min-w-0">
              <label className={sheetLabel}>Moeda</label>
              <input
                type="number"
                min={0}
                value={characterData.saldoMoedas}
                onChange={(e) =>
                  updateField('saldoMoedas', Math.max(0, coerceInt(e.target.value, 0)))
                }
                className={sheetFieldCompact}
                title={formatCerosDisplay(characterData.saldoMoedas)}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Peso</label>
              <input
                type="number"
                min={0}
                value={typeof characterData.peso === 'number' ? characterData.peso : 0}
                onChange={(e) =>
                  updateField('peso', Math.max(0, coerceInt(e.target.value, 0)))
                }
                className={sheetFieldCompact}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Tamanho</label>
              <input
                type="number"
                min={0}
                value={typeof characterData.tamanho === 'number' ? characterData.tamanho : 0}
                onChange={(e) =>
                  updateField('tamanho', Math.max(0, coerceInt(e.target.value, 0)))
                }
                className={sheetFieldCompact}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IdentityWidget
