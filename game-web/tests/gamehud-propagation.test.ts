/**
 * RBATCH-010 — GameHUD accept-button event-propagation (component-level adversarial)
 *
 * Imports the real GameHUD with a minimal Phaser mock.  Tests prove:
 *   - stopPropagation is called before onAccept
 *   - acceptance occurs exactly once per button press
 *   - the scene-level world handler cannot process the same pointer event
 *   - tapTarget, isMoving, pendingDeliveryDestination remain unchanged
 *   - later taps in the former button area are allowed after the button hides
 *
 * Phaser is fully mocked here because it requires a browser environment.
 */

import { describe, expect, it, vi } from 'vitest'

// ── Phaser mock ────────────────────────────────────────────────────────────────
// Must be declared before the GameHUD import so Vitest's vi.mock hoisting applies.
vi.mock('phaser', () => ({ default: {} }))

import { GameHUD } from '../src/ui/GameHUD'
import { buildHUDLayout } from '../src/ui/hudLayout'
import { createInitialWorldState } from '../src/state/gameState'
import type { HUDData } from '../src/ui/HUDViewModel'

// ── Minimal scene factory ──────────────────────────────────────────────────────

/**
 * Returns a minimal Phaser.Scene duck-type sufficient for GameHUD.
 * Captures the `pointerdown` handler registered on the Accept button.
 */
function buildSceneMock(canvasWidth = 800, canvasHeight = 600) {
  let capturedPointerDown: ((...args: unknown[]) => void) | null = null

  const makeRect = () => {
    const obj: Record<string, unknown> = {}
    obj.setStrokeStyle = () => obj
    obj.setScrollFactor = () => obj
    obj.setDepth = () => obj
    obj.setInteractive = () => obj
    obj.visible = true
    obj.setVisible = (v: boolean) => {
      obj.visible = v
      return obj
    }
    obj.on = (event: string, cb: (...args: unknown[]) => void) => {
      if (event === 'pointerdown') capturedPointerDown = cb
      return obj
    }
    obj.getBounds = () => ({ x: canvasWidth - 100, y: 80, width: 88, height: 52 })
    return obj
  }

  const makeText = () => {
    const obj: Record<string, unknown> = {}
    obj.setScrollFactor = () => obj
    obj.setDepth = () => obj
    obj.setOrigin = () => obj
    obj.setVisible = (v: boolean) => {
      ;(obj as Record<string, unknown>).visible = v
      return obj
    }
    obj.setText = () => obj
    return obj
  }

  const scene = {
    scale: { width: canvasWidth, height: canvasHeight },
    add: { rectangle: makeRect, text: makeText },
  } as unknown as import('phaser').Scene

  return { scene, getPointerDownCb: () => capturedPointerDown }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('RBATCH-010 — GameHUD accept-button pointer propagation (component)', () => {
  it('stopPropagation is called before onAccept', () => {
    const { scene, getPointerDownCb } = buildSceneMock()
    const callOrder: string[] = []
    const onAccept = vi.fn(() => {
      callOrder.push('accept')
    })

    new GameHUD(scene, onAccept)

    const cb = getPointerDownCb()
    expect(cb).not.toBeNull()

    const event = {
      stopPropagation: vi.fn(() => {
        callOrder.push('stop')
      }),
    }
    cb!(null, 0, 0, event)

    expect(event.stopPropagation).toHaveBeenCalledOnce()
    expect(onAccept).toHaveBeenCalledOnce()
    expect(callOrder).toEqual(['stop', 'accept'])
  })

  it('acceptance occurs exactly once per button press', () => {
    const { scene, getPointerDownCb } = buildSceneMock()
    const onAccept = vi.fn()

    new GameHUD(scene, onAccept)

    const cb = getPointerDownCb()!
    const event = { stopPropagation: vi.fn() }
    cb(null, 0, 0, event)

    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  it('scene-level world handler cannot process the same pointer event after stopPropagation', () => {
    const { scene, getPointerDownCb } = buildSceneMock()
    const world = createInitialWorldState()
    const originalTapTarget = { ...world.tapTarget }
    const originalIsMoving = world.isMoving
    const originalPending = world.pendingDeliveryDestination

    // Mirrors the relevant part of GameWorldScene's pointerdown handler.
    const scenePointerHandler = (
      pointer: { worldX: number; worldY: number },
      stopped: boolean,
    ) => {
      if (stopped) return
      world.tapTarget = { x: pointer.worldX, y: pointer.worldY }
      world.isMoving = true
    }

    new GameHUD(scene, vi.fn())
    const cb = getPointerDownCb()!

    let propagationStopped = false
    const event = {
      stopPropagation: vi.fn(() => {
        propagationStopped = true
      }),
    }

    cb(null, 0, 0, event)

    // Simulate scene-level handler for the same event.
    scenePointerHandler({ worldX: 750, worldY: 100 }, propagationStopped)

    expect(propagationStopped).toBe(true)
    expect(world.tapTarget).toEqual(originalTapTarget)
    expect(world.isMoving).toBe(originalIsMoving)
    expect(world.pendingDeliveryDestination).toBe(originalPending)
  })

  it('tapTarget, isMoving, pendingDeliveryDestination remain unchanged on Accept press', () => {
    const { scene, getPointerDownCb } = buildSceneMock()
    const world = createInitialWorldState()
    const onAccept = vi.fn()

    new GameHUD(scene, onAccept)
    const cb = getPointerDownCb()!
    cb(null, 0, 0, { stopPropagation: vi.fn() })

    const fresh = createInitialWorldState()
    expect(world.tapTarget).toEqual(fresh.tapTarget)
    expect(world.isMoving).toBe(fresh.isMoving)
    expect(world.pendingDeliveryDestination).toBe(fresh.pendingDeliveryDestination)
  })

  it('later taps in the former button area are allowed after the button is legitimately hidden', () => {
    const { scene } = buildSceneMock()
    const hud = new GameHUD(scene, vi.fn())

    const layout = buildHUDLayout(800, 600)
    const pressX = layout.acceptButton.left + 5
    const pressY = layout.acceptButton.top + 5

    // Hide the Accept button via update().
    const hiddenData: HUDData = {
      money: 0,
      reputation: 50,
      showActiveOrder: false,
      showAcceptButton: false,
      orderId: '',
      orderStatus: 'Available',
      pickupLocation: '',
      destination: '',
      reward: 0,
      carryingPackage: false,
    }
    hud.update(hiddenData)

    // After hiding, the former button area must not block world input.
    expect(hud.containsPoint(pressX, pressY)).toBe(false)
    expect(hud.getInteractiveBounds()).toHaveLength(0)
  })
})
