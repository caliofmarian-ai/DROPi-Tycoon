import type {
  WorldBuildingLayout,
  WorldRectLayout,
  WorldRoutePoint,
  WorldZoneId,
  WorldZoneLayout,
} from './legacyCityLayout'
import {
  CITY_DETAIL_MIN_ZOOM,
  CITY_DETAIL_SECTOR_LIMIT,
  CITY_DETAIL_SECTOR_SIZE,
  CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  CITY_PLAYABLE_SCALE_VERSION,
} from './worldScale'

/**
 * Brăila compatibility/calibration adapter for #614.
 *
 * The authoritative scale policy is global and lives in worldScale.ts. Brăila consumes that
 * World/Locality contract; it must never become a separate city-owned scale authority again.
 */
export const BRAILA_PLAYABLE_SCALE_VERSION = CITY_PLAYABLE_SCALE_VERSION
export const BRAILA_PLAYABLE_DISTANCE_SCALE = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE

/** Android detail limits are aliases of the global bounded presentation contract. */
export const BRAILA_DETAIL_SECTOR_SIZE = CITY_DETAIL_SECTOR_SIZE
export const BRAILA_DETAIL_SECTOR_LIMIT = CITY_DETAIL_SECTOR_LIMIT
export const BRAILA_DETAIL_MIN_ZOOM = CITY_DETAIL_MIN_ZOOM

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
  Number.isFinite(value) && value > 0 ? value : CITY_PLAYABLE_DISTANCE_SCALE_BASELINE

export const expandBrailaCoordinate = (
  value: number,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): number => value * finiteScale(scale)

export const expandBrailaPoint = <T extends BrailaPoint>(
  point: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => ({
  ...point,
  x: expandBrailaCoordinate(point.x, scale),
  y: expandBrailaCoordinate(point.y, scale),
})

export const expandBrailaExtent = (
  value: number,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): number => Math.ceil(expandBrailaCoordinate(value, scale))

/**
 * Legacy Brăila helper retained for compatibility. New world materialization should use worldScale.
 */
export const expandBrailaRoad = <T extends WorldRectLayout>(
  road: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
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

export const expandBrailaZone = <T extends WorldZoneLayout>(
  zone: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const center = expandBrailaPoint({ x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 }, scale)
  return { ...zone, x: center.x - zone.width / 2, y: center.y - zone.height / 2 }
}

export const expandBrailaBuilding = <T extends WorldBuildingLayout>(
  building: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
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
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => expandBrailaPoint(point, scale)

export const expandBrailaContextBuilding = <T extends BrailaContextBuilding>(
  building: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
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

export const expandBrailaLandscapeFeature = <T extends BrailaLandscapeFeature>(
  feature: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => ({
  ...feature,
  points: feature.points.map(point => expandBrailaPoint(point, scale)),
})

export interface BrailaSector { column: number; row: number; id: string }
export const brailaSectorForPoint = (
  point: BrailaPoint,
  sectorSize = CITY_DETAIL_SECTOR_SIZE,
): BrailaSector => {
  const size = Number.isFinite(sectorSize) && sectorSize > 0 ? sectorSize : CITY_DETAIL_SECTOR_SIZE
  const column = Math.max(0, Math.floor(point.x / size))
  const row = Math.max(0, Math.floor(point.y / size))
  return { column, row, id: `${column}-${row}` }
}

/**
 * Compatibility types for the existing #615 handoff. The next locality-generic spatial authority
 * may move these semantics out of this adapter without changing the global 10x scale contract.
 */
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
