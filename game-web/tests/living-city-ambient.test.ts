import { describe, expect, it } from 'vitest'
import { AMBIENT_ACTOR_LIMIT, buildAmbientRoutes, sampleAmbientRoute, type AmbientPose } from '../src/world/ambientCity'
import { isUrbanWalkable } from '../src/world/urbanWorld'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import { serializeGameSession } from '../src/persistence/saveSystem'

describe('bounded deterministic city life', () => {
  it('populates connected promenades and roads with a fixed actor budget', () => {
    const routes = buildAmbientRoutes()
    expect(routes.length).toBeGreaterThanOrEqual(14)
    expect(routes.length).toBeLessThanOrEqual(AMBIENT_ACTOR_LIMIT)
    expect(routes.filter(route => route.kind !== 'pedestrian')).toHaveLength(4)
    expect(buildAmbientRoutes()).toEqual(routes)
    expect(new Set(routes.map(route => route.id)).size).toBe(routes.length)
    for (const route of routes) {
      const pose: AmbientPose = { x: 0, y: 0, facing: 'right', moving: false }
      for (let time = 0; time < 100; time += 0.5) {
        expect(sampleAmbientRoute(route, time, pose)).toBe(pose)
        expect(isUrbanWalkable(pose.x, pose.y, route.kind !== 'pedestrian', 6), route.id).toBe(true)
        expect(pose.x).toBeGreaterThanOrEqual(Math.min(route.start.x, route.end.x))
        expect(pose.x).toBeLessThanOrEqual(Math.max(route.start.x, route.end.x))
      }
    }
  })

  it('changes direction at route ends and pauses without random drift', () => {
    const route = { id: 'test', kind: 'pedestrian' as const, start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, speed: 10, phase: 0 }
    const pose: AmbientPose = { x: 0, y: 0, facing: 'right', moving: false }
    expect(sampleAmbientRoute(route, 5, pose)).toMatchObject({ x: 50, y: 0, facing: 'right', moving: true })
    expect(sampleAmbientRoute(route, 10.5, pose)).toMatchObject({ x: 100, facing: 'right', moving: false })
    expect(sampleAmbientRoute(route, 16.5, pose)).toMatchObject({ x: 50, facing: 'left', moving: true })
    expect(sampleAmbientRoute(route, NaN, pose)).toMatchObject({ x: 0, y: 0 })
  })

  it('keeps ambient population, art and camera preferences out of Save v2', () => {
    const raw = serializeGameSession({
      world: createInitialWorldState(), company: createInitialCompanyState(), settings: createInitialGameSettingsState(),
    })
    expect(JSON.parse(raw).formatVersion).toBe(2)
    expect(raw).not.toMatch(/ambient|pedestrian|camera|zoom|texture|decoration/)
  })
})
