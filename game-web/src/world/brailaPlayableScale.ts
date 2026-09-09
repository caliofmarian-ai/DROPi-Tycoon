import type { WorldZoneId, WorldZoneLayout } from './legacyCityLayout'
import {
  CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  CITY_PLAYABLE_SCALE_VERSION,
  PLAYABLE_CITY_DETAIL_MIN_ZOOM,
  PLAYABLE_CITY_DETAIL_SECTOR_LIMIT,
  PLAYABLE_CITY_DETAIL_SECTOR_SIZE,
  adjacentPlayableCityZoneIds,
  classifyPlayableCityRouteDistance,
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
  playableCityTravelSeconds,
  type PlayableCityContextBuilding,
  type PlayableCityLandscapeFeature,
  type PlayableCityPoint,
  type PlayableCityRoadDistanceClass,
  type PlayableCityRouteDistanceClassification,
  type PlayableCityRouteDistanceContext,
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

export type BrailaRoadDistanceClass = PlayableCityRoadDistanceClass
export interface BrailaRouteDistanceContext extends PlayableCityRouteDistanceContext<WorldZoneId> {}
export interface BrailaRouteDistanceClassification
  extends PlayableCityRouteDistanceClassification<WorldZoneId> {}

/** Compatibility adapter for Brăila consumers; generic locality topology lives in playableCityScale. */
export const brailaAdjacentDistrictIds = (
  zoneId: WorldZoneId,
  zones: readonly WorldZoneLayout[],
): readonly WorldZoneId[] => adjacentPlayableCityZoneIds(zoneId, zones)

/** Compatibility adapter for #615 while consumers migrate to the locality-generic classifier. */
export const classifyBrailaRouteDistance = (
  context: BrailaRouteDistanceContext,
  zones: readonly WorldZoneLayout[],
): BrailaRouteDistanceClassification => classifyPlayableCityRouteDistance(context, zones)

export const brailaTravelSeconds = playableCityTravelSeconds
