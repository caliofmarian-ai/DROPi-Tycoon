import { describe, expect, it, vi } from 'vitest'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import { createSaveGame, restoreGameSessionFromSave } from '../src/persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../src/state/gameSession'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import * as marketplace from '../src/systems/urbanMarketplace'
import { findWorldRoutePoint } from '../src/world/worldLayout'
import { URBAN_HQ, URBAN_MERCHANT } from '../src/world/urbanWorld'
import { directionFromDPadPoint, UrbanDPadInput, urbanHUDLayout, urbanStatusText } from '../src/ui/UrbanHUD'
import type { WorldState } from '../src/types/game'

vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Input: { Keyboard: { JustDown: (key: { justDown: boolean }) => {
      const pressed = key.justDown
      key.justDown = false
      return pressed
    } } },
  },
}))

import { GameWorldScene } from '../src/scenes/GameWorldScene'
import { getUrbanObjective, performUrbanInteraction } from '../src/systems/urbanInteractions'

const at = (world: WorldState, point: { x: number; y: number }): WorldState =>
  ({ ...world, player: { ...world.player, x: point.x, y: point.y } })

describe('urban physical delivery scene', () => {
  it.each(['Accepted', 'PickedUp'] as const)('does not auto-interact with a nearby %s job during update', status => {
    const scene = new GameWorldScene()
    let world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.activeOrder.status = status
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = status === 'PickedUp'
    world = at(world, getUrbanObjective(world).point)
    Object.assign(scene, {
      worldState: world,
      companyState: createInitialCompanyState(),
      hud: { movement: () => ({ x: 0, y: 0 }), isMenuOpen: () => false },
      playerVisual: { container: { setPosition: vi.fn() }, setMoving: vi.fn(), update: vi.fn() },
    })
    scene.update(0, 16)
    expect(world.activeOrder.status).toBe(status)
  })

  it('moves from held D-pad input, but not from legacy tap targets or an open menu', () => {
    const scene = new GameWorldScene()
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.tapTarget = { x: 800, y: 900 }
    world.isMoving = true
    let input = { x: 0, y: 0 }
    let menuOpen = false
    Object.assign(scene, {
      worldState: world,
      companyState: createInitialCompanyState(),
      hud: { movement: () => input, isMenuOpen: () => menuOpen },
      playerVisual: {
        container: { setPosition: vi.fn() }, setMoving: vi.fn(), setFacing: vi.fn(), update: vi.fn(),
      },
    })
    scene.update(0, 16)
    expect(world.player.x).toBe(URBAN_HQ.x)
    input = { x: 1, y: 0 }
    scene.update(0, 16)
    expect(world.player.x).toBeGreaterThan(URBAN_HQ.x)
    const stoppedX = world.player.x
    menuOpen = true
    scene.update(0, 16)
    expect(world.player.x).toBe(stoppedX)
  })

  it.each([
    ['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0],
  ] as const)('turns the courier %s from direct movement input', (direction, x, y) => {
    const scene = new GameWorldScene()
    const world = createInitialWorldState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    const setFacing = vi.fn()
    Object.assign(scene, {
      worldState: world,
      companyState: createInitialCompanyState(),
      hud: { movement: () => ({ x, y }), isMenuOpen: () => false },
      playerVisual: {
        container: { setPosition: vi.fn() }, setMoving: vi.fn(), setFacing, update: vi.fn(),
      },
    })
    scene.update(0, 16)
    expect(setFacing).toHaveBeenCalledWith(direction)
  })

  it('equips an owned bicycle only at HQ and parks it without losing carried cargo', () => {
    const scene = new GameWorldScene()
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    world.player.carryingPackage = true
    world.player.currentOrder = world.activeOrder.orderId
    world.activeOrder.status = 'PickedUp'
    const key = { justDown: true }
    const marker = { setPosition: vi.fn() }
    const parcel = { setPosition: () => parcel, setVisible: vi.fn() }
    Object.assign(scene, {
      worldState: world,
      companyState: company,
      keys: { T: key },
      cameras: { main: { worldView: { x: 0, y: 0, width: 740, height: 360 } } },
      hud: { movement: () => ({ x: 0, y: 0 }), isMenuOpen: () => false, notify: vi.fn(), update: vi.fn() },
      objectiveMarker: marker,
      parcel,
      playerVisual: {
        container: { setPosition: vi.fn() }, setMoving: vi.fn(), setFacing: vi.fn(),
        update: vi.fn(), setState: vi.fn(), setCarrying: vi.fn(),
      },
    })
    scene.update(0, 16)
    expect(world.urban.activeTransport).toBe('walking')
    company.vehicles.push({ vehicleId: 'owned-bike', typeId: 'Bicycle' })
    Object.assign(world.player, URBAN_MERCHANT)
    key.justDown = true
    scene.update(0, 16)
    expect(world.urban.activeTransport).toBe('walking')
    Object.assign(world.player, URBAN_HQ)
    key.justDown = true
    scene.update(0, 16)
    expect(world.urban.activeTransport).toBe('bicycle')
    expect(world.player.carryingPackage).toBe(true)
    key.justDown = true
    scene.update(0, 16)
    expect(world.urban.activeTransport).toBe('walking')
    expect(world.player.carryingPackage).toBe(true)
  })

  it('requires merchant onboarding, then a physical visit to HQ before acceptance', () => {
    const company = createInitialCompanyState()
    const initial = createInitialWorldState()
    expect(getUrbanObjective(initial).point).toEqual(URBAN_MERCHANT)
    const blocked = performUrbanInteraction(at(initial, URBAN_HQ), company)
    expect(blocked.world.activeOrder.status).toBe('Available')
    expect(blocked.world.urban?.merchantOnboarded).toBe(false)
    const onboarded = performUrbanInteraction(at(blocked.world, URBAN_MERCHANT), company)
    expect(onboarded.world.urban?.merchantOnboarded).toBe(true)
    expect(onboarded.world.activeOrder.status).toBe('Available')
    expect(performUrbanInteraction(onboarded.world, company).world.activeOrder.status).toBe('Available')
    const accepted = performUrbanInteraction(at(onboarded.world, URBAN_HQ), company)
    expect(accepted.world.activeOrder.status).toBe('Accepted')
    expect(accepted.world.player.carryingPackage).toBe(false)
    expect(accepted.world.player.currentOrder).toBe(initial.activeOrder.orderId)
  })

  it.each([1, 2, 3])('plays route %i only through explicit nearby pickup and delivery actions', sequence => {
    const company = createInitialCompanyState()
    const world = createInitialWorldState()
    world.activeOrder = createOrderForSequence(sequence)
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    const accepted = performUrbanInteraction(at(world, URBAN_HQ), company)
    expect(accepted.world.activeOrder.pickupLocation).toBe(world.activeOrder.pickupLocation)
    expect(accepted.world.activeOrder.orderId).toBe(world.activeOrder.orderId)
    expect(accepted.world.activeOrder.destination).toBe(world.activeOrder.destination)
    const pickup = findWorldRoutePoint(accepted.world.activeOrder.pickupLocation)!
    const destination = findWorldRoutePoint(world.activeOrder.destination)!
    const remotePickup = performUrbanInteraction(accepted.world, company)
    expect(remotePickup.world.activeOrder.status).toBe('Accepted')
    const arrived = at(accepted.world, pickup)
    expect(arrived.player.carryingPackage).toBe(false)
    const picked = performUrbanInteraction(arrived, company)
    expect(picked.world.activeOrder.status).toBe('PickedUp')
    expect(picked.world.player.carryingPackage).toBe(true)
    const remoteDelivery = performUrbanInteraction(picked.world, company)
    expect(remoteDelivery.settled).toBe(false)
    expect(remoteDelivery.company.money).toBe(company.money)
    const delivered = performUrbanInteraction(at(picked.world, destination), company)
    expect(delivered.settled).toBe(true)
    expect(delivered.company.money).toBe(company.money + world.activeOrder.reward)
    expect(delivered.company.reviews).toHaveLength(1)
    expect(delivered.world.activeOrder.status).toBe('Available')
    expect(delivered.world.activeOrder.orderId).not.toBe(world.activeOrder.orderId)
    expect(delivered.world.player.carryingPackage).toBe(false)
    const duplicate = performUrbanInteraction(delivered.world, delivered.company)
    expect(duplicate.settled).toBe(false)
    expect(duplicate.company.money).toBe(delivered.company.money)
    expect(duplicate.company.reviews).toHaveLength(1)
  })

  it('keeps legacy accepted and picked-up jobs playable without onboarding', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    delete world.urban
    world.activeOrder.status = 'Accepted'
    world.player.currentOrder = world.activeOrder.orderId
    const pickup = findWorldRoutePoint(world.activeOrder.pickupLocation)!
    expect(getUrbanObjective(world).point).toEqual({ x: pickup.x, y: pickup.y })
    const picked = performUrbanInteraction(at(world, pickup), company)
    expect(picked.world.activeOrder.status).toBe('PickedUp')
    expect(picked.world.urban?.merchantOnboarded).toBe(false)
    const destination = findWorldRoutePoint(world.activeOrder.destination)!
    expect(getUrbanObjective(picked.world).point).toEqual(destination)
    const delivered = performUrbanInteraction(at(picked.world, destination), company)
    expect(delivered.settled).toBe(true)
    expect(getUrbanObjective(delivered.world).point).toEqual(URBAN_MERCHANT)
  })

  it('blocks physical pickup when the shared cargo projection has no spare capacity', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    world.player.currentOrder = world.activeOrder.orderId
    Object.assign(world.player, URBAN_MERCHANT)
    const projectedCargo = vi.spyOn(marketplace, 'cargoForPlayer').mockReturnValue({
      capacity: 1,
      parcels: [{ parcelId: 'existing-parcel', orderId: 'ORDER-999', cargoUnits: 1 }],
    })
    try {
      const result = performUrbanInteraction(world, createInitialCompanyState())
      expect(projectedCargo).toHaveBeenCalledWith(expect.any(Object), 'walking')
      expect(result.world.activeOrder.status).toBe('Accepted')
      expect(result.world.player.carryingPackage).toBe(false)
      expect(result.message).toContain('No cargo space')
    } finally {
      projectedCargo.mockRestore()
    }
  })

  it('uses the displayed interaction boundary and rejects remote actions', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'Accepted'
    world.player.currentOrder = world.activeOrder.orderId
    const point = getUrbanObjective(world).point
    const company = createInitialCompanyState()
    const outside = at(world, { x: point.x + 48.01, y: point.y })
    expect(performUrbanInteraction(outside, company).world.activeOrder.status).toBe('Accepted')
    const edge = at(world, { x: point.x + 48, y: point.y })
    expect(performUrbanInteraction(edge, company).world.activeOrder.status).toBe('PickedUp')
  })

  it('does not mutate source state when a transaction onboards or accepts', () => {
    const world = at(createInitialWorldState(), URBAN_MERCHANT)
    const before = structuredClone(world)
    performUrbanInteraction(world, createInitialCompanyState())
    expect(world).toEqual(before)
  })

  it.each(['Accepted', 'PickedUp'] as const)('continues %s work during navigation and across disk load', status => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
    const activeDestination = world.activeOrder.destination
    world.activeOrder.status = status
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = status === 'PickedUp'
    const saved = createSaveGame({ world, company, settings: createInitialGameSettingsState() })
    const loaded = restoreGameSessionFromSave(saved)
    expect(loaded.world.activeOrder.status).toBe(status)
    expect(loaded.world.activeOrder.orderId).toBe(world.activeOrder.orderId)
    expect(loaded.world.player.carryingPackage).toBe(status === 'PickedUp')
    expect(loaded.world.player.currentOrder).toBe(world.activeOrder.orderId)
    expect(loaded.world.urban?.merchantOnboarded).toBe(true)
    expect(loaded.company.money).toBe(company.money)
    replaceGameSession(world, company)
    let restored = getOrCreateGameSession().world
    expect(restored.activeOrder.status).toBe(status)
    if (status === 'Accepted') {
      restored = performUrbanInteraction(at(restored, getUrbanObjective(restored).point), company).world
    }
    expect(restored.player.carryingPackage).toBe(true)
    const destination = findWorldRoutePoint(activeDestination)!
    const delivered = performUrbanInteraction(at(restored, destination), company)
    expect(delivered.settled).toBe(true)
    expect(delivered.company.money).toBe(company.money + world.activeOrder.reward)
  })
})

describe('urban touch controls and compact HUD', () => {
  it('shows actual cargo count and selected profile capacity', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    expect(urbanStatusText(world, company)).toContain('Walking  Cargo 0/1')
    world.urban = { merchantOnboarded: true, activeTransport: 'bicycle' }
    expect(urbanStatusText(world, company)).toContain('Bicycle  Cargo 0/3')
    world.player.carryingPackage = true
    expect(urbanStatusText(world, company)).toContain('Bicycle  Cargo 1/3')
  })

  it('supports diagonal multitouch and independent releases', () => {
    const pad = new UrbanDPadInput()
    pad.press(1, 'up')
    pad.press(2, 'right')
    expect(pad.value()).toEqual({ x: 1, y: -1 })
    pad.release(3)
    expect(pad.value()).toEqual({ x: 1, y: -1 })
    pad.release(1)
    expect(pad.value()).toEqual({ x: 1, y: 0 })
    pad.clear()
    expect(pad.value()).toEqual({ x: 0, y: 0 })
  })

  it('slides one pointer between directions without keeping stale movement', () => {
    const pad = new UrbanDPadInput()
    pad.press(1, 'left')
    pad.press(1, 'down')
    expect(pad.value()).toEqual({ x: 0, y: 1 })
    pad.press(2, 'up')
    expect(pad.value()).toEqual({ x: 0, y: 0 })
  })

  it('maps the compact unified touch surface to cardinal directions with a neutral center', () => {
    const extent = 108
    expect(directionFromDPadPoint(54, 8, extent)).toBe('up')
    expect(directionFromDPadPoint(54, 100, extent)).toBe('down')
    expect(directionFromDPadPoint(8, 54, extent)).toBe('left')
    expect(directionFromDPadPoint(100, 54, extent)).toBe('right')
    expect(directionFromDPadPoint(54, 54, extent)).toBeNull()
    expect(directionFromDPadPoint(-1, 54, extent)).toBeNull()
  })

  it.each([[740, 360], [360, 740], [390, 844], [844, 390]])(
    'keeps controls and menu separated at %ix%i',
    (width, height) => {
      const layout = urbanHUDLayout(width, height)
      const padRight = layout.pad.x + 3 * layout.pad.size
      const actionLeft = layout.action.x - layout.action.width / 2
      expect(padRight).toBeLessThan(actionLeft)
      expect(layout.pad.y).toBeGreaterThan(120)
      expect(layout.menu.x - layout.menu.width / 2).toBeGreaterThan(padRight)
      expect(layout.menu.y + 3 * layout.menu.rowHeight + layout.menu.rowHeight / 2)
        .toBeLessThan(layout.transport.y - layout.transport.height / 2)
      expect(layout.minimap.x + layout.minimap.width).toBeLessThan(width)
      expect(layout.action.y + layout.action.height / 2).toBeLessThan(height)
      expect(layout.pad.size).toBeGreaterThanOrEqual(38)
      expect(layout.pad.size).toBeLessThanOrEqual(40)
      expect(layout.pad.size * 3).toBeGreaterThanOrEqual(114)
      expect(layout.pad.size * 3).toBeLessThanOrEqual(120)
      expect(layout.transport.height).toBeGreaterThanOrEqual(44)
      expect(layout.menu.rowHeight).toBeGreaterThanOrEqual(44)
      expect(layout.toast.y).toBeGreaterThan(height / 2 + 40)
      expect(layout.toast.y + layout.toast.height).toBeLessThan(height - 14)
      if (width > height) {
        expect(layout.toast.x - layout.toast.width / 2).toBeGreaterThan(padRight)
        expect(layout.toast.x + layout.toast.width / 2).toBeLessThan(actionLeft)
      } else {
        expect(layout.toast.y + layout.toast.height).toBeLessThan(layout.pad.y)
      }
    },
  )
})