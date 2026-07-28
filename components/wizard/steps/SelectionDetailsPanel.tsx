'use client'

import Image from 'next/image'
import type { RaceImageConfig } from '@/data/races'
import { RaceComparisonSection } from '@/components/wizard/steps/RaceComparisonSection'
import StampButton from '@/components/beyond/StampButton'
import CoordLabel from '@/components/beyond/CoordLabel'
import { TickStat } from '@/components/beyond/WizardStage'

export function SelectionDetailsPanel({
  type,
  selectedId,
  getItemById,
  onBack,
  onSelect,
  headerActions,
}: {
  type: 'race' | 'path' | 'location' | 'martialSchool'
  selectedId: string
  getItemById: (id: string) => any
  onBack?: () => void
  onSelect?: (id: string) => void
  headerActions?: React.ReactNode
}) {
  const item = getItemById(selectedId)
  if (!item) return null

  const raceImageConfig: RaceImageConfig | undefined =
    type === 'race' ? (item.image as RaceImageConfig | undefined) : undefined
  const showRaceImage = Boolean(raceImageConfig?.src)

  const typeLabel =
    type === 'race'
      ? 'Raça'
      : type === 'path'
        ? 'Trilha'
        : type === 'location'
          ? 'Localização'
          : 'Escola Marcial'

  const attributeNames: Record<string, string> = {
    carisma: 'Carisma',
    finesse: 'Finesse',
    forca: 'Força',
    inteligencia: 'Inteligência',
    percepcao: 'Percepção',
    vitalidade: 'Vitalidade',
    vontade: 'Vontade',
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-ecoar-teal/50 dark:border-ecoar-teal px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? (
            <StampButton tone="ghost" onClick={onBack} className="shrink-0">
              Seleção
            </StampButton>
          ) : null}
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.16em] text-ecoar-teal">{typeLabel}</p>
            <h2 className="font-display text-xl sm:text-2xl uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 truncate">
              {item.name}
            </h2>
          </div>
        </div>
        {headerActions ? <div className="flex flex-wrap gap-2 shrink-0">{headerActions}</div> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-0 border border-ecoar-teal/50 dark:border-ecoar-teal">
        <div className="relative min-h-[280px] lg:min-h-[420px] bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-ecoar-teal/50 dark:border-ecoar-teal overflow-hidden">
          {showRaceImage && raceImageConfig?.src ? (
            <>
              <Image
                src={raceImageConfig.src}
                alt={raceImageConfig.alt ?? item.name}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-top contrast-[1.1] saturate-[0.75] grayscale-[0.25]"
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_55%,rgba(10,10,10,0.55)_100%),radial-gradient(circle_at_40%_20%,transparent_30%,rgba(10,10,10,0.5)_100%)] pointer-events-none" />
              <span className="absolute left-2 bottom-2 text-[9px] uppercase tracking-[0.12em] text-ecoar-light-900 bg-black/50 px-1.5 py-1">
                PLATE · {item.name} · PROCESSED
              </span>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ecoar-teal">NO IMAGE PLATE</p>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 space-y-4 bg-[#0a0a0a]/35">
          <div>
            <CoordLabel refId={`DET-${type.toUpperCase()}`} className="mb-2" />
            <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] max-w-[52ch]">
              {item.description}
            </p>
          </div>

          {item.bonuses ? (
            <div className="space-y-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-ecoar-teal">Bônus · Efeitos</p>

              {item.bonuses.attributes && Object.keys(item.bonuses.attributes).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(item.bonuses.attributes).map(([attr, value]) => (
                    <TickStat
                      key={attr}
                      label={attributeNames[attr] || attr}
                      value={`+${value as number}`}
                    />
                  ))}
                </div>
              ) : null}

              {item.bonuses.skills && Object.keys(item.bonuses.skills).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(item.bonuses.skills).map(([skill, value]) => (
                    <TickStat key={skill} label={skill} value={`+${value as number}`} />
                  ))}
                </div>
              ) : null}

              {(item.bonuses.corpo || item.bonuses.mente || item.bonuses.folego || item.bonuses.mana) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.bonuses.corpo ? (
                    <TickStat
                      label="Corpo"
                      value={`+${item.bonuses.corpo}`}
                      hint="Limite de dano físico antes da incapacitação."
                    />
                  ) : null}
                  {item.bonuses.mente ? (
                    <TickStat
                      label="Mente"
                      value={`+${item.bonuses.mente}`}
                      hint="Limite de estresse mental e fadiga."
                    />
                  ) : null}
                  {item.bonuses.folego ? (
                    <TickStat label="Fôlego" value={`+${item.bonuses.folego}`} />
                  ) : null}
                  {item.bonuses.mana ? (
                    <TickStat label="Mana" value={`+${item.bonuses.mana}`} />
                  ) : null}
                </div>
              )}

              {item.bonuses.movement ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {item.bonuses.movement.terrestre ? (
                    <TickStat label="Terrestre" value={`${item.bonuses.movement.terrestre}m`} />
                  ) : null}
                  {item.bonuses.movement.aquatico ? (
                    <TickStat label="Aquático" value={`${item.bonuses.movement.aquatico}m`} />
                  ) : null}
                  {item.bonuses.movement.aereo ? (
                    <TickStat label="Aéreo" value={`${item.bonuses.movement.aereo}m`} />
                  ) : null}
                </div>
              ) : null}

              {item.bonuses.senses ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {item.bonuses.senses.visao !== undefined ? (
                    <TickStat label="Visão" value={`${item.bonuses.senses.visao}m`} />
                  ) : null}
                  {item.bonuses.senses.audicao !== undefined ? (
                    <TickStat label="Audição" value={`${item.bonuses.senses.audicao}m`} />
                  ) : null}
                  {item.bonuses.senses.olfato !== undefined ? (
                    <TickStat label="Olfato" value={`${item.bonuses.senses.olfato}m`} />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-[10px] uppercase tracking-[0.14em] text-ecoar-teal">Sem bônus especiais</p>
          )}
        </div>
      </div>

      {type === 'race' && onSelect ? (
        <RaceComparisonSection selectedRaca={selectedId} onSelect={onSelect} />
      ) : null}
    </div>
  )
}
