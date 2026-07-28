import type { SystemSingularityKind } from '@/lib/systemSingularities'
import type { SingularitySheetKindGroup } from '@/features/character/sheet/sheetLayoutTypes'

export type { SingularitySheetKindGroup }

export const SING_GROUP_TO_KINDS: Record<SingularitySheetKindGroup, SystemSingularityKind[]> = {
  ecoar: ['ecoar'],
  naturais: ['criacao', 'racial'],
  magicas: ['marcial'],
  absolutas: ['path'],
}
