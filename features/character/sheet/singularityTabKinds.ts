import type { SystemSingularityKind } from '@/lib/systemSingularities'
import type { SingularitySheetKindGroup } from '@/features/character/sheet/sheetLayoutTypes'

export type { SingularitySheetKindGroup }

export type MartialSheetScope = 'escola' | 'maestria'

export type SheetSingularityGroupConfig = {
  kinds: SystemSingularityKind[]
  martialScope?: MartialSheetScope
}

export const SING_GROUP_TO_KINDS: Record<SingularitySheetKindGroup, SheetSingularityGroupConfig> = {
  ecoar: { kinds: ['ecoar'] },
  naturais: { kinds: ['criacao', 'racial', 'marcial'], martialScope: 'maestria' },
  magicas: { kinds: ['marcial'], martialScope: 'escola' },
  absolutas: { kinds: ['path'] },
}
