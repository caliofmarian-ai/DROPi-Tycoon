import { describe, expect, it } from 'vitest'
import {
  ambientSectorId,
  resolveActiveAmbientSectorIds,
  resolveActiveAmbientSectorIdsForFocuses,
  resolveAmbientSectorActivation,
  resolveAmbientSectorActivationForFocuses,
  resolveAmbientSectorTransition,
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

  it('keeps overlapping nearby actors retained instead of resetting them at a boundary', () => {
    const routes = [
      route('west-only', -400, 100),
      route('shared-near-boundary', 700, 100),
      route('east-only', 1300, 100),
    ]
    const policy = { sectorSize: 512, activeRadius: 1, maxActiveActors: 8 }
    const before = resolveAmbientSectorActivation(routes, { x: 511.99, y: 100 }, policy)
    const transition = resolveAmbientSectorTransition(routes, before, [{ x: 512, y: 100 }], policy)

    expect(transition.retainedActorIds).toContain('shared-near-boundary')
    expect(transition.activatedActorIds).toContain('east-only')
    expect(transition.deactivatedActorIds).toContain('west-only')
    expect(transition.transitionActorCount).toBe(
      transition.activatedActorIds.length + transition.deactivatedActorIds.length,
    )
    expect(transition.activation.simulatedActorCount).toBeLessThanOrEqual(policy.maxActiveActors)
  })

  it('activates bounded life around a player and governed route look-ahead without center-only bias', () => {
    const routes = [
      route('player-nearby', 100, 100),
      route('corridor-nearby', 5100, 100),
      route('unreferenced-distant', 15000, 100),
    ]
    const policy = { sectorSize: 512, activeRadius: 1, maxActiveActors: 22, maxActivationFocuses: 3 }
    const focuses = [{ x: 150, y: 100 }, { x: 5150, y: 100 }]
    const activation = resolveAmbientSectorActivationForFocuses(routes, focuses, policy)

    expect(activation.activeActorIds).toEqual(['player-nearby', 'corridor-nearby'])
    expect(activation.inactiveActorIds).toEqual(['unreferenced-distant'])
    expect(resolveActiveAmbientSectorIdsForFocuses(focuses, policy).length).toBeLessThanOrEqual(18)
  })

  it('keeps actor and transition work bounded across a city hundreds of sectors wide', () => {
    const routes = Array.from({ length: 12000 }, (_, index) => {
      const band = Math.floor(index / 120)
      return route(`wide-${String(index).padStart(5, '0')}`, (index % 120) * 512, band * 512)
    })
    const policy = { sectorSize: 512, activeRadius: 1, maxActiveActors: 22, maxActivationFocuses: 3 }
    const firstFocuses = [{ x: 256, y: 256 }, { x: 512 * 40 + 256, y: 256 }, { x: 512 * 80 + 256, y: 256 }]
    const nextFocuses = firstFocuses.map(focus => ({ x: focus.x + 512, y: focus.y }))
    const first = resolveAmbientSectorActivationForFocuses(routes, firstFocuses, policy)
    const transition = resolveAmbientSectorTransition(routes, first, nextFocuses, policy)

    expect(first.candidateCount).toBe(12000)
    expect(first.simulatedActorCount).toBeLessThanOrEqual(22)
    expect(first.activeSectorIds.length).toBeLessThanOrEqual(27)
    expect(transition.activation.simulatedActorCount).toBeLessThanOrEqual(22)
    expect(transition.transitionActorCount).toBeLessThanOrEqual(44)
    expect(resolveAmbientSectorTransition(routes, first, nextFocuses, policy)).toEqual(transition)
  })
})
