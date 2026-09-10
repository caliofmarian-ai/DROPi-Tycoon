/**
 * Reusable World/Locality visual-distance contract.
 *
 * The 10x baseline changes gameplay separation between governed/source/generated intra-city
 * anchors. It does NOT make every locality the same size, does NOT multiply Hero-scale object
 * dimensions blindly, and must never be interpreted as surveyed metres or fabricated geography.
 *
 * Locality-specific calibration and compatibility naming belongs in locality adapters outside
 * this module; this authority remains locality-neutral.
 *
 * Ownership boundary: this module transforms presentation geometry only. It does not define
 * locality adjacency, road connectivity, route classes, mission topology, or logistics truth.
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
 * Road source vertices gain playable visual separation while carriageway width stays Hero-readable.
 * The transform preserves the supplied centerline shape; it does not infer or author connectivity.
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

/** Zone footprint size stays legible while its supplied anchor gains playable separation. */
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

/** Context footprints retain local size; only their supplied city position changes. */
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
