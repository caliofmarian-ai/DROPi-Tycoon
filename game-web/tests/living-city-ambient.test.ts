import type Phaser from 'phaser'
import { describe, expect, it, vi } from 'vitest'
import {
  AMBIENT_ACTOR_LIMIT,
  AMBIENT_PEDESTRIAN_SCALE,
  AmbientCity,
  buildAmbientRoutes,
  sampleAmbientRoute,
  type AmbientPose,
} from '../src/world/ambientCity'
import { ensureNeighborAtlas } from '../src/world/cityArt'
import { CONTROLLED_CROSSINGS } from '../src/world/cityTrafficRules'
import { WORLD_WIDTH, WORLD_HEIGHT } from '../src/world/worldLayout'
import { isUrbanWalkable } from '../src/world/urbanWorld'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import { serializeGameSession } from '../src/persistence/saveSystem'

const ambientScene = () => {
  const textures = new Map<string, { add: ReturnType<typeof vi.fn> }>()
  let drawCalls = 0
  const makeGraphics = vi.fn(() => {
    const graphics = new Proxy({}, {
      get: (_target, method: string) => (...args: unknown[]) => {
        drawCalls++
        if (method === 'generateTexture') textures.set(args[0] as string, { add: vi.fn() })
        return graphics
      },
    })
    return graphics
  })
  const object = () => {
    const result = {
      name: '',
      setRotation: vi.fn(), setOrigin: vi.fn(), setDepth: vi.fn(),
      setName: vi.fn(), setVisible: vi.fn(),
      setPosition: vi.fn(), setFrame: vi.fn(),
      setTexture: vi.fn(), setScale: vi.fn(),
      setAlpha: vi.fn(), add: vi.fn(),
    }
    for (const method of [
      result.setRotation, result.setOrigin, result.setDepth, result.setVisible,
      result.setPosition, result.setFrame, result.setTexture, result.setScale,
      result.setAlpha, result.add,
    ]) method.mockReturnValue(result)
    result.setName.mockImplementation((name: string) => {
      result.name = name
      return result
    })
    return result
  }
  const images: ReturnType<typeof object>[] = []
  const containers: ReturnType<typeof object>[] = []
  const rectangles: ReturnType<typeof object>[] = []
  const circles: ReturnType<typeof object>[] = []
  const raw = {
    textures: { exists: (key: string) => textures.has(key), get: (key: string) => textures.get(key) },
    make: { graphics: makeGraphics },
    add: {
      image: vi.fn(() => { const image = object(); images.push(image); return image }),
      container: vi.fn(() => { const container = object(); containers.push(container); return container }),
      rectangle: vi.fn(() => { const rectangle = object(); rectangles.push(rectangle); return rectangle }),
      circle: vi.fn(() => { const circle = object(); circles.push(circle); return circle }),
    },
  }
  return { scene: raw as unknown as Phaser.Scene, textures, raw, images, containers, rectangles, circles, drawCalls: () => drawCalls }
}

const routeView = (route: ReturnType<typeof buildAmbientRoutes>[number], padding = 180): Phaser.Geom.Rectangle => ({
  x: Math.min(route.start.x, route.end.x) - padding,
  y: Math.min(route.start.y, route.end.y) - padding,
  right: Math.max(route.start.x, route.end.x) + padding,
  bottom: Math.max(route.start.y, route.end.y) + padding,
} as Phaser.Geom.Rectangle)

const routeMidpoint = (route: ReturnType<typeof buildAmbientRoutes>[number]) => ({
  x: (route.start.x + route.end.x) / 2,
  y: (route.start.y + route.end.y) / 2,
})

describe('bounded deterministic city life', () => {
  it('populates sidewalks, a legal crossing and roads within a fixed actor budget', () => {
    const routes = buildAmbientRoutes()
    expect(routes.length).toBeGreaterThanOrEqual(15)
    expect(routes.length).toBeLessThanOrEqual(AMBIENT_ACTOR_LIMIT)
    expect(routes.filter(route => route.kind !== 'pedestrian')).toHaveLength(4)
    expect(routes.filter(route => route.kind === 'pedestrian' && (route.start.x !== route.end.x || route.start.y !== route.end.y)).length)
      .toBeGreaterThanOrEqual(5)
    expect(routes.filter(route => route.controlledCrossingId)).toHaveLength(2)
    expect(buildAmbientRoutes()).toEqual(routes)
    expect(new Set(routes.map(route => route.id)).size).toBe(routes.length)
    for (const route of routes) {
      const pose: AmbientPose = { x: 0, y: 0, facing: 'right', moving: false }
      for (let time = 0; time < 100; time += 0.5) {
        expect(sampleAmbientRoute(route, time, pose)).toBe(pose)
        expect(isUrbanWalkable(pose.x, pose.y, route.kind !== 'pedestrian', 6), route.id).toBe(true)
        expect(pose.x).toBeGreaterThanOrEqual(Math.min(route.start.x, route.end.x) - 1e-8)
        expect(pose.x).toBeLessThanOrEqual(Math.max(route.start.x, route.end.x) + 1e-8)
        expect(pose.y).toBeGreaterThanOrEqual(Math.min(route.start.y, route.end.y) - 1e-8)
        expect(pose.y).toBeLessThanOrEqual(Math.max(route.start.y, route.end.y) + 1e-8)
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
    expect(sampleAmbientRoute({ ...route, phase: -1 }, 0, pose)).toMatchObject({ x: 0, moving: false })
    expect(sampleAmbientRoute({ ...route, end: route.start }, 10, pose)).toMatchObject({ x: 0, y: 0, moving: false })
  })

  it('reuses six small four-direction pedestrian atlases, including after scene recreation', () => {
    const mock = ambientScene()
    for (let index = 0; index < 24; index++) ensureNeighborAtlas(mock.scene, index)
    expect(mock.raw.make.graphics).toHaveBeenCalledTimes(6)
    for (const texture of mock.textures.values()) expect(texture.add).toHaveBeenCalledTimes(16)
    const initial = mock.drawCalls()
    for (let index = -6; index < 12; index++) ensureNeighborAtlas(mock.scene, index)
    expect(mock.drawCalls()).toBe(initial)
  })

  it('renders one bounded zebra/signal surface and scales pedestrians below courier size', () => {
    const mock = ambientScene()
    new AmbientCity(mock.scene)
    const pedestrianCount = buildAmbientRoutes().filter(route => route.kind === 'pedestrian').length
    expect(mock.rectangles.length).toBe(CONTROLLED_CROSSINGS.length * 14)
    expect(mock.circles.length).toBe(CONTROLLED_CROSSINGS.length * 2)
    expect(mock.images.slice(0, pedestrianCount)
      .every(image => image.setScale.mock.calls.some(([scale]) => scale === AMBIENT_PEDESTRIAN_SCALE))).toBe(true)
  })

  it('animates only sector-active pedestrians using bounded texture frames, never Graphics redraws or mirroring', () => {
    const mock = ambientScene()
    const city = new AmbientCity(mock.scene)
    const routes = buildAmbientRoutes()
    const pedestrianCount = routes.filter(route => route.kind === 'pedestrian').length
    const focusRoutes = routes.filter(route => route.kind === 'pedestrian').slice(0, 2)
    city.setActivationFocuses(focusRoutes.map(routeMidpoint))
    const initial = mock.drawCalls()
    const view = { x: 0, y: 0, right: WORLD_WIDTH, bottom: WORLD_HEIGHT } as Phaser.Geom.Rectangle
    for (let tick = 0; tick < 2000; tick++) city.update(16, view)
    expect(mock.containers).toHaveLength(routes.length)
    expect(mock.images).toHaveLength(routes.length)
    expect(mock.drawCalls()).toBe(initial)
    expect(mock.containers.every(container => container.setScale.mock.calls.length === 0)).toBe(true)
    expect(mock.images.slice(0, pedestrianCount).some(image => image.setFrame.mock.calls.length > 20)).toBe(true)
    expect(mock.images.slice(0, pedestrianCount).flatMap(image => image.setFrame.mock.calls)
      .every(([frame]) => Number.isInteger(frame) && frame >= 0 && frame < 16)).toBe(true)
    expect(mock.circles.every(circle => circle.setAlpha.mock.calls.length > 20)).toBe(true)
    new AmbientCity(mock.scene)
    expect(mock.drawCalls()).toBe(initial)
  })

  it('culls inactive sectors and resumes a returning actor from global elapsed time instead of route zero', () => {
    const mock = ambientScene()
    const city = new AmbientCity(mock.scene)
    const routes = buildAmbientRoutes()
    const targetRoute = routes[0]
    expect(targetRoute).toBeDefined()
    const routeIds = new Set(routes.map(route => route.id))
    const actorById = new Map(mock.containers
      .filter(container => routeIds.has(container.name))
      .map(container => [container.name, container] as const))
    expect(actorById.size).toBe(routes.length)

    const offscreen = { x: -5000, y: -5000, right: -4900, bottom: -4900 } as Phaser.Geom.Rectangle
    city.update(0, offscreen)
    const initialFrames = mock.images.map(image => image.setFrame.mock.calls.length)
    const baselinePositionWrites = new Map(routes.map(route => [
      route.id,
      actorById.get(route.id)!.setPosition.mock.calls.length,
    ] as const))
    for (let tick = 0; tick < 100; tick++) city.update(100, offscreen)
    for (const route of routes) {
      const actor = actorById.get(route.id)!
      expect(actor.setPosition.mock.calls.length, route.id).toBe(baselinePositionWrites.get(route.id))
      expect(actor.setVisible, route.id).toHaveBeenLastCalledWith(false)
    }
    expect(mock.images.map(image => image.setFrame.mock.calls.length)).toEqual(initialFrames)

    city.setActivationFocuses([routeMidpoint(targetRoute)])
    city.update(NaN, routeView(targetRoute))
    const pose = sampleAmbientRoute(targetRoute, 10, { x: 0, y: 0, facing: 'down', moving: false })
    const targetActor = actorById.get(targetRoute.id)!
    const [x, y] = targetActor.setPosition.mock.calls.at(-1)!
    expect(x).toBeCloseTo(pose.x, 8)
    expect(y).toBeCloseTo(pose.y, 8)
    expect(targetActor.setVisible).toHaveBeenLastCalledWith(true)
  })

  it('accepts bounded corridor look-ahead focuses without creating gameplay state', () => {
    const mock = ambientScene()
    const city = new AmbientCity(mock.scene)
    const routes = buildAmbientRoutes()
    city.setActivationFocuses(routes.slice(0, 10).map(routeMidpoint))
    city.update(16, routeView(routes[0]))
    const routeIds = new Set(routes.map(route => route.id))
    const visibleWrites = mock.containers.filter(container =>
      routeIds.has(container.name) && container.setPosition.mock.calls.length > 0).length
    expect(visibleWrites).toBeLessThanOrEqual(AMBIENT_ACTOR_LIMIT)
    expect(visibleWrites).toBeGreaterThan(0)
  })

  it('keeps ambient population, crossing phases and camera preferences out of Save v2', () => {
    const raw = serializeGameSession({
      world: createInitialWorldState(), company: createInitialCompanyState(), settings: createInitialGameSettingsState(),
    })
    expect(JSON.parse(raw).formatVersion).toBe(2)
    expect(raw).not.toMatch(/ambient|pedestrian|crossing|camera|zoom|texture|decoration/)
  })
})
