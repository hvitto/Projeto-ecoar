'use client'

import { getDisadvantageById, getDisadvantagesByCategory } from '@/data/disadvantages'
import { anySelectedSingularityForbidsDisadvantage } from '@/lib/creationSingularityDisadvantageConflict'
import WizardStage, { TickStat } from '@/components/beyond/WizardStage'
import DisadvantageCard from '@/shared/components/ui/DisadvantageCard'

export function CreationPointsStep({
  pontosCriacao,
  onPointsChange,
  singularidades,
  selectedDisadvantages,
  onDisadvantagesChange,
}: {
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onPointsChange: (points: { obtidos: number; gastos: number; disponiveis: number }) => void
  singularidades: string[]
  selectedDisadvantages?: string[]
  onDisadvantagesChange?: (disadvantages: string[]) => void
}) {
  void onPointsChange

  const basePoints =
    pontosCriacao.obtidos -
    (selectedDisadvantages?.reduce((total, id) => {
      const disadvantage = getDisadvantageById(id)
      return total + (disadvantage?.pontosCriacao || 0)
    }, 0) || 0)

  void basePoints

  const totalDisadvantagesPoints =
    selectedDisadvantages?.reduce((total, id) => {
      const disadvantage = getDisadvantageById(id)
      return total + (disadvantage?.pontosCriacao || 0)
    }, 0) || 0

  return (
    <WizardStage
      title="Pontos de Criação"
      refId="STEP-05"
      lede="Gerencie PC obtidos, gastos e saldo. Desvantagens opcionais concedem até +30 PC extras."
      hero="circuit"
    >
      <div className="mb-3 border border-ecoar-teal/40 px-3 py-3">
        <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-2">Próximas etapas</p>
        <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-3">
          Os Pontos de Criação poderão ser gastos da seguinte forma:
        </p>
        <ul className="space-y-2 text-[10px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd]">
          <li>
            <span className="text-ecoar-teal uppercase tracking-[0.08em]">Singularidades Marciais — </span>
            vantagens vinculadas às aptidões mágicas e maestrias de combate.
          </li>
          <li>
            <span className="text-ecoar-teal uppercase tracking-[0.08em]">Singularidades de Criação — </span>
            bônus diversos;{' '}
            <span className="text-ecoar-magenta">
              só podem ser adquiridas nesta etapa de criação.
            </span>
          </li>
          <li>
            <span className="text-ecoar-teal uppercase tracking-[0.08em]">Ecoar — </span>
            vantagens que permitem retornar à vida após a morte.
          </li>
          <li>
            <span className="text-ecoar-teal uppercase tracking-[0.08em]">Talentos Raciais — </span>
            vantagens ligadas à identidade da raça.
          </li>
          <li>
            <span className="text-ecoar-teal uppercase tracking-[0.08em]">Evoluindo Traços — </span>
            aumentar atributos (10 PC/pt), habilidades e aptidões (20 PC/pt) abaixo de 3.
          </li>
          <li className="pt-2 border-t border-ecoar-teal/25">
            <span className="text-ecoar-magenta uppercase tracking-[0.08em]">Equipamentos — </span>
            cada PC não utilizado vira 100 moedas para compra de equipamentos.
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <TickStat
          label="Obtidos"
          value={pontosCriacao.obtidos}
          hint={`Base: 30 · Desvantagens: +${totalDisadvantagesPoints} (máx +30)`}
        />
        <TickStat label="Gastos" value={pontosCriacao.gastos} hint="Calculado automaticamente" />
        <TickStat
          label="Disponíveis"
          value={pontosCriacao.disponiveis}
          hint={
            pontosCriacao.disponiveis < 0
              ? 'Você gastou mais pontos do que obteve'
              : 'Disponíveis para uso'
          }
        />
      </div>

      {onDisadvantagesChange ? (
        <div className="space-y-5">
          <div className="border-b border-ecoar-teal/35 pb-2">
            <h4 className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
              Desvantagens
            </h4>
            <p className="mt-1 text-[10px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd]">
              Opcional. Cada desvantagem concede Pontos de Criação extras.
            </p>
          </div>

          {(['atributos', 'habilidades', 'genetica'] as const).map((category) => {
            const categoryDisadvantages = getDisadvantagesByCategory(category)
            if (categoryDisadvantages.length === 0) return null

            const categoryLabels: Record<typeof category, string> = {
              atributos: 'Atributos',
              habilidades: 'Habilidades',
              genetica: 'Genética',
            }

            return (
              <div key={category} className="space-y-2">
                <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal border-b border-ecoar-teal/25 pb-1">
                  {categoryLabels[category]}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryDisadvantages.map((disadvantage) => {
                    const isSelected = selectedDisadvantages?.includes(disadvantage.id) || false
                    const blockedBySingularity =
                      !isSelected &&
                      anySelectedSingularityForbidsDisadvantage(singularidades, disadvantage.id)

                    return (
                      <DisadvantageCard
                        key={disadvantage.id}
                        name={disadvantage.name}
                        description={disadvantage.description}
                        pontosCriacao={disadvantage.pontosCriacao}
                        isSelected={isSelected}
                        disabled={blockedBySingularity}
                        onClick={() => {
                          if (!onDisadvantagesChange) return
                          if (
                            !isSelected &&
                            anySelectedSingularityForbidsDisadvantage(singularidades, disadvantage.id)
                          ) {
                            return
                          }
                          const newDisadvantages = isSelected
                            ? selectedDisadvantages?.filter((id) => id !== disadvantage.id) || []
                            : [...(selectedDisadvantages || []), disadvantage.id]
                          onDisadvantagesChange(newDisadvantages)
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </WizardStage>
  )
}
