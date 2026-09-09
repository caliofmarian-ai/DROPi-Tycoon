import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const publicRoot = join(root, 'public')
const commercialRelease = process.argv.includes('--commercial-release')
const errors = []

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const fail = (message) => errors.push(message)

const inventoryPath = join(publicRoot, 'legal', 'dependency-license-inventory.json')
const provenancePath = join(publicRoot, 'legal', 'runtime-provenance.json')
const noticesPath = join(publicRoot, 'legal', 'third-party-notices.html')
const lockfilePath = join(root, 'package-lock.json')

for (const required of [inventoryPath, provenancePath, noticesPath, lockfilePath]) {
  if (!existsSync(required)) fail(`missing required compliance artifact: ${relative(root, required)}`)
}

if (errors.length === 0) {
  const lockfile = readJson(lockfilePath)
  const inventory = readJson(inventoryPath)
  const provenance = readJson(provenancePath)
  const notices = readFileSync(noticesPath, 'utf8')
  const packages = lockfile.packages ?? {}
  const rootPackage = packages[''] ?? {}

  const productionClosure = new Map()
  const queue = Object.entries(rootPackage.dependencies ?? {}).map(([name]) => name)

  while (queue.length > 0) {
    const name = queue.shift()
    if (productionClosure.has(name)) continue
    const record = packages[`node_modules/${name}`]
    if (!record) {
      fail(`production dependency ${name} is absent from package-lock packages`)
      continue
    }
    productionClosure.set(name, { version: record.version, license: record.license ?? null })
    for (const child of Object.keys(record.dependencies ?? {})) queue.push(child)
    for (const child of Object.keys(record.optionalDependencies ?? {})) {
      const childRecord = packages[`node_modules/${child}`]
      if (childRecord && childRecord.dev !== true) queue.push(child)
    }
  }

  const auditedPackages = new Map(
    (inventory.packages ?? []).map((entry) => [entry.name, { version: entry.version, license: entry.license }]),
  )

  for (const [name, actual] of productionClosure) {
    const audited = auditedPackages.get(name)
    if (!audited) {
      fail(`production dependency ${name}@${actual.version} is missing from dependency-license-inventory.json`)
      continue
    }
    if (audited.version !== actual.version) {
      fail(`dependency inventory version mismatch for ${name}: ${audited.version} != ${actual.version}`)
    }
    if (audited.license !== actual.license) {
      fail(`dependency inventory license mismatch for ${name}: ${audited.license} != ${actual.license}`)
    }
  }

  for (const name of auditedPackages.keys()) {
    if (!productionClosure.has(name)) fail(`dependency inventory contains non-production package ${name}`)
  }

  const noticeRequirements = [
    'OpenStreetMap contributors',
    'Open Database License (ODbL) 1.0',
    'GeoNames',
    'Creative Commons Attribution 4.0',
    'Natural Earth',
    'world-atlas 2.0.2',
    'Phaser 3.90.0',
    'EventEmitter3 5.0.4',
    'Postgres.js 3.4.9',
  ]
  for (const token of noticeRequirements) {
    if (!notices.includes(token)) fail(`third-party notices are missing required token: ${token}`)
  }

  const walkFiles = (dir) => {
    const files = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) files.push(...walkFiles(path))
      else if (entry.isFile()) files.push(path)
    }
    return files
  }

  const assetFiles = walkFiles(join(publicRoot, 'assets'))
    .map((path) => relative(publicRoot, path).replaceAll('\\', '/'))
    .sort()
  const registeredAssets = new Set((provenance.assets ?? []).map((entry) => entry.path))

  for (const path of assetFiles) {
    if (!registeredAssets.has(path)) fail(`runtime asset lacks provenance entry: ${path}`)
  }
  for (const path of registeredAssets) {
    if (!assetFiles.includes(path)) fail(`provenance entry points to missing runtime asset: ${path}`)
  }

  const requiredDataFamilies = new Set([
    'natural-earth-global-localities',
    'natural-earth-world-atlas-boundaries',
    'geonames-regional-localities',
    'osm-braila-city-plan',
  ])
  for (const entry of provenance.dataFamilies ?? []) requiredDataFamilies.delete(entry.id)
  for (const id of requiredDataFamilies) fail(`runtime provenance is missing required data family: ${id}`)

  const regionalFiles = readdirSync(join(publicRoot, 'data'))
    .filter((name) => /^europe-.*-regional-localities-v1\.json$/.test(name))
  if (regionalFiles.length === 0) fail('no governed Europe regional-locality runtime files were found')
  for (const name of regionalFiles) {
    const data = readJson(join(publicRoot, 'data', name))
    if (data.source?.provider !== 'GeoNames') fail(`${name} does not declare GeoNames as its source provider`)
    if (!String(data.source?.license ?? '').includes('Attribution 4.0')) {
      fail(`${name} does not declare the expected GeoNames attribution license`)
    }
  }

  const globalLocalities = readJson(join(publicRoot, 'data', 'country-representative-localities-v1.json'))
  if (globalLocalities.source?.name !== 'Natural Earth 1:10m populated places simple') {
    fail('global representative locality source no longer matches the audited Natural Earth family')
  }
  if (globalLocalities.source?.license !== 'Public Domain') {
    fail('global representative locality license no longer matches the audited Natural Earth public-domain record')
  }

  if (!existsSync(join(publicRoot, 'data', 'world-atlas-countries-110m.json'))) {
    fail('audited world-atlas country boundary runtime file is missing')
  }

  if (commercialRelease && provenance.commercialReleaseReady !== true) {
    const blockers = provenance.blockingReviewIds ?? []
    fail(`commercial release gate is blocked: ${blockers.join(', ') || 'unresolved provenance review'}`)
  }
}

if (errors.length > 0) {
  console.error('Third-party release verification FAILED')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  commercialRelease
    ? 'Third-party commercial release gate PASSED'
    : 'Third-party inventory/notices/provenance consistency PASSED',
)
