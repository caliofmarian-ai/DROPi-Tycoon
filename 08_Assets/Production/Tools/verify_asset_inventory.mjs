#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const DEFAULT_REPO_ROOT = resolve(dirname(SCRIPT_PATH), '../../..')
const DEFAULT_INVENTORY = '08_Assets/Production/asset-inventory.v1.json'
const LEGAL_QUALIFICATION_CONTRACT = '09_Development/Compliance/GLOBAL_ASSET_PROVENANCE_CONTRACT_565_643.md'
const RUNTIME_EVIDENCE_MANIFEST = 'game-web/public/legal/runtime-provenance.json'
const LEGACY_BOARD_CROPS_COLLECTION = 'legacy-board-crops-v1'
const EXPECTED_LIFECYCLE = [
  'INVENTORIED',
  'SPECIFIED',
  'CANDIDATE',
  'APPROVED_SOURCE',
  'PRODUCTION_READY',
  'RUNTIME_INTEGRATED',
  'ANDROID_VERIFIED',
]
const LIBRARY_PRESENCE_VALUES = [
  'LIBRARY_PRESENT',
  'LIBRARY_NOT_FOUND_IN_AUDIT',
  'LIBRARY_NOT_AUDITED',
]
const REPOSITORY_PRESENCE_VALUES = [
  'REPOSITORY_ATTESTED',
  'REPOSITORY_ATTESTED_DERIVATIVES_ONLY',
  'NOT_ATTESTED_ON_MAIN',
]
const DT13_QUALIFICATION_FIELDS = new Set([
  'legalStatus',
  'legalQualification',
  'legalQualificationStatus',
  'commercialReleaseStatus',
  'clearanceStatus',
  'rightsStatus',
  'licenceStatus',
  'licenseStatus',
  'releaseStatus',
])

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

function assertNoDt13QualificationFields(value, path = 'inventory') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoDt13QualificationFields(item, `${path}[${index}]`))
    return
  }
  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value)) {
    if (DT13_QUALIFICATION_FIELDS.has(key)) {
      throw new Error(
        `DT-19 registry must not define legal qualification field ${path}.${key}; DT-13 owns legal/licence/provenance qualification`,
      )
    }
    assertNoDt13QualificationFields(child, `${path}.${key}`)
  }
}

function assertLegalQualificationBoundary(inventory, repoRoot) {
  const policyRefs = inventory.policyRefs ?? {}
  if (Object.prototype.hasOwnProperty.call(policyRefs, 'legalReleaseAuthority')) {
    throw new Error('policyRefs.legalReleaseAuthority is forbidden: runtime evidence is not the DT-13 legal qualification authority')
  }
  if (policyRefs.legalQualificationContract !== LEGAL_QUALIFICATION_CONTRACT) {
    throw new Error(`policyRefs.legalQualificationContract must equal ${LEGAL_QUALIFICATION_CONTRACT}`)
  }
  if (policyRefs.runtimeEvidenceManifest !== RUNTIME_EVIDENCE_MANIFEST) {
    throw new Error(`policyRefs.runtimeEvidenceManifest must equal ${RUNTIME_EVIDENCE_MANIFEST}`)
  }

  requireFile(repoRoot, policyRefs.legalQualificationContract, 'DT-13 legal qualification contract')
  requireFile(repoRoot, policyRefs.runtimeEvidenceManifest, 'Runtime legal/provenance evidence manifest')

  const boundary = inventory.authorityBoundary
  if (!boundary || typeof boundary !== 'object') throw new Error('authorityBoundary is required')
  if (boundary.productionLifecycleAuthority !== 'DT-19') {
    throw new Error('authorityBoundary.productionLifecycleAuthority must remain DT-19')
  }
  if (boundary.legalQualificationAuthority !== 'DT-13') {
    throw new Error('authorityBoundary.legalQualificationAuthority must remain DT-13')
  }
  if (boundary.legalQualificationContractRef !== policyRefs.legalQualificationContract) {
    throw new Error('authorityBoundary legal qualification contract must match policyRefs.legalQualificationContract')
  }
  if (boundary.runtimeEvidenceManifestRef !== policyRefs.runtimeEvidenceManifest) {
    throw new Error('authorityBoundary runtime evidence manifest must match policyRefs.runtimeEvidenceManifest')
  }
  if (boundary.legalQualificationContractRef === boundary.runtimeEvidenceManifestRef) {
    throw new Error('DT-13 legal qualification contract and runtime evidence manifest must remain distinct')
  }

  const contract = readFileSync(repoPath(repoRoot, policyRefs.legalQualificationContract), 'utf8')
  if (!contract.includes('It does not replace the DT-19 asset lifecycle or asset registries.')) {
    throw new Error('DT-13 legal qualification contract no longer declares the DT-19 lifecycle boundary')
  }
  if (!contract.includes('Legal/provenance status is an independent release dimension.')) {
    throw new Error('DT-13 legal qualification contract no longer keeps legal status independent from DT-19 lifecycle')
  }
  if (!contract.includes('A family/batch record must not claim facts that are unknown.')) {
    throw new Error('DT-13 legal qualification contract no longer preserves unknown provenance facts as unknown')
  }
  if (!contract.includes('A derivative cannot become legally `CLEARED` merely because the parent is visually `APPROVED_SOURCE` or technically `RUNTIME_INTEGRATED`.')) {
    throw new Error('DT-13 legal qualification contract no longer preserves the lifecycle-versus-clearance boundary')
  }

  assertNoDt13QualificationFields(inventory)
}

function assertPresenceValue(value, allowed, context) {
  if (!allowed.includes(value)) {
    throw new Error(`${context} has invalid presence value: ${value}`)
  }
}

function assertPresenceBoundary(inventory, familyIds) {
  const model = inventory.presenceModel
  if (!model || typeof model !== 'object') throw new Error('presenceModel is required')
  if (JSON.stringify(model.libraryPresenceValues) !== JSON.stringify(LIBRARY_PRESENCE_VALUES)) {
    throw new Error('presenceModel.libraryPresenceValues must preserve the canonical Library audit states')
  }
  if (JSON.stringify(model.repositoryPresenceValues) !== JSON.stringify(REPOSITORY_PRESENCE_VALUES)) {
    throw new Error('presenceModel.repositoryPresenceValues must preserve the canonical GitHub attestation states')
  }
  if (model.ingestionOwner !== '#413') {
    throw new Error('presenceModel.ingestionOwner must remain #413; #414 does not ingest Library binaries')
  }

  const external = inventory.externalLibraryArtifacts ?? []
  assertUnique(external.map((artifact) => artifact.artifactId), 'external Library artifactId')
  const externalById = new Map(external.map((artifact) => [artifact.artifactId, artifact]))

  for (const artifact of external) {
    assertPresenceValue(artifact.libraryPresence, LIBRARY_PRESENCE_VALUES, `External Library artifact ${artifact.artifactId}`)
    assertPresenceValue(artifact.repositoryPresence, REPOSITORY_PRESENCE_VALUES, `External Library artifact ${artifact.artifactId}`)
    if (artifact.libraryPresence === 'LIBRARY_PRESENT') {
      if (typeof artifact.libraryFileId !== 'string' || artifact.libraryFileId.trim() === '') {
        throw new Error(`Library-present artifact ${artifact.artifactId} must retain libraryFileId audit evidence`)
      }
      if (typeof artifact.libraryPath !== 'string' || !artifact.libraryPath.startsWith('/DROPi Tycon/')) {
        throw new Error(`Library-present artifact ${artifact.artifactId} must retain its /DROPi Tycon/ libraryPath`)
      }
    }
    if (artifact.familyId && !familyIds.has(artifact.familyId)) {
      throw new Error(`External Library artifact ${artifact.artifactId} references unknown family ${artifact.familyId}`)
    }
    if (artifact.repositoryPresence === 'REPOSITORY_ATTESTED' && artifact.libraryPresence === 'LIBRARY_PRESENT') {
      throw new Error(
        `External Library artifact ${artifact.artifactId} cannot become REPOSITORY_ATTESTED from Library presence alone; repository bytes/evidence must be inventoried separately`,
      )
    }
  }

  for (const family of inventory.registeredFamilies ?? []) {
    assertPresenceValue(family.libraryPresence, LIBRARY_PRESENCE_VALUES, `Family ${family.familyId}`)
    assertPresenceValue(family.repositoryPresence, REPOSITORY_PRESENCE_VALUES, `Family ${family.familyId}`)
    if (family.libraryPresence === 'LIBRARY_PRESENT') {
      if (!family.libraryArtifactRef) {
        throw new Error(`Library-present family ${family.familyId} must reference audited Library evidence`)
      }
      const externalArtifact = externalById.get(family.libraryArtifactRef)
      if (!externalArtifact) {
        throw new Error(`Family ${family.familyId} references unknown Library artifact ${family.libraryArtifactRef}`)
      }
      if (externalArtifact.familyId && externalArtifact.familyId !== family.familyId) {
        throw new Error(`Family ${family.familyId} Library artifact points at ${externalArtifact.familyId}`)
      }
    }
  }

  for (const packageRecord of inventory.documentedPackages ?? []) {
    assertPresenceValue(packageRecord.libraryPresence, LIBRARY_PRESENCE_VALUES, `Package ${packageRecord.packageId}`)
    assertPresenceValue(packageRecord.repositoryPresence, REPOSITORY_PRESENCE_VALUES, `Package ${packageRecord.packageId}`)
    if (packageRecord.libraryPresence === 'LIBRARY_PRESENT' && packageRecord.repositoryPresence === 'REPOSITORY_ATTESTED') {
      throw new Error(
        `Package ${packageRecord.packageId} cannot become REPOSITORY_ATTESTED from Library presence alone; repository evidence is required`,
      )
    }
  }

  return external.length
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
  assertLegalQualificationBoundary(inventory, repoRoot)

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

  const externalLibraryArtifacts = assertPresenceBoundary(inventory, familyIds)

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
    if (collection.collectionId === LEGACY_BOARD_CROPS_COLLECTION && collection.lifecycleState !== 'CANDIDATE') {
      throw new Error(`Collection ${LEGACY_BOARD_CROPS_COLLECTION} must remain CANDIDATE; collection inventory does not grant APPROVED_SOURCE`)
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
    if (Object.prototype.hasOwnProperty.call(asset, 'legalEvidenceRef')) {
      throw new Error(`Runtime asset ${asset.assetId} uses deprecated legalEvidenceRef; runtime evidence must not be labeled legal authority`)
    }
    if (asset.runtimeEvidenceRef) {
      if (asset.runtimeEvidenceRef !== inventory.policyRefs.runtimeEvidenceManifest) {
        throw new Error(`Runtime asset ${asset.assetId} runtimeEvidenceRef must use the canonical runtime evidence manifest`)
      }
      requireFile(repoRoot, asset.runtimeEvidenceRef, `Runtime asset ${asset.assetId} runtime evidence`)
    }

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
    if (!packageRecord.evidenceRef) {
      throw new Error(`Documented package ${packageRecord.packageId} must retain its evidenceRef`)
    }
    requireFile(repoRoot, packageRecord.evidenceRef, `Package ${packageRecord.packageId}`)
  }

  return {
    schemaVersion: inventory.schemaVersion,
    families: families.length,
    collections: collections.length,
    externalLibraryArtifacts,
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
