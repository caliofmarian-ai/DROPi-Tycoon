/**
 * Reusable World/Locality visual-distance contract.
 *
 * The 10x baseline changes gameplay separation between governed/source/generated intra-city
 * anchors. It does NOT make every locality the same size, does NOT multiply Hero-scale object
 * dimensions blindly, and must never be interpreted as surveyed metres or fabricated geography.
 *
 * Brăila is the premium calibration locality. It consumes this authority; it does not own it.
 */
export const CITY_PLAYABLE_SCALE_VERSION = 3
export const CITY_PLAYABLE_DISTANCE_SCALE_BASELINE = 10

/**
 * Android detail remains bounded independently of total locality extent. A larger city therefore
 * creates more possible sectors, never more than this many simultaneously resident detail sectors.
 */
export const PLAYABLE_CITY_DETAIL_SECTOR_SIZE = 768
export const PLAYABLE_CITY_DETAIL_SECTOR_LIMIT = 5
export const PLAYABLE_CITY_DETAIL_MIN_ZOOM = 0.4

export interface PlayableCityPoint { x: number; y: number }
export interface PlayableCityRect extends PlayableCityPoint {
  width: number
  height: number
}
export interface PlayableCityRoad extends PlayableCityRect {
  centerline?: readonly PlayableCityPoint[]
  roadWidth?: number
}
export interface PlayableCityBuilding extends PlayableCityRect {
  door: PlayableCityPoint
}
export interface PlayableCityContextBuilding extends PlayableCityRect {
  points: readonly PlayableCityPoint[]
}
export interface PlayableCityLandscapeFeature {
  points: readonly PlayableCityPoint[]
}
export interface PlayableCityZone<ZoneId extends string = string> extends PlayableCityRect {
  id: ZoneId
}

const finiteScale = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : CITY_PLAYABLE_DISTANCE_SCALE_BASELINE

export const expandPlayableCityCoordinate = (
  value: number,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): number => value * finiteScale(scale)

export const expandPlayableCityPoint = <T extends PlayableCityPoint>(
  point: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => ({
  ...point,
  x: expandPlayableCityCoordinate(point.x, scale),
  y: expandPlayableCityCoordinate(point.y, scale),
})

export const expandPlayableCityExtent = (
  value: number,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): number => Math.ceil(expandPlayableCityCoordinate(value, scale))

/**
 * Road source vertices gain playable separation while carriageway width stays Hero-readable.
 * Scaling all centerline vertices identically preserves the governed source topology.
 */
export const expandPlayableCityRoad = <T extends PlayableCityRoad>(
  road: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  if (!road.centerline?.length) return expandPlayableCityPoint(road, scale)
  const centerline = road.centerline.map(point => expandPlayableCityPoint(point, scale))
  const xs = centerline.map(point => point.x)
  const ys = centerline.map(point => point.y)
  const roadWidth = road.roadWidth ?? Math.min(road.width, road.height)
  return {
    ...road,
    centerline,
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
    width: Math.max(roadWidth, Math.max(...xs) - Math.min(...xs) + roadWidth),
    height: Math.max(roadWidth, Math.max(...ys) - Math.min(...ys) + roadWidth),
  }
}

/** Zone footprint size stays legible while its governed anchor gains playable separation. */
export const expandPlayableCityZone = <T extends PlayableCityRect>(
  zone: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const center = expandPlayableCityPoint({ x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 }, scale)
  return { ...zone, x: center.x - zone.width / 2, y: center.y - zone.height / 2 }
}

/**
 * Building footprints stay usable at Hero scale. The center follows city separation and the door
 * retains its original local offset from that building, preserving interaction attachment.
 */
export const expandPlayableCityBuilding = <T extends PlayableCityBuilding>(
  building: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const center = expandPlayableCityPoint(building, scale)
  const dx = center.x - building.x
  const dy = center.y - building.y
  return {
    ...building,
    x: center.x,
    y: center.y,
    door: { x: building.door.x + dx, y: building.door.y + dy },
  }
}

export const expandPlayableCityRoutePoint = <T extends PlayableCityPoint>(
  point: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => expandPlayableCityPoint(point, scale)

/** Context footprints retain local size; only their governed city position changes. */
export const expandPlayableCityContextBuilding = <T extends PlayableCityContextBuilding>(
  building: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const center = expandPlayableCityPoint(building, scale)
  const dx = center.x - building.x
  const dy = center.y - building.y
  return {
    ...building,
    x: center.x,
    y: center.y,
    points: building.points.map(point => ({ x: point.x + dx, y: point.y + dy })),
  }
}

/** River/park/source feature vertices retain their shape under the same separation transform. */
export const expandPlayableCityLandscapeFeature = <T extends PlayableCityLandscapeFeature>(
  feature: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => ({
  ...feature,
  points: feature.points.map(point => expandPlayableCityPoint(point, scale)),
})

export interface PlayableCitySector { column: number; row: number; id: string }
export const playableCitySectorForPoint = (
  point: PlayableCityPoint,
  sectorSize = PLAYABLE_CITY_DETAIL_SECTOR_SIZE,
): PlayableCitySector => {
  const size = Number.isFinite(sectorSize) && sectorSize > 0 ? sectorSize : PLAYABLE_CITY_DETAIL_SECTOR_SIZE
  const column = Math.max(0, Math.floor(point.x / size))
  const row = Math.max(0, Math.floor(point.y / size))
  return { column, row, id: `${column}-${row}` }
}

export type PlayableCityRoadDistanceClass = 'local' | 'adjacent-district' | 'cross-city'

export interface PlayableCityRouteDistanceContext<ZoneId extends string = string> {
  originZoneId: ZoneId
  destinationZoneId: ZoneId
  roadDistance: number
}

export interface PlayableCityRouteDistanceClassification<ZoneId extends string = string>
  extends PlayableCityRouteDistanceContext<ZoneId> {
  spatialClass: PlayableCityRoadDistanceClass
  routeDistanceValid: boolean
}

const zoneCenter = <ZoneId extends string>(zone: PlayableCityZone<ZoneId>): PlayableCityPoint => ({
  x: zone.x + zone.width / 2,
  y: zone.y + zone.height / 2,
})

const zoneDistanceSquared = <ZoneId extends string>(
  a: PlayableCityZone<ZoneId>,
  b: PlayableCityZone<ZoneId>,
): number => {
  const ac = zoneCenter(a)
  const bc = zoneCenter(b)
  const dx = ac.x - bc.x
  const dy = ac.y - bc.y
  return dx * dx + dy * dy
}

/**
 * Generic locality topology handoff for #615. Adjacency is deterministic and independent of any
 * mission quota: a zone is adjacent only when it is among the other's two nearest governed zones
 * and that relationship is mutual.
 */
export const adjacentPlayableCityZoneIds = <ZoneId extends string>(
  zoneId: ZoneId,
  zones: readonly PlayableCityZone<ZoneId>[],
): readonly ZoneId[] => {
  const origin = zones.find(zone => zone.id === zoneId)
  if (!origin) return []
  return zones
    .filter(zone => zone.id !== zoneId)
    .sort((a, b) => zoneDistanceSquared(origin, a) - zoneDistanceSquared(origin, b) || a.id.localeCompare(b.id))
    .slice(0, 2)
    .map(zone => zone.id)
}

/**
 * Spatial class comes from governed locality topology. Authoritative road-network distance remains
 * a separate metric and invalid distance fails closed instead of being replaced by straight-line
 * distance.
 */
export const classifyPlayableCityRouteDistance = <ZoneId extends string>(
  context: PlayableCityRouteDistanceContext<ZoneId>,
  zones: readonly PlayableCityZone<ZoneId>[],
): PlayableCityRouteDistanceClassification<ZoneId> => {
  const origin = zones.find(zone => zone.id === context.originZoneId)
  const destination = zones.find(zone => zone.id === context.destinationZoneId)
  const routeDistanceValid = Number.isFinite(context.roadDistance) && context.roadDistance >= 0

  let spatialClass: PlayableCityRoadDistanceClass = 'cross-city'
  if (origin && destination) {
    if (origin.id === destination.id) {
      spatialClass = 'local'
    } else {
      const originNeighbors = adjacentPlayableCityZoneIds(origin.id, zones)
      const destinationNeighbors = adjacentPlayableCityZoneIds(destination.id, zones)
      if (originNeighbors.includes(destination.id) && destinationNeighbors.includes(origin.id)) {
        spatialClass = 'adjacent-district'
      }
    }
  }

  return { ...context, spatialClass, routeDistanceValid }
}

export const playableCityTravelSeconds = (roadDistance: number, movementSpeed: number): number =>
  Number.isFinite(roadDistance) && roadDistance >= 0 && Number.isFinite(movementSpeed) && movementSpeed > 0
    ? roadDistance / movementSpeed
    : Number.POSITIVE_INFINITY
