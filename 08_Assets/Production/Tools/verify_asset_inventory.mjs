#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const DEFAULT_REPO_ROOT = resolve(dirname(SCRIPT_PATH), '../../..')
const DEFAULT_INVENTORY = '08_Assets/Production/asset-inventory.v1.json'
const EXPECTED_LIFECYCLE = [
  'INVENTORIED',
  'SPECIFIED',
  'CANDIDATE',
  'APPROVED_SOURCE',
  'PRODUCTION_READY',
  'RUNTIME_INTEGRATED',
  'ANDROID_VERIFIED',
]

function parseArgs(argv) {
  const args = { repoRoot: DEFAULT_REPO_ROOT, inventory: DEFAULT_INVENTORY }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--repo-root') {
      args.repoRoot = argv[++index]
    } else if (arg === '--inventory') {
      args.inventory = argv[++index]
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  if (!args.repoRoot || !args.inventory) throw new Error('Missing argument value')
  args.repoRoot = resolve(args.repoRoot)
  return args
}

function repoPath(repoRoot, repositoryPath) {
  if (typeof repositoryPath !== 'string' || repositoryPath.trim() === '') {
    throw new Error('Repository path must be a non-empty string')
  }
  if (isAbsolute(repositoryPath)) throw new Error(`Absolute repository path is forbidden: ${repositoryPath}`)
  const absolute = resolve(repoRoot, repositoryPath)
  const rel = relative(repoRoot, absolute)
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`Repository path escapes root: ${repositoryPath}`)
  }
  return absolute
}

function requireFile(repoRoot, repositoryPath, context) {
  const absolute = repoPath(repoRoot, repositoryPath)
  if (!existsSync(absolute) || !statSync(absolute).isFile()) {
    throw new Error(`${context} references missing file: ${repositoryPath}`)
  }
  return absolute
}

function requireDirectory(repoRoot, repositoryPath, context) {
  const absolute = repoPath(repoRoot, repositoryPath)
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
    throw new Error(`${context} references missing directory: ${repositoryPath}`)
  }
  return absolute
}

function listFilesRecursively(root) {
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name)
    if (entry.isDirectory()) files.push(...listFilesRecursively(path))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function assertUnique(values, label) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

function assertCanonicalLifecycle(inventory) {
  if (!Array.isArray(inventory.canonicalLifecycle)) throw new Error('canonicalLifecycle must be an array')
  if (JSON.stringify(inventory.canonicalLifecycle) !== JSON.stringify(EXPECTED_LIFECYCLE)) {
    throw new Error(`canonicalLifecycle must equal ${EXPECTED_LIFECYCLE.join(' -> ')}`)
  }
}

function validateEvidenceRefs(repoRoot, refs, context) {
  if (!Array.isArray(refs) || refs.length === 0) throw new Error(`${context} must provide evidenceRefs`)
  for (const ref of refs) requireFile(repoRoot, ref, context)
}

function resolveSemanticFamily(collection, relativePath) {
  const override = collection.artifactOverrides?.[relativePath]
  if (override?.semanticFamily) return override.semanticFamily
  const prefixes = Object.entries(collection.semanticFamilyByPrefix ?? {})
    .filter(([prefix]) => relativePath.startsWith(prefix))
    .sort(([left], [right]) => right.length - left.length)
  if (prefixes.length === 0) {
    throw new Error(`Collection ${collection.collectionId} has no semantic family for ${relativePath}`)
  }
  return prefixes[0][1]
}

function validateInventory(inventory, repoRoot) {
  if (inventory.schemaVersion !== 1) throw new Error(`Unsupported schemaVersion: ${inventory.schemaVersion}`)
  if (inventory.authority !== 'DT-19 — ART ASSET PIPELINE / PRODUCTION LIBRARY') {
    throw new Error('Asset inventory authority must remain DT-19')
  }
  assertCanonicalLifecycle(inventory)

  const requiredDedupDimensions = [
    'semanticFamily',
    'silhouetteOrForm',
    'runtimeClassOrFootprint',
    'directionStateAnimation',
    'biomeRegionCityArchetype',
    'professionOrIdentity',
    'productOrLogisticsForm',
    'transportModeOrCapacity',
    'sourceLineage',
    'visualSimilarity',
  ]
  if (JSON.stringify(inventory.dedupDimensions) !== JSON.stringify(requiredDedupDimensions)) {
    throw new Error('dedupDimensions no longer match the #414 canonical duplicate audit dimensions')
  }

  for (const [name, ref] of Object.entries(inventory.policyRefs ?? {})) {
    requireFile(repoRoot, ref, `policyRefs.${name}`)
  }

  const families = inventory.registeredFamilies ?? []
  assertUnique(families.map((family) => family.familyId), 'familyId')
  const familyIds = new Set(families.map((family) => family.familyId))
  for (const family of families) {
    if (!EXPECTED_LIFECYCLE.includes(family.lifecycleState)) {
      throw new Error(`Family ${family.familyId} has invalid lifecycleState: ${family.lifecycleState}`)
    }
    if (!family.semanticFamily) throw new Error(`Family ${family.familyId} is missing semanticFamily`)
    validateEvidenceRefs(repoRoot, family.evidenceRefs, `Family ${family.familyId}`)
  }

  const generatedFamilyRegister = readFileSync(repoPath(repoRoot, inventory.policyRefs.generatedFamilyRegister), 'utf8')
  for (const family of families.filter((item) => item.familyId.startsWith('SRC-20260907-'))) {
    if (!generatedFamilyRegister.includes(family.familyId)) {
      throw new Error(`Generated family ${family.familyId} is not present in canonical generated-family register`)
    }
  }

  const aliases = inventory.approvedFamilyAliases ?? []
  assertUnique(aliases.map((alias) => alias.approvedSourceId), 'approvedSourceId alias')
  const approvedSourceRegister = readFileSync(repoPath(repoRoot, inventory.policyRefs.approvedSourceRegister), 'utf8')
  for (const alias of aliases) {
    if (!approvedSourceRegister.includes(alias.approvedSourceId)) {
      throw new Error(`Alias ${alias.approvedSourceId} is not present in canonical approved-source register`)
    }
    if (!Array.isArray(alias.registeredFamilyIds) || alias.registeredFamilyIds.length === 0) {
      throw new Error(`Alias ${alias.approvedSourceId} must reference at least one registered family`)
    }
    for (const familyId of alias.registeredFamilyIds) {
      if (!familyIds.has(familyId)) throw new Error(`Alias ${alias.approvedSourceId} references unknown family ${familyId}`)
    }
  }

  const inventoryArtifacts = []
  const collections = inventory.collections ?? []
  assertUnique(collections.map((collection) => collection.collectionId), 'collectionId')
  for (const collection of collections) {
    if (!EXPECTED_LIFECYCLE.includes(collection.lifecycleState)) {
      throw new Error(`Collection ${collection.collectionId} has invalid lifecycleState: ${collection.lifecycleState}`)
    }
    if (!familyIds.has(collection.sourceFamilyId)) {
      throw new Error(`Collection ${collection.collectionId} references unknown sourceFamilyId ${collection.sourceFamilyId}`)
    }
    const root = requireDirectory(repoRoot, collection.root, `Collection ${collection.collectionId}`)
    const extensions = new Set((collection.extensions ?? []).map((extension) => extension.toLowerCase()))
    if (extensions.size === 0) throw new Error(`Collection ${collection.collectionId} must declare extensions`)
    const files = listFilesRecursively(root).filter((path) => extensions.has(extname(path).toLowerCase()))
    if (files.length !== collection.expectedAssetCount) {
      throw new Error(
        `Collection ${collection.collectionId} expected ${collection.expectedAssetCount} assets but found ${files.length}`,
      )
    }
    for (const absolutePath of files) {
      const relativeToCollection = relative(root, absolutePath).split(sep).join('/')
      const semanticFamily = resolveSemanticFamily(collection, relativeToCollection)
      const override = collection.artifactOverrides?.[relativeToCollection]
      inventoryArtifacts.push({
        path: relative(repoRoot, absolutePath).split(sep).join('/'),
        semanticFamily,
        reuseGroup: override?.reuseGroup ?? null,
        lifecycleState: collection.lifecycleState,
      })
    }
  }

  const runtimeArtifacts = inventory.runtimeArtifacts ?? []
  assertUnique(runtimeArtifacts.map((asset) => asset.assetId), 'runtime assetId')
  assertUnique(runtimeArtifacts.map((asset) => asset.path), 'runtime path')
  for (const asset of runtimeArtifacts) {
    const absolutePath = requireFile(repoRoot, asset.path, `Runtime asset ${asset.assetId}`)
    if (!asset.semanticFamily) throw new Error(`Runtime asset ${asset.assetId} is missing semanticFamily`)
    if (!EXPECTED_LIFECYCLE.includes(asset.lifecycleState)) {
      throw new Error(`Runtime asset ${asset.assetId} has invalid lifecycleState: ${asset.lifecycleState}`)
    }
    if (asset.sourceFamilyId && !familyIds.has(asset.sourceFamilyId)) {
      throw new Error(`Runtime asset ${asset.assetId} references unknown sourceFamilyId ${asset.sourceFamilyId}`)
    }

    if (asset.legacyMigrationStatus) {
      validateEvidenceRefs(repoRoot, asset.evidenceRefs, `Runtime asset ${asset.assetId}`)
    } else {
      const targetIndex = EXPECTED_LIFECYCLE.indexOf(asset.lifecycleState)
      const evidence = asset.lifecycleEvidence ?? {}
      for (let index = 0; index <= targetIndex; index += 1) {
        const state = EXPECTED_LIFECYCLE[index]
        const evidenceRef = evidence[state]
        if (!evidenceRef) throw new Error(`Runtime asset ${asset.assetId} is missing lifecycle evidence for ${state}`)
        requireFile(repoRoot, evidenceRef, `Runtime asset ${asset.assetId} lifecycle ${state}`)
      }
    }
    if (asset.legalEvidenceRef) requireFile(repoRoot, asset.legalEvidenceRef, `Runtime asset ${asset.assetId}`)

    inventoryArtifacts.push({
      path: asset.path,
      absolutePath,
      semanticFamily: asset.semanticFamily,
      reuseGroup: asset.reuseGroup ?? null,
      lifecycleState: asset.lifecycleState,
    })
  }

  assertUnique(inventoryArtifacts.map((asset) => asset.path), 'inventoried artifact path')

  const hashes = new Map()
  for (const artifact of inventoryArtifacts) {
    const absolutePath = artifact.absolutePath ?? repoPath(repoRoot, artifact.path)
    const digest = sha256(absolutePath)
    const group = hashes.get(digest) ?? []
    group.push(artifact)
    hashes.set(digest, group)
  }

  let declaredReuseSets = 0
  for (const [digest, artifacts] of hashes.entries()) {
    if (artifacts.length < 2) continue
    const reuseGroups = new Set(artifacts.map((artifact) => artifact.reuseGroup).filter(Boolean))
    const everyArtifactDeclaresReuse = artifacts.every((artifact) => Boolean(artifact.reuseGroup))
    if (!everyArtifactDeclaresReuse || reuseGroups.size !== 1) {
      throw new Error(
        `Exact duplicate ${digest} must share one declared reuseGroup: ${artifacts.map((artifact) => artifact.path).join(', ')}`,
      )
    }
    declaredReuseSets += 1
  }

  for (const packageRecord of inventory.documentedPackages ?? []) {
    if (packageRecord.repositoryPresence === 'DOCUMENTED_NOT_ATTESTED_ON_MAIN' && !packageRecord.evidenceRef) {
      throw new Error(`Documented-only package ${packageRecord.packageId} must retain its evidenceRef`)
    }
    if (packageRecord.evidenceRef) requireFile(repoRoot, packageRecord.evidenceRef, `Package ${packageRecord.packageId}`)
  }

  return {
    schemaVersion: inventory.schemaVersion,
    families: families.length,
    collections: collections.length,
    inventoriedArtifacts: inventoryArtifacts.length,
    runtimeArtifacts: runtimeArtifacts.length,
    declaredReuseSets,
    legacyRuntimeRecords: runtimeArtifacts.filter((asset) => Boolean(asset.legacyMigrationStatus)).length,
  }
}

export function verifyAssetInventory({ repoRoot = DEFAULT_REPO_ROOT, inventoryPath = DEFAULT_INVENTORY } = {}) {
  const resolvedRepoRoot = resolve(repoRoot)
  const inventoryFile = isAbsolute(inventoryPath) ? inventoryPath : repoPath(resolvedRepoRoot, inventoryPath)
  if (!existsSync(inventoryFile) || !statSync(inventoryFile).isFile()) {
    throw new Error(`Asset inventory not found: ${inventoryFile}`)
  }
  const inventory = JSON.parse(readFileSync(inventoryFile, 'utf8'))
  return validateInventory(inventory, resolvedRepoRoot)
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(SCRIPT_PATH)) {
  try {
    const args = parseArgs(process.argv.slice(2))
    const summary = verifyAssetInventory({ repoRoot: args.repoRoot, inventoryPath: args.inventory })
    process.stdout.write(`${JSON.stringify({ ok: true, ...summary })}\n`)
  } catch (error) {
    process.stderr.write(`DT-19 asset inventory verification failed: ${error.message}\n`)
    process.exitCode = 1
  }
}
