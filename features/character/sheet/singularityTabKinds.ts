import type { SystemSingularityKind } from '@/lib/systemSingularities'

export type MartialSheetScope = 'escola' | 'maestria'

export type SheetSingularityTabConfig = {
  kinds: SystemSingularityKind[]
  martialScope?: MartialSheetScope
}

export const SHEET_TAB_TO_KINDS: Record<
  'sing-ecoar' | 'sing-naturais' | 'sing-magicas' | 'sing-absolutas',
  SheetSingularityTabConfig
> = {
  'sing-ecoar': { kinds: ['ecoar'] },
  'sing-naturais': { kinds: ['criacao', 'racial', 'marcial'], martialScope: 'maestria' },
  'sing-magicas': { kinds: ['marcial'], martialScope: 'escola' },
  'sing-absolutas': { kinds: ['path'] },
}
