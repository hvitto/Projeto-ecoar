export type SheetTabId = 'personagem' | 'equipamentos' | 'singularidades'

export type SingularitySheetKindGroup = 'ecoar' | 'naturais' | 'magicas' | 'absolutas'

export type FolderSize = 'S' | 'M' | 'L'
export type WidgetSpan = 'S' | 'M' | 'L'

export type SheetWidgetId =
  | 'identity'
  | 'attributes'
  | 'skills'
  | 'limits'
  | 'aptitudes'
  | 'commonTests'
  | 'movementSenses'
  | 'combatWeapons'
  | 'resistances'
  | 'inventory'
  | 'notes'
  | 'disturbios'
  | 'singPassivos'
  | 'singCondicionais'
  | 'singComplexos'
  | 'singAtivos'

export type SheetTabWidgetsState = {
  order: SheetWidgetId[]
  hidden: SheetWidgetId[]
  sizes: Partial<Record<SheetWidgetId, WidgetSpan>>
}

export type SheetLayout = {
  version: 2
  folderSize: FolderSize
  tabOrder: SheetTabId[]
  hiddenTabs: SheetTabId[]
  activeTab: SheetTabId
  widgets: Record<SheetTabId, SheetTabWidgetsState>
}

export const ALL_SHEET_TABS: SheetTabId[] = [
  'personagem',
  'equipamentos',
  'singularidades',
]

export const SHEET_TAB_LABELS: Record<SheetTabId, string> = {
  personagem: 'Personagem',
  equipamentos: 'Equipamento',
  singularidades: 'Singularidades',
}

export const ALL_SING_GROUPS: SingularitySheetKindGroup[] = [
  'ecoar',
  'naturais',
  'magicas',
  'absolutas',
]

export const SING_GROUP_LABELS: Record<SingularitySheetKindGroup, string> = {
  ecoar: 'Ecoar',
  naturais: 'Naturais',
  magicas: 'Mágicas',
  absolutas: 'Absolutas',
}

export const FOLDER_SIZE_MAX_WIDTH: Record<FolderSize, number> = {
  S: 960,
  M: 1200,
  L: 1440,
}

export const FIXED_FOLDER_WIDTH = FOLDER_SIZE_MAX_WIDTH.M

export const PERSONAGEM_WIDGETS: SheetWidgetId[] = [
  'identity',
  'attributes',
  'limits',
  'aptitudes',
  'skills',
  'commonTests',
  'movementSenses',
  'resistances',
  'notes',
]

export const PERSONAGEM_MESA_HIDDEN: SheetWidgetId[] = [
  'limits',
  'commonTests',
  'movementSenses',
  'resistances',
  'notes',
]

export const EQUIPAMENTOS_WIDGETS: SheetWidgetId[] = ['combatWeapons', 'inventory']

export const SING_WIDGETS: SheetWidgetId[] = [
  'disturbios',
  'singPassivos',
  'singCondicionais',
  'singComplexos',
  'singAtivos',
]

export const WIDGET_LABELS: Record<SheetWidgetId, string> = {
  identity: 'Identidade',
  attributes: 'Atributos',
  skills: 'Habilidades',
  limits: 'Limites',
  aptitudes: 'Aptidões',
  commonTests: 'Testes comuns',
  movementSenses: 'Deslocamento e sentidos',
  combatWeapons: 'Armas carregadas',
  resistances: 'Resistências',
  inventory: 'Mochila',
  notes: 'Anotações',
  disturbios: 'Distúrbios',
  singPassivos: 'Efeitos passivos',
  singCondicionais: 'Efeitos condicionais',
  singComplexos: 'Efeitos complexos',
  singAtivos: 'Efeitos ativos',
}

export const WIDGET_SPAN_COLS: Record<WidgetSpan, number> = {
  S: 4,
  M: 6,
  L: 12,
}

export function defaultWidgetSpan(widgetId: SheetWidgetId): WidgetSpan {
  switch (widgetId) {
    case 'identity':
    case 'attributes':
    case 'aptitudes':
    case 'skills':
    case 'notes':
    case 'inventory':
    case 'combatWeapons':
    case 'disturbios':
      return 'L'
    case 'singPassivos':
    case 'singCondicionais':
    case 'singComplexos':
    case 'singAtivos':
      return 'S'
    default:
      return 'M'
  }
}

export function resolveWidgetSpan(
  tabState: SheetTabWidgetsState | undefined,
  widgetId: SheetWidgetId,
): WidgetSpan {
  const stored = tabState?.sizes?.[widgetId]
  if (stored === 'S' || stored === 'M' || stored === 'L') return stored
  return defaultWidgetSpan(widgetId)
}

function defaultSizesForOrder(order: SheetWidgetId[]): Partial<Record<SheetWidgetId, WidgetSpan>> {
  const sizes: Partial<Record<SheetWidgetId, WidgetSpan>> = {}
  for (const id of order) sizes[id] = defaultWidgetSpan(id)
  return sizes
}

export function widgetsForSingGroup(group: SingularitySheetKindGroup): SheetTabWidgetsState {
  const order =
    group === 'ecoar' ? [...SING_WIDGETS] : SING_WIDGETS.filter((id) => id !== 'disturbios')
  return { order, hidden: [], sizes: defaultSizesForOrder(order) }
}

function widgetsForTab(tab: SheetTabId): SheetTabWidgetsState {
  if (tab === 'personagem') {
    const order = [...PERSONAGEM_WIDGETS]
    return { order, hidden: [...PERSONAGEM_MESA_HIDDEN], sizes: defaultSizesForOrder(order) }
  }
  if (tab === 'equipamentos') {
    const order = [...EQUIPAMENTOS_WIDGETS]
    return { order, hidden: [], sizes: defaultSizesForOrder(order) }
  }
  return widgetsForSingGroup('ecoar')
}

export function createDefaultSheetLayout(): SheetLayout {
  return {
    version: 2,
    folderSize: 'M',
    tabOrder: [...ALL_SHEET_TABS],
    hiddenTabs: [],
    activeTab: 'personagem',
    widgets: {
      personagem: widgetsForTab('personagem'),
      equipamentos: widgetsForTab('equipamentos'),
      singularidades: widgetsForTab('singularidades'),
    },
  }
}

function mapLegacyActiveTab(raw: unknown): SheetTabId {
  if (raw === 'equipamentos') return 'equipamentos'
  if (
    raw === 'singularidades' ||
    raw === 'sing-ecoar' ||
    raw === 'sing-naturais' ||
    raw === 'sing-magicas' ||
    raw === 'sing-absolutas'
  ) {
    return 'singularidades'
  }
  if (raw === 'personagem' || raw === 'basico') return 'personagem'
  return 'personagem'
}

export function normalizeSheetLayout(raw: unknown): SheetLayout {
  const fallback = createDefaultSheetLayout()
  if (!raw || typeof raw !== 'object') return fallback
  const r = raw as Partial<SheetLayout> & { activeTab?: unknown }
  return {
    ...fallback,
    activeTab: mapLegacyActiveTab(r.activeTab),
  }
}

export function visibleWidgets(layout: SheetLayout, tab: SheetTabId): SheetWidgetId[] {
  const state = layout.widgets[tab] ?? widgetsForTab(tab)
  return state.order.filter((id) => !state.hidden.includes(id))
}

export function visibleSingWidgets(group: SingularitySheetKindGroup): SheetWidgetId[] {
  return widgetsForSingGroup(group).order
}
