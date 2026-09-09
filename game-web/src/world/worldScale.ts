import type {
  WorldBuildingLayout,
  WorldRectLayout,
  WorldRoutePoint,
  WorldZoneLayout,
} from './legacyCityLayout'

/**
 * #614 global World/Locality playable-distance authority.
 *
 * Every governed playable locality consumes this same baseline. Localities keep different total
 * sizes because their source/generated footprints, topology and development extent differ; the
 * baseline itself does not vary by city identity.
 */
export const CITY_PLAYABLE_SCALE_VERSION = 1
export const CITY_PLAYABLE_DISTANCE_SCALE_BASELINE = 10

/** Large-city Android presentation budgets stay bounded while total city sector count may grow. */
export const CITY_DETAIL_SECTOR_SIZE = 768
export const CITY_DETAIL_SECTOR_LIMIT = 5
export const CITY_DETAIL_MIN_ZOOM = 0.4

export interface CityPlayableScaleContract {
  localityId: string
  scaleVersion: number
  playableDistanceScale: number
}

export interface CityScalePoint { x: number; y: number }
export interface CityContextBuilding extends CityScalePoint {
  width: number
  height: number
  points: readonly CityScalePoint[]
}
export interface CityLandscapeFeature {
  id: string
  name: string
  kind: string
  points: readonly CityScalePoint[]
}

export const cityPlayableScaleForLocality = (localityId: string): CityPlayableScaleContract => {
  const normalized = localityId.trim()
  if (!normalized) throw new Error('Playable city scale requires a stable locality identity')
  return {
    localityId: normalized,
    scaleVersion: CITY_PLAYABLE_SCALE_VERSION,
    playableDistanceScale: CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  }
}

const finiteScale = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : CITY_PLAYABLE_DISTANCE_SCALE_BASELINE

export const scaleCityCoordinate = (
  value: number,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): number => value * finiteScale(scale)

export const scaleCityPoint = <T extends CityScalePoint>(
  point: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => ({
  ...point,
  x: scaleCityCoordinate(point.x, scale),
  y: scaleCityCoordinate(point.y, scale),
})

export const scaleCityExtent = (
  value: number,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): number => Math.ceil(scaleCityCoordinate(value, scale))

/**
 * Roads become longer/separated while retaining a usable carriageway width. Centerline vertices
 * keep their authored/source connectivity; no road or junction is invented by the transform.
 */
export const scaleCityRoad = <T extends WorldRectLayout>(
  road: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const appliedScale = finiteScale(scale)
  const roadWidth = road.roadWidth ?? Math.min(road.width, road.height)

  if (!road.centerline?.length) {
    const center = scaleCityPoint(road, appliedScale)
    const horizontal = road.width >= road.height
    return {
      ...center,
      width: horizontal ? scaleCityExtent(road.width, appliedScale) : roadWidth,
      height: horizontal ? roadWidth : scaleCityExtent(road.height, appliedScale),
      roadWidth,
    }
  }

  const centerline = road.centerline.map(point => scaleCityPoint(point, appliedScale))
  const xs = centerline.map(point => point.x)
  const ys = centerline.map(point => point.y)
  return {
    ...road,
    centerline,
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
    width: Math.max(roadWidth, Math.max(...xs) - Math.min(...xs) + roadWidth),
    height: Math.max(roadWidth, Math.max(...ys) - Math.min(...ys) + roadWidth),
    roadWidth,
  }
}

/** District footprints remain locally readable while their governed city positions separate. */
export const scaleCityZone = <T extends WorldZoneLayout>(
  zone: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const center = scaleCityPoint(
    { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 },
    scale,
  )
  return { ...zone, x: center.x - zone.width / 2, y: center.y - zone.height / 2 }
}

/**
 * Building footprints remain Hero-readable. The center moves through the global city transform and
 * the door follows the same translation, preserving its local attachment to the building.
 */
export const scaleCityBuilding = <T extends WorldBuildingLayout>(
  building: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const center = scaleCityPoint(building, scale)
  const dx = center.x - building.x
  const dy = center.y - building.y
  return {
    ...building,
    x: center.x,
    y: center.y,
    door: { x: building.door.x + dx, y: building.door.y + dy },
  }
}

/**
 * A pickup/drop-off bound to a building follows that building's translation instead of being
 * blindly scaled away from its door. Unbound/generated points still consume the global transform.
 */
export const scaleCityRoutePoint = <T extends WorldRoutePoint>(
  point: T,
  sourceBuilding?: WorldBuildingLayout,
  playableBuilding?: WorldBuildingLayout,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  if (sourceBuilding && playableBuilding) {
    return {
      ...point,
      x: point.x + playableBuilding.x - sourceBuilding.x,
      y: point.y + playableBuilding.y - sourceBuilding.y,
    }
  }
  return scaleCityPoint(point, scale)
}

/** Context structures keep their local footprint; their source-backed centers gain city spacing. */
export const scaleCityContextBuilding = <T extends CityContextBuilding>(
  building: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const center = scaleCityPoint(building, scale)
  const dx = center.x - building.x
  const dy = center.y - building.y
  return {
    ...building,
    x: center.x,
    y: center.y,
    points: building.points.map(point => ({ x: point.x + dx, y: point.y + dy })),
  }
}

/** Large geographic landscape geometry follows the governed positional transform; source geo bounds remain separate. */
export const scaleCityLandscapeFeature = <T extends CityLandscapeFeature>(
  feature: T,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => ({
  ...feature,
  points: feature.points.map(point => scaleCityPoint(point, scale)),
})
