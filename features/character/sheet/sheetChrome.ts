export const sheetGround = 'bg-[#1a1d21]'
export const sheetGroundDeep = 'bg-[#0a0a0a]'
export const sheetInk = 'text-[#f5f5f5]'
export const sheetInkDim = 'text-[#adb5bd]'

export const sheetPanel =
  'rounded-none border border-ecoar-teal/45 bg-[#1a1d21]/95'

export const sheetPanelSecondary =
  'rounded-none border border-ecoar-teal/30 bg-[#1a1d21]/80'

export const sheetField =
  'h-8 w-full rounded-none border border-ecoar-teal/40 bg-[#0a0a0a] px-2 font-mono text-sm text-[#f5f5f5] outline-none transition-colors focus:border-ecoar-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal disabled:opacity-55 placeholder:text-[#adb5bd]/55'

export const sheetFieldCompact =
  'h-7 w-full rounded-none border border-ecoar-teal/40 bg-[#0a0a0a] px-1.5 text-center font-mono text-xs font-semibold text-[#f5f5f5] outline-none focus:border-ecoar-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal disabled:opacity-55'

export const sheetLimitInput =
  'h-7 w-11 shrink-0 rounded-none border border-ecoar-teal/40 bg-[#0a0a0a] px-1 text-center font-mono text-xs font-semibold tabular-nums text-[#f5f5f5] outline-none focus:border-ecoar-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal disabled:opacity-55 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'

export const sheetLabel =
  'mb-1 block font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-[#adb5bd]'

export const sheetStatCell =
  'min-w-0 rounded-none border border-ecoar-teal/30 bg-[#0a0a0a]/60'

export const sheetStatCellInteractive =
  `${sheetStatCell} transition-colors hover:border-ecoar-teal/50 hover:bg-ecoar-teal/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal`

export const sheetWidgetHeader =
  'flex h-8 shrink-0 items-center justify-between gap-1 border-b border-ecoar-teal/35 px-2'

export const sheetWidgetTitle =
  'truncate font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-ecoar-teal'

export const sheetMeta =
  'font-mono text-[10px] uppercase tracking-[0.12em] text-[#adb5bd]'

export const sheetHint =
  'font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-ecoar-teal sm:text-[11px]'

export const sheetFooterHelp =
  'font-mono text-[11px] font-normal uppercase tracking-[0.08em] leading-snug text-[#adb5bd] sm:text-xs'

export const sheetData =
  'font-mono text-xs leading-snug tabular-nums text-[#f5f5f5]'

export const sheetCoord =
  'font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-ecoar-teal'

export const sheetFocusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal'

export const sheetFocusRingInset =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ecoar-teal'

export const sheetBtn =
  `inline-flex min-h-9 items-center justify-center gap-1.5 rounded-none border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors disabled:pointer-events-none disabled:opacity-55 ${sheetFocusRing} [@media(pointer:coarse)]:min-h-11`

export const sheetBtnCompact =
  '!min-h-7 !h-7 gap-1 px-1.5 text-[9px] tracking-[0.1em] sm:!min-h-8 sm:!h-8 sm:px-2 sm:text-[10px] [@media(pointer:coarse)]:!min-h-9 [@media(pointer:coarse)]:!h-9'

export const sheetBtnTeal =
  `${sheetBtn} border-ecoar-teal/50 bg-ecoar-teal/10 text-ecoar-teal hover:bg-ecoar-teal/20`

export const sheetBtnTealStrong =
  `${sheetBtn} border-ecoar-teal bg-ecoar-teal text-[#1a1d21] hover:bg-[#8fc4c7] hover:border-[#8fc4c7]`

export const sheetBtnGhost =
  `${sheetBtn} border-ecoar-teal/40 bg-transparent text-[#adb5bd] hover:bg-ecoar-teal/10 hover:text-[#f5f5f5]`

export const sheetAttackRoll =
  `inline-flex min-h-11 items-center justify-center border border-ecoar-magenta bg-ecoar-magenta px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--ecoar-accent-ink)] hover:brightness-110 ${sheetFocusRing}`

export const sheetAttackRollQuiet =
  `inline-flex min-h-11 items-center justify-center border border-ecoar-teal/50 bg-ecoar-teal/10 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ecoar-teal hover:bg-ecoar-teal/20 ${sheetFocusRing}`

export const sheetAttackRollBlock =
  `min-h-11 w-full rounded-none border border-ecoar-magenta bg-ecoar-magenta px-3 py-2.5 text-left font-mono text-sm font-semibold tracking-[0.02em] text-[var(--ecoar-accent-ink)] transition-[filter] hover:brightness-110 ${sheetFocusRing}`

export const sheetAttackRollBlockQuiet =
  `min-h-11 w-full rounded-none border border-ecoar-teal/45 bg-ecoar-teal/10 px-3 py-2.5 text-left font-mono text-sm font-semibold text-ecoar-teal transition-colors hover:border-ecoar-teal/70 hover:bg-ecoar-teal/20 ${sheetFocusRing}`

export const sheetSkillRoll =
  `inline-flex min-h-7 min-w-[2.75rem] items-center justify-center border border-ecoar-teal/45 bg-ecoar-teal/10 px-1.5 font-mono text-[11px] font-semibold tabular-nums text-ecoar-teal transition-colors hover:border-ecoar-teal/70 hover:bg-ecoar-teal/20 ${sheetFocusRing} [@media(pointer:coarse)]:min-h-9`

export const sheetEditChip =
  `inline-flex h-7 shrink-0 items-center gap-1 rounded-none border border-ecoar-teal/50 bg-ecoar-teal/10 px-1.5 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-ecoar-teal sm:h-8 sm:px-2 sm:text-[10px] [@media(pointer:coarse)]:h-8`

export const sheetModeChipMesa =
  `inline-flex h-7 shrink-0 items-center gap-1 rounded-none border border-ecoar-teal/35 bg-transparent px-1.5 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-[#adb5bd] sm:h-8 sm:px-2 sm:text-[10px] [@media(pointer:coarse)]:h-8`

export const sheetStripMicro =
  'font-mono text-[8px] uppercase tracking-[0.1em] text-ecoar-teal sm:text-[9px] sm:tracking-[0.12em]'

export const sheetTextLink =
  `font-mono text-[11px] uppercase tracking-[0.08em] text-[#adb5bd] hover:text-ecoar-teal ${sheetFocusRing}`

export const sheetChip =
  `rounded-none border px-2 py-1.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] transition-colors ${sheetFocusRing}`

export const sheetChipActive =
  `${sheetChip} border-ecoar-teal/50 bg-ecoar-teal/15 text-ecoar-teal`

export const sheetChipIdle =
  `${sheetChip} border-ecoar-teal/30 bg-transparent text-[#adb5bd] hover:border-ecoar-teal/50 hover:text-[#f5f5f5]`

export const sheetTableHead =
  'bg-[#0a0a0a]/80 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-ecoar-teal'

export const sheetTableRow =
  'border-b border-ecoar-teal/20 last:border-b-0'

export const sheetFolder =
  'relative overflow-hidden rounded-none border border-ecoar-teal/50 bg-[#1a1d21]'

export const sheetGridTexture =
  'pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#7bb7bb_1px,transparent_1px),linear-gradient(90deg,#7bb7bb_1px,transparent_1px)] [background-size:24px_24px]'
