export interface MapPoint {
  x: number
  y: number
}

export interface MapBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export type MapRing = MapPoint[]
export type MapPolygon = MapRing[]

export interface GlobalCountryGeometry {
  id: string
  name: string
  polygons: MapPolygon[]
  primaryBounds: MapBounds
  area: number
}

interface TopologyTransform {
  scale: [number, number]
  translate: [number, number]
}

interface TopologyBaseGeometry {
  id?: string | number
  properties?: { name?: string }
}

interface TopologyPolygonGeometry extends TopologyBaseGeometry {
  type: 'Polygon'
  arcs: number[][]
}

interface TopologyMultiPolygonGeometry extends TopologyBaseGeometry {
  type: 'MultiPolygon'
  arcs: number[][][]
}

export type TopologyCountryGeometry = TopologyPolygonGeometry | TopologyMultiPolygonGeometry

export interface WorldTopology {
  type: 'Topology'
  transform?: TopologyTransform
  arcs: number[][][]
  objects: {
    countries: {
      type: 'GeometryCollection'
      geometries: TopologyCountryGeometry[]
    }
  }
}

interface LonLat {
  lon: number
  lat: number
}

const finitePoint = (point: MapPoint): boolean => Number.isFinite(point.x) && Number.isFinite(point.y)

const decodeArc = (topology: WorldTopology, ref: number): LonLat[] => {
  const reverse = ref < 0
  const index = reverse ? ~ref : ref
  const raw = topology.arcs[index]
  if (!raw) return []

  const scale = topology.transform?.scale ?? [1, 1]
  const translate = topology.transform?.translate ?? [0, 0]
  let x = 0
  let y = 0
  const points = raw.map(([dx = 0, dy = 0]) => {
    x += dx
    y += dy
    return {
      lon: x * scale[0] + translate[0],
      lat: y * scale[1] + translate[1],
    }
  })
  return reverse ? points.reverse() : points
}

const stitchRing = (topology: WorldTopology, refs: number[]): LonLat[] => {
  const points: LonLat[] = []
  refs.forEach((ref, index) => {
    const arc = decodeArc(topology, ref)
    points.push(...(index === 0 ? arc : arc.slice(1)))
  })
  return points
}

/** Keep a ring continuous around the antimeridian instead of drawing a line across the whole map. */
const unwrapLongitudes = (points: LonLat[]): LonLat[] => {
  if (points.length === 0) return []
  const result: LonLat[] = [{ ...points[0] }]
  let offset = 0
  let previous = points[0].lon

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index]
    let longitude = point.lon + offset
    while (longitude - previous > 180) {
      offset -= 360
      longitude = point.lon + offset
    }
    while (longitude - previous < -180) {
      offset += 360
      longitude = point.lon + offset
    }
    result.push({ lon: longitude, lat: point.lat })
    previous = longitude
  }
  return result
}

const projectRing = (points: LonLat[], width: number, height: number): MapRing =>
  unwrapLongitudes(points)
    .map(point => ({
      x: (point.lon + 180) / 360 * width,
      y: (90 - point.lat) / 180 * height,
    }))
    .filter(finitePoint)

const ringBounds = (ring: MapRing): MapBounds => {
  if (ring.length === 0) return { left: 0, top: 0, right: 0, bottom: 0 }
  return ring.reduce<MapBounds>((bounds, point) => ({
    left: Math.min(bounds.left, point.x),
    top: Math.min(bounds.top, point.y),
    right: Math.max(bounds.right, point.x),
    bottom: Math.max(bounds.bottom, point.y),
  }), { left: ring[0].x, top: ring[0].y, right: ring[0].x, bottom: ring[0].y })
}

const ringArea = (ring: MapRing): number => {
  if (ring.length < 3) return 0
  let sum = 0
  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index]
    const next = ring[(index + 1) % ring.length]
    sum += current.x * next.y - next.x * current.y
  }
  return Math.abs(sum) / 2
}

const decodePolygon = (
  topology: WorldTopology,
  rings: number[][],
  width: number,
  height: number,
): MapPolygon => rings
  .map(refs => projectRing(stitchRing(topology, refs), width, height))
  .filter(ring => ring.length >= 3)

export const decodeWorldTopology = (
  topology: WorldTopology,
  width: number,
  height: number,
): GlobalCountryGeometry[] => {
  if (topology.type !== 'Topology' || !Array.isArray(topology.arcs)) return []
  const geometries = topology.objects?.countries?.geometries
  if (!Array.isArray(geometries)) return []

  return geometries.flatMap((geometry, index) => {
    const polygons = geometry.type === 'Polygon'
      ? [decodePolygon(topology, geometry.arcs, width, height)]
      : geometry.arcs.map(polygon => decodePolygon(topology, polygon, width, height))
    const valid = polygons.filter(polygon => polygon[0]?.length >= 3)
    if (valid.length === 0) return []

    let primary = valid[0][0]
    let primaryArea = ringArea(primary)
    let area = 0
    for (const polygon of valid) {
      const outer = polygon[0]
      const candidateArea = ringArea(outer)
      area += candidateArea
      if (candidateArea > primaryArea) {
        primary = outer
        primaryArea = candidateArea
      }
    }

    return [{
      id: String(geometry.id ?? index),
      name: geometry.properties?.name?.trim() || `Country ${geometry.id ?? index}`,
      polygons: valid,
      primaryBounds: ringBounds(primary),
      area,
    }]
  })
}

export const pointInRing = (point: MapPoint, ring: MapRing): boolean => {
  let inside = false
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current, current += 1) {
    const a = ring[current]
    const b = ring[previous]
    const crosses = (a.y > point.y) !== (b.y > point.y) &&
      point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || Number.EPSILON) + a.x
    if (crosses) inside = !inside
  }
  return inside
}

const countryContainsPoint = (country: GlobalCountryGeometry, point: MapPoint, mapWidth: number): boolean => {
  for (const polygon of country.polygons) {
    const outer = polygon[0]
    for (const shift of [-mapWidth, 0, mapWidth]) {
      if (pointInRing({ x: point.x - shift, y: point.y }, outer)) return true
    }
  }
  return false
}

/** Prefer the smallest containing geometry so enclaves/small neighbors are not hidden by larger polygons. */
export const countryAtMapPoint = (
  countries: GlobalCountryGeometry[],
  point: MapPoint,
  mapWidth: number,
): GlobalCountryGeometry | null => {
  const matches = countries.filter(country => countryContainsPoint(country, point, mapWidth))
  return matches.sort((a, b) => a.area - b.area)[0] ?? null
}

export const wrappedRingCopies = (ring: MapRing, mapWidth: number): MapRing[] => {
  const bounds = ringBounds(ring)
  const shifts = [-mapWidth, 0, mapWidth]
  return shifts
    .filter(shift => bounds.right + shift >= 0 && bounds.left + shift <= mapWidth)
    .map(shift => ring.map(point => ({ x: point.x + shift, y: point.y })))
}

export const boundsCenter = (bounds: MapBounds): MapPoint => ({
  x: (bounds.left + bounds.right) / 2,
  y: (bounds.top + bounds.bottom) / 2,
})
