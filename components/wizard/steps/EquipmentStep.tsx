'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { CatalogEntry, CatalogOwnedItem } from '@/shared/types/equipment'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import OwnedWeaponQualityControls from '@/components/equipment/OwnedWeaponQualityControls'
import OwnedCatalogItemStats from '@/components/equipment/OwnedCatalogItemStats'
import { useEquipmentCatalog } from '@/shared/contexts/EquipmentCatalogContext'
import {
  applyOwnedItemQuality,
  catalogDisplayLine,
  formatCerosDisplay,
  newCatalogInstanceId,
} from '@/lib/equipmentCost'
import WizardStage, { TickStat } from '@/components/beyond/WizardStage'
import StampButton from '@/components/beyond/StampButton'

export function EquipmentStep({
  itensCatalogo,
  onItensCatalogoChange,
  orcamentoCeros,
  saldoRestanteCeros,
}: {
  itensCatalogo: CatalogOwnedItem[]
  onItensCatalogoChange: (items: CatalogOwnedItem[]) => void
  orcamentoCeros: number
  saldoRestanteCeros: number
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const { weapons, armor, utilities, multiplierTables } = useEquipmentCatalog()

  const catalogById = useMemo(() => {
    const m = new Map<string, CatalogEntry>()
    for (const w of weapons) m.set(w.id, w)
    for (const a of armor) m.set(a.id, a)
    for (const u of utilities) m.set(u.id, u)
    return m
  }, [weapons, armor, utilities])

  const handlePickCatalog = (entry: CatalogEntry, custoCeros: number) => {
    const displayLine = catalogDisplayLine(entry, custoCeros, { qualidadeNivel: 0 })
    onItensCatalogoChange([
      ...itensCatalogo,
      {
        instanceId: newCatalogInstanceId(),
        catalogId: entry.id,
        kind: entry.kind,
        nome: entry.name,
        custoCeros,
        custoBaseCeros: custoCeros,
        qualidadeNivel: 0,
        displayLine,
      },
    ])
  }

  const removeCatalogItem = (instanceId: string) => {
    onItensCatalogoChange(itensCatalogo.filter((i) => i.instanceId !== instanceId))
  }

  const changeItemQuality = (instanceId: string, nextNivel: number) => {
    const current = itensCatalogo.find((i) => i.instanceId === instanceId)
    if (!current || current.kind !== 'weapon') return
    const next = applyOwnedItemQuality(current, nextNivel)
    const delta = next.custoCeros - current.custoCeros
    if (delta > 0 && delta > saldoRestanteCeros) return
    onItensCatalogoChange(
      itensCatalogo.map((i) => (i.instanceId === instanceId ? next : i)),
    )
  }

  return (
    <WizardStage
      title="Equipamentos"
      refId="STEP-07"
      lede="Escolha itens no catálogo; o custo desconta do orçamento. Armas podem subir de qualidade pagando o multiplicador do livro."
      hero="blocks"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3">
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-md">
          <TickStat label="Orçamento" value={formatCerosDisplay(orcamentoCeros)} />
          <TickStat
            label="Saldo"
            value={formatCerosDisplay(Math.max(0, saldoRestanteCeros))}
            hint={saldoRestanteCeros < 0 ? 'Saldo insuficiente' : undefined}
          />
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <StampButton onClick={() => setPickerOpen(true)}>Abrir catálogo</StampButton>
          <Link
            href="/referencia/aquisicao-equipamentos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.1em] text-ecoar-teal hover:text-ecoar-magenta underline-offset-2 hover:underline"
          >
            Referência completa (nova aba)
          </Link>
        </div>
      </div>

      <div className="border border-ecoar-teal/50">
        <div className="px-3 py-2 border-b border-ecoar-teal/35">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal">Itens escolhidos</p>
        </div>

        {itensCatalogo.length === 0 ? (
          <p className="px-3 py-8 text-center text-[10px] uppercase tracking-[0.14em] text-ecoar-dark-500 dark:text-[#adb5bd]">
            Nenhum item · abrir catálogo
          </p>
        ) : (
          <ul className="divide-y divide-ecoar-teal/25">
            {itensCatalogo.map((item) => (
              <li key={item.instanceId} className="p-3 bg-[#0a0a0a]/40">
                <OwnedCatalogItemStats
                  item={item}
                  entry={catalogById.get(item.catalogId)}
                  headerRight={
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase tracking-[0.1em] tabular-nums text-ecoar-magenta">
                        {formatCerosDisplay(item.custoCeros)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCatalogItem(item.instanceId)}
                        className="text-[9px] uppercase tracking-[0.12em] text-ecoar-magenta hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  }
                  footer={
                    item.kind === 'weapon' ? (
                      <OwnedWeaponQualityControls
                        item={item}
                        saldoDisponivel={saldoRestanteCeros}
                        onChangeQuality={(next) => changeItemQuality(item.instanceId, next)}
                      />
                    ) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 p-2 sm:p-4 md:p-6">
          <div className="mx-auto w-full max-w-4xl flex flex-col min-h-0 flex-1 border border-ecoar-teal/50 bg-[#0a0a0a]/95 overflow-hidden">
            <div className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-ecoar-teal/40">
              <span className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
                Catálogo de aquisição
              </span>
              <StampButton tone="ghost" onClick={() => setPickerOpen(false)}>
                Fechar
              </StampButton>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-4">
              <EquipmentCatalogBrowser
                mode="picker"
                urlSync={false}
                saldoDisponivel={saldoRestanteCeros}
                onPickItem={handlePickCatalog}
                showCostMultiplierTables={false}
                weaponCatalog={weapons}
                armorCatalog={armor}
                utilityCatalog={utilities}
                costMultiplierTables={multiplierTables}
              />
            </div>
          </div>
        </div>
      ) : null}
    </WizardStage>
  )
}
