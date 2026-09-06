import type { ActiveTransport } from '../types/game'

export type InteriorLocationId = 'hq' | 'marketplace'
export type InteriorInteractionId =
  | 'exit'
  | 'fleet'
  | 'employees'
  | 'operations'
  | 'staging'
  | 'market-stalls'
  | 'player-listings'

export interface InteriorPoint { x: number; y: number }
export interface InteriorRect extends InteriorPoint { width: number; height: number }
export interface InteriorInteraction extends InteriorPoint {
  id: InteriorInteractionId
  label: string
  radius: number
}

export interface InteriorLocationDefinition {
  id: InteriorLocationId
  title: string
  subtitle: string
  width: number
  height: number
  spawn: InteriorPoint
  interactions: readonly InteriorInteraction[]
  obstacles: readonly InteriorRect[]
}

export const INTERIOR_WIDTH = 1200
export const INTERIOR_HEIGHT = 720

const interaction = (
  id: InteriorInteractionId,
  label: string,
  x: number,
  y: number,
  radius = 62,
): InteriorInteraction => ({ id, label, x, y, radius })

export const HQ_INTERIOR: InteriorLocationDefinition = {
  id: 'hq',
  title: 'DROPi TYCOON HEADQUARTERS',
  subtitle: 'Main Multimodal Operations Hub',
  width: INTERIOR_WIDTH,
  height: INTERIOR_HEIGHT,
  spawn: { x: 600, y: 620 },
  interactions: [
    interaction('exit', 'Exit to Cedar City', 600, 662, 54),
    interaction('fleet', 'Fleet Bay', 225, 390, 76),
    interaction('employees', 'Employee Area', 235, 155, 70),
    interaction('operations', 'Operations & Dispatch', 925, 155, 76),
    interaction('staging', 'Parcel Staging', 945, 405, 76),
  ],
  obstacles: [
    { x: 600, y: 34, width: 1120, height: 46 },
    { x: 34, y: 360, width: 46, height: 640 },
    { x: 1166, y: 360, width: 46, height: 640 },
    { x: 300, y: 330, width: 170, height: 48 },
    { x: 900, y: 330, width: 170, height: 48 },
  ],
}

export const MARKETPLACE_INTERIOR: InteriorLocationDefinition = {
  id: 'marketplace',
  title: 'DROPi MARKETPLACE',
  subtitle: 'Local trade hall · player economy foundation',
  width: INTERIOR_WIDTH,
  height: INTERIOR_HEIGHT,
  spawn: { x: 600, y: 620 },
  interactions: [
    interaction('exit', 'Exit to Cedar City', 600, 662, 54),
    interaction('market-stalls', 'Local Marketplace Stalls', 320, 245, 82),
    interaction('player-listings', 'Player Listings Counter', 880, 245, 82),
  ],
  obstacles: [
    { x: 600, y: 34, width: 1120, height: 46 },
    { x: 34, y: 360, width: 46, height: 640 },
    { x: 1166, y: 360, width: 46, height: 640 },
    { x: 320, y: 330, width: 250, height: 54 },
    { x: 880, y: 330, width: 250, height: 54 },
  ],
}

export const INTERIOR_LOCATIONS: Readonly<Record<InteriorLocationId, InteriorLocationDefinition>> = {
  hq: HQ_INTERIOR,
  marketplace: MARKETPLACE_INTERIOR,
}

const finitePoint = (point: InteriorPoint): boolean => Number.isFinite(point.x) && Number.isFinite(point.y)
const contains = (rect: InteriorRect, point: InteriorPoint, padding: number): boolean =>
  Math.abs(point.x - rect.x) <= rect.width / 2 + padding &&
  Math.abs(point.y - rect.y) <= rect.height / 2 + padding

export const isInteriorWalkable = (
  location: InteriorLocationDefinition,
  point: InteriorPoint,
  radius = 12,
): boolean => {
  if (!finitePoint(point) || !Number.isFinite(radius) || radius < 0) return false
  if (point.x < radius || point.y < radius || point.x > location.width - radius || point.y > location.height - radius) return false
  return !location.obstacles.some(rect => contains(rect, point, radius))
}

export const moveInteriorPlayer = (
  location: InteriorLocationDefinition,
  position: InteriorPoint,
  input: InteriorPoint,
  deltaSeconds: number,
  speed = 185,
): InteriorPoint => {
  if (!finitePoint(position) || !finitePoint(input) || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0 ||
      !Number.isFinite(speed) || speed < 0) return { ...position }
  const length = Math.hypot(input.x, input.y)
  if (length === 0) return { ...position }
  const travel = Math.min(deltaSeconds, 0.1) * Math.min(speed, 600)
  const dx = input.x / Math.max(1, length) * travel
  const dy = input.y / Math.max(1, length) * travel
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 5))
  const stepX = dx / steps
  const stepY = dy / steps
  let { x, y } = position
  for (let step = 0; step < steps; step += 1) {
    if (stepX !== 0 && isInteriorWalkable(location, { x: x + stepX, y })) x += stepX
    if (stepY !== 0 && isInteriorWalkable(location, { x, y: y + stepY })) y += stepY
  }
  return { x, y }
}

export const nearestInteriorInteraction = (
  location: InteriorLocationDefinition,
  position: InteriorPoint,
): InteriorInteraction | undefined => location.interactions
  .map(candidate => ({ candidate, distance: Math.hypot(candidate.x - position.x, candidate.y - position.y) }))
  .filter(({ candidate, distance }) => distance <= candidate.radius)
  .sort((a, b) => a.distance - b.distance)[0]?.candidate

export const transportBayLabel = (transport: ActiveTransport): string => {
  switch (transport) {
    case 'walking': return 'On foot'
    case 'bicycle': return 'Bicycle'
    case 'scooter': return 'Electric Scooter'
    case 'motorcycle': return 'Motorcycle'
    case 'van': return 'Delivery Van'
  }
}
