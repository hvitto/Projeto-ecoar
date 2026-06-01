import { Crown, Zap, Hammer, Brain, Eye, Heart, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const attributeIconsMap: Record<string, LucideIcon> = {
  carisma: Crown,
  finesse: Zap,
  forca: Hammer,
  inteligencia: Brain,
  percepcao: Eye,
  vitalidade: Heart,
  vontade: Shield,
}

export const attributeLabelsShort: Record<string, string> = {
  carisma: 'Car',
  finesse: 'Fin',
  forca: 'For',
  inteligencia: 'Int',
  percepcao: 'Per',
  vitalidade: 'Vit',
  vontade: 'Von',
}
