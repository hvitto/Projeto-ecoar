/**
 * Extrai funções de step do monólito para arquivos separados.
 * NÃO cola mais o bloco global de imports (ver prune-wizard-step-imports.mjs).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcPath = path.join(root, 'components/wizard/CharacterCreationWizard.tsx')
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/)

const fns = []
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^function ([A-Z][a-zA-Z0-9]+)/)
  if (m) fns.push({ name: m[1], start: i })
}
fns.forEach((f, idx) => {
  f.end = idx < fns.length - 1 ? fns[idx + 1].start : lines.length
})

const stepsDir = path.join(root, 'components/wizard/steps')
const pcSpending = new Set([
  'PathSingularitiesTab',
  'PCSpendingStep',
  'SingularitiesSpendingStep',
  'MartialSingularitiesTab',
  'RacialSingularitiesTab',
  'TraitsSpendingStep',
  'MartialSchoolPCSpendingStep',
  'MartialSchoolSingularitiesPurchase',
  'MartialSchoolSingularitiesStep',
  'EcoarSingularitiesList',
  'EcoarSelection',
])

for (const f of fns) {
  const body = lines.slice(f.start, f.end).join('\n')
  const dir = pcSpending.has(f.name) ? path.join(stepsDir, 'pc-spending') : stepsDir
  const outPath = path.join(dir, `${f.name}.tsx`)
  const content = `'use client'

// Imports: manter mínimos. Após extrair, rodar scripts/prune-wizard-step-imports.mjs

${body.replace(/^function /, 'export function ')}
`
  fs.writeFileSync(outPath, content)
  console.log('wrote', path.relative(root, outPath))
}

console.log('done: use lazy imports in wizardLazySteps.tsx, not static imports no shell')
