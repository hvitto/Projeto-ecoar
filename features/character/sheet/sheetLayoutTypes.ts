export type SheetTabId =
  | 'basico'
  | 'equipamentos'
  | 'sing-ecoar'
  | 'sing-naturais'
  | 'sing-magicas'
  | 'sing-absolutas'

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
  version: 1
  folderSize: FolderSize
  tabOrder: SheetTabId[]
  hiddenTabs: SheetTabId[]
  activeTab: SheetTabId
  widgets: Record<SheetTabId, SheetTabWidgetsState>
}

export const ALL_SHEET_TABS: SheetTabId[] = [
  'basico',
  'equipamentos',
  'sing-ecoar',
  'sing-naturais',
  'sing-magicas',
  'sing-absolutas',
]

export const SHEET_TAB_LABELS: Record<SheetTabId, string> = {
  basico: 'Básico',
  equipamentos: 'Equipamentos',
  'sing-ecoar': 'Sing. do Ecoar',
  'sing-naturais': 'Sing. Naturais',
  'sing-magicas': 'Sing. Mágicas',
  'sing-absolutas': 'Sing. Absolutas',
}

export const FOLDER_SIZE_MAX_WIDTH: Record<FolderSize, number> = {
  S: 960,
  M: 1200,
  L: 1440,
}

export const BASICO_WIDGETS: SheetWidgetId[] = [
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

export const EQUIPAMENTOS_WIDGETS: SheetWidgetId[] = [
  'inventory',
  'combatWeapons',
]

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

export function cycleWidgetSpan(current: WidgetSpan): WidgetSpan {
  if (current === 'S') return 'M'
  if (current === 'M') return 'L'
  return 'S'
}

function defaultSizesForOrder(order: SheetWidgetId[]): Partial<Record<SheetWidgetId, WidgetSpan>> {
  const sizes: Partial<Record<SheetWidgetId, WidgetSpan>> = {}
  for (const id of order) sizes[id] = defaultWidgetSpan(id)
  return sizes
}

function widgetsForTab(tab: SheetTabId): SheetTabWidgetsState {
  if (tab === 'basico') {
    const order = [...BASICO_WIDGETS]
    return { order, hidden: [], sizes: defaultSizesForOrder(order) }
  }
  if (tab === 'equipamentos') {
    const order = [...EQUIPAMENTOS_WIDGETS]
    return { order, hidden: [], sizes: defaultSizesForOrder(order) }
  }
  if (tab === 'sing-ecoar') {
    const order = [...SING_WIDGETS]
    return { order, hidden: [], sizes: defaultSizesForOrder(order) }
  }
  const order = SING_WIDGETS.filter((id) => id !== 'disturbios')
  return { order, hidden: [], sizes: defaultSizesForOrder(order) }
}

export function createDefaultSheetLayout(): SheetLayout {
  return {
    version: 1,
    folderSize: 'M',
    tabOrder: [...ALL_SHEET_TABS],
    hiddenTabs: [],
    activeTab: 'basico',
    widgets: {
      basico: widgetsForTab('basico'),
      equipamentos: widgetsForTab('equipamentos'),
      'sing-ecoar': widgetsForTab('sing-ecoar'),
      'sing-naturais': widgetsForTab('sing-naturais'),
      'sing-magicas': widgetsForTab('sing-magicas'),
      'sing-absolutas': widgetsForTab('sing-absolutas'),
    },
  }
}

export function normalizeSheetLayout(raw: unknown): SheetLayout {
  const fallback = createDefaultSheetLayout()
  if (!raw || typeof raw !== 'object') return fallback
  const r = raw as Partial<SheetLayout>
  const folderSize = r.folderSize === 'S' || r.folderSize === 'M' || r.folderSize === 'L' ? r.folderSize : 'M'
  const tabOrder = Array.isArray(r.tabOrder)
    ? (r.tabOrder.filter((t): t is SheetTabId => ALL_SHEET_TABS.includes(t as SheetTabId)) as SheetTabId[])
    : fallback.tabOrder
  const fullOrder = [...tabOrder, ...ALL_SHEET_TABS.filter((t) => !tabOrder.includes(t))]
  const hiddenTabs = Array.isArray(r.hiddenTabs)
    ? (r.hiddenTabs.filter((t): t is SheetTabId => ALL_SHEET_TABS.includes(t as SheetTabId)) as SheetTabId[])
    : []
  const visible = fullOrder.filter((t) => !hiddenTabs.includes(t))
  const activeTab =
    r.activeTab && ALL_SHEET_TABS.includes(r.activeTab) && !hiddenTabs.includes(r.activeTab)
      ? r.activeTab
      : visible[0] ?? 'basico'

  const widgets = { ...fallback.widgets }
  for (const tab of ALL_SHEET_TABS) {
    const src = r.widgets?.[tab]
    const def = widgetsForTab(tab)
    if (!src) {
      widgets[tab] = def
      continue
    }
    const allowed = new Set(def.order)
    const order = (Array.isArray(src.order) ? src.order : [])
      .filter((id): id is SheetWidgetId => allowed.has(id as SheetWidgetId))
    const missing = def.order.filter((id) => !order.includes(id))
    const fullOrderWidgets = [...order, ...missing]
    const hidden = (Array.isArray(src.hidden) ? src.hidden : []).filter((id): id is SheetWidgetId =>
      allowed.has(id as SheetWidgetId),
    )
    const sizes: Partial<Record<SheetWidgetId, WidgetSpan>> = { ...def.sizes }
    const rawSizes = src.sizes && typeof src.sizes === 'object' ? src.sizes : {}
    for (const id of fullOrderWidgets) {
      const raw = (rawSizes as Partial<Record<SheetWidgetId, unknown>>)[id]
      if (raw === 'S' || raw === 'M' || raw === 'L') sizes[id] = raw
      else if (!sizes[id]) sizes[id] = defaultWidgetSpan(id)
    }
    widgets[tab] = { order: fullOrderWidgets, hidden, sizes }
  }

  return {
    version: 1,
    folderSize,
    tabOrder: fullOrder,
    hiddenTabs: hiddenTabs.filter((t) => fullOrder.includes(t)),
    activeTab,
    widgets,
  }
}

export function snapFolderSize(widthPx: number): FolderSize {
  const entries: Array<[FolderSize, number]> = [
    ['S', FOLDER_SIZE_MAX_WIDTH.S],
    ['M', FOLDER_SIZE_MAX_WIDTH.M],
    ['L', FOLDER_SIZE_MAX_WIDTH.L],
  ]
  let best: FolderSize = 'M'
  let bestDist = Infinity
  for (const [size, w] of entries) {
    const d = Math.abs(widthPx - w)
    if (d < bestDist) {
      bestDist = d
      best = size
    }
  }
  return best
}

export function visibleTabs(layout: SheetLayout): SheetTabId[] {
  const visible = layout.tabOrder.filter((t) => !layout.hiddenTabs.includes(t))
  return visible.length > 0 ? visible : (['basico'] as SheetTabId[])
}

export function visibleWidgets(layout: SheetLayout, tab: SheetTabId): SheetWidgetId[] {
  const state = layout.widgets[tab] ?? widgetsForTab(tab)
  return state.order.filter((id) => !state.hidden.includes(id))
}
