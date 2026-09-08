import type { MapPoint } from './globalMapTopology'

export type CountryLocalityRole = 'capital' | 'urban' | 'secondary'
export type CountryLocalitySector = 'CAPITAL' | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export interface CountryLocalityNode {
  name: string
  role: CountryLocalityRole
  sector: CountryLocalitySector
  longitude: number
  latitude: number
  populationReference: number
  admin1: string
  sourceFeatureClass: string
}

export interface CountryLocalityCatalog {
  version: string
  source: {
    name: string
    upstreamCommit: string
    license: string
  }
  stats: {
    renderedCountries: number
    countriesWithRepresentativeNodes: number
    capitalNodes: number
    totalRepresentativeNodes: number
    maxNodesPerCountry: number
  }
  countries: Record<string, CountryLocalityNode[]>
}

export const localityNodesForCountry = (
  catalog: CountryLocalityCatalog | null | undefined,
  countryId: string,
): CountryLocalityNode[] => catalog?.countries?.[countryId] ?? []

export const projectLocalityToGlobalMap = (
  node: Pick<CountryLocalityNode, 'longitude' | 'latitude'>,
  width: number,
  height: number,
): MapPoint => ({
  x: (node.longitude + 180) / 360 * width,
  y: (90 - node.latitude) / 180 * height,
})

export const nearestLocalityNode = (
  nodes: CountryLocalityNode[],
  point: MapPoint,
  width: number,
  height: number,
  maxDistance: number,
): CountryLocalityNode | null => {
  let winner: CountryLocalityNode | null = null
  let bestDistance = maxDistance
  for (const node of nodes) {
    const projected = projectLocalityToGlobalMap(node, width, height)
    const distance = Math.hypot(projected.x - point.x, projected.y - point.y)
    if (distance <= bestDistance) {
      winner = node
      bestDistance = distance
    }
  }
  return winner
}
