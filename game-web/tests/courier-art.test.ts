import type Phaser from 'phaser'
import { describe, expect, it, vi } from 'vitest'
import {
  COURIER_DIRECTIONS, COURIER_STATES, courierAnimationFrame, getCourierPose,
} from '../src/world/courierPose'
import { drawCourierFrame, ensureCourierAtlas } from '../src/world/courierArt'
import { createPlayerVisual } from '../src/world/playerVisual'

type DrawCall = { method: string; args: unknown[]; color: number }
const artScene = () => {
  const textures = new Map<string, { add: ReturnType<typeof vi.fn> }>()
  const calls: DrawCall[] = []
  const graphics = () => {
    let color = 0
    const chain: Record<string, unknown> = new Proxy({}, {
      get: (_target, property: string) => (...args: unknown[]) => {
        if (property === 'fillStyle') color = args[0] as number
        calls.push({ method: property, args, color })
        if (property === 'generateTexture') textures.set(args[0] as string, { add: vi.fn() })
        return chain
      },
    })
    return chain
  }
  const image = {
    setOrigin: vi.fn().mockReturnThis(), setFrame: vi.fn().mockReturnThis(),
    setTexture: vi.fn().mockReturnThis(), destroy: vi.fn(),
  }
  const container = { add: vi.fn(), destroy: vi.fn(), setScale: vi.fn() }
  const makeGraphics = vi.fn(graphics)
  const scene = {
    textures: { exists: (key: string) => textures.has(key), get: (key: string) => textures.get(key) },
    make: { graphics: makeGraphics },
    add: { image: vi.fn(() => image), container: vi.fn(() => container) },
  } as unknown as Phaser.Scene
  return { scene, calls, graphics, image, container, makeGraphics, textures }
}

describe('original courier directional pose contract', () => {
  it.each(COURIER_STATES)('%s has four independent projections and bounded unique atlas frames', state => {
    const frames = new Set<number>()
    for (const facing of COURIER_DIRECTIONS) for (const carrying of [false, true]) {
      for (const frame of [0, 1, 2, 3] as const) {
        const pose = getCourierPose(state, facing, frame, carrying)
        expect(pose.facing).toBe(facing)
        expect(pose.carrying).toBe(carrying)
        expect(pose.frame).toBe(frame)
        expect(pose.projection).toBe(facing === 'down' ? 'front' : facing === 'up' ? 'back' : 'profile')
        expect(pose.atlasFrame).toBeGreaterThanOrEqual(0)
        expect(pose.atlasFrame).toBeLessThan(32)
        expect(Object.isFrozen(pose)).toBe(true)
        expect(Object.isFrozen(pose.wheels)).toBe(true)
        expect(getCourierPose(state, facing, frame, carrying)).toBe(pose)
        frames.add(pose.atlasFrame)
      }
    }
    expect(frames.size).toBe(32)
  })

  it.each(['Bicycle', 'ElectricScooter', 'Motorcycle'] as const)(
    '%s projects vertical wheels on the y axis, not a mirrored side view', state => {
      for (const direction of ['up', 'down'] as const) {
        const pose = getCourierPose(state, direction)
        expect(pose.wheelAxis).toBe('y')
        expect(pose.wheels).toHaveLength(2)
        expect(pose.wheels[0].x).toBe(pose.wheels[1].x)
        expect(Math.abs(pose.wheels[0].y - pose.wheels[1].y)).toBeGreaterThan(25)
      }
      for (const direction of ['left', 'right'] as const) {
        const pose = getCourierPose(state, direction)
        expect(pose.wheelAxis).toBe('x')
        expect(pose.wheels[0].y).toBe(pose.wheels[1].y)
        expect(Math.abs(pose.wheels[0].x - pose.wheels[1].x)).toBeGreaterThan(25)
      }
    },
  )

  it.each(['Walking', 'Bicycle', 'ElectricScooter', 'Motorcycle'] as const)(
    '%s shows a front face and a rear backpack, never eyes through the back of the cap', state => {
      expect(getCourierPose(state, 'up').faceVisible).toBe(false)
      expect(getCourierPose(state, 'up').backpackVisible).toBe(true)
      expect(getCourierPose(state, 'down').faceVisible).toBe(true)
      expect(getCourierPose(state, 'down').backpackVisible).toBe(false)
      expect(getCourierPose(state, 'left').head.x).toBeLessThan(0)
      expect(getCourierPose(state, 'right').head.x).toBeGreaterThan(0)
    },
  )

  it('keeps the car and delivery van physically distinct and encloses their riders', () => {
    for (const direction of COURIER_DIRECTIONS) {
      const car = getCourierPose('Car', direction)
      const van = getCourierPose('DeliveryVan', direction)
      expect(car.riderVisible).toBe(false)
      expect(van.riderVisible).toBe(false)
      expect(van.bodyLength).toBeGreaterThan(car.bodyLength)
      expect(van.bodyWidth).toBeGreaterThan(car.bodyWidth)
      expect(car.wheelAxis).toBe(direction === 'up' || direction === 'down' ? 'y' : 'x')
    }
  })

  it('uses a deterministic four-step walk/pedal cycle and a neutral rest frame', () => {
    expect([0, 115, 230, 345, 460].map(time => courierAnimationFrame(time, true))).toEqual([0, 1, 2, 3, 0])
    expect(courierAnimationFrame(345, false)).toBe(0)
    expect(courierAnimationFrame(NaN, true)).toBe(0)
    expect(courierAnimationFrame(-20, true)).toBe(0)
    expect(getCourierPose('Walking', 'down', 1).feet).not.toEqual(getCourierPose('Walking', 'down', 3).feet)
  })

  it.each(COURIER_DIRECTIONS)('separates the %s rider backpack from loaded bicycle cargo', facing => {
    const pose = getCourierPose('Bicycle', facing, 1, true)
    expect(pose.backpack).not.toEqual(pose.cargo)
    expect(pose.backpack.y).toBeLessThan(-20)
    expect(Object.isFrozen(pose.hands)).toBe(true)
    expect(getCourierPose('Bicycle', facing, 1).feet).not.toEqual(getCourierPose('Bicycle', facing, 3).feet)
    if (facing === 'up') expect(pose.cargo.y).toBeGreaterThan(0)
    if (facing === 'down') expect(Math.abs(pose.cargo.x)).toBeGreaterThan(15)
  })
})

describe('real Graphics character art and atlas lifecycle', () => {
  it.each(COURIER_STATES)('draws %s using every descriptor rather than a UI vehicle glyph', state => {
    const mock = artScene()
    for (const direction of COURIER_DIRECTIONS) {
      mock.calls.length = 0
      drawCourierFrame(mock.graphics() as unknown as Phaser.GameObjects.Graphics,
        getCourierPose(state, direction, 1, true))
      expect(mock.calls.filter(call => call.method.startsWith('fill')).length).toBeGreaterThan(15)
      expect(mock.calls.some(call => call.method === 'clear')).toBe(false)
      expect(mock.calls.flatMap(call => call.args).filter(arg => typeof arg === 'number').every(Number.isFinite)).toBe(true)
    }
  })

  it('renders vertical bicycle tires as narrow ellipses in projection, not side-view circles', () => {
    const mock = artScene()
    const pose = getCourierPose('Bicycle', 'up')
    drawCourierFrame(mock.graphics() as unknown as Phaser.GameObjects.Graphics, pose)
    for (const wheel of pose.wheels) {
      expect(mock.calls.some(call => call.method === 'fillRoundedRect' &&
        JSON.stringify(call.args) === JSON.stringify([wheel.x - 3, wheel.y - 12, 6, 24, 3]))).toBe(true)
      expect(mock.calls.some(call => call.method === 'fillCircle' &&
        call.args[0] === wheel.x && call.args[1] === wheel.y && call.args[2] === 12)).toBe(false)
    }
  })

  it.each(COURIER_DIRECTIONS)('connects %s cycling hands to the actual handlebar', facing => {
    const mock = artScene()
    const pose = getCourierPose('Bicycle', facing)
    drawCourierFrame(mock.graphics() as unknown as Phaser.GameObjects.Graphics, pose)
    const hands = pose.projection === 'profile' ? [pose.hands[0]] : pose.hands
    for (const hand of hands) {
      expect(mock.calls.some(call => call.method === 'fillCircle' &&
        call.args[0] === hand.x && call.args[1] === hand.y && call.args[2] === 3)).toBe(true)
      expect(mock.calls.some(call => call.method === 'lineBetween' &&
        ((call.args[0] === hand.x && call.args[1] === hand.y) ||
         (call.args[2] === hand.x && call.args[3] === hand.y)))).toBe(true)
    }
  })

  it('draws loaded rear cargo in front of the northbound rider, not behind their legs', () => {
    const mock = artScene()
    const pose = getCourierPose('Bicycle', 'up', 0, true)
    drawCourierFrame(mock.graphics() as unknown as Phaser.GameObjects.Graphics, pose)
    const parcel = mock.calls.findIndex(call => call.method === 'fillRoundedRect' &&
      call.args[0] === pose.cargo.x - 9 && call.args[1] === pose.cargo.y - 9 && call.args[2] === 18)
    const cap = mock.calls.findIndex(call => call.method === 'fillRoundedRect' &&
      call.args[0] === pose.head.x - 9 && call.args[1] === pose.head.y - 10 && call.args[2] === 18)
    expect(parcel).toBeGreaterThan(cap)
    expect(cap).toBeGreaterThan(0)
  })

  it('builds exactly 32 small frames once per transport, shared across scene/player recreation', () => {
    const mock = artScene()
    const key = ensureCourierAtlas(mock.scene, 'Walking')
    expect(ensureCourierAtlas(mock.scene, 'Walking')).toBe(key)
    expect(mock.makeGraphics).toHaveBeenCalledTimes(1)
    expect(mock.textures.get(key)?.add).toHaveBeenCalledTimes(32)
    expect(mock.calls.find(call => call.method === 'generateTexture')?.args).toEqual([key, 448, 896])
    expect(mock.calls.filter(call => call.method === 'destroy')).toHaveLength(1)
  })

  it('animates without Graphics redraw, allocation, destruction, or negative-scale mirroring', () => {
    const mock = artScene()
    const visual = createPlayerVisual(mock.scene, 380, 270)
    const drawCount = mock.calls.length
    visual.setMoving(true)
    for (let i = 0; i < 2000; i++) visual.update(16)
    for (const direction of COURIER_DIRECTIONS) visual.setFacing(direction)
    visual.setCarrying(true)
    expect(mock.calls).toHaveLength(drawCount)
    expect(mock.makeGraphics).toHaveBeenCalledTimes(1)
    expect(mock.container.setScale).not.toHaveBeenCalled()
    expect(mock.image.setFrame).toHaveBeenLastCalledWith(getCourierPose('Walking', 'up', courierAnimationFrame(32000 % 460, true), true).atlasFrame)
    visual.setMoving(false)
    expect(mock.image.setFrame).toHaveBeenLastCalledWith(getCourierPose('Walking', 'up', 0, true).atlasFrame)
    visual.destroy()
    expect(mock.container.destroy).toHaveBeenCalledWith(true)
  })

  it('only changes transport explicitly and preserves cargo/facing when mounting or parking', () => {
    const mock = artScene()
    const visual = createPlayerVisual(mock.scene, 0, 0)
    visual.setCarrying(true)
    visual.setFacing('up')
    visual.setState('Bicycle')
    expect(mock.makeGraphics).toHaveBeenCalledTimes(2)
    expect(mock.image.setFrame).toHaveBeenLastCalledWith(getCourierPose('Bicycle', 'up', 0, true).atlasFrame)
    visual.setState('Walking')
    visual.setState('Bicycle')
    expect(mock.makeGraphics).toHaveBeenCalledTimes(2)
    expect([...mock.textures.keys()].some(key => /Motorcycle|Car|Van/.test(key))).toBe(false)
    visual.setFacing(true)
    expect(mock.image.setFrame).toHaveBeenLastCalledWith(getCourierPose('Bicycle', 'left', 0, true).atlasFrame)
  })

  it('ignores invalid timing and repeated no-op state changes', () => {
    const mock = artScene()
    const visual = createPlayerVisual(mock.scene, 0, 0)
    visual.setState('Walking')
    visual.setFacing('down')
    visual.setCarrying(false)
    visual.setMoving(false)
    visual.update(500)
    visual.setMoving(true)
    visual.update(NaN)
    visual.update(Infinity)
    visual.update(-1)
    expect(mock.image.setFrame).not.toHaveBeenCalled()
  })
})
