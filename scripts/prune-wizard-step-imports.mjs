/**
 * Remove o bloco de imports duplicado colado pelo extract-wizard-steps.mjs legado.
 * Mantém 'use client' + imports mínimos por arquivo (mapa manual — só steps verificados).
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
import { getAllMartialSchools } from '@/data/martialSchoolSingularities'
import MartialSchoolCard from '@/shared/components/ui/MartialSchoolCard'
`,
  BackgroundStep: `'use client'

import { User } from 'lucide-react'
import { Input, Textarea } from '@/shared/components/ui'
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
