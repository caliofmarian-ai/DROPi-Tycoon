import { describe, expect, it, vi } from 'vitest'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import { createSaveGame, restoreGameSessionFromSave } from '../src/persistence/saveSystem'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import { findWorldRoutePoint } from '../src/world/worldLayout'
import { URBAN_HQ, URBAN_MERCHANT } from '../src/world/urbanWorld'
import { UrbanDPadInput, urbanHUDLayout } from '../src/ui/UrbanHUD'
import type { WorldState } from '../src/types/game'

vi.mock('phaser', () => ({ default: { Scene: class {} } }))

import { getUrbanObjective, performUrbanInteraction } from '../src/scenes/GameWorldScene'

const at = (world: WorldState, point: { x: number; y: number }): WorldState =>
  ({ ...world, player: { ...world.player, x: point.x, y: point.y } })

describe('urban physical delivery scene', () => {
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
    const pickup = findWorldRoutePoint(world.activeOrder.pickupLocation)!
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

  it.each(['Accepted', 'PickedUp'] as const)('finishes a saved %s delivery to the legacy CompanyDelivery endpoint', status => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.activeOrder.destination = 'CompanyDelivery'
    world.activeOrder.status = status
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = status === 'PickedUp'
    const saved = createSaveGame({ world, company, settings: createInitialGameSettingsState() })
    let restored = restoreGameSessionFromSave(saved).world
    expect(restored.activeOrder.status).toBe(status)
    if (status === 'Accepted') {
      restored = performUrbanInteraction(at(restored, getUrbanObjective(restored).point), company).world
    }
    expect(restored.player.carryingPackage).toBe(true)
    const destination = findWorldRoutePoint('CompanyDelivery')!
    const delivered = performUrbanInteraction(at(restored, destination), company)
    expect(delivered.settled).toBe(true)
    expect(delivered.company.money).toBe(company.money + world.activeOrder.reward)
  })
})

describe('urban touch controls and compact HUD', () => {
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

  it.each([[740, 360], [360, 740], [390, 844], [844, 390]])(
    'keeps controls and menu separated at %ix%i',
    (width, height) => {
      const layout = urbanHUDLayout(width, height)
      const padRight = layout.pad.x + 3 * layout.pad.size
      const actionLeft = layout.action.x - layout.action.width / 2
      expect(padRight).toBeLessThan(actionLeft)
      expect(layout.pad.y).toBeGreaterThan(120)
      expect(layout.menu.y + 3 * layout.menu.rowHeight + layout.menu.rowHeight / 2)
        .toBeLessThan(layout.pad.y)
      expect(layout.minimap.x + layout.minimap.width).toBeLessThan(width)
      expect(layout.action.y + layout.action.height / 2).toBeLessThan(height)
      expect(layout.pad.size - 2).toBeGreaterThanOrEqual(44)
      expect(layout.transport.height).toBeGreaterThanOrEqual(44)
    },
  )
})
