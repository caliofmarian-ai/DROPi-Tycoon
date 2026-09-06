import {
  PLAYER_START, WORLD_BUILDINGS, WORLD_DECORATIONS, WORLD_HEIGHT, WORLD_ROADS,
  WORLD_ROUTE_POINTS, WORLD_SIDEWALKS, WORLD_WIDTH, type WorldBuildingLayout, type WorldRectLayout,
} from './worldLayout'

export interface UrbanPoint { x: number; y: number }
export type UrbanFacing = 'up' | 'down' | 'left' | 'right'
export type UrbanBuilding = WorldBuildingLayout

export const URBAN_HQ: Readonly<UrbanPoint> = PLAYER_START
export const URBAN_MERCHANT: Readonly<UrbanPoint> = { x: 620, y: 910 }
export const URBAN_CUSTOMER: Readonly<UrbanPoint> = { x: 560, y: 290 }
export const URBAN_ROADS = WORLD_ROADS

export const URBAN_BUILDINGS: readonly UrbanBuilding[] = WORLD_BUILDINGS
export const URBAN_ENTRANCE_PATHS: readonly WorldRectLayout[] = WORLD_ROUTE_POINTS.map(point => {
  const building = WORLD_BUILDINGS.find(entry => entry.id === point.buildingId)!
  return {
    id: `${point.label}-entrance`, x: point.x, y: (point.y + building.door.y) / 2,
    width: 28, height: Math.abs(point.y - building.door.y),
  }
})
export const URBAN_SIDEWALKS: readonly WorldRectLayout[] = [...WORLD_SIDEWALKS, ...URBAN_ENTRANCE_PATHS]

const finitePoint = (point: UrbanPoint): boolean =>
  Number.isFinite(point.x) && Number.isFinite(point.y)
const finiteCoordinates = (x: number, y: number): boolean => Number.isFinite(x) && Number.isFinite(y)

const contains = (rect: WorldRectLayout, x: number, y: number, padding = 0): boolean =>
  Math.abs(x - rect.x) <= rect.width / 2 + padding &&
  Math.abs(y - rect.y) <= rect.height / 2 + padding

/**
 * Static city geometry is indexed once at module initialization. Android gameplay used to scan
 * the complete building/tree/surface collections for every collision substep; cardinal bicycle
 * movement could therefore perform several full-city scans per rendered frame.
 */
export const URBAN_SPATIAL_CELL_SIZE = 192

type SpatialIndex<T> = Map<string, T[]>
type TreeObstacle = (typeof WORLD_DECORATIONS)[number]

const cellKey = (column: number, row: number): string => `${column}:${row}`
const cell = (value: number): number => Math.floor(value / URBAN_SPATIAL_CELL_SIZE)

const addIndexed = <T>(
  index: SpatialIndex<T>, item: T, minX: number, minY: number, maxX: number, maxY: number,
): void => {
  for (let column = cell(minX); column <= cell(maxX); column += 1) {
    for (let row = cell(minY); row <= cell(maxY); row += 1) {
      const key = cellKey(column, row)
      const bucket = index.get(key)
      if (bucket) bucket.push(item)
      else index.set(key, [item])
    }
  }
}

const indexRects = <T extends WorldRectLayout>(items: readonly T[]): SpatialIndex<T> => {
  const index: SpatialIndex<T> = new Map()
  for (const item of items) {
    addIndexed(index, item,
      item.x - item.width / 2, item.y - item.height / 2,
      item.x + item.width / 2, item.y + item.height / 2)
  }
  return index
}

const indexTrees = (items: readonly TreeObstacle[]): SpatialIndex<TreeObstacle> => {
  const index: SpatialIndex<TreeObstacle> = new Map()
  for (const tree of items) {
    addIndexed(index, tree,
      tree.x - tree.radius, tree.y - tree.radius,
      tree.x + tree.radius, tree.y + tree.radius)
  }
  return index
}

const BUILDING_INDEX = indexRects(URBAN_BUILDINGS)
const WALKABLE_SURFACE_INDEX = indexRects(URBAN_SIDEWALKS)
const ROAD_SURFACE_INDEX = indexRects(URBAN_ROADS)
const TREE_INDEX = indexTrees(WORLD_DECORATIONS)

const indexedRectContains = <T extends WorldRectLayout>(
  index: SpatialIndex<T>, x: number, y: number, padding = 0,
): boolean => {
  const minColumn = cell(x - padding)
  const maxColumn = cell(x + padding)
  const minRow = cell(y - padding)
  const maxRow = cell(y + padding)
  for (let column = minColumn; column <= maxColumn; column += 1) {
    for (let row = minRow; row <= maxRow; row += 1) {
      const bucket = index.get(cellKey(column, row))
      if (bucket?.some(item => contains(item, x, y, padding))) return true
    }
  }
  return false
}

const indexedTreeBlocks = (x: number, y: number, radius: number): boolean => {
  const minColumn = cell(x - radius)
  const maxColumn = cell(x + radius)
  const minRow = cell(y - radius)
  const maxRow = cell(y + radius)
  for (let column = minColumn; column <= maxColumn; column += 1) {
    for (let row = minRow; row <= maxRow; row += 1) {
      const bucket = TREE_INDEX.get(cellKey(column, row))
      if (!bucket) continue
      for (const tree of bucket) {
        const dx = x - tree.x
        const dy = y - tree.y
        const limit = tree.radius + radius
        if (dx * dx + dy * dy < limit * limit) return true
      }
    }
  }
  return false
}

/** One collision source is shared by rendering, mobile controls and tests. */
export const isUrbanWalkable = (
  x: number, y: number, roadOnly = false, radius = 10,
): boolean => {
  if (!finiteCoordinates(x, y) || !Number.isFinite(radius) || radius < 0 ||
      x < radius || y < radius || x > WORLD_WIDTH - radius || y > WORLD_HEIGHT - radius) {
    return false
  }
  if (indexedRectContains(BUILDING_INDEX, x, y, radius)) return false
  if (indexedTreeBlocks(x, y, radius)) return false
  const surfaces = roadOnly ? ROAD_SURFACE_INDEX : WALKABLE_SURFACE_INDEX
  return indexedRectContains(surfaces, x - radius, y - radius) &&
    indexedRectContains(surfaces, x + radius, y - radius) &&
    indexedRectContains(surfaces, x - radius, y + radius) &&
    indexedRectContains(surfaces, x + radius, y + radius)
}

export const repairUrbanPosition = (point: UrbanPoint): UrbanPoint =>
  isUrbanWalkable(point.x, point.y) ? { ...point } : { ...URBAN_HQ }

export const movementFacing = (
  input: UrbanPoint, previous: UrbanFacing = 'down',
): UrbanFacing => {
  if (!finitePoint(input) || (input.x === 0 && input.y === 0)) return previous
  return Math.abs(input.x) > Math.abs(input.y)
    ? input.x < 0 ? 'left' : 'right'
    : input.y < 0 ? 'up' : 'down'
}

/** Bounded substeps prevent tunnelling; axis sliding avoids sticky corners. */
export const moveUrbanPlayer = (
  position: UrbanPoint, input: UrbanPoint, deltaSeconds: number, speed: number, roadOnly = false,
): UrbanPoint => {
  if (!finitePoint(position) || !finitePoint(input) || !Number.isFinite(deltaSeconds) ||
      !Number.isFinite(speed) || speed < 0 || deltaSeconds <= 0) return { ...position }
  const length = Math.hypot(input.x, input.y)
  if (length === 0) return { ...position }
  const travel = Math.min(deltaSeconds, 0.1) * Math.min(speed, 1000)
  const dx = input.x / Math.max(1, length) * travel
  const dy = input.y / Math.max(1, length) * travel
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 4))
  const stepX = dx / steps
  const stepY = dy / steps
  let { x, y } = position
  for (let i = 0; i < steps; i += 1) {
    // D-pad travel is normally cardinal. Do not run an identical full collision query for an
    // axis that has zero displacement; diagonal input still preserves the original axis slide.
    if (stepX !== 0 && isUrbanWalkable(x + stepX, y, roadOnly)) x += stepX
    if (stepY !== 0 && isUrbanWalkable(x, y + stepY, roadOnly)) y += stepY
  }
  return { x, y }
}

export const inInteractionRange = (a: UrbanPoint, b: UrbanPoint, radius = 48): boolean => {
  if (!finitePoint(a) || !finitePoint(b) || !Number.isFinite(radius) || radius < 0) return false
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy <= radius * radius
}

export const minimapPoint = (point: UrbanPoint, width: number, height: number): UrbanPoint => ({
  x: Number.isFinite(point.x) && Number.isFinite(width)
    ? Math.max(0, Math.min(WORLD_WIDTH, point.x)) / WORLD_WIDTH * Math.max(0, width) : 0,
  y: Number.isFinite(point.y) && Number.isFinite(height)
    ? Math.max(0, Math.min(WORLD_HEIGHT, point.y)) / WORLD_HEIGHT * Math.max(0, height) : 0,
})
