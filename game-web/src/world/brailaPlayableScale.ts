import type {
  WorldBuildingLayout,
  WorldRectLayout,
  WorldRoutePoint,
  WorldZoneId,
  WorldZoneLayout,
} from './legacyCityLayout'

/**
 * #614 canonical Brăila gameplay-distance contract.
 *
 * The retained OSM geometry remains the geographic source of truth. This multiplier deliberately
 * changes only the *playable separation* between source-backed coordinates so Brăila reads as a
 * real playable city rather than a compact board. It must never be interpreted as surveyed metres
 * or used to fabricate latitude/longitude.
 */
export const BRAILA_PLAYABLE_SCALE_VERSION = 3
export const BRAILA_PLAYABLE_DISTANCE_SCALE = 10

/**
 * Android detail presentation remains strictly local. DT-04 owns the downstream performance
 * guardrail and requires no more than five resident streamed/detail sectors at once.
 */
export const BRAILA_DETAIL_SECTOR_SIZE = 768
export const BRAILA_DETAIL_SECTOR_LIMIT = 5
export const BRAILA_DETAIL_MIN_ZOOM = 0.4

export interface BrailaPoint { x: number; y: number }
export interface BrailaContextBuilding extends BrailaPoint {
  width: number
  height: number
  points: readonly BrailaPoint[]
}
export interface BrailaLandscapeFeature {
  id: string
  name: string
  kind: string
  points: readonly BrailaPoint[]
}

const finiteScale = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : BRAILA_PLAYABLE_DISTANCE_SCALE

export const expandBrailaCoordinate = (
  value: number,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): number => value * finiteScale(scale)

export const expandBrailaPoint = <T extends BrailaPoint>(
  point: T,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): T => ({
  ...point,
  x: expandBrailaCoordinate(point.x, scale),
  y: expandBrailaCoordinate(point.y, scale),
})

export const expandBrailaExtent = (
  value: number,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): number => Math.ceil(expandBrailaCoordinate(value, scale))

/**
 * Roads become longer while preserving their mobile-readable carriageway width. Source vertices
 * are scaled identically, so real OSM junction connectivity remains exact and route finding does
 * not gain invented links.
 */
export const expandBrailaRoad = <T extends WorldRectLayout>(
  road: T,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): T => {
  if (!road.centerline?.length) return expandBrailaPoint(road, scale)
  const centerline = road.centerline.map(point => expandBrailaPoint(point, scale))
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

/** District footprint size stays readable while its source-backed anchor gains real separation. */
export const expandBrailaZone = <T extends WorldZoneLayout>(
  zone: T,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): T => {
  const center = expandBrailaPoint({ x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 }, scale)
  return { ...zone, x: center.x - zone.width / 2, y: center.y - zone.height / 2 }
}

/**
 * Gameplay building footprints stay usable at Hero scale. Their centers move with the city and
 * their door keeps its local offset, so interactions remain attached to the same building.
 */
export const expandBrailaBuilding = <T extends WorldBuildingLayout>(
  building: T,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): T => {
  const center = expandBrailaPoint(building, scale)
  const dx = center.x - building.x
  const dy = center.y - building.y
  return {
    ...building,
    x: center.x,
    y: center.y,
    door: { x: building.door.x + dx, y: building.door.y + dy },
  }
}

export const expandBrailaRoutePoint = <T extends WorldRoutePoint>(
  point: T,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): T => expandBrailaPoint(point, scale)

/**
 * Real context footprints keep their local building size; only the urban spacing between their
 * source-backed centers expands. This avoids making houses 10x wider while still removing the
 * miniature-board density.
 */
export const expandBrailaContextBuilding = <T extends BrailaContextBuilding>(
  building: T,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): T => {
  const center = expandBrailaPoint(building, scale)
  const dx = center.x - building.x
  const dy = center.y - building.y
  return {
    ...building,
    x: center.x,
    y: center.y,
    points: building.points.map(point => ({ x: point.x + dx, y: point.y + dy })),
  }
}

/** River/park centerlines retain their source shape while gaining the same city-distance scale. */
export const expandBrailaLandscapeFeature = <T extends BrailaLandscapeFeature>(
  feature: T,
  scale = BRAILA_PLAYABLE_DISTANCE_SCALE,
): T => ({
  ...feature,
  points: feature.points.map(point => expandBrailaPoint(point, scale)),
})

export interface BrailaSector { column: number; row: number; id: string }
export const brailaSectorForPoint = (
  point: BrailaPoint,
  sectorSize = BRAILA_DETAIL_SECTOR_SIZE,
): BrailaSector => {
  const size = Number.isFinite(sectorSize) && sectorSize > 0 ? sectorSize : BRAILA_DETAIL_SECTOR_SIZE
  const column = Math.max(0, Math.floor(point.x / size))
  const row = Math.max(0, Math.floor(point.y / size))
  return { column, row, id: `${column}-${row}` }
}

export type BrailaRoadDistanceClass = 'local' | 'adjacent-district' | 'cross-city'

export interface BrailaRouteDistanceContext {
  originZoneId: WorldZoneId
  destinationZoneId: WorldZoneId
  roadDistance: number
}

export interface BrailaRouteDistanceClassification extends BrailaRouteDistanceContext {
  spatialClass: BrailaRoadDistanceClass
  routeDistanceValid: boolean
}

const zoneCenter = (zone: WorldZoneLayout): BrailaPoint => ({
  x: zone.x + zone.width / 2,
  y: zone.y + zone.height / 2,
})

const zoneDistanceSquared = (a: WorldZoneLayout, b: WorldZoneLayout): number => {
  const ac = zoneCenter(a)
  const bc = zoneCenter(b)
  const dx = ac.x - bc.x
  const dy = ac.y - bc.y
  return dx * dx + dy * dy
}

/**
 * District adjacency is derived from the enlarged governed city structure, not mission quotas.
 * Two districts are adjacent when each is among the other's two closest district identities.
 * This gives #615 a stable spatial class while authoritative road-network distance remains an
 * independent metric for reward/time logic.
 */
export const brailaAdjacentDistrictIds = (
  zoneId: WorldZoneId,
  zones: readonly WorldZoneLayout[],
): readonly WorldZoneId[] => {
  const origin = zones.find(zone => zone.id === zoneId)
  if (!origin) return []
  return zones
    .filter(zone => zone.id !== zoneId)
    .sort((a, b) => zoneDistanceSquared(origin, a) - zoneDistanceSquared(origin, b) || a.id.localeCompare(b.id))
    .slice(0, 2)
    .map(zone => zone.id)
}

/**
 * #615 handoff: classify spatial context from stable district topology and carry the already-
 * computed road-network distance beside it. Straight-line distance is never substituted for road
 * authority, and invalid road distance fails closed through routeDistanceValid=false.
 */
export const classifyBrailaRouteDistance = (
  context: BrailaRouteDistanceContext,
  zones: readonly WorldZoneLayout[],
): BrailaRouteDistanceClassification => {
  const origin = zones.find(zone => zone.id === context.originZoneId)
  const destination = zones.find(zone => zone.id === context.destinationZoneId)
  const routeDistanceValid = Number.isFinite(context.roadDistance) && context.roadDistance >= 0

  let spatialClass: BrailaRoadDistanceClass = 'cross-city'
  if (origin && destination) {
    if (origin.id === destination.id) {
      spatialClass = 'local'
    } else {
      const originNeighbors = brailaAdjacentDistrictIds(origin.id, zones)
      const destinationNeighbors = brailaAdjacentDistrictIds(destination.id, zones)
      if (originNeighbors.includes(destination.id) && destinationNeighbors.includes(origin.id)) {
        spatialClass = 'adjacent-district'
      }
    }
  }

  return { ...context, spatialClass, routeDistanceValid }
}

export const brailaTravelSeconds = (roadDistance: number, movementSpeed: number): number =>
  Number.isFinite(roadDistance) && roadDistance >= 0 && Number.isFinite(movementSpeed) && movementSpeed > 0
    ? roadDistance / movementSpeed
    : Number.POSITIVE_INFINITY
