import { describe, expect, it } from 'vitest'
import {
  ambientSectorId,
  resolveActiveAmbientSectorIds,
  resolveAmbientSectorActivation,
  type AmbientSectorRoute,
} from '../src/simulation/ambient/sectorActivation'

const route = (id: string, x: number, y: number): AmbientSectorRoute => ({
  id,
  start: { x, y },
  end: { x: x + 40, y },
})

describe('Living City sector activation', () => {
  it('derives deterministic technical sector ids without inventing city geography', () => {
    expect(ambientSectorId({ x: 0, y: 0 }, 512)).toBe('0:0')
    expect(ambientSectorId({ x: 511.99, y: 511.99 }, 512)).toBe('0:0')
    expect(ambientSectorId({ x: 512, y: 512 }, 512)).toBe('1:1')
    expect(ambientSectorId({ x: -1, y: -1 }, 512)).toBe('-1:-1')
    expect(resolveActiveAmbientSectorIds({ x: 0, y: 0 }, {
      sectorSize: 512,
      activeRadius: 1,
      maxActiveActors: 22,
    })).toEqual([
      '-1:-1', '0:-1', '1:-1',
      '-1:0', '0:0', '1:0',
      '-1:1', '0:1', '1:1',
    ])
  })

  it('keeps distant sectors out of full-detail actor simulation', () => {
    const routes = [
      route('near-pedestrian', 120, 120),
      route('near-courier', 300, 180),
      route('distant-east', 6000, 100),
      route('distant-south', 100, 7000),
    ]
    const activation = resolveAmbientSectorActivation(routes, { x: 200, y: 200 }, {
      sectorSize: 512,
      activeRadius: 1,
      maxActiveActors: 22,
    })

    expect(activation.activeActorIds).toEqual(['near-pedestrian', 'near-courier'])
    expect(activation.inactiveActorIds).toEqual(['distant-east', 'distant-south'])
    expect(activation.simulatedActorCount).toBe(2)
    expect(activation.candidateCount).toBe(4)
  })

  it('caps active simulation independently of total city route count', () => {
    const routes = Array.from({ length: 5000 }, (_, index) => route(`actor-${String(index).padStart(4, '0')}`, index % 400, Math.floor(index / 400) % 400))
    const activation = resolveAmbientSectorActivation(routes, { x: 200, y: 200 }, {
      sectorSize: 512,
      activeRadius: 1,
      maxActiveActors: 18,
    })

    expect(activation.candidateCount).toBe(5000)
    expect(activation.simulatedActorCount).toBe(18)
    expect(activation.activeActorIds).toHaveLength(18)
    expect(activation.inactiveActorIds).toHaveLength(4982)
  })

  it('uses deterministic distance then id ordering for equally legitimate nearby actors', () => {
    const routes = [
      route('z-route', 220, 200),
      route('a-route', 220, 200),
      route('m-route', 220, 200),
    ]
    const first = resolveAmbientSectorActivation(routes, { x: 200, y: 200 }, {
      sectorSize: 512,
      activeRadius: 0,
      maxActiveActors: 2,
    })
    const second = resolveAmbientSectorActivation([...routes].reverse(), { x: 200, y: 200 }, {
      sectorSize: 512,
      activeRadius: 0,
      maxActiveActors: 2,
    })

    expect(first.activeActorIds).toEqual(['a-route', 'm-route'])
    expect(second.activeActorIds).toEqual(first.activeActorIds)
  })

  it('transitions deterministically when the player crosses a sector boundary', () => {
    const routes = [
      route('west-sector', 100, 100),
      route('east-sector', 600, 100),
    ]
    const policy = { sectorSize: 512, activeRadius: 0, maxActiveActors: 4 }
    const before = resolveAmbientSectorActivation(routes, { x: 511.99, y: 100 }, policy)
    const after = resolveAmbientSectorActivation(routes, { x: 512, y: 100 }, policy)

    expect(before.centerSectorId).toBe('0:0')
    expect(before.activeActorIds).toEqual(['west-sector'])
    expect(after.centerSectorId).toBe('1:0')
    expect(after.activeActorIds).toEqual(['east-sector'])
    expect(resolveAmbientSectorActivation(routes, { x: 512, y: 100 }, policy)).toEqual(after)
  })
})
