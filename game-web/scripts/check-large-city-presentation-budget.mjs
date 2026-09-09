import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const MAX_STREAMED_SECTORS = 5
const MAX_CHUNKS_PER_SECTOR = 10
const BRAILA_SCALE_CONTRACT = 'src/world/brailaPlayableScale.ts'
const CITY_RUNTIME_ROOT = 'src/city'

const numericExportPattern = /export\s+const\s+([A-Z0-9_]+)\s*=\s*(\d+(?:\.\d+)?)/g

const fileExists = async relativePath => {
  try {
    await access(path.resolve(relativePath))
    return true
  } catch {
    return false
  }
}

const readNumericExports = source => {
  const values = new Map()
  for (const match of source.matchAll(numericExportPattern)) {
    values.set(match[1], Number(match[2]))
  }
  return values
}

const isSectorBudgetSymbol = name => {
  const upper = name.toUpperCase()
  if (!upper.includes('SECTOR')) return false
  if (upper.includes('SIZE') || upper.includes('RADIUS')) return false
  return upper.includes('LIMIT') || upper.includes('MAX') || upper.includes('BUDGET') || upper.includes('COUNT')
}

const isChunkBudgetSymbol = name => {
  const upper = name.toUpperCase()
  if (!upper.includes('CHUNK')) return false
  if (upper.includes('SIZE') || upper.includes('BYTES')) return false
  if (upper.includes('PER_SECTOR')) return true
  return upper.includes('LIMIT') || upper.includes('MAX') || upper.includes('BUDGET') || upper.includes('COUNT')
}

const evaluateExports = (file, exportsMap) => {
  const violations = []
  const observations = []

  for (const [name, value] of exportsMap) {
    if (isSectorBudgetSymbol(name)) {
      observations.push(`${file}: ${name}=${value} (sector ceiling ${MAX_STREAMED_SECTORS})`)
      if (value > MAX_STREAMED_SECTORS) {
        violations.push(`${file}: ${name}=${value} exceeds streamed-sector ceiling ${MAX_STREAMED_SECTORS}`)
      }
    }

    if (isChunkBudgetSymbol(name)) {
      observations.push(`${file}: ${name}=${value} (chunk ceiling ${MAX_CHUNKS_PER_SECTOR})`)
      if (value > MAX_CHUNKS_PER_SECTOR) {
        violations.push(`${file}: ${name}=${value} exceeds chunks-per-sector ceiling ${MAX_CHUNKS_PER_SECTOR}`)
      }
    }
  }

  return { observations, violations }
}

const walkTypeScriptFiles = async root => {
  if (!(await fileExists(root))) return []

  const files = []
  const visit = async current => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await visit(next)
      } else if (entry.isFile() && next.endsWith('.ts')) {
        files.push(next)
      }
    }
  }

  await visit(root)
  return files.sort((a, b) => a.localeCompare(b))
}

const assertSelfTest = () => {
  const passing = readNumericExports(`
    export const BRAILA_DETAIL_SECTOR_LIMIT = 5
    export const MAX_CHUNKS_PER_SECTOR = 10
    export const BRAILA_DETAIL_SECTOR_SIZE = 768
  `)
  const passingResult = evaluateExports('self-test-pass.ts', passing)
  if (passingResult.violations.length !== 0) {
    throw new Error(`Budget checker self-test unexpectedly rejected valid ceilings: ${passingResult.violations.join('; ')}`)
  }

  const failing = readNumericExports(`
    export const BRAILA_DETAIL_SECTOR_LIMIT = 12
    export const MAX_CHUNKS_PER_SECTOR = 11
  `)
  const failingResult = evaluateExports('self-test-fail.ts', failing)
  if (failingResult.violations.length !== 2) {
    throw new Error(`Budget checker self-test failed to detect both ceiling violations: ${failingResult.violations.join('; ')}`)
  }
}

assertSelfTest()

const filesToInspect = []
if (await fileExists(BRAILA_SCALE_CONTRACT)) {
  filesToInspect.push(BRAILA_SCALE_CONTRACT)
}
filesToInspect.push(...await walkTypeScriptFiles(CITY_RUNTIME_ROOT))

const observations = []
const violations = []

for (const file of [...new Set(filesToInspect)]) {
  const source = await readFile(file, 'utf8')
  const result = evaluateExports(file, readNumericExports(source))
  observations.push(...result.observations)
  violations.push(...result.violations)
}

console.log('Large-city presentation performance guard')
console.log(`- streamed-sector hard ceiling: ${MAX_STREAMED_SECTORS}`)
console.log(`- chunks-per-sector hard ceiling: ${MAX_CHUNKS_PER_SECTOR}`)

if (!(await fileExists(BRAILA_SCALE_CONTRACT))) {
  console.log(`- ${BRAILA_SCALE_CONTRACT}: pending on this ref`)
}
if (!(await fileExists(CITY_RUNTIME_ROOT))) {
  console.log(`- ${CITY_RUNTIME_ROOT}/: pending on this ref`)
}

if (observations.length > 0) {
  for (const observation of observations) console.log(`- observed ${observation}`)
} else {
  console.log('- no governed numeric sector/chunk budget exports are present on this ref yet')
}

if (violations.length > 0) {
  console.error('Large-city presentation performance guard: FAIL')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log('Large-city presentation performance guard: PASS')
