'use client'

import Image from 'next/image'
import type { Race, RaceImageConfig } from '@/data/races'
import { RaceComparisonSection } from '@/components/wizard/steps/RaceComparisonSection'
import StampButton from '@/components/beyond/StampButton'
import { TickStat } from '@/components/beyond/WizardStage'
import { formatRaceBonusLines } from '@/lib/formatRaceBonuses'
import { microLabel, mutedBody, statusLabel } from '@/shared/styles/ecoarChrome'

export function SelectionDetailsPanel({
  type,
  selectedId,
  previewId,
  getItemById,
  availableRaces,
  onBack,
  onPreview,
  onCommitPreview,
  onDismissPreview,
}: {
  type: 'race' | 'path' | 'location' | 'martialSchool'
  selectedId: string
  previewId?: string | null
  getItemById: (id: string) => any
  availableRaces?: Race[]
  onBack?: () => void
  onPreview?: (id: string) => void
  onCommitPreview?: () => void
  onDismissPreview?: () => void
}) {
  const isRace = type === 'race'
  const isPreviewing =
    isRace && Boolean(previewId) && previewId !== selectedId
  const displayId = isPreviewing && previewId ? previewId : selectedId
  const item = getItemById(displayId)
  const committed = getItemById(selectedId)
  if (!item) return null

  const raceImageConfig: RaceImageConfig | undefined = isRace
    ? (item.image as RaceImageConfig | undefined)
    : undefined
  const showRaceImage = Boolean(raceImageConfig?.src)
  const bonusLines = isRace ? formatRaceBonusLines(item) : []

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border border-ecoar-teal/50 dark:border-ecoar-teal px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? (
            <StampButton
              tone="ghost"
              onClick={onBack}
              className="shrink-0 min-h-12 sm:min-h-11"
            >
              Ver grade
            </StampButton>
          ) : null}
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 truncate">
              {item.name}
            </h2>
            {isPreviewing ? (
              <p className={`${microLabel} font-normal mt-0.5 text-ecoar-magenta`}>
                Espiar · seleção: {committed?.name ?? '—'}
              </p>
            ) : (
              <p className={`${microLabel} font-normal mt-0.5`}>Selecionada</p>
            )}
          </div>
        </div>
      </div>

      {isPreviewing ? (
        <div className="border border-ecoar-magenta/60 bg-ecoar-magenta/10 px-3 py-3 space-y-3">
          <div role="status" className="space-y-2">
            <p className={statusLabel}>Espiar · {item.name}</p>
            <p className={`${mutedBody} max-w-[52ch]`}>
              Você está só olhando. Sua raça continua{' '}
              {committed?.name ?? 'a atual'}. Troca só com Usar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <StampButton
              tone="ghost"
              onClick={onDismissPreview}
              className="w-full sm:w-auto font-normal min-h-12 sm:min-h-11"
            >
              Manter {committed?.name ?? 'seleção'}
            </StampButton>
            <StampButton
              onClick={onCommitPreview}
              className="w-full sm:w-auto font-normal min-h-12 sm:min-h-11 sm:min-w-[9rem]"
            >
              Usar {item.name}
            </StampButton>
          </div>
        </div>
      ) : null}

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
              <span
                aria-hidden="true"
                className="absolute left-2 bottom-2 text-xs uppercase tracking-[0.12em] text-ecoar-light-900 bg-black/50 px-1.5 py-1 font-normal"
              >
                PLATE · {item.name} · PROCESSED
              </span>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className={`${microLabel} font-normal`}>Sem imagem</p>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 space-y-4 bg-[#0a0a0a]/35">
          <p className={`${mutedBody} max-w-[52ch]`}>{item.description}</p>

          {isRace ? (
            bonusLines.length > 0 ? (
              <div className="space-y-3">
                <p className={statusLabel}>Bônus · Efeitos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bonusLines.map((line) => (
                    <TickStat
                      key={line.key}
                      label={line.label}
                      value={line.value}
                      hint={line.hint}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className={`${microLabel} font-normal`}>Sem bônus especiais</p>
            )
          ) : null}
        </div>
      </div>

      {isRace && onPreview && availableRaces ? (
        <RaceComparisonSection
          selectedRaca={selectedId}
          previewRaca={previewId}
          availableRaces={availableRaces}
          onPreview={onPreview}
        />
      ) : null}
    </div>
  )
}
