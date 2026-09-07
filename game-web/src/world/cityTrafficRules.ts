import type { UrbanFacing, UrbanPoint } from './urbanWorld'

export interface ControlledCrossing {
  id: string
  x: number
  y: number
  pedestrianAxis: 'vertical' | 'horizontal'
  halfLength: number
  halfWidth: number
  approachStopOffset: number
  cycleSeconds: number
}

export interface CrossingPedestrianPose extends UrbanPoint {
  facing: UrbanFacing
  moving: boolean
}

export const CENTRAL_CONTROLLED_CROSSING: ControlledCrossing = {
  id: 'central-station-crossing',
  x: 800,
  y: 600,
  pedestrianAxis: 'vertical',
  halfLength: 84,
  halfWidth: 24,
  approachStopOffset: 86,
  cycleSeconds: 12,
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
  const north = crossing.y - crossing.halfLength
  const south = crossing.y + crossing.halfLength

  target.x = crossing.x
  target.moving = false

  if (t < 1) {
    target.y = north
    target.facing = 'down'
    return target
  }
  if (t < 4) {
    const progress = (t - 1) / 3
    target.y = north + (south - north) * progress
    target.facing = 'down'
    target.moving = true
    return target
  }
  if (t < 7) {
    target.y = south
    target.facing = 'up'
    return target
  }
  if (t < 10) {
    const progress = (t - 7) / 3
    target.y = south - (south - north) * progress
    target.facing = 'up'
    target.moving = true
    return target
  }

  target.y = north
  target.facing = 'down'
  return target
}

export const isPointInsideControlledCrossing = (crossing: ControlledCrossing, point: UrbanPoint): boolean => {
  if (crossing.pedestrianAxis === 'vertical') {
    return Math.abs(point.x - crossing.x) <= crossing.halfWidth &&
      Math.abs(point.y - crossing.y) <= crossing.halfLength
  }
  return Math.abs(point.y - crossing.y) <= crossing.halfWidth &&
    Math.abs(point.x - crossing.x) <= crossing.halfLength
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

  const leftStop = crossing.x - crossing.approachStopOffset
  const rightStop = crossing.x + crossing.approachStopOffset
  const crossingLeft = crossing.x - crossing.halfWidth
  const crossingRight = crossing.x + crossing.halfWidth

  if (pose.facing === 'right' && pose.x >= leftStop && pose.x <= crossingRight) {
    pose.x = leftStop
    pose.moving = false
  } else if (pose.facing === 'left' && pose.x <= rightStop && pose.x >= crossingLeft) {
    pose.x = rightStop
    pose.moving = false
  }
  return pose
}
