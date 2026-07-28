'use client'

import { useEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import EquipmentCatalogErrorBoundary from '@/components/equipment/EquipmentCatalogErrorBoundary'
import OwnedWeaponQualityControls from '@/components/equipment/OwnedWeaponQualityControls'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import { useEquipmentCatalog } from '@/shared/contexts/EquipmentCatalogContext'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetBtnCompact,
  sheetBtnGhost,
  sheetBtnTeal,
  sheetChipActive,
  sheetChipIdle,
  sheetField,
  sheetFocusRing,
  sheetLabel,
  sheetStatCell,
  sheetTableHead,
  sheetTextLink,
} from '@/features/character/sheet/sheetChrome'

const sheetTextarea =
  `w-full resize-y rounded-none border border-ecoar-teal/40 bg-[#0a0a0a] px-2 py-1.5 font-mono text-xs text-[#f5f5f5] outline-none focus:border-ecoar-teal ${sheetFocusRing} disabled:opacity-55`

export function InventoryWidget() {
  const catalogCloseRef = useRef<HTMLButtonElement>(null)
  const catalogReturnFocusRef = useRef<HTMLElement | null>(null)

  const {
    characterData,
    updateField,
    isEditing,
    canMutateFicha,
    canMutateMesa,
    requestConfirm,
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
    changeSheetCatalogItemQuality,
    equippedMainArmorEntries,
    equippedAccessoryEntries,
    equippedUtilityEntries,
    totalArmorStats,
  } = useSheetRuntime()

  const { weapons, armor, utilities, multiplierTables } = useEquipmentCatalog()

  const canMutateCatalog = canMutateFicha
  const canToggleEquipFor = (item: (typeof characterData.itensCatalogo)[number]) =>
    item.kind === 'weapon' ? canMutateMesa : canMutateFicha

  useEffect(() => {
    if (!equipmentPickerOpen) return
    catalogReturnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const id = window.setTimeout(() => catalogCloseRef.current?.focus(), 0)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setEquipmentPickerOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKeyDown, true)
      catalogReturnFocusRef.current?.focus()
      catalogReturnFocusRef.current = null
    }
  }, [equipmentPickerOpen, setEquipmentPickerOpen])

  const sheetUsesStructuredEquip =
    characterData.itensCatalogo.length > 0 ||
    characterData.equipamentosLivresText.trim() !== '' ||
    characterData.armasLivresText.trim() !== ''

  const showOutrosEquipamentos =
    isEditing || characterData.equipamentosLivresText.trim() !== ''
  const showOutrasArmas = isEditing || characterData.armasLivresText.trim() !== ''
  const showFreeTextBlock = showOutrosEquipamentos || showOutrasArmas

  const tabActive = sheetChipActive
  const tabIdle = sheetChipIdle

  const spacesTotal =
    typeof equipmentSpaces.total === 'number'
      ? equipmentSpaces.total
      : Number.parseInt(String(equipmentSpaces.total), 10)
  const spacesCapacityKnown = Number.isFinite(spacesTotal) && spacesTotal > 0
  const spacesReadout = spacesCapacityKnown
    ? `${equipmentSpaces.used} / ${spacesTotal} espaços`
    : `${equipmentSpaces.used} usados · capacidade indefinida`

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
    <div className="space-y-1.5 p-2 sm:p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEquipmentSubTab('inventario')}
            className={`${equipmentSubTab === 'inventario' ? tabActive : tabIdle}`}
            aria-pressed={equipmentSubTab === 'inventario'}
          >
            Mochila
          </button>
          <button
            type="button"
            onClick={() => setEquipmentSubTab('equipados')}
            className={`${equipmentSubTab === 'equipados' ? tabActive : tabIdle}`}
            aria-pressed={equipmentSubTab === 'equipados'}
            title="Armaduras, acessórios e mods — armas ficam em Armas carregadas"
          >
            Vestuário
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <label className={`${sheetLabel} mb-0`} htmlFor="sheet-equip-capacidade">
            Capacidade
          </label>
          <input
            id="sheet-equip-capacidade"
            type="text"
            value={characterData.espacos}
            disabled={!isEditing}
            onChange={(e) => updateField('espacos', e.target.value)}
            placeholder="7"
            aria-describedby="sheet-equip-espacos-readout"
            className={`${sheetField} h-7 max-w-[5.5rem]`}
          />
          <span
            id="sheet-equip-espacos-readout"
            className="font-mono text-xs tabular-nums text-[#adb5bd]"
          >
            {spacesReadout}
          </span>
          <span className="font-mono text-xs tabular-nums text-[#f5f5f5]">
            {formatCerosDisplay(characterData.saldoMoedas)}
          </span>
          <button
            type="button"
            onClick={() => setEquipmentPickerOpen(true)}
            disabled={!canMutateCatalog}
            title={
              canMutateCatalog
                ? 'Abrir catálogo de aquisição'
                : 'Ficha · entre em edição para Catálogo'
            }
            className={`${sheetBtnTeal} ${sheetBtnCompact}`}
          >
            Catálogo
          </button>
          <a
            href="/referencia/aquisicao-equipamentos"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.08em] text-ecoar-teal hover:underline ${sheetFocusRing}`}
          >
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            Regras de aquisição
          </a>
        </div>
      </div>

      {equipmentSubTab === 'inventario' ? (
        sheetUsesStructuredEquip ? (
          <div className="space-y-2">
            {characterData.itensCatalogo.length > 0 ? (
              <div className="overflow-x-auto rounded-none border border-ecoar-teal/40">
                <table className="min-w-full font-mono text-xs">
                  <thead>
                    <tr className={`border-b border-ecoar-teal/30 ${sheetTableHead}`}>
                      <th className="px-2 py-1.5 text-left font-normal">
                        Item
                      </th>
                      <th className="w-[7.5rem] px-2 py-1.5 text-left font-normal">
                        Equipar
                      </th>
                      {isEditing ? (
                        <th className="w-16 px-2 py-1.5 text-right font-normal">
                          Ação
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {characterData.itensCatalogo.map((item) => {
                      const eq = equipLabel(item)
                      const canToggleEquip = canToggleEquipFor(item)
                      return (
                        <tr
                          key={item.instanceId}
                          className="border-b border-ecoar-teal/20 last:border-b-0"
                        >
                          <td className="max-w-[28rem] px-2 py-1 text-[#f5f5f5]">
                            <span className="line-clamp-2 break-words">{item.displayLine}</span>
                            {item.kind === 'weapon' && isEditing ? (
                              <div className="mt-1.5">
                                <OwnedWeaponQualityControls
                                  compact
                                  item={item}
                                  saldoDisponivel={characterData.saldoMoedas}
                                  disabled={!canMutateFicha}
                                  onChangeQuality={(next) => {
                                    changeSheetCatalogItemQuality(item.instanceId, next)
                                  }}
                                />
                              </div>
                            ) : null}
                          </td>
                          <td className="px-2 py-1">
                            {eq ? (
                              <label
                                className={`inline-flex select-none items-center gap-1.5 font-mono text-xs ${
                                  canToggleEquip ? 'text-[#adb5bd]' : 'cursor-not-allowed text-[#adb5bd]/70'
                                }`}
                                title={
                                  canToggleEquip
                                    ? undefined
                                    : item.kind === 'weapon'
                                      ? 'Sem permissão para equipar armas'
                                      : 'Ficha · entre em edição para Equipar'
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={eq.checked}
                                  disabled={!canToggleEquip}
                                  onChange={(e) => eq.onToggle(e.target.checked)}
                                  className={`h-3.5 w-3.5 rounded-none border-ecoar-teal/40 ${sheetFocusRing}`}
                                />
                                <span className={eq.checked ? 'text-ecoar-teal' : ''}>
                                  {eq.text}
                                </span>
                              </label>
                            ) : (
                              <span className="text-[#adb5bd]">—</span>
                            )}
                          </td>
                          {isEditing ? (
                            <td className="px-2 py-1 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  void (async () => {
                                    const nome = item.nome?.trim() || 'este item'
                                    const ok = await requestConfirm({
                                      title: 'Remover da mochila?',
                                      body: `“${nome}” será removido. Essa ação não pode ser desfeita nesta edição.`,
                                      confirmLabel: 'Remover',
                                      cancelLabel: 'Manter',
                                    })
                                    if (!ok) return
                                    removeSheetCatalogItem(item.instanceId)
                                  })()
                                }}
                                className={sheetTextLink}
                              >
                                Remover
                              </button>
                            </td>
                          ) : null}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="font-mono text-xs text-[#adb5bd]">
                {canMutateCatalog
                  ? 'Mochila vazia. Abra o Catálogo para adicionar itens.'
                  : 'Mochila vazia. Em edição (Ficha), abra o Catálogo para adicionar itens.'}
              </p>
            )}

            {showFreeTextBlock ? (
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                {showOutrosEquipamentos ? (
                  <div>
                    <label className={sheetLabel}>Outros equipamentos</label>
                    <textarea
                      value={characterData.equipamentosLivresText}
                      disabled={!isEditing}
                      onChange={(e) => updateField('equipamentosLivresText', e.target.value)}
                      placeholder="Itens que não estão no catálogo…"
                      rows={isEditing ? 2 : 1}
                      className={sheetTextarea}
                    />
                  </div>
                ) : null}
                {showOutrasArmas ? (
                  <div>
                    <label className={sheetLabel}>Outras armas</label>
                    <textarea
                      value={characterData.armasLivresText}
                      disabled={!isEditing}
                      onChange={(e) => updateField('armasLivresText', e.target.value)}
                      placeholder="Armas que não estão no catálogo…"
                      rows={isEditing ? 2 : 1}
                      className={sheetTextarea}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <textarea
            value={characterData.equipamentos}
            disabled={!isEditing}
            onChange={(e) => updateField('equipamentos', e.target.value)}
            placeholder="Liste armas, armaduras e outros itens…"
            rows={8}
            className={sheetTextarea}
          />
        )
      ) : (
        <div className="space-y-1.5">
          <p className="font-mono text-xs leading-snug text-[#adb5bd]">
            Armaduras, acessórios e mods. Armas equipadas ficam em Armas carregadas.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className={`${sheetStatCell} px-2.5 py-2`}>
              <div className={sheetLabel}>Armaduras</div>
              <p className="font-mono text-xs leading-snug text-[#f5f5f5]">
                {equippedMainArmorEntries.map((e) => e.name).join(', ') || 'Nenhuma armadura equipada'}
              </p>
            </div>
            <div className={`${sheetStatCell} px-2.5 py-2`}>
              <div className={sheetLabel}>Acessórios</div>
              <p className="font-mono text-xs leading-snug text-[#f5f5f5]">
                {[
                  ...equippedAccessoryEntries.map((e) => e.name),
                  ...equippedUtilityEntries.map((u) => u.name),
                ].join(', ') || 'Nenhum acessório equipado'}
              </p>
            </div>
            <div className={`${sheetStatCell} px-2.5 py-2`}>
              <div className={sheetLabel}>Mods de vestuário</div>
              <p className="font-mono text-xs tabular-nums text-[#f5f5f5]">
                Esquiva {totalArmorStats.esquiva} · Furtividade {totalArmorStats.furtividade} · Crítico{' '}
                {totalArmorStats.crit}
              </p>
            </div>
          </div>
        </div>
      )}

      {equipmentPickerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 p-2 sm:p-4">
          <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-none border border-ecoar-teal/40 bg-[#1a1d21] shadow-none">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-ecoar-teal/35 bg-[#0a0a0a] px-3 py-2">
              <span className="font-display text-sm uppercase tracking-[-0.02em] text-[#f5f5f5]">
                Catálogo de aquisição
              </span>
              <button
                type="button"
                ref={catalogCloseRef}
                onClick={() => setEquipmentPickerOpen(false)}
                className={sheetBtnGhost}
              >
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
