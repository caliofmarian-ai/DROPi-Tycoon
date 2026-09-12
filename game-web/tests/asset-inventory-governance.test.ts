import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const inventoryPath = fileURLToPath(
  new URL('../../08_Assets/Production/asset-inventory.v1.json', import.meta.url),
)
const verifierPath = fileURLToPath(
  new URL('../../08_Assets/Production/Tools/verify_asset_inventory.mjs', import.meta.url),
)

const legalQualificationContract = '09_Development/Compliance/GLOBAL_ASSET_PROVENANCE_CONTRACT_565_643.md'
const runtimeEvidenceManifest = 'game-web/public/legal/runtime-provenance.json'
const tempDirs: string[] = []

function loadInventory(): any {
  return JSON.parse(readFileSync(inventoryPath, 'utf8'))
}

function runVerifier(fixturePath = inventoryPath) {
  return spawnSync(
    process.execPath,
    [verifierPath, '--repo-root', repoRoot, '--inventory', fixturePath],
    { encoding: 'utf8' },
  )
}

function writeFixture(inventory: any) {
  const dir = mkdtempSync(join(tmpdir(), 'dropi-dt19-assets-'))
  tempDirs.push(dir)
  const path = join(dir, 'asset-inventory.json')
  writeFileSync(path, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')
  return path
}

afterEach(() => {
  while (tempDirs.length > 0) rmSync(tempDirs.pop()!, { recursive: true, force: true })
})

describe('ISSUE-414 — DT-19 asset inventory and dedup authority', () => {
  it('verifies current canonical families, Library audit, candidate inventory, runtime lineage and declared exact reuse', () => {
    const inventory = loadInventory()
    expect(inventory.policyRefs.legalQualificationContract).toBe(legalQualificationContract)
    expect(inventory.policyRefs.runtimeEvidenceManifest).toBe(runtimeEvidenceManifest)
    expect(inventory.policyRefs.legalReleaseAuthority).toBeUndefined()
    expect(inventory.authorityBoundary.productionLifecycleAuthority).toBe('DT-19')
    expect(inventory.authorityBoundary.legalQualificationAuthority).toBe('DT-13')
    expect(inventory.presenceModel.ingestionOwner).toBe('#413')
    expect(inventory.collections.find((item: any) => item.collectionId === 'legacy-board-crops-v1')?.lifecycleState).toBe('CANDIDATE')

    const civicFamily = inventory.registeredFamilies.find(
      (family: any) => family.familyId === 'SRC-20260907-002',
    )
    expect(civicFamily.libraryPresence).toBe('LIBRARY_PRESENT')
    expect(civicFamily.repositoryPresence).toBe('REPOSITORY_ATTESTED_DERIVATIVES_ONLY')

    const initialFamily = inventory.registeredFamilies.find(
      (family: any) => family.familyId === 'SRC-20260907-001',
    )
    expect(initialFamily.libraryPresence).toBe('LIBRARY_PRESENT')
    expect(initialFamily.repositoryPresence).toBe('REPOSITORY_ATTESTED_DERIVATIVES_ONLY')

    const q55 = inventory.externalLibraryArtifacts.find(
      (artifact: any) => artifact.artifactId === 'library-crops-q55',
    )
    const q68 = inventory.externalLibraryArtifacts.find(
      (artifact: any) => artifact.artifactId === 'library-crops-q68',
    )
    expect(q55.libraryPresence).toBe('LIBRARY_PRESENT')
    expect(q55.repositoryPresence).toBe('NOT_ATTESTED_ON_MAIN')
    expect(q55.memberAssetCount).toBe(50)
    expect(q68.libraryPresence).toBe('LIBRARY_PRESENT')
    expect(q68.repositoryPresence).toBe('NOT_ATTESTED_ON_MAIN')
    expect(q68.memberAssetCount).toBe(50)

    const historicalPackage = inventory.documentedPackages.find(
      (item: any) => item.packageId === 'batch-001-extracted-candidate-package',
    )
    expect(historicalPackage.libraryPresence).toBe('LIBRARY_NOT_FOUND_IN_AUDIT')
    expect(historicalPackage.repositoryPresence).toBe('NOT_ATTESTED_ON_MAIN')

    const result = runVerifier()

    expect(result.status, result.stderr).toBe(0)
    const summary = JSON.parse(result.stdout.trim())
    expect(summary.ok).toBe(true)
    expect(summary.families).toBeGreaterThanOrEqual(11)
    expect(summary.collections).toBe(4)
    expect(summary.externalLibraryArtifacts).toBe(13)
    expect(summary.inventoriedArtifacts).toBeGreaterThanOrEqual(67)
    expect(summary.runtimeArtifacts).toBe(13)
    expect(summary.declaredReuseSets).toBeGreaterThanOrEqual(2)
  })

  it('fails closed when runtime evidence is relabeled as the legal release authority', () => {
    const inventory = loadInventory()
    inventory.policyRefs.legalReleaseAuthority = runtimeEvidenceManifest

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('legalReleaseAuthority is forbidden')
    expect(result.stderr).toContain('runtime evidence is not the DT-13 legal qualification authority')
  })

  it('fails closed when the DT-13 qualification contract is replaced by the runtime evidence manifest', () => {
    const inventory = loadInventory()
    inventory.policyRefs.legalQualificationContract = runtimeEvidenceManifest
    inventory.authorityBoundary.legalQualificationContractRef = runtimeEvidenceManifest

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('policyRefs.legalQualificationContract must equal')
    expect(result.stderr).toContain(legalQualificationContract)
  })

  it('fails closed when the runtime evidence manifest is replaced by the DT-13 qualification contract', () => {
    const inventory = loadInventory()
    inventory.policyRefs.runtimeEvidenceManifest = legalQualificationContract
    inventory.authorityBoundary.runtimeEvidenceManifestRef = legalQualificationContract

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('policyRefs.runtimeEvidenceManifest must equal')
    expect(result.stderr).toContain(runtimeEvidenceManifest)
  })

  it('fails closed when a runtime artifact labels evidence as legal authority', () => {
    const inventory = loadInventory()
    const ordersIcon = inventory.runtimeArtifacts.find(
      (asset: any) => asset.assetId === 'runtime-orders-icon',
    )
    ordersIcon.legalEvidenceRef = ordersIcon.runtimeEvidenceRef
    delete ordersIcon.runtimeEvidenceRef

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('uses deprecated legalEvidenceRef')
  })

  it('fails closed when DT-19 registry tries to write a DT-13 legal qualification verdict', () => {
    const inventory = loadInventory()
    inventory.registeredFamilies[0].legalStatus = 'CLEARED'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('DT-19 registry must not define legal qualification field')
    expect(result.stderr).toContain('DT-13 owns legal/licence/provenance qualification')
  })

  it('keeps the mirrored legacy board crops at CANDIDATE until a real promotion gate exists', () => {
    const inventory = loadInventory()
    const collection = inventory.collections.find(
      (item: any) => item.collectionId === 'legacy-board-crops-v1',
    )
    collection.lifecycleState = 'APPROVED_SOURCE'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('legacy-board-crops-v1 must remain CANDIDATE')
    expect(result.stderr).toContain('does not grant APPROVED_SOURCE')
  })

  it('fails closed when Library presence is rewritten as repository attestation without repository ingestion', () => {
    const inventory = loadInventory()
    const civicBoard = inventory.externalLibraryArtifacts.find(
      (artifact: any) => artifact.artifactId === 'library-source-board-src-20260907-002',
    )
    civicBoard.repositoryPresence = 'REPOSITORY_ATTESTED'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('cannot become REPOSITORY_ATTESTED from Library presence alone')
  })

  it('fails closed when a Library-present source loses its persistent Library identity evidence', () => {
    const inventory = loadInventory()
    const natureBoard = inventory.externalLibraryArtifacts.find(
      (artifact: any) => artifact.artifactId === 'library-source-board-src-20260907-009',
    )
    delete natureBoard.libraryFileId

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('must retain libraryFileId audit evidence')
  })

  it('fails closed when #414 tries to take Library ingestion ownership from #413', () => {
    const inventory = loadInventory()
    inventory.presenceModel.ingestionOwner = '#414'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('ingestionOwner must remain #413')
    expect(result.stderr).toContain('#414 does not ingest Library binaries')
  })

  it('fails closed when an exact duplicate is no longer declared as intentional reuse', () => {
    const inventory = loadInventory()
    const mobileLogo = inventory.runtimeArtifacts.find(
      (asset: any) => asset.assetId === 'runtime-mobile-brand-logo',
    )
    delete mobileLogo.reuseGroup

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('must share one declared reuseGroup')
    expect(result.stderr).toContain('dropi-tycoon-logo.png')
  })

  it('fails closed when a lifecycle state is promoted without every preceding gate', () => {
    const inventory = loadInventory()
    const ordersIcon = inventory.runtimeArtifacts.find(
      (asset: any) => asset.assetId === 'runtime-orders-icon',
    )
    ordersIcon.lifecycleState = 'ANDROID_VERIFIED'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('missing lifecycle evidence for ANDROID_VERIFIED')
  })

  it('fails closed when the registry claims a runtime asset that is not present', () => {
    const inventory = loadInventory()
    inventory.runtimeArtifacts[0].path = 'game-web/public/assets/production/not-present.webp'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('references missing file')
  })
})
