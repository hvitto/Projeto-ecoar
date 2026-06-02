import fs from 'fs'
import path from 'path'

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8')
      const n = c
        .replace(/@\/components\/ui/g, '@/shared/components/ui')
        .replace(/@\/contexts\//g, '@/shared/contexts/')
        .replace(/@\/types\//g, '@/shared/types/')
      if (c !== n) {
        fs.writeFileSync(p, n)
        console.log('fixed', p)
      }
    }
  }
}

walk('components/wizard/steps')
