import type { SystemSingularityKind } from '@/lib/systemSingularities'

export type SingularitySheetKindGroup = 'ecoar' | 'naturais' | 'magicas' | 'absolutas'

export const SHEET_TAB_TO_KINDS: Record<
  'sing-ecoar' | 'sing-naturais' | 'sing-magicas' | 'sing-absolutas',
  SystemSingularityKind[]
> = {
  'sing-ecoar': ['ecoar'],
  'sing-naturais': ['criacao', 'racial'],
  'sing-magicas': ['marcial'],
  'sing-absolutas': ['path'],
}
