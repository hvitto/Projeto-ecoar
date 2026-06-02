/**
 * Remove o bloco de imports duplicado colado pelo extract-wizard-steps.mjs legado.
 * Mantém 'use client' + imports mínimos por arquivo (mapa manual).
 *
 * Uso: node scripts/prune-wizard-step-imports.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stepsDir = path.join(root, 'components/wizard/steps')

const headers = {
  RaceSelectionStep: `'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Circle } from 'lucide-react'
import type { Race } from '@/data/races'
import RaceCard from '@/shared/components/ui/RaceCard'
`,
  MartialSchoolSelectionStep: `'use client'

import { motion } from 'framer-motion'
import { Sword } from 'lucide-react'
import { martialSchools } from '@/data/martialSchools'
import MartialSchoolCard from '@/shared/components/ui/MartialSchoolCard'
`,
  AttributesStep: `'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Dices } from 'lucide-react'
import { Button } from '@/shared/components/ui'
import { getAttributeModifier, formatModifier } from '@/lib/calculations'
import { CHARACTER_ATTRIBUTE_KEYS } from '@/lib/characterBonuses'
`,
  SkillsStep: `'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Dices } from 'lucide-react'
import { skills as skillsData, getSkillsByCategory, getSkillById, type Skill } from '@/data/skills'
import { Button } from '@/shared/components/ui'
`,
  AptitudesStep: `'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { aptitudes as aptitudesData, getAptitudeById } from '@/data/aptitudes'
import { Button } from '@/shared/components/ui'
`,
  CreationPointsStep: `'use client'

import { motion } from 'framer-motion'
import { Calculator, Skull } from 'lucide-react'
import { disadvantages, getDisadvantageById, getDisadvantagesByCategory } from '@/data/disadvantages'
import DisadvantageCard from '@/shared/components/ui/DisadvantageCard'
`,
  EquipmentStep: `'use client'

import { Package } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { CatalogOwnedItem } from '@/shared/types/equipment'
import { useEquipmentCatalog } from '@/shared/contexts/EquipmentCatalogContext'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import StepSkeleton from '@/components/wizard/StepSkeleton'

const EquipmentCatalogBrowser = dynamic(
  () => import('@/components/equipment/EquipmentCatalogBrowser'),
  { loading: () => <StepSkeleton />, ssr: false },
)
`,
  BackgroundStep: `'use client'

import { User } from 'lucide-react'
import { Input, Textarea } from '@/shared/components/ui'
`,
  SoulLevelSelectionStep: `'use client'

import { soulLevels } from '@/data/soulLevels'
import SelectionCard from '@/shared/components/ui/SelectionCard'
`,
  SelectionDetailsPanel: `'use client'

import type { Race } from '@/data/races'
import RaceImage from '@/shared/components/ui/RaceImage'
`,
  PCSpendingStep: `'use client'

import dynamic from 'next/dynamic'
import StepSkeleton from '@/components/wizard/StepSkeleton'

const SingularitiesSpendingStep = dynamic(
  () => import('@/components/wizard/steps/pc-spending/SingularitiesSpendingStep').then((m) => ({ default: m.SingularitiesSpendingStep })),
  { loading: () => <StepSkeleton />, ssr: false },
)
const TraitsSpendingStep = dynamic(
  () => import('@/components/wizard/steps/pc-spending/TraitsSpendingStep').then((m) => ({ default: m.TraitsSpendingStep })),
  { loading: () => <StepSkeleton />, ssr: false },
)
const MartialSchoolPCSpendingStep = dynamic(
  () => import('@/components/wizard/steps/pc-spending/MartialSchoolPCSpendingStep').then((m) => ({ default: m.MartialSchoolPCSpendingStep })),
  { loading: () => <StepSkeleton />, ssr: false },
)
`,
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (ent.name.endsWith('.tsx')) pruneFile(p)
  }
}

function pruneFile(filePath) {
  const base = path.basename(filePath, '.tsx')
  const header = headers[base]
  if (!header) return

  const content = fs.readFileSync(filePath, 'utf8')
  const exportIdx = content.indexOf('export function ')
  if (exportIdx < 0) return

  const body = content.slice(exportIdx)
  fs.writeFileSync(filePath, header + '\n' + body)
  console.log('pruned', path.relative(root, filePath))
}

walk(stepsDir)
console.log('done')
