import type { WorldZoneId, WorldZoneLayout } from './legacyCityLayout'
import {
  CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  CITY_PLAYABLE_SCALE_VERSION,
  PLAYABLE_CITY_DETAIL_MIN_ZOOM,
  PLAYABLE_CITY_DETAIL_SECTOR_LIMIT,
  PLAYABLE_CITY_DETAIL_SECTOR_SIZE,
  expandPlayableCityBuilding,
  expandPlayableCityContextBuilding,
  expandPlayableCityCoordinate,
  expandPlayableCityExtent,
  expandPlayableCityLandscapeFeature,
  expandPlayableCityPoint,
  expandPlayableCityRoad,
  expandPlayableCityRoutePoint,
  expandPlayableCityZone,
  playableCitySectorForPoint,
  type PlayableCityContextBuilding,
  type PlayableCityLandscapeFeature,
  type PlayableCityPoint,
  type PlayableCitySector,
} from './playableCityScale'

/**
 * Brăila is the premium calibration adapter for the reusable World/Locality scale authority.
 * Keep these aliases for current Brăila consumers while preventing Brăila from owning global policy.
 */
export const BRAILA_PLAYABLE_SCALE_VERSION = CITY_PLAYABLE_SCALE_VERSION
export const BRAILA_PLAYABLE_DISTANCE_SCALE = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE
export const BRAILA_DETAIL_SECTOR_SIZE = PLAYABLE_CITY_DETAIL_SECTOR_SIZE
export const BRAILA_DETAIL_SECTOR_LIMIT = PLAYABLE_CITY_DETAIL_SECTOR_LIMIT
export const BRAILA_DETAIL_MIN_ZOOM = PLAYABLE_CITY_DETAIL_MIN_ZOOM

export type BrailaPoint = PlayableCityPoint
export type BrailaContextBuilding = PlayableCityContextBuilding
export type BrailaLandscapeFeature = PlayableCityLandscapeFeature

export const expandBrailaCoordinate = expandPlayableCityCoordinate
export const expandBrailaPoint = expandPlayableCityPoint
export const expandBrailaExtent = expandPlayableCityExtent
export const expandBrailaRoad = expandPlayableCityRoad
export const expandBrailaZone = expandPlayableCityZone
export const expandBrailaBuilding = expandPlayableCityBuilding
export const expandBrailaRoutePoint = expandPlayableCityRoutePoint
export const expandBrailaContextBuilding = expandPlayableCityContextBuilding
export const expandBrailaLandscapeFeature = expandPlayableCityLandscapeFeature

export type BrailaSector = PlayableCitySector
export const brailaSectorForPoint = playableCitySectorForPoint

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
 * Legacy Brăila-only compatibility heuristic retained for current consumers.
 *
 * This nearest-zone relationship is visual-layout-derived and MUST NOT be interpreted as a global
 * locality connectivity/topology invariant. DT-09/DT-11 may replace/consume governed topology at
 * their authority boundary; this adapter does not author that cross-locality truth.
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
 * Brăila compatibility classification for existing #615-facing consumers only. The supplied
 * road-network distance is carried through unchanged; this function neither computes routes nor
 * establishes reusable locality adjacency authority.
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
