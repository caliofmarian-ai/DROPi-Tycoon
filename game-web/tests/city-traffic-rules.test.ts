import { describe, expect, it } from 'vitest'
import {
  CENTRAL_CONTROLLED_CROSSING,
  crossingCycleTime,
  isPointInsideControlledCrossing,
  pedestrianHasCrossingPriority,
  sampleControlledCrossingPedestrian,
  yieldHorizontalTrafficAtCrossing,
} from '../src/world/cityTrafficRules'

describe('controlled city crossing rules', () => {
  const crossing = { ...CENTRAL_CONTROLLED_CROSSING, roadAngle: 0 }

  it('has deterministic bounded cycle semantics', () => {
    expect(crossingCycleTime(crossing, 0)).toBe(0)
    expect(crossingCycleTime(crossing, crossing.cycleSeconds)).toBe(0)
    expect(crossingCycleTime(crossing, Number.NaN)).toBe(0)
    expect(pedestrianHasCrossingPriority(crossing, 0.5)).toBe(false)
    expect(pedestrianHasCrossingPriority(crossing, 1)).toBe(true)
    expect(pedestrianHasCrossingPriority(crossing, 5)).toBe(false)
    expect(pedestrianHasCrossingPriority(crossing, 8)).toBe(true)
    expect(pedestrianHasCrossingPriority(crossing, 11)).toBe(false)
  })

  it('keeps the pedestrian at a curb outside crossing windows and moves only through the designated zebra', () => {
    const pose = { x: 0, y: 0, facing: 'right' as const, moving: false }
    expect(sampleControlledCrossingPedestrian(crossing, 0.5, pose)).toMatchObject({
      x: crossing.x,
      y: crossing.y - crossing.halfLength,
      facing: 'down',
      moving: false,
    })
    const outbound = sampleControlledCrossingPedestrian(crossing, 2.5, pose)
    expect(outbound.moving).toBe(true)
    expect(outbound.facing).toBe('down')
    expect(isPointInsideControlledCrossing(crossing, outbound)).toBe(true)
    expect(sampleControlledCrossingPedestrian(crossing, 5, pose)).toMatchObject({
      x: crossing.x,
      y: crossing.y + crossing.halfLength,
      facing: 'up',
      moving: false,
    })
    const returning = sampleControlledCrossingPedestrian(crossing, 8.5, pose)
    expect(returning.moving).toBe(true)
    expect(returning.facing).toBe('up')
    expect(isPointInsideControlledCrossing(crossing, returning)).toBe(true)
  })

  it('holds approaching traffic at the stop line while pedestrians have priority', () => {
    const leftApproach = { x: crossing.x - 30, y: crossing.y, facing: 'right' as const, moving: true }
    yieldHorizontalTrafficAtCrossing(crossing, 2, leftApproach)
    expect(leftApproach).toMatchObject({
      x: crossing.x - crossing.approachStopOffset,
      moving: false,
      facing: 'right',
    })

    const rightApproach = { x: crossing.x + 30, y: crossing.y, facing: 'left' as const, moving: true }
    yieldHorizontalTrafficAtCrossing(crossing, 8, rightApproach)
    expect(rightApproach).toMatchObject({
      x: crossing.x + crossing.approachStopOffset,
      moving: false,
      facing: 'left',
    })
  })

  it('lets traffic proceed when the pedestrian phase is closed and never pulls cleared traffic backwards', () => {
    const green = { x: crossing.x - 30, y: crossing.y, facing: 'right' as const, moving: true }
    expect(yieldHorizontalTrafficAtCrossing(crossing, 5, green)).toEqual(green)
    expect(green.x).toBe(crossing.x - 30)
    expect(green.moving).toBe(true)

    const clearedEast = { x: crossing.x + crossing.halfWidth + 20, y: crossing.y, facing: 'right' as const, moving: true }
    yieldHorizontalTrafficAtCrossing(crossing, 2, clearedEast)
    expect(clearedEast.x).toBe(crossing.x + crossing.halfWidth + 20)
    expect(clearedEast.moving).toBe(true)
  })

  it('uses strict crossing geometry instead of treating nearby road space as a pedestrian crossing', () => {
    expect(isPointInsideControlledCrossing(crossing, { x: crossing.x, y: crossing.y })).toBe(true)
    expect(isPointInsideControlledCrossing(crossing, {
      x: crossing.x + crossing.halfWidth + 1,
      y: crossing.y,
    })).toBe(false)
    expect(isPointInsideControlledCrossing(crossing, {
      x: crossing.x,
      y: crossing.y + crossing.halfLength + 1,
    })).toBe(false)
  })
})
