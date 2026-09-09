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

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value))

const closestPointOnSegment = (
  point: CityScalePoint,
  start: CityScalePoint,
  end: CityScalePoint,
): CityScalePoint => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return { x: start.x, y: start.y }
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1)
  return { x: start.x + dx * t, y: start.y + dy * t }
}

/**
 * Resolve a source-space road anchor without inventing topology. Curved roads project to the
 * nearest source centerline segment; legacy rectangle roads project to their long centre axis.
 */
export const cityRoadAnchorForPoint = (
  point: CityScalePoint,
  road: WorldRectLayout,
): CityScalePoint => {
  const centerline = road.centerline
  if (centerline?.length) {
    if (centerline.length === 1) return { x: centerline[0].x, y: centerline[0].y }
    let best = closestPointOnSegment(point, centerline[0], centerline[1])
    let bestDistanceSquared = (point.x - best.x) ** 2 + (point.y - best.y) ** 2
    for (let index = 1; index < centerline.length - 1; index++) {
      const candidate = closestPointOnSegment(point, centerline[index], centerline[index + 1])
      const distanceSquared = (point.x - candidate.x) ** 2 + (point.y - candidate.y) ** 2
      if (distanceSquared < bestDistanceSquared) {
        best = candidate
        bestDistanceSquared = distanceSquared
      }
    }
    return best
  }

  if (road.width >= road.height) {
    return {
      x: clamp(point.x, road.x - road.width / 2, road.x + road.width / 2),
      y: road.y,
    }
  }
  return {
    x: road.x,
    y: clamp(point.y, road.y - road.height / 2, road.y + road.height / 2),
  }
}

/**
 * A point attached to a road follows the scaled road anchor while retaining its local lateral
 * offset. This expands city separation without multiplying the point's offset across a fixed-width
 * carriageway.
 */
export const scaleCityRoadAttachedPoint = <T extends CityScalePoint>(
  point: T,
  sourceRoad: WorldRectLayout,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => {
  const sourceAnchor = cityRoadAnchorForPoint(point, sourceRoad)
  const playableAnchor = scaleCityPoint(sourceAnchor, scale)
  return {
    ...point,
    x: playableAnchor.x + point.x - sourceAnchor.x,
    y: playableAnchor.y + point.y - sourceAnchor.y,
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
 * Building footprints remain Hero-readable. Unanchored buildings scale by their governed centre;
 * road-facing buildings may instead consume scaleCityBuildingFromAnchor so their local frontage
 * remains attached to the enlarged road topology.
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
 * Keep a building, its door and its road-facing anchor as one locally scaled assembly. The anchor
 * gains global city separation; the building keeps the same source-space offset from that anchor.
 */
export const scaleCityBuildingFromAnchor = <T extends WorldBuildingLayout>(
  building: T,
  sourceAnchor: CityScalePoint,
  playableAnchor: CityScalePoint,
): T => {
  const dx = playableAnchor.x - sourceAnchor.x
  const dy = playableAnchor.y - sourceAnchor.y
  return {
    ...building,
    x: building.x + dx,
    y: building.y + dy,
    door: { x: building.door.x + dx, y: building.door.y + dy },
  }
}

/** A road-bound pickup/drop-off keeps its local offset from the road while the road gains 10x separation. */
export const scaleCityRoutePoint = <T extends WorldRoutePoint>(
  point: T,
  sourceRoad?: WorldRectLayout,
  scale = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
): T => sourceRoad ? scaleCityRoadAttachedPoint(point, sourceRoad, scale) : scaleCityPoint(point, scale)

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
