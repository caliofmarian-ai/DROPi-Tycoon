export interface ExpandedLocalityBounds {
  west: number
  south: number
  east: number
  north: number
  wrapsAntimeridian: boolean
}

export interface ExpandedLocality {
  localityId: string
  sourceRef: string
  sourceId: number
  name: string
  asciiName: string
  latitude: number
  longitude: number
  featureCode: string
  population: number
  timezone: string
  modifiedOn: string
  admin1Code: string
  importanceTier: number
  geometryId: string
}

export interface ExpandedLocalityPartitionMeta {
  admin1Code: string | null
  admin1Name: string | null
  admin1SourceRef: string | null
  recordCount: number
  bestImportanceTier: number
  maxPopulation: number
  bounds: ExpandedLocalityBounds
  file: string
}

export interface ExpandedAnchorReconciliationEntry {
  anchorName: string
  anchorSector: string
  anchorRole: string
  status: 'MATCHED' | 'UNMATCHED'
  localityId?: string
  sourceRef?: string
  distanceKm?: number
}

export interface ExpandedCountryIndex {
  version: string
  issue: number
  coverageMode: 'pilot' | 'global'
  geometryId: string
  renderedName: string
  countryCode: string
  recordCount: number
  admin1PartitionCount: number
  bounds: ExpandedLocalityBounds
  partitions: ExpandedLocalityPartitionMeta[]
  anchorReconciliation: {
    globalAnchorCount: number
    matchedCount: number
    unmatchedCount: number
    entries: ExpandedAnchorReconciliationEntry[]
  }
}

export interface ExpandedLocalityPartition {
  version: string
  geometryId: string
  renderedName: string
  countryCode: string
  admin1Code: string | null
  admin1Name: string | null
  admin1SourceRef: string | null
  recordCount: number
  bounds: ExpandedLocalityBounds
  localities: ExpandedLocality[]
}

export interface ExpandedLocalityQueryOptions {
  maxImportanceTier: number
  maxMarkers: number
  dataRoot?: string
}

export interface ExpandedLocalityQueryResult {
  countryIndex: ExpandedCountryIndex
  localities: ExpandedLocality[]
  selectedPartitionCount: number
  candidateCount: number
  globalAnchorLocalityIds: ReadonlySet<string>
}

export type ExpandedLocalityJsonLoader = <T>(url: string) => Promise<T>

const defaultJsonLoader: ExpandedLocalityJsonLoader = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Expanded locality request failed: ${response.status} ${url}`)
  }
  return response.json() as Promise<T>
}

const longitudeIntervals = (bounds: ExpandedLocalityBounds): Array<[number, number]> => (
  bounds.wrapsAntimeridian
    ? [[bounds.west, 180], [-180, bounds.east]]
    : [[bounds.west, bounds.east]]
)

export const expandedBoundsIntersect = (
  left: ExpandedLocalityBounds,
  right: ExpandedLocalityBounds,
): boolean => {
  if (left.north < right.south || right.north < left.south) return false
  return longitudeIntervals(left).some(([leftWest, leftEast]) => (
    longitudeIntervals(right).some(([rightWest, rightEast]) => (
      leftEast >= rightWest && rightEast >= leftWest
    ))
  ))
}

export const expandedLocalityInsideBounds = (
  locality: Pick<ExpandedLocality, 'longitude' | 'latitude'>,
  bounds: ExpandedLocalityBounds,
): boolean => {
  if (locality.latitude < bounds.south || locality.latitude > bounds.north) return false
  if (bounds.wrapsAntimeridian) {
    return locality.longitude >= bounds.west || locality.longitude <= bounds.east
  }
  return locality.longitude >= bounds.west && locality.longitude <= bounds.east
}

export const expandedPartitionsForViewport = (
  countryIndex: ExpandedCountryIndex,
  viewport: ExpandedLocalityBounds,
  maxImportanceTier: number,
): ExpandedLocalityPartitionMeta[] => countryIndex.partitions.filter(partition => (
  partition.bestImportanceTier <= maxImportanceTier
  && expandedBoundsIntersect(partition.bounds, viewport)
))

const compareRank = (left: ExpandedLocality, right: ExpandedLocality): number => {
  if (left.importanceTier !== right.importanceTier) {
    return left.importanceTier - right.importanceTier
  }
  if (left.population !== right.population) {
    return right.population - left.population
  }
  const nameOrder = left.name.localeCompare(right.name, 'en')
  if (nameOrder !== 0) return nameOrder
  return left.sourceId - right.sourceId
}

export const selectExpandedLocalities = (
  localities: ExpandedLocality[],
  viewport: ExpandedLocalityBounds,
  maxImportanceTier: number,
  maxMarkers: number,
): ExpandedLocality[] => {
  if (!Number.isInteger(maxImportanceTier) || maxImportanceTier < 0 || maxImportanceTier > 5) {
    throw new Error(`maxImportanceTier must be an integer in [0, 5], got ${maxImportanceTier}`)
  }
  if (!Number.isInteger(maxMarkers) || maxMarkers < 1) {
    throw new Error(`maxMarkers must be a positive integer, got ${maxMarkers}`)
  }
  return localities
    .filter(locality => (
      locality.importanceTier <= maxImportanceTier
      && expandedLocalityInsideBounds(locality, viewport)
    ))
    .sort(compareRank)
    .slice(0, maxMarkers)
}

export const loadExpandedLocalitiesForViewport = async (
  geometryId: string,
  viewport: ExpandedLocalityBounds,
  options: ExpandedLocalityQueryOptions,
  loadJson: ExpandedLocalityJsonLoader = defaultJsonLoader,
): Promise<ExpandedLocalityQueryResult> => {
  if (!geometryId.trim()) throw new Error('geometryId is required')
  const root = (options.dataRoot ?? 'data/expanded-localities-v1').replace(/\/$/, '')
  const encodedGeometryId = encodeURIComponent(geometryId)
  const countryRoot = `${root}/countries/${encodedGeometryId}`
  const countryIndex = await loadJson<ExpandedCountryIndex>(`${countryRoot}/index.json`)
  if (countryIndex.geometryId !== geometryId) {
    throw new Error(`Expanded locality country index mismatch: requested ${geometryId}, received ${countryIndex.geometryId}`)
  }

  const selectedPartitions = expandedPartitionsForViewport(
    countryIndex,
    viewport,
    options.maxImportanceTier,
  )
  const payloads = await Promise.all(selectedPartitions.map(partition => (
    loadJson<ExpandedLocalityPartition>(`${countryRoot}/${partition.file}`)
  )))
  const candidates = payloads.flatMap(payload => {
    if (payload.geometryId !== geometryId) {
      throw new Error(`Expanded locality partition geometry mismatch: ${payload.geometryId} != ${geometryId}`)
    }
    return payload.localities
  })
  const localities = selectExpandedLocalities(
    candidates,
    viewport,
    options.maxImportanceTier,
    options.maxMarkers,
  )
  const globalAnchorLocalityIds = new Set(
    countryIndex.anchorReconciliation.entries
      .filter(entry => entry.status === 'MATCHED' && entry.localityId)
      .map(entry => entry.localityId as string),
  )

  return {
    countryIndex,
    localities,
    selectedPartitionCount: selectedPartitions.length,
    candidateCount: candidates.length,
    globalAnchorLocalityIds,
  }
}
