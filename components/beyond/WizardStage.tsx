import type { ReactNode } from 'react'
import RangeFrame from './RangeFrame'
import CoordLabel from './CoordLabel'
import HeroFrame, { type HeroVariant } from '@/components/branding/HeroFrame'

type WizardStageProps = {
  title: string
  refId: string
  lede?: string
  children: ReactNode
  hero?: HeroVariant | false
  actions?: ReactNode
  className?: string
}

export default function WizardStage({
  title,
  refId,
  lede,
  children,
  hero = 'glitch',
  actions,
  className = '',
}: WizardStageProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(220px,0.42fr)] gap-0 border border-ecoar-teal/50 dark:border-ecoar-teal">
        <div className="p-4 sm:p-5 border-b xl:border-b-0 xl:border-r border-ecoar-teal/50 dark:border-ecoar-teal flex flex-col min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ecoar-teal mb-2">CREATE · {refId}</p>
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] uppercase leading-[0.88] tracking-[-0.03em] text-ecoar-dark-900 dark:text-ecoar-light-900 mb-2">
            {title}
          </h2>
          {lede ? (
            <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] max-w-[48ch] mb-3">
              {lede}
            </p>
          ) : null}
          <CoordLabel refId={refId} className="mt-auto" />
        </div>
        {hero !== false ? (
          <div className="p-2 sm:p-3 bg-[#0a0a0a]/40">
            <HeroFrame variant={hero} aspect="16/11" label={`ANCHOR · ${refId}`} />
          </div>
        ) : null}
      </div>

      <RangeFrame title={title} refId={refId} bodyClassName="p-3 sm:p-4">
        <div className="pr-1">{children}</div>
        {actions ? <div className="mt-4 pt-3 border-t border-ecoar-teal/35">{actions}</div> : null}
      </RangeFrame>
    </div>
  )
}

type PointBannerProps = {
  label: string
  value: number | string
  danger?: boolean
  action?: ReactNode
}

export function PointBanner({ label, value, danger, action }: PointBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 border border-ecoar-teal/45 dark:border-ecoar-teal/55 px-3 py-2.5 mb-3">
      <div>
        <div className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal">{label}</div>
        <div
          className={`font-display text-3xl leading-none tabular-nums ${
            danger ? 'text-ecoar-magenta' : 'text-ecoar-dark-900 dark:text-ecoar-light-900'
          }`}
        >
          {value}
        </div>
      </div>
      {action}
    </div>
  )
}

type LevelStepperProps = {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  canDecrease?: boolean
  canIncrease?: boolean
  suffix?: string
}

export function LevelStepper({
  value,
  onDecrease,
  onIncrease,
  canDecrease = true,
  canIncrease = true,
  suffix,
}: LevelStepperProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        className="w-8 h-8 border border-ecoar-teal/50 text-ecoar-dark-900 dark:text-ecoar-light-900 disabled:opacity-30 hover:enabled:border-ecoar-magenta hover:enabled:text-ecoar-magenta"
        aria-label="Diminuir"
      >
        −
      </button>
      <div className="min-w-[2.5rem] text-center">
        <span className="font-display text-xl tabular-nums text-ecoar-dark-900 dark:text-ecoar-light-900">
          {value}
        </span>
        {suffix ? (
          <span className="block text-[9px] uppercase tracking-[0.1em] text-ecoar-teal">{suffix}</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        className="w-8 h-8 border border-ecoar-teal/50 text-ecoar-dark-900 dark:text-ecoar-light-900 disabled:opacity-30 hover:enabled:border-ecoar-teal"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  )
}

type TickStatProps = {
  label: string
  value: string | number
  hint?: string
}

export function TickStat({ label, value, hint }: TickStatProps) {
  return (
    <div className="border border-ecoar-teal/40 dark:border-ecoar-teal/50 p-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal">{label}</span>
        <span className="font-display text-lg leading-none text-ecoar-magenta tabular-nums">{value}</span>
      </div>
      {hint ? (
        <p className="mt-1.5 text-[10px] leading-snug text-ecoar-dark-500 dark:text-[#adb5bd]">{hint}</p>
      ) : null}
    </div>
  )
}
