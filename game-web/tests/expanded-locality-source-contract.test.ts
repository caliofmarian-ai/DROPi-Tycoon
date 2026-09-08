import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const registry = JSON.parse(readFileSync(
  new URL('../../04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_REGISTRY.json', import.meta.url),
  'utf8',
)) as any

const architecture = readFileSync(
  new URL('../../04_World/LOCALITY_LOD_ARCHITECTURE.md', import.meta.url),
  'utf8',
)

const sparseCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-representative-localities-v1.json', import.meta.url),
  'utf8',
)) as { version: string; countries: Record<string, unknown[]> }

describe('expanded locality source contract #502', () => {
  it('selects GeoNames cities500 under an explicit commercial-use attribution license', () => {
    expect(registry.version).toBe('1.0.0')
    expect(registry.issue).toBe(502)
    expect(registry.selectedSourceId).toBe('geonames-cities500')
    const source = registry.sources['geonames-cities500']
    expect(source.license).toBe('Creative Commons Attribution 4.0')
    expect(source.commercialUseAllowed).toBe(true)
    expect(source.attributionRequired).toBe(true)
    expect(source.sourceIdentityField).toBe('geonameid')
    expect(source.url).toBe('https://download.geonames.org/export/dump/cities500.zip')
  })

  it('records a validated large global snapshot without committing the raw archive in this slice', () => {
    const snapshot = registry.observedSnapshot.cities500
    expect(snapshot.records).toBeGreaterThan(150_000)
    expect(snapshot.uniqueGeonameIds).toBe(snapshot.records)
    expect(snapshot.countriesOrTerritoriesWithRecords).toBeGreaterThan(150)
    expect(snapshot.sha256).toMatch(/^[0-9a-f]{64}$/)
    for (const code of ['RU', 'CA', 'AU', 'BR', 'US', 'IN', 'DE', 'RO', 'IE']) {
      expect(snapshot.sampleCountryRecordCounts[code]).toBeGreaterThan(0)
    }
    expect(registry.governance.rawUpstreamArchiveCommittedInThisSlice).toBe(false)
    expect(registry.governance.rawSnapshotRetentionRequiredBeforeProductionCatalogMerge).toBe(true)
  })

  it('preserves Natural Earth sparse anchors as Global LOD instead of replacing them', () => {
    expect(sparseCatalog.version).toBe('1.9.0')
    const total = Object.values(sparseCatalog.countries).reduce((sum, nodes) => sum + nodes.length, 0)
    expect(total).toBe(1356)
    expect(registry.governance.currentSparseCatalogRemainsGlobalLod).toBe(true)
    expect(registry.sources['natural-earth-sparse-anchors'].role).toContain('not replaced')
    expect(architecture).toContain('LOD 0 — Global anchors')
    expect(architecture).toContain('LOD 2 — Region localities')
  })

  it('keeps source country codes subordinate to DROPi geometry and special-status governance', () => {
    expect(registry.governance.sourceCountryCodeIsMetadataNotSovereigntyAssertion).toBe(true)
    expect(registry.governance.dropiGeometryOwnershipMustBeResolvedAndAuditedSeparately).toBe(true)
    expect(registry.governance.specialStatusSemanticsRemainAuthoritative).toBe(true)
    expect(architecture).toContain('must never directly become authoritative gameplay sovereignty')
  })
})
