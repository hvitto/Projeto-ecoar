'use client'

import { ExternalLink } from 'lucide-react'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import EquipmentCatalogErrorBoundary from '@/components/equipment/EquipmentCatalogErrorBoundary'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import { useEquipmentCatalog } from '@/shared/contexts/EquipmentCatalogContext'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetBtnGhost,
  sheetBtnTeal,
  sheetChip,
  sheetField,
  sheetLabel,
} from '@/features/character/sheet/sheetChrome'

export function InventoryWidget() {
  const {
    characterData,
    updateField,
    isEditing,
    canEditSheet,
    handleStartEdit,
    equipmentSpaces,
    equipmentSubTab,
    setEquipmentSubTab,
    equipmentPickerOpen,
    setEquipmentPickerOpen,
    toggleEquipWeaponInstance,
    toggleEquipArmorInstance,
    toggleEquipAccessoryInstance,
    findEquippedSlotForInstance,
    isArmorCatalogItem,
    isAccessoryCatalogItem,
    removeSheetCatalogItem,
    handleEquipmentCatalogPick,
    equippedMainArmorEntries,
    equippedAccessoryEntries,
    equippedUtilityEntries,
    totalArmorStats,
  } = useSheetRuntime()

  const { weapons, armor, utilities, multiplierTables } = useEquipmentCatalog()

  const sheetUsesStructuredEquip =
    characterData.itensCatalogo.length > 0 ||
    characterData.equipamentosLivresText.trim() !== '' ||
    characterData.armasLivresText.trim() !== ''

  const tabActive =
    'border-ecoar-teal-500/35 bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300'
  const tabIdle =
    'border-slate-300/70 text-slate-600 hover:bg-slate-100 dark:border-ecoar-light-900/20 dark:text-ecoar-light-900/70 dark:hover:bg-ecoar-light-900/10'

  const equipLabel = (item: (typeof characterData.itensCatalogo)[number]) => {
    if (item.kind === 'weapon') {
      const slot = findEquippedSlotForInstance(item.instanceId)
      if (!slot) return { checked: false, text: 'Equipar', onToggle: (v: boolean) => toggleEquipWeaponInstance(item.instanceId, v) }
      return {
        checked: true,
        text: slot === 'slot1' ? 'Arma 1' : 'Arma 2',
        onToggle: (v: boolean) => toggleEquipWeaponInstance(item.instanceId, v),
      }
    }
    if (item.kind === 'armor' && isArmorCatalogItem(item)) {
      const checked = (characterData.equippedArmors ?? []).some((it) => it.instanceId === item.instanceId)
      return {
        checked,
        text: 'Armadura',
        onToggle: (v: boolean) => toggleEquipArmorInstance(item.instanceId, v),
      }
    }
    if (item.kind === 'armor' && isAccessoryCatalogItem(item)) {
      const checked = (characterData.equippedAccessories ?? []).some((it) => it.instanceId === item.instanceId)
      return {
        checked,
        text: 'Acessório',
        onToggle: (v: boolean) => toggleEquipAccessoryInstance(item.instanceId, v),
      }
    }
    if (item.kind === 'utility') {
      const checked = (characterData.equippedAccessories ?? []).some((it) => it.instanceId === item.instanceId)
      return {
        checked,
        text: 'Utilitário',
        onToggle: (v: boolean) => toggleEquipAccessoryInstance(item.instanceId, v),
      }
    }
    return null
  }

  return (
    <div className="space-y-2 p-2 sm:p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEquipmentSubTab('inventario')}
            className={`${sheetChip} ${equipmentSubTab === 'inventario' ? tabActive : tabIdle}`}
          >
            Mochila
          </button>
          <button
            type="button"
            onClick={() => setEquipmentSubTab('equipados')}
            className={`${sheetChip} ${equipmentSubTab === 'equipados' ? tabActive : tabIdle}`}
          >
            Equipados
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <label className={`${sheetLabel} mb-0`}>Espaços</label>
          <input
            type="text"
            value={characterData.espacos}
            disabled={!isEditing}
            onChange={(e) => updateField('espacos', e.target.value)}
            placeholder="7"
            className={`${sheetField} h-7 max-w-[5.5rem]`}
          />
          <span className="text-[11px] tabular-nums text-slate-500 dark:text-ecoar-light-900/55">
            {equipmentSpaces.used}/{equipmentSpaces.total || '—'}
          </span>
          <span className="text-[11px] tabular-nums text-slate-700 dark:text-ecoar-light-900/80">
            {formatCerosDisplay(characterData.saldoMoedas)}
          </span>
          <button
            type="button"
            onClick={() => setEquipmentPickerOpen(true)}
            disabled={!canEditSheet || !isEditing}
            className={`${sheetBtnTeal} h-7 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Catálogo
          </button>
          <a
            href="/referencia/aquisicao-equipamentos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-ecoar-teal-600 hover:underline dark:text-ecoar-teal-400"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            Ref.
          </a>
        </div>
      </div>

      {equipmentSubTab === 'inventario' ? (
        sheetUsesStructuredEquip ? (
          <div className="space-y-2">
            {characterData.itensCatalogo.length > 0 ? (
              <div className="overflow-x-auto rounded-sm border border-slate-300/60 dark:border-ecoar-light-900/15">
                <table className="min-w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/30">
                      <th className="px-2 py-1.5 text-left font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                        Item
                      </th>
                      <th className="w-[7.5rem] px-2 py-1.5 text-left font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                        Equipar
                      </th>
                      <th className="w-16 px-2 py-1.5 text-right font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {characterData.itensCatalogo.map((item) => {
                      const eq = equipLabel(item)
                      return (
                        <tr
                          key={item.instanceId}
                          className="border-b border-slate-100 last:border-b-0 dark:border-ecoar-light-900/10"
                        >
                          <td className="max-w-[28rem] px-2 py-1 text-slate-800 dark:text-ecoar-light-900/85">
                            <span className="line-clamp-2 break-words">{item.displayLine}</span>
                          </td>
                          <td className="px-2 py-1">
                            {eq ? (
                              <label className="inline-flex select-none items-center gap-1.5 text-[11px] text-slate-600 dark:text-ecoar-light-900/65">
                                <input
                                  type="checkbox"
                                  checked={eq.checked}
                                  disabled={!canEditSheet}
                                  onChange={(e) => {
                                    if (!isEditing) handleStartEdit()
                                    eq.onToggle(e.target.checked)
                                  }}
                                  className="h-3.5 w-3.5 rounded-sm border-slate-300 dark:border-ecoar-light-900/25"
                                />
                                <span className={eq.checked ? 'text-ecoar-teal-700 dark:text-ecoar-teal-300' : ''}>
                                  {eq.text}
                                </span>
                              </label>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => removeSheetCatalogItem(item.instanceId)}
                                className="text-[11px] text-ecoar-magenta hover:underline"
                              >
                                Remover
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-ecoar-light-900/55">
                Mochila vazia. Use o catálogo para adicionar itens.
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <label className={sheetLabel}>Outros equipamentos</label>
                <textarea
                  value={characterData.equipamentosLivresText}
                  disabled={!isEditing}
                  onChange={(e) => updateField('equipamentosLivresText', e.target.value)}
                  placeholder="Itens fora do catálogo…"
                  rows={3}
                  className="w-full resize-y rounded-sm border border-slate-300/80 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-ecoar-teal-500 disabled:opacity-60 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-700 dark:text-ecoar-light-900 dark:focus:border-ecoar-teal-400"
                />
              </div>
              <div>
                <label className={sheetLabel}>Outras armas</label>
                <textarea
                  value={characterData.armasLivresText}
                  disabled={!isEditing}
                  onChange={(e) => updateField('armasLivresText', e.target.value)}
                  placeholder="Armas fora do catálogo…"
                  rows={3}
                  className="w-full resize-y rounded-sm border border-slate-300/80 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-ecoar-teal-500 disabled:opacity-60 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-700 dark:text-ecoar-light-900 dark:focus:border-ecoar-teal-400"
                />
              </div>
            </div>
          </div>
        ) : (
          <textarea
            value={characterData.equipamentos}
            disabled={!isEditing}
            onChange={(e) => updateField('equipamentos', e.target.value)}
            placeholder="Liste seus equipamentos..."
            rows={8}
            className="w-full resize-y rounded-sm border border-slate-300/80 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-ecoar-teal-500 disabled:opacity-60 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-700 dark:text-ecoar-light-900 dark:focus:border-ecoar-teal-400"
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-sm border border-slate-300/60 px-2.5 py-2 dark:border-ecoar-light-900/15">
            <div className={sheetLabel}>Armaduras</div>
            <p className="text-[11px] leading-snug text-slate-800 dark:text-ecoar-light-900/85">
              {equippedMainArmorEntries.map((e) => e.name).join(', ') || '—'}
            </p>
          </div>
          <div className="rounded-sm border border-slate-300/60 px-2.5 py-2 dark:border-ecoar-light-900/15">
            <div className={sheetLabel}>Acessórios</div>
            <p className="text-[11px] leading-snug text-slate-800 dark:text-ecoar-light-900/85">
              {[
                ...equippedAccessoryEntries.map((e) => e.name),
                ...equippedUtilityEntries.map((u) => u.name),
              ].join(', ') || '—'}
            </p>
          </div>
          <div className="rounded-sm border border-slate-300/60 px-2.5 py-2 dark:border-ecoar-light-900/15">
            <div className={sheetLabel}>Mods de vestuário</div>
            <p className="text-[11px] tabular-nums text-slate-700 dark:text-ecoar-light-900/80">
              Esquiva {totalArmorStats.esquiva} · Furt. {totalArmorStats.furtividade} · Crit{' '}
              {totalArmorStats.crit}
            </p>
          </div>
        </div>
      )}

      {equipmentPickerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 p-2 sm:p-4">
          <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-sm border border-slate-200 bg-slate-50 shadow-xl dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-900">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-800/80">
              <span className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">
                Catálogo de aquisição
              </span>
              <button type="button" onClick={() => setEquipmentPickerOpen(false)} className={sheetBtnGhost}>
                Fechar
              </button>
            </div>
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
              <EquipmentCatalogErrorBoundary onClose={() => setEquipmentPickerOpen(false)}>
                <EquipmentCatalogBrowser
                  mode="picker"
                  urlSync={false}
                  saldoDisponivel={characterData.saldoMoedas}
                  onPickItem={handleEquipmentCatalogPick}
                  showCostMultiplierTables={false}
                  weaponCatalog={weapons}
                  armorCatalog={armor}
                  utilityCatalog={utilities}
                  costMultiplierTables={multiplierTables}
                />
              </EquipmentCatalogErrorBoundary>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryWidget
