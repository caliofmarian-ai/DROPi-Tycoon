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

const contains = (rect: WorldRectLayout, x: number, y: number, padding = 0): boolean =>
  Math.abs(x - rect.x) <= rect.width / 2 + padding &&
  Math.abs(y - rect.y) <= rect.height / 2 + padding

/** One collision source is shared by rendering, mobile controls and tests. */
export const isUrbanWalkable = (
  x: number, y: number, roadOnly = false, radius = 10,
): boolean => {
  if (!finitePoint({ x, y }) || !Number.isFinite(radius) || radius < 0 ||
      x < radius || y < radius || x > WORLD_WIDTH - radius || y > WORLD_HEIGHT - radius) {
    return false
  }
  if (URBAN_BUILDINGS.some(building => contains(building, x, y, radius))) return false
  if (WORLD_DECORATIONS.some(tree => Math.hypot(x - tree.x, y - tree.y) < tree.radius + radius)) {
    return false
  }
  const surfaces = roadOnly ? URBAN_ROADS : URBAN_SIDEWALKS
  return [[-radius, -radius], [radius, -radius], [-radius, radius], [radius, radius]]
    .every(([dx, dy]) => surfaces.some(surface => contains(surface, x + dx, y + dy)))
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
  let { x, y } = position
  for (let i = 0; i < steps; i += 1) {
    if (isUrbanWalkable(x + dx / steps, y, roadOnly)) x += dx / steps
    if (isUrbanWalkable(x, y + dy / steps, roadOnly)) y += dy / steps
  }
  return { x, y }
}

export const inInteractionRange = (a: UrbanPoint, b: UrbanPoint, radius = 48): boolean =>
  finitePoint(a) && finitePoint(b) && Number.isFinite(radius) && radius >= 0 &&
  Math.hypot(a.x - b.x, a.y - b.y) <= radius

export const minimapPoint = (point: UrbanPoint, width: number, height: number): UrbanPoint => ({
  x: Number.isFinite(point.x) && Number.isFinite(width)
    ? Math.max(0, Math.min(WORLD_WIDTH, point.x)) / WORLD_WIDTH * Math.max(0, width) : 0,
  y: Number.isFinite(point.y) && Number.isFinite(height)
    ? Math.max(0, Math.min(WORLD_HEIGHT, point.y)) / WORLD_HEIGHT * Math.max(0, height) : 0,
})
