import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const repoRoot = resolve(root, '..')
const publicRoot = join(root, 'public')
const mobileRoot = join(repoRoot, 'game-mobile')
const commercialRelease = process.argv.includes('--commercial-release')
const errors = []

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const fail = (message) => errors.push(message)

const inventoryPath = join(publicRoot, 'legal', 'dependency-license-inventory.json')
const provenancePath = join(publicRoot, 'legal', 'runtime-provenance.json')
const commercialEvidencePath = join(publicRoot, 'legal', 'commercial-release-evidence.json')
const noticesPath = join(publicRoot, 'legal', 'third-party-notices.html')
const lockfilePath = join(root, 'package-lock.json')
const mobilePackagePath = join(mobileRoot, 'package.json')
const mobileLockfilePath = join(mobileRoot, 'package-lock.json')
const mobilePreparePath = join(mobileRoot, 'scripts', 'prepare-bundled-runtime.mjs')
const mobileValidatePath = join(mobileRoot, 'scripts', 'validate-bundled-runtime.mjs')

for (const required of [
  inventoryPath,
  provenancePath,
  commercialEvidencePath,
  noticesPath,
  lockfilePath,
  mobilePackagePath,
  mobilePreparePath,
  mobileValidatePath,
]) {
  if (!existsSync(required)) fail(`missing required compliance artifact: ${relative(repoRoot, required)}`)
}

if (errors.length === 0) {
  const lockfile = readJson(lockfilePath)
  const inventory = readJson(inventoryPath)
  const provenance = readJson(provenancePath)
  const commercialEvidence = readJson(commercialEvidencePath)
  const mobilePackage = readJson(mobilePackagePath)
  const notices = readFileSync(noticesPath, 'utf8')
  const mobilePrepare = readFileSync(mobilePreparePath, 'utf8')
  const mobileValidate = readFileSync(mobileValidatePath, 'utf8')
  const packages = lockfile.packages ?? {}
  const rootPackage = packages[''] ?? {}

  if (inventory.component !== 'game-web') {
    fail('dependency-license-inventory.json must identify its component as game-web')
  }
  if (!String(inventory.scope ?? '').includes('game-web production npm dependency closure')) {
    fail('dependency-license-inventory.json must state its exact game-web-only release scope')
  }

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

  const mobileEvidence = commercialEvidence.mobileReleaseDependencyClosure ?? {}
  const actualMobileDependencies = mobilePackage.dependencies ?? {}
  const auditedMobileDependencies = mobileEvidence.declaredDirectProductionDependencies ?? {}
  if (JSON.stringify(actualMobileDependencies) !== JSON.stringify(auditedMobileDependencies)) {
    fail('commercial release evidence does not exactly match game-mobile declared production dependencies')
  }

  const mobileBlockers = new Set(commercialEvidence.blockingReviewIds ?? [])
  const mobileLockfilePresent = existsSync(mobileLockfilePath)
  if (!mobileLockfilePresent) {
    if (mobileEvidence.status !== 'BLOCKED_PENDING_LOCKFILE') {
      fail('missing game-mobile/package-lock.json must be represented as BLOCKED_PENDING_LOCKFILE')
    }
    if (mobileEvidence.lockfilePresentAtAudit !== false) {
      fail('mobile dependency evidence must truthfully record that the lockfile is absent')
    }
    if (!mobileBlockers.has('mobile-release-dependency-license-closure')) {
      fail('missing mobile lockfile must keep mobile-release-dependency-license-closure blocked')
    }
  } else if (mobileEvidence.status === 'BLOCKED_PENDING_LOCKFILE' || mobileEvidence.lockfilePresentAtAudit === false) {
    fail('game-mobile/package-lock.json now exists; #565 mobile dependency evidence is stale and must be regenerated')
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

  const legalBundleRequirements = commercialEvidence.noticePlacement?.androidBundleRequirement ?? []
  for (const relativePath of legalBundleRequirements) {
    const token = `'${relativePath}'`
    if (!mobilePrepare.includes(token)) {
      fail(`Android production bundler does not require legal evidence output: ${relativePath}`)
    }
    if (!mobileValidate.includes(token)) {
      fail(`Android bundled-runtime validator does not guard legal evidence output: ${relativePath}`)
    }
  }

  const mobileBranding = commercialEvidence.mobileBrandingAssets ?? []
  const registeredMobilePaths = new Set(mobileBranding.map((entry) => entry.path))
  const requiredMobileBranding = [
    'game-mobile/assets/branding/dropi-tycoon-logo.png',
    'game-mobile/assets/branding/dropi-tycoon-app-icon.png',
    'game-mobile/assets/branding/dropi-tycoon-splash.jpg',
  ]
  for (const path of requiredMobileBranding) {
    if (!registeredMobilePaths.has(path)) fail(`commercial evidence is missing mobile branding asset: ${path}`)
    if (!existsSync(join(repoRoot, path))) fail(`registered mobile branding asset is missing: ${path}`)
  }
  for (const entry of mobileBranding) {
    if (entry.status !== 'REVIEW_REQUIRED') {
      fail(`mobile branding asset must remain REVIEW_REQUIRED until #565 external review: ${entry.path}`)
    }
    if (entry.blocker !== 'branding-chain-of-title-and-trademark') {
      fail(`mobile branding asset must remain tied to branding chain/trademark blocker: ${entry.path}`)
    }
    if (!String(entry.declaredSha256 ?? '').match(/^[a-f0-9]{64}$/)) {
      fail(`mobile branding evidence lacks a valid declared SHA-256: ${entry.path}`)
    }
  }

  if (commercialEvidence.generatedRuntimeAssetEvidence?.status !== 'BLOCKED') {
    fail('icon-orders generated runtime asset must remain BLOCKED until its factual generation chain is complete')
  }
  if (commercialEvidence.generatedRuntimeAssetEvidence?.blocker !== 'generated-orders-icon-chain-of-title') {
    fail('generated orders icon evidence must remain tied to its chain-of-title blocker')
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
    fail(`commercial runtime provenance gate is blocked: ${blockers.join(', ') || 'unresolved provenance review'}`)
  }
  if (commercialRelease && commercialEvidence.commercialReleaseReady !== true) {
    const blockers = commercialEvidence.blockingReviewIds ?? []
    fail(`commercial IP/evidence gate is blocked: ${blockers.join(', ') || 'unresolved commercial evidence review'}`)
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
