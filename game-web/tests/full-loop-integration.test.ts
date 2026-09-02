import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import {
  autosaveIfApproved,
  inspectSaveSlot,
  restoreGameSessionFromSave,
  type SaveStorage,
} from '../src/persistence/saveSystem'
import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../src/state/gameState'
import { synchronizePlayerMovementSpeed } from '../src/systems/bicycleSystem'
import { settleDeliveryOutcome } from '../src/systems/economySettlement'
import { applyOrderAcceptanceRequest } from '../src/systems/orderAcceptance'
import { attemptDelivery, attemptPickup } from '../src/systems/orderSystem'
import { purchaseUpgrade } from '../src/systems/upgradeSystem'
import type { CompanyState, GameSessionState, WorldState } from '../src/types/game'
import { buildHUDLayout, buildNotificationLayout, boundsIntersect } from '../src/ui/hudLayout'
import { GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX } from '../src/ui/gameWorldTopBar'
import {
  buildCompanyManagementLayout,
  buildMainMenuLayout,
  buildNavigationButtonBounds,
  MIN_TOUCH_TARGET_PX,
  rectInsideViewport,
  SUPPORTED_ANDROID_VIEWPORTS,
} from '../src/ui/mobileViewport'

class MemorySaveStorage implements SaveStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

const initialSession = (): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
})

const acceptAndPickup = (world: WorldState): WorldState => {
  const acceptance = applyOrderAcceptanceRequest(world, world.activeOrder.orderId)
  expect(acceptance.accepted).toBe(true)
  expect(acceptance.worldState.activeOrder.status).toBe('Accepted')

  const pickup = attemptPickup(
    acceptance.worldState.activeOrder,
    acceptance.worldState.player,
    {
      distanceToPackage: 0,
      expectedPickupLocation: 'PickupZone',
      pickupRadius: acceptance.worldState.pickupRadius,
    },
  )

  expect(pickup.order.status).toBe('PickedUp')
  expect(pickup.player.carryingPackage).toBe(true)
  expect(pickup.player.currentOrder).toBe(world.activeOrder.orderId)

  return {
    ...acceptance.worldState,
    activeOrder: pickup.order,
    player: pickup.player,
  }
}

const deliverAndSettle = (
  world: WorldState,
  company: CompanyState,
  destination: string,
): { world: WorldState; company: CompanyState } => {
  const delivery = attemptDelivery(world.activeOrder, world.player, {
    selectedDestination: destination,
    distanceToDestination: 0,
    deliveryRadius: world.deliveryRadius,
    orderConditionsMet: true,
  })

  const settlement = settleDeliveryOutcome(world.activeOrder, delivery.order, company)
  expect(settlement.applied).toBe(true)
  if (!settlement.applied) {
    throw new Error(settlement.reason)
  }

  return {
    world: {
      ...world,
      activeOrder: settlement.order,
      player: delivery.player,
      pendingDeliveryDestination: '',
    },
    company: settlement.company,
  }
}

describe('RBATCH-016 — full-loop integration verification', () => {
  it('connects fresh startup → accept → pickup → success → economy → bicycle → autosave → continue', () => {
    const storage = new MemorySaveStorage()
    const started = initialSession()

    expect(started.company.money).toBe(BALANCING.INITIAL_MONEY)
    expect(started.company.reputation).toBe(BALANCING.INITIAL_REPUTATION)
    expect(started.world.player.movementSpeed).toBe(BALANCING.WALKING_MOVEMENT_SPEED)
    expect(started.world.activeOrder.status).toBe('Available')

    const carrying = acceptAndPickup(started.world)
    const completed = deliverAndSettle(carrying, started.company, carrying.activeOrder.destination)

    expect(completed.world.activeOrder.status).toBe('Completed')
    expect(completed.world.activeOrder.economySettled).toBe(true)
    expect(completed.world.player.carryingPackage).toBe(false)
    expect(completed.world.player.currentOrder).toBe('')
    expect(completed.company.money).toBe(BALANCING.ORDER_REWARD)
    expect(completed.company.reputation).toBe(
      BALANCING.INITIAL_REPUTATION + BALANCING.REPUTATION_ON_SUCCESS,
    )

    const completedSession: GameSessionState = {
      world: completed.world,
      company: completed.company,
      settings: started.settings,
    }
    expect(autosaveIfApproved(storage, completedSession, 'delivery-completed')).toEqual({
      saved: true,
      event: 'delivery-completed',
    })

    const purchase = purchaseUpgrade(completed.company, 'Bicycle')
    expect(purchase.purchased).toBe(true)
    if (!purchase.purchased) {
      throw new Error(purchase.message)
    }
    expect(purchase.company.money).toBe(0)
    expect(purchase.company.purchasedUpgradeLevels.Bicycle).toBe(1)

    const bicycleWorld = synchronizePlayerMovementSpeed(completed.world, purchase.company)
    expect(bicycleWorld.player.movementSpeed).toBe(BALANCING.BICYCLE_MOVEMENT_SPEED)

    const upgradedSession: GameSessionState = {
      world: bicycleWorld,
      company: purchase.company,
      settings: { tutorialCompleted: true },
    }
    expect(autosaveIfApproved(storage, upgradedSession, 'upgrade-purchased')).toEqual({
      saved: true,
      event: 'upgrade-purchased',
    })

    const slot = inspectSaveSlot(storage)
    expect(slot.kind).toBe('valid')
    if (slot.kind !== 'valid') {
      throw new Error(`Expected valid save, received ${slot.kind}`)
    }

    const continued = restoreGameSessionFromSave(slot.save)
    expect(continued.company).toEqual(purchase.company)
    expect(continued.settings.tutorialCompleted).toBe(true)
    expect(continued.world.player.movementSpeed).toBe(BALANCING.BICYCLE_MOVEMENT_SPEED)

    // ODR-001=A and transient-state policy: load regenerates the world/order,
    // rather than restoring completed order/player-position state.
    expect(continued.world.activeOrder.status).toBe('Available')
    expect(continued.world.activeOrder.economySettled).toBe(false)
    expect(continued.world.player.currentOrder).toBe('')
    expect(continued.world.player.carryingPackage).toBe(false)
    expect(continued.world.player.x).toBe(createInitialWorldState().player.x)
    expect(continued.world.player.y).toBe(createInitialWorldState().player.y)
  })

  it('connects fresh startup → accept → pickup → wrong destination → failure → reputation autosave → continue', () => {
    const storage = new MemorySaveStorage()
    const started = initialSession()
    const carrying = acceptAndPickup(started.world)
    const failed = deliverAndSettle(carrying, started.company, 'DeliveryPoint')

    expect(failed.world.activeOrder.status).toBe('Failed')
    expect(failed.world.activeOrder.economySettled).toBe(true)
    expect(failed.company.money).toBe(BALANCING.INITIAL_MONEY)
    expect(failed.company.reputation).toBe(
      BALANCING.INITIAL_REPUTATION + BALANCING.REPUTATION_ON_FAILURE,
    )

    const failedSession: GameSessionState = {
      world: failed.world,
      company: failed.company,
      settings: started.settings,
    }
    expect(autosaveIfApproved(storage, failedSession, 'progression-changed')).toEqual({
      saved: true,
      event: 'progression-changed',
    })

    const slot = inspectSaveSlot(storage)
    expect(slot.kind).toBe('valid')
    if (slot.kind !== 'valid') {
      throw new Error(`Expected valid save, received ${slot.kind}`)
    }

    const continued = restoreGameSessionFromSave(slot.save)
    expect(continued.company.money).toBe(BALANCING.INITIAL_MONEY)
    expect(continued.company.reputation).toBe(
      BALANCING.INITIAL_REPUTATION + BALANCING.REPUTATION_ON_FAILURE,
    )
    expect(continued.world.activeOrder.status).toBe('Available')
    expect(continued.world.player.carryingPackage).toBe(false)
  })

  it('preserves canonical autosave boundaries when the loop crosses transient order states', () => {
    const storage = new MemorySaveStorage()
    const started = initialSession()
    const accepted = applyOrderAcceptanceRequest(started.world, started.world.activeOrder.orderId)
    expect(accepted.accepted).toBe(true)

    const acceptedSession: GameSessionState = {
      ...started,
      world: accepted.worldState,
    }
    expect(autosaveIfApproved(storage, acceptedSession, 'order-accepted')).toEqual({
      saved: false,
      reason: 'not-approved',
    })
    expect(inspectSaveSlot(storage).kind).toBe('missing')

    const carrying = acceptAndPickup(started.world)
    const pickedUpSession: GameSessionState = {
      ...started,
      world: carrying,
    }
    expect(autosaveIfApproved(storage, pickedUpSession, 'package-picked-up')).toEqual({
      saved: false,
      reason: 'not-approved',
    })
    expect(inspectSaveSlot(storage).kind).toBe('missing')
  })

  it('keeps integrated UI surfaces usable throughout the supported mobile viewport matrix', () => {
    for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
      const menu = buildMainMenuLayout(viewport.width, viewport.height, 4, false)
      expect(menu.buttonHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      for (const center of menu.actionCenters) {
        expect(
          rectInsideViewport(
            {
              left: center.x - menu.buttonWidth / 2,
              top: center.y - menu.buttonHeight / 2,
              width: menu.buttonWidth,
              height: menu.buttonHeight,
            },
            viewport.width,
            viewport.height,
          ),
        ).toBe(true)
      }

      const company = buildCompanyManagementLayout(viewport.width, viewport.height)
      expect(rectInsideViewport(company.purchase, viewport.width, viewport.height)).toBe(true)
      expect(company.purchase.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)

      const hud = buildHUDLayout(viewport.width, viewport.height)
      const notification = buildNotificationLayout(viewport.width, viewport.height)
      const navigation = buildNavigationButtonBounds(viewport.width, viewport.height)
      expect(hud.acceptButton.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
      navigation.forEach((rect) => {
        expect(rectInsideViewport(rect, viewport.width, viewport.height)).toBe(true)
        expect(boundsIntersect(hud.orderPanel, rect)).toBe(false)
        expect(boundsIntersect(notification, rect)).toBe(false)
      })
    }
  })
})
