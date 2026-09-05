import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { getUrbanObjective } from '../src/systems/urbanInteractions'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import { isUrbanHUDPoint, urbanHUDLayout, urbanMapMarkers, urbanStatusText } from '../src/ui/UrbanHUD'
import { CAMERA_MAX_ZOOM, CAMERA_MIN_ZOOM } from '../src/ui/cameraControls'
import { UrbanZoomGesture, urbanZoomStep } from '../src/ui/urbanZoom'
import { minimapPoint } from '../src/world/urbanWorld'

describe('living city screen-space navigation', () => {
  it.each([[360, 640], [390, 844], [640, 360], [740, 360], [844, 390], [1280, 720], [1672, 941]])(
    'keeps the mission, minimap and large controls separate at %ix%i', (width, height) => {
      const l = urbanHUDLayout(width, height)
      expect(l.objective.x + l.objective.width).toBeLessThan(l.minimap.x - 5)
      expect(l.objective.y).toBeGreaterThan(l.headerHeight)
      expect(l.zoom.y + l.zoom.size / 2).toBeLessThan(l.transport.y - l.transport.height / 2)
      expect(l.pad.x + 3 * l.pad.size).toBeLessThan(l.action.x - l.action.width / 2)
      expect(l.pad.y).toBeGreaterThan(l.objective.y + l.objective.height)
      expect(l.minimap.x + l.minimap.width).toBeLessThan(width)
      expect(l.action.y + l.action.height / 2).toBeLessThan(height)
      expect(l.zoom.size).toBeGreaterThanOrEqual(44)
      expect(l.pad.size - 2).toBeGreaterThanOrEqual(44)
      expect(isUrbanHUDPoint(width, height, l.action.x, l.action.y)).toBe(true)
      expect(isUrbanHUDPoint(width, height, l.zoom.x, l.zoom.y)).toBe(true)
      expect(isUrbanHUDPoint(width, height, l.pad.x + l.pad.size, l.pad.y + l.pad.size)).toBe(true)
      expect(isUrbanHUDPoint(width, height, width / 2, height / 2 + 10)).toBe(false)
    },
  )

  it('projects the active pickup/delivery rather than one universal map target', () => {
    const world = createInitialWorldState()
    for (const sequence of [1, 2, 5, 9]) {
      world.activeOrder = createOrderForSequence(sequence)
      world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
      for (const status of ['Accepted', 'PickedUp'] as const) {
        world.activeOrder.status = status
        const objective = getUrbanObjective(world)
        const markers = urbanMapMarkers(world, objective, 160, 120)
        expect(markers.target).toEqual(minimapPoint(objective.point, 160, 120))
        expect(markers.player).toEqual(minimapPoint(world.player, 160, 120))
      }
    }
  })

  it('uses actual money, reputation, transport and carried cargo', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    company.money = 2345
    company.reputation = 67
    world.urban = { merchantOnboarded: true, activeTransport: 'bicycle' }
    world.player.carryingPackage = true
    expect(urbanStatusText(world, company)).toBe('$2,345  Rep 67  Bicycle  Cargo 1/3')
  })
})

describe('bounded world-only pinch and accessible zoom buttons', () => {
  it('scales continuously without rotation, with both hard bounds', () => {
    const gesture = new UrbanZoomGesture()
    gesture.press(1, { x: 0, y: 0 })
    gesture.press(2, { x: 100, y: 0 })
    expect(gesture.isPinching()).toBe(true)
    expect(gesture.move(2, { x: 150, y: 0 }, 1)).toBe(1.5)
    expect(gesture.move(2, { x: 1000, y: 0 }, 1.5)).toBe(CAMERA_MAX_ZOOM)
    expect(gesture.move(2, { x: 30, y: 0 }, CAMERA_MAX_ZOOM)).toBe(CAMERA_MIN_ZOOM)
  })

  it('does not let a control-owned, released, or third pointer change zoom', () => {
    const gesture = new UrbanZoomGesture()
    expect(gesture.move(99, { x: 999, y: 0 }, 1)).toBe(1)
    gesture.press(1, { x: 10, y: 10 })
    gesture.press(2, { x: 110, y: 10 })
    gesture.press(3, { x: 900, y: 10 })
    expect(gesture.move(3, { x: 1000, y: 10 }, 1)).toBe(1)
    gesture.release(2)
    expect(gesture.isPinching()).toBe(false)
    expect(gesture.move(1, { x: 30, y: 10 }, 1)).toBe(1)
    gesture.clear()
    expect(gesture.isPinching()).toBe(false)
  })

  it('rebases close fingers and rejects invalid coordinates without jumps', () => {
    const gesture = new UrbanZoomGesture()
    gesture.press(1, { x: 0, y: 0 })
    gesture.press(2, { x: 0, y: 0 })
    expect(gesture.move(2, { x: 50, y: 0 }, 1)).toBe(1)
    expect(gesture.move(2, { x: NaN, y: 0 }, 1)).toBe(1)
    expect(gesture.move(2, { x: 60, y: 0 }, 1)).toBe(1.2)
    for (const direction of ['in', 'out'] as const) {
      let zoom = 1
      for (let i = 0; i < 100; i++) zoom = urbanZoomStep(zoom, direction)
      expect(zoom).toBe(direction === 'in' ? CAMERA_MAX_ZOOM : CAMERA_MIN_ZOOM)
    }
  })
})

it('does not ship or load the owner concept images as runtime art', () => {
  const root = new URL('../src/', import.meta.url)
  const files = readdirSync(root, { recursive: true, encoding: 'utf8' }).filter(file => file.endsWith('.ts'))
  for (const file of files) {
    const source = readFileSync(new URL(file, root), 'utf8')
    expect(source, file).not.toMatch(/user-attachments|01696593-4b87|43b877f2-ac04|9c0c9663-ca76|f36e290c-e95f/)
    expect(source, file).not.toMatch(/load\.image\([^)]*https?:/)
  }
})
