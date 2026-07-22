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
  sheetBtnTeal,
  sheetBtnGhost,
} from '@/features/character/sheet/sheetChrome'

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
  } = useSheetRuntime()

  return (
    <div className="flex flex-col gap-2.5 p-2.5 sm:p-3 lg:flex-row lg:items-stretch">
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-sm border border-dashed border-slate-300 bg-slate-50 text-[10px] text-slate-500 dark:border-ecoar-light-900/25 dark:bg-ecoar-dark-900/30 dark:text-ecoar-light-900/50">
        Retrato
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <label className={sheetLabel}>Nome</label>
            <input
              type="text"
              value={characterData.nome}
              onChange={(e) => updateField('nome', e.target.value)}
              disabled={!isEditing}
              placeholder="Nome"
              className={sheetField}
            />
          </div>
          <div className="min-w-0">
            <label className={sheetLabel}>Raça</label>
            <select
              value={characterData.raca}
              disabled={!isEditing}
              onChange={(e) => {
                updateField('raca', e.target.value)
                applyRaceBonuses(e.target.value)
              }}
              className={sheetField}
            >
              <option value="">—</option>
              {races.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className={sheetLabel}>Localização</label>
            <select
              value={characterData.localizacao}
              disabled={!isEditing}
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
              disabled={!isEditing}
              onChange={(e) => updateField('trilha', e.target.value)}
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
          <div className="flex min-w-0 flex-wrap items-end gap-1.5 xl:col-span-4">
            <div className="min-w-0 flex-1">
              <label className={sheetLabel}>PE</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={characterData.pontosEvolucao.atual}
                  readOnly
                  disabled={!isEditing && !hasMasterOverride}
                  className={`${sheetFieldCompact} w-14`}
                />
                <span className="text-xs text-slate-500 dark:text-ecoar-light-900/50">/</span>
                <input
                  type="number"
                  value={characterData.pontosEvolucao.max}
                  readOnly
                  disabled={!isEditing && !hasMasterOverride}
                  className={`${sheetFieldCompact} w-14`}
                />
              </div>
            </div>
            <div className="w-16 shrink-0">
              <label className={sheetLabel}>+</label>
              <input
                type="number"
                min="0"
                value={peToAdd}
                disabled={!isEditing}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === '') {
                    setPeToAdd('')
                    return
                  }
                  setPeToAdd(raw)
                }}
                placeholder="0"
                className={sheetFieldCompact}
              />
            </div>
            <button
              type="button"
              disabled={!isEditing || peToAddNumber <= 0}
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
              className={`${sheetBtnTeal} disabled:opacity-50`}
            >
              Adicionar
            </button>
            {canEditSheet && !isEditing && (
              <button
                type="button"
                disabled={characterData.pontosEvolucao.atual <= 0}
                onClick={() => onOpenEvolution?.()}
                className={`${sheetBtnGhost} border-ecoar-magenta-500/30 text-ecoar-magenta-800 disabled:opacity-50 dark:text-ecoar-magenta-300`}
              >
                Evoluir
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 xl:col-span-2">
            {(
              [
                { label: 'Alma', value: nivelAlma },
                { label: 'Poder', value: nivelPoder },
                { label: 'Trilha', value: nivelTrilha },
              ] as const
            ).map((n) => (
              <div
                key={n.label}
                className="rounded-sm border border-slate-200 bg-slate-50/80 px-1.5 py-1 text-center dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/25"
              >
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/50">
                  {n.label}
                </div>
                <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-ecoar-light-900">
                  {n.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 xl:col-span-4">
            <div className="min-w-0">
              <label className={sheetLabel}>Traço +</label>
              <input
                type="text"
                value={characterData.tracoPositivo}
                disabled={!isEditing}
                onChange={(e) => updateField('tracoPositivo', e.target.value)}
                placeholder="—"
                className={sheetField}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Traço −</label>
              <input
                type="text"
                value={characterData.tracoNegativo}
                disabled={!isEditing}
                onChange={(e) => updateField('tracoNegativo', e.target.value)}
                placeholder="—"
                className={sheetField}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Personalidade</label>
              <input
                type="text"
                value={characterData.personalidade}
                disabled={!isEditing}
                onChange={(e) => updateField('personalidade', e.target.value)}
                placeholder="—"
                className={sheetField}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 xl:col-span-2">
            <div className="min-w-0">
              <label className={sheetLabel}>Moeda</label>
              <input
                type="number"
                min={0}
                disabled={!isEditing}
                value={characterData.saldoMoedas}
                onChange={(e) => updateField('saldoMoedas', Math.max(0, coerceInt(e.target.value, 0)))}
                className={sheetFieldCompact}
                title={formatCerosDisplay(characterData.saldoMoedas)}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Peso</label>
              <input
                type="number"
                value={typeof characterData.peso === 'number' ? characterData.peso : 0}
                disabled={!isEditing}
                onChange={(e) => updateField('peso', coerceInt(e.target.value, 0))}
                className={sheetFieldCompact}
              />
            </div>
            <div className="min-w-0">
              <label className={sheetLabel}>Tamanho</label>
              <input
                type="number"
                value={typeof characterData.tamanho === 'number' ? characterData.tamanho : 0}
                disabled={!isEditing}
                onChange={(e) => updateField('tamanho', coerceInt(e.target.value, 0))}
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
