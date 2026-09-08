import type { UrbanFacing, UrbanPoint } from './urbanWorld'
import { isUrbanWalkable } from './urbanWorld'
import { PLAYER_START, WORLD_ROADS } from './worldLayout'

export interface ControlledCrossing {
  id: string
  x: number
  y: number
  pedestrianAxis: 'vertical' | 'horizontal'
  roadAngle?: number
  halfLength: number
  halfWidth: number
  approachStopOffset: number
  cycleSeconds: number
}

export interface CrossingPedestrianPose extends UrbanPoint {
  facing: UrbanFacing
  moving: boolean
}

/** Local crossing coordinates rotate with the source street. */
export const crossingPoint = (crossing: Pick<ControlledCrossing, 'x' | 'y' | 'roadAngle'>, x: number, y: number): UrbanPoint => {
  const angle = crossing.roadAngle ?? 0, c = Math.cos(angle), s = Math.sin(angle)
  return { x: crossing.x + x * c - y * s, y: crossing.y + x * s + y * c }
}
const crossingLocalPoint = (crossing: ControlledCrossing, point: UrbanPoint): UrbanPoint => {
  const angle = crossing.roadAngle ?? 0, c = Math.cos(angle), s = Math.sin(angle)
  const x = point.x - crossing.x, y = point.y - crossing.y
  return { x: x * c + y * s, y: -x * s + y * c }
}

// A game control on a validated source segment; no claim about real traffic signals.
const crossingSites = WORLD_ROADS.flatMap(road => (road.centerline ?? []).slice(1).map((b, i) => {
  const a = road.centerline![i], dx = b.x - a.x, dy = b.y - a.y
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, halfLength: (road.roadWidth ?? 32) / 2 + 6,
    length: Math.hypot(dx, dy), roadAngle: Math.atan2(dy * Math.sign(dx), Math.abs(dx)) }
})).filter(p => p.length > 190 && Math.abs(p.roadAngle) < Math.PI / 5)
  .sort((a, b) => Math.hypot(a.x - PLAYER_START.x, a.y - PLAYER_START.y) - Math.hypot(b.x - PLAYER_START.x, b.y - PLAYER_START.y))
const crossingSite = crossingSites.find(p => {
  for (let x = -80; x <= 80; x += 8) { const v = crossingPoint(p, x, 0); if (!isUrbanWalkable(v.x, v.y, true, 6)) return false }
  for (let y = -p.halfLength; y <= p.halfLength; y += 2) { const v = crossingPoint(p, 0, y); if (!isUrbanWalkable(v.x, v.y, false, 6)) return false }
  return true
})
if (!crossingSite) throw new Error('City plan needs a safe controlled crossing')
export const CENTRAL_CONTROLLED_CROSSING: ControlledCrossing = {
  id: 'central-station-crossing', x: crossingSite.x, y: crossingSite.y, roadAngle: crossingSite.roadAngle,
  pedestrianAxis: 'vertical', halfLength: crossingSite.halfLength, halfWidth: 24,
  approachStopOffset: 60, cycleSeconds: 12,
}

export const CONTROLLED_CROSSINGS: readonly ControlledCrossing[] = [CENTRAL_CONTROLLED_CROSSING]

const positiveModulo = (value: number, divisor: number): number => ((value % divisor) + divisor) % divisor

export const crossingCycleTime = (crossing: ControlledCrossing, seconds: number): number =>
  positiveModulo(Number.isFinite(seconds) ? Math.max(0, seconds) : 0, crossing.cycleSeconds)

/**
 * Two bounded pedestrian crossing windows per cycle. Vehicles yield throughout these windows.
 * The short all-stop buffer on either side avoids a pedestrian/vehicle visual overlap at phase changes.
 */
export const pedestrianHasCrossingPriority = (crossing: ControlledCrossing, seconds: number): boolean => {
  const t = crossingCycleTime(crossing, seconds)
  return (t >= 0.75 && t < 4.25) || (t >= 6.75 && t < 10.25)
}

export const sampleControlledCrossingPedestrian = (
  crossing: ControlledCrossing,
  seconds: number,
  target: CrossingPedestrianPose,
): CrossingPedestrianPose => {
  const t = crossingCycleTime(crossing, seconds)
  const north = -crossing.halfLength
  const south = crossing.halfLength

  target.x = 0
  target.moving = false

  if (t < 1) {
    target.y = north
    target.facing = 'down'
    return Object.assign(target, crossingPoint(crossing, 0, target.y))
  }
  if (t < 4) {
    const progress = (t - 1) / 3
    target.y = north + (south - north) * progress
    target.facing = 'down'
    target.moving = true
    return Object.assign(target, crossingPoint(crossing, 0, target.y))
  }
  if (t < 7) {
    target.y = south
    target.facing = 'up'
    return Object.assign(target, crossingPoint(crossing, 0, target.y))
  }
  if (t < 10) {
    const progress = (t - 7) / 3
    target.y = south - (south - north) * progress
    target.facing = 'up'
    target.moving = true
    return Object.assign(target, crossingPoint(crossing, 0, target.y))
  }

  target.y = north
  target.facing = 'down'
  return Object.assign(target, crossingPoint(crossing, 0, target.y))
}

export const isPointInsideControlledCrossing = (crossing: ControlledCrossing, point: UrbanPoint): boolean => {
  point = crossingLocalPoint(crossing, point)
  if (crossing.pedestrianAxis === 'vertical') {
    return Math.abs(point.x) <= crossing.halfWidth &&
      Math.abs(point.y) <= crossing.halfLength
  }
  return Math.abs(point.y) <= crossing.halfWidth &&
    Math.abs(point.x) <= crossing.halfLength
}

/**
 * Clamp a horizontal traffic pose to the correct stop line while pedestrians own the crossing.
 * Poses that have already cleared the crossing are not pulled backwards.
 */
export const yieldHorizontalTrafficAtCrossing = (
  crossing: ControlledCrossing,
  seconds: number,
  pose: CrossingPedestrianPose,
): CrossingPedestrianPose => {
  if (crossing.pedestrianAxis !== 'vertical' || !pedestrianHasCrossingPriority(crossing, seconds)) return pose

  const point = crossingLocalPoint(crossing, pose)
  const leftStop = -crossing.approachStopOffset
  const rightStop = crossing.approachStopOffset
  const crossingLeft = -crossing.halfWidth
  const crossingRight = crossing.halfWidth

  if (pose.facing === 'right' && point.x >= leftStop && point.x <= crossingRight) {
    Object.assign(pose, crossingPoint(crossing, leftStop, point.y))
    pose.moving = false
  } else if (pose.facing === 'left' && point.x <= rightStop && point.x >= crossingLeft) {
    Object.assign(pose, crossingPoint(crossing, rightStop, point.y))
    pose.moving = false
  }
  return pose
}
