import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const inventoryPath = fileURLToPath(new URL('../../08_Assets/Production/asset-inventory.v1.json', import.meta.url))
const manifestPath = fileURLToPath(
  new URL('../../08_Assets/Production/Manifests/CITY_WORLD_INGEST_BATCH_001.json', import.meta.url),
)

function gitBlobSha1(bytes: Buffer) {
  const header = Buffer.from(`blob ${bytes.length}\0`)
  return createHash('sha1').update(header).update(bytes).digest('hex')
}

function loadJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

describe('ISSUE-413 — governed city-world Library ingestion batch 001', () => {
  it('attests exactly four repository candidate derivatives without crossing legal or runtime gates', () => {
    const inventory = loadJson(inventoryPath)
    const manifest = loadJson(manifestPath)

    expect(manifest.authority).toBe('DT-19 — ART ASSET PIPELINE / PRODUCTION LIBRARY')
    expect(manifest.issue).toBe('#413')
    expect(manifest.lifecycleState).toBe('CANDIDATE')
    expect(manifest.assets).toHaveLength(4)
    expect(new Set(manifest.assets.map((asset: any) => asset.assetId)).size).toBe(4)
    expect(new Set(manifest.assets.map((asset: any) => asset.path)).size).toBe(4)
    expect(new Set(manifest.assets.map((asset: any) => asset.sourceFamilyId))).toEqual(
      new Set(['SRC-20260907-002', 'SRC-20260907-003', 'SRC-20260907-006']),
    )

    const externalById = new Map(
      inventory.externalLibraryArtifacts.map((artifact: any) => [artifact.artifactId, artifact]),
    )

    for (const asset of manifest.assets) {
      expect(asset.lifecycleState).toBe('CANDIDATE')
      expect(asset.preparationEncodingDetails).toBe('UNKNOWN_RECOVERED_EXISTING_WORK')
      const bytes = readFileSync(`${repoRoot}${asset.path}`)
      expect(gitBlobSha1(bytes)).toBe(asset.derivativeGitBlobSha1)

      const source = externalById.get(asset.sourceLibraryArtifactId) as any
      expect(source).toBeDefined()
      expect(source.familyId).toBe(asset.sourceFamilyId)
      expect(source.libraryPresence).toBe('LIBRARY_PRESENT')
      expect(source.repositoryPresence).toBe('NOT_ATTESTED_ON_MAIN')
      expect(source.libraryFileId).toBe(asset.sourceLibraryFileId)
      expect(source.libraryPath).toBe(asset.sourceLibraryPath)
    }

    for (const familyId of ['SRC-20260907-002', 'SRC-20260907-003', 'SRC-20260907-006']) {
      const family = inventory.registeredFamilies.find((item: any) => item.familyId === familyId)
      expect(family.repositoryPresence).toBe('REPOSITORY_ATTESTED_DERIVATIVES_ONLY')
    }

    const batchCollections = inventory.collections.filter((item: any) =>
      item.collectionId.startsWith('city-world-ingest-batch-001-'),
    )
    expect(batchCollections).toHaveLength(3)
    expect(batchCollections.reduce((count: number, item: any) => count + item.expectedAssetCount, 0)).toBe(4)
    for (const collection of batchCollections) expect(collection.lifecycleState).toBe('CANDIDATE')

    expect(manifest.authorityBoundary.legalCommercialQualificationAuthority).toBe('DT-13')
    expect(manifest.authorityBoundary.runtimePlacementAuthority).toBe('DT-01')
  })
})
