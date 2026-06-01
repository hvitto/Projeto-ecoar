import fs from 'fs'
import path from 'path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const srcPath = path.join(root, 'components/CharacterCreationWizard.tsx')
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/)

const importEnd = lines.findIndex((l, i) => i > 90 && l.startsWith('interface CharacterCreationData'))
const importBlock = lines.slice(0, importEnd).join('\n')

const fns = []
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^function ([A-Z][a-zA-Z0-9]+)/)
  if (m) fns.push({ name: m[1], start: i })
}
fns.forEach((f, idx) => {
  f.end = idx < fns.length - 1 ? fns[idx + 1].start : lines.length
})

const stepsDir = path.join(root, 'components/wizard/steps')
fs.mkdirSync(path.join(stepsDir, 'pc-spending'), { recursive: true })

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
  const dir = pcSpending.has(f.name)
    ? path.join(stepsDir, 'pc-spending')
    : stepsDir
  const outPath = path.join(dir, `${f.name}.tsx`)
  const content = `${importBlock}

${body.replace(/^function /, 'export function ')}
`
  fs.writeFileSync(outPath, content)
  console.log('wrote', path.relative(root, outPath))
}

const shellEnd = fns[0].start
const shellLines = lines.slice(0, shellEnd)
const importLines = [
  ...fns.map((f) => {
    const sub = pcSpending.has(f.name) ? 'pc-spending/' : ''
    return `import { ${f.name} } from '@/components/wizard/steps/${sub}${f.name}'`
  }),
]
const shellPath = path.join(root, 'components/wizard/CharacterCreationWizard.tsx')
const shellContent = shellLines.join('\n') + '\n\n' + importLines.join('\n') + '\n'
fs.writeFileSync(shellPath, shellContent)
console.log('wrote shell', path.relative(root, shellPath))

const indexExports = fns.map((f) => {
  const sub = pcSpending.has(f.name) ? './pc-spending/' : './'
  return `export { ${f.name} } from '${sub}${f.name}'`
})
fs.writeFileSync(path.join(stepsDir, 'index.ts'), indexExports.join('\n') + '\n')
console.log('done')
