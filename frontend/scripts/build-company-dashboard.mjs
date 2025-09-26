import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const cdRoot = join(root, '..', 'Company Dashboard', 'market-mosaic-online-4190')
const outDir = join(root, 'public', 'company-dashboard')

function copyDir(src, dest) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const s = join(src, entry)
    const d = join(dest, entry)
    const st = statSync(s)
    if (st.isDirectory()) {
      copyDir(s, d)
    } else {
      copyFileSync(s, d)
    }
  }
}

try {
  console.log('➡️ Building embedded Company Dashboard (Vite) ...')
  execSync('npm ci', { cwd: cdRoot, stdio: 'inherit' })
  execSync('npm run build:dev || npm run build', { cwd: cdRoot, stdio: 'inherit' })
  const viteDist = join(cdRoot, 'dist')
  copyDir(viteDist, outDir)
  console.log('✅ Company Dashboard copied to /public/company-dashboard')
} catch (e) {
  console.warn('⚠️ Skipping Company Dashboard build:', e.message)
}


