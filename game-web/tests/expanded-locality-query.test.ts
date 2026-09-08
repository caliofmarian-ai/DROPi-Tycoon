import { describe, expect, it } from 'vitest'
import {
  expandedBoundsIntersect,
  expandedLocalityInsideBounds,
  loadExpandedLocalitiesForViewport,
  selectExpandedLocalities,
  type ExpandedCountryIndex,
  type ExpandedLocality,
  type ExpandedLocalityJsonLoader,
  type ExpandedLocalityPartition,
} from '../src/world/expandedLocalityCatalog'

const bounds = (
  west: number,
  south: number,
  east: number,
  north: number,
  wrapsAntimeridian = false,
) => ({ west, south, east, north, wrapsAntimeridian })

const locality = (
  sourceId: number,
  longitude: number,
  latitude: number,
  importanceTier: number,
  population: number,
  name: string,
): ExpandedLocality => ({
  localityId: `dropi:locality:geonames:${sourceId}`,
  sourceRef: `geonames:${sourceId}`,
  sourceId,
  name,
  asciiName: name,
  latitude,
  longitude,
  featureCode: 'PPL',
  population,
  timezone: 'Etc/UTC',
  modifiedOn: '2026-09-08',
  admin1Code: '01',
  importanceTier,
  geometryId: '643',
})

describe('expanded locality viewport helpers', () => {
  it('handles normal and antimeridian-wrapping bounds', () => {
    expect(expandedBoundsIntersect(bounds(10, 0, 20, 10), bounds(15, 5, 25, 15))).toBe(true)
    expect(expandedBoundsIntersect(bounds(10, 0, 20, 10), bounds(30, 5, 40, 15))).toBe(false)

    const dateline = bounds(170, -10, -170, 10, true)
    expect(expandedLocalityInsideBounds({ longitude: 179, latitude: 0 }, dateline)).toBe(true)
    expect(expandedLocalityInsideBounds({ longitude: -179, latitude: 0 }, dateline)).toBe(true)
    expect(expandedLocalityInsideBounds({ longitude: 0, latitude: 0 }, dateline)).toBe(false)
    expect(expandedBoundsIntersect(dateline, bounds(175, -5, 178, 5))).toBe(true)
    expect(expandedBoundsIntersect(dateline, bounds(-178, -5, -175, 5))).toBe(true)
  })

  it('applies importance, viewport and explicit marker budget deterministically', () => {
    const candidates = [
      locality(1, 15, 5, 2, 500_000, 'Beta'),
      locality(2, 16, 5, 1, 100_000, 'Alpha'),
      locality(3, 17, 5, 1, 900_000, 'Gamma'),
      locality(4, 50, 5, 0, 2_000_000, 'Outside'),
      locality(5, 18, 5, 4, 10_000, 'Too detailed'),
    ]
    const selected = selectExpandedLocalities(candidates, bounds(10, 0, 20, 10), 2, 2)
    expect(selected.map(item => item.sourceId)).toEqual([3, 2])
    expect(() => selectExpandedLocalities(candidates, bounds(10, 0, 20, 10), 6, 2)).toThrow()
    expect(() => selectExpandedLocalities(candidates, bounds(10, 0, 20, 10), 2, 0)).toThrow()
  })

  it('loads only intersecting eligible admin partitions', async () => {
    const countryIndex: ExpandedCountryIndex = {
      version: '1.0.0',
      issue: 502,
      coverageMode: 'pilot',
      geometryId: '643',
      renderedName: 'Russia',
      countryCode: 'RU',
      recordCount: 3,
      admin1PartitionCount: 2,
      bounds: bounds(20, 40, -170, 80, true),
      partitions: [
        {
          admin1Code: '01',
          admin1Name: 'Near',
          admin1SourceRef: 'geonames:10',
          recordCount: 2,
          bestImportanceTier: 1,
          maxPopulation: 1_000_000,
          bounds: bounds(30, 50, 40, 60),
          file: 'admin1/01.json',
        },
        {
          admin1Code: '02',
          admin1Name: 'Far',
          admin1SourceRef: 'geonames:20',
          recordCount: 1,
          bestImportanceTier: 1,
          maxPopulation: 500_000,
          bounds: bounds(80, 50, 90, 60),
          file: 'admin1/02.json',
        },
      ],
      anchorReconciliation: {
        globalAnchorCount: 1,
        matchedCount: 1,
        unmatchedCount: 0,
        entries: [{
          anchorName: 'Capital',
          anchorSector: 'CAPITAL',
          anchorRole: 'capital',
          status: 'MATCHED',
          localityId: 'dropi:locality:geonames:1',
          sourceRef: 'geonames:1',
          distanceKm: 1,
        }],
      },
    }
    const nearPartition: ExpandedLocalityPartition = {
      version: '1.0.0',
      geometryId: '643',
      renderedName: 'Russia',
      countryCode: 'RU',
      admin1Code: '01',
      admin1Name: 'Near',
      admin1SourceRef: 'geonames:10',
      recordCount: 2,
      bounds: bounds(30, 50, 40, 60),
      localities: [
        locality(1, 35, 55, 1, 1_000_000, 'Capital'),
        locality(2, 36, 55, 4, 5_000, 'Small'),
      ],
    }
    const loaded: string[] = []
    const values: Record<string, unknown> = {
      'data/expanded-localities-v1/countries/643/index.json': countryIndex,
      'data/expanded-localities-v1/countries/643/admin1/01.json': nearPartition,
    }
    const loader: ExpandedLocalityJsonLoader = async <T>(url: string): Promise<T> => {
      loaded.push(url)
      if (!(url in values)) throw new Error(`unexpected load: ${url}`)
      return values[url] as T
    }

    const result = await loadExpandedLocalitiesForViewport(
      '643',
      bounds(32, 52, 38, 58),
      { maxImportanceTier: 2, maxMarkers: 10 },
      loader,
    )

    expect(result.selectedPartitionCount).toBe(1)
    expect(result.candidateCount).toBe(2)
    expect(result.localities.map(item => item.sourceId)).toEqual([1])
    expect(result.globalAnchorLocalityIds.has('dropi:locality:geonames:1')).toBe(true)
    expect(loaded).toEqual([
      'data/expanded-localities-v1/countries/643/index.json',
      'data/expanded-localities-v1/countries/643/admin1/01.json',
    ])
  })
})
