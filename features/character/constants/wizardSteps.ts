import {
  Users,
  Zap,
  BookOpen,
  Award,
  Calculator,
  Sparkles,
  Package,
  User,
  type LucideIcon,
} from 'lucide-react'

export const WIZARD_STEP_TITLES = [
  'Raça',
  'Atributos',
  'Habilidades',
  'Aptidões',
  'Obtendo PC',
  'Gastando PC',
  'Equipamentos',
  'Finalização',
] as const

export const WIZARD_STEP_ICONS: LucideIcon[] = [
  Users,
  Zap,
  BookOpen,
  Award,
  Calculator,
  Sparkles,
  Package,
  User,
]

/** Steps 0–4 básicos, 5 Gastando PC, 6 Equipamentos, 7 Finalização */
export const WIZARD_TOTAL_STEPS = WIZARD_STEP_TITLES.length - 1

export const WIZARD_PC_STEP_INDEX = 5
