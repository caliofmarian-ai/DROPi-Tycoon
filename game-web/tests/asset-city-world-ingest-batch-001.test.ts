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

function sha256(bytes: Buffer) {
  return createHash('sha256').update(bytes).digest('hex')
}

function webpDimensions(bytes: Buffer) {
  expect(bytes.toString('ascii', 0, 4)).toBe('RIFF')
  expect(bytes.toString('ascii', 8, 12)).toBe('WEBP')

  for (let offset = 12; offset + 8 <= bytes.length;) {
    const chunkType = bytes.toString('ascii', offset, offset + 4)
    const chunkSize = bytes.readUInt32LE(offset + 4)
    const dataOffset = offset + 8
    if (chunkType === 'VP8X') {
      return {
        width: bytes.readUIntLE(dataOffset + 4, 3) + 1,
        height: bytes.readUIntLE(dataOffset + 7, 3) + 1,
      }
    }
    offset = dataOffset + chunkSize + (chunkSize % 2)
  }

  throw new Error('Expected a VP8X WebP dimension chunk')
}

function loadJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

const expectedDerivatives: Record<string, {
  width: number
  height: number
  sizeBytes: number
  sha256: string
  assetUseClassification: string
  embeddedText: string
}> = {
  'dt19-b001-school-01': {
    width: 144,
    height: 85,
    sizeBytes: 6294,
    sha256: 'f2cbaae170893eb82ee59f557cddf9e390836716852c4b5e20a03b94cb0b57a0',
    assetUseClassification: 'REFERENCE_ONLY',
    embeddedText: 'SCHOOL',
  },
  'dt19-b001-train-station-01': {
    width: 144,
    height: 86,
    sizeBytes: 6540,
    sha256: '4378545827c30c98a8e360407d536733ce9ff20372136104571b04c2ff8859e6',
    assetUseClassification: 'REFERENCE_ONLY',
    embeddedText: 'TRAIN STATION',
  },
  'dt19-b001-historic-european-building-01': {
    width: 144,
    height: 122,
    sizeBytes: 7780,
    sha256: 'aea4e74511f3d860357c9e5b7adcf05fa3f580a02c7378bf6ef6c9346b1262bc',
    assetUseClassification: 'STRATEGIC_MAP_OR_REFERENCE_ONLY',
    embeddedText: 'NONE_OBSERVED',
  },
  'dt19-b001-modern-office-building-01': {
    width: 120,
    height: 142,
    sizeBytes: 4374,
    sha256: 'd97f1c104a764ebd9334919129f8b778c1cbca1b3d6df020812d74479567ecc2',
    assetUseClassification: 'STRATEGIC_MAP_OR_REFERENCE_ONLY',
    embeddedText: 'NONE_OBSERVED',
  },
}

describe('ISSUE-413 — governed city-world Library ingestion batch 001', () => {
  it('attests exactly four repository candidate derivatives without crossing legal or runtime gates', () => {
    const inventory = loadJson(inventoryPath)
    const manifest = loadJson(manifestPath)

    expect(manifest.authority).toBe('DT-19 — ART ASSET PIPELINE / PRODUCTION LIBRARY')
    expect(manifest.issue).toBe('#413')
    expect(manifest.baselineMainSha).toBe('f1d4396f64aa7a0fcfbcc37322d9fe6a6731066f')
    expect(manifest.lifecycleState).toBe('CANDIDATE')
    expect(manifest.repositoryReadiness).toBe('REPOSITORY_READY_FOR_STRATEGIC_MAP_OR_REFERENCE_REVIEW')
    expect(manifest.visualUseClassification).toBe('STRATEGIC_MAP_OR_REFERENCE_ONLY')
    expect(manifest.localHumanScaleThirdPersonRuntime).toBe(
      'FORBIDDEN_FOR_LOCAL_HUMAN_SCALE_THIRD_PERSON_RUNTIME',
    )
    expect(manifest.canonicalVisualAuthority).toBe(
      '00_Project/THIRD_PERSON_OPEN_WORLD_VISUAL_EXPERIENCE_CANON.md',
    )
    expect(manifest.sourceGenerationAndRightsEvidence).toMatchObject({
      libraryGenerationIndicator: 'MODEL_GENERATED_TRUE',
      provider: 'UNKNOWN_OR_UNCLEARED',
      tool: 'UNKNOWN_OR_UNCLEARED',
      modelProduct: 'UNKNOWN_OR_UNCLEARED',
      providerTermsLicenceEvidence: 'UNKNOWN_OR_UNCLEARED',
      inputReferenceRightsClassification: 'UNKNOWN_OR_UNCLEARED',
      commercialUseReview: 'UNKNOWN_OR_UNCLEARED',
      redistributionReview: 'UNKNOWN_OR_UNCLEARED',
      commercialReleaseGate: 'BLOCKED_PENDING_DT13_EVIDENCE',
    })
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
      expect(asset.exactReencodingReproducibility).toBe('NOT_REPRODUCIBLE_FROM_RECORDED_EVIDENCE')
      expect(asset.visualForm).toBe('2D_ISOMETRIC_MINIATURE_WEBP_WITH_ALPHA')
      expect(asset.visualUseClassification).toBe('STRATEGIC_MAP_OR_REFERENCE_ONLY')
      expect(asset.localHumanScaleThirdPersonRuntime).toBe(
        'FORBIDDEN_FOR_LOCAL_HUMAN_SCALE_THIRD_PERSON_RUNTIME',
      )
      expect(asset.path.startsWith('08_Assets/Production/Candidates/')).toBe(true)

      const expected = expectedDerivatives[asset.assetId]
      expect(expected).toBeDefined()
      const bytes = readFileSync(`${repoRoot}${asset.path}`)
      expect(gitBlobSha1(bytes)).toBe(asset.derivativeGitBlobSha1)
      expect(sha256(bytes)).toBe(expected.sha256)
      expect(asset.derivativeSha256).toBe(expected.sha256)
      expect(bytes.length).toBe(expected.sizeBytes)
      expect(asset.derivativeFileSizeBytes).toBe(expected.sizeBytes)
      expect(webpDimensions(bytes)).toEqual({ width: expected.width, height: expected.height })
      expect(asset.derivativeDimensions).toEqual({ width: expected.width, height: expected.height })
      expect(asset.assetUseClassification).toBe(expected.assetUseClassification)
      expect(asset.embeddedText).toBe(expected.embeddedText)

      const source = externalById.get(asset.sourceLibraryArtifactId) as any
      expect(source).toBeDefined()
      expect(source.familyId).toBe(asset.sourceFamilyId)
      expect(source.libraryPresence).toBe('LIBRARY_PRESENT')
      expect(source.repositoryPresence).toBe('NOT_ATTESTED_ON_MAIN')
      expect(source.libraryFileId).toBe(asset.sourceLibraryFileId)
      expect(source.libraryPath).toBe(asset.sourceLibraryPath)
      expect(source.libraryMetadataEvidence.modelGenerated).toBe(true)
      expect(source.provider).toBe('UNKNOWN_OR_UNCLEARED')
      expect(source.generationTool).toBe('UNKNOWN_OR_UNCLEARED')
      expect(source.modelProduct).toBe('UNKNOWN_OR_UNCLEARED')
      expect(source.providerTermsLicenceEvidence).toBe('UNKNOWN_OR_UNCLEARED')
      expect(source.inputReferenceRightsEvidence).toBe('UNKNOWN_OR_UNCLEARED')
      expect(source.commercialUseReviewEvidence).toBe('UNKNOWN_OR_UNCLEARED')
      expect(source.redistributionReviewEvidence).toBe('UNKNOWN_OR_UNCLEARED')

      expect(inventory.runtimeArtifacts.some((runtime: any) => runtime.path === asset.path)).toBe(false)
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
    for (const collection of batchCollections) {
      expect(collection.lifecycleState).toBe('CANDIDATE')
      expect(collection.visualUseClassification).toBe('STRATEGIC_MAP_OR_REFERENCE_ONLY')
      expect(collection.localHumanScaleThirdPersonRuntime).toBe(
        'FORBIDDEN_FOR_LOCAL_HUMAN_SCALE_THIRD_PERSON_RUNTIME',
      )
      expect(collection.provenanceEvidenceState).toBe('UNKNOWN_OR_UNCLEARED')
      expect(collection.commercialUseAndRedistributionEvidence).toBe('UNKNOWN_OR_UNCLEARED')
    }

    expect(batchCollections.find((item: any) => item.collectionId.endsWith('-civic'))
      .artifactOverrides['school_01.webp'].assetUseClassification).toBe('REFERENCE_ONLY')
    expect(batchCollections.find((item: any) => item.collectionId.endsWith('-infrastructure'))
      .artifactOverrides['train_station_01.webp'].assetUseClassification).toBe('REFERENCE_ONLY')

    expect(manifest.authorityBoundary.legalCommercialQualificationAuthority).toBe('DT-13')
    expect(manifest.authorityBoundary.runtimePlacementAuthority).toBe('DT-01')
  })
})
