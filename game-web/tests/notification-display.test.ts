/**
 * RBATCH-010 — NotificationDisplay component (Phaser component-level)
 *
 * Imports the real NotificationDisplay with a minimal Phaser mock.  Tests prove:
 *   - the production component uses buildNotificationLayout geometry at 800×600
 *   - the production component uses buildNotificationLayout geometry at 1280×720
 *   - background and text are camera-fixed (setScrollFactor(0))
 *   - show() displays the message
 *   - rapid replacement removes the previous timer and creates one replacement timer
 *   - expiry hides the display and invokes onExpired exactly once
 *   - expiry therefore permits the scene callback to clear controller state
 *   - hide() removes the active timer safely
 *   - destroy() removes an active timer safely
 *   - repeated hide/destroy is safe and does not leak timers
 *   - the notification remains non-interactive and does not obstruct input handling
 */

import { describe, expect, it, vi } from 'vitest'

// ── Phaser mock ────────────────────────────────────────────────────────────────
vi.mock('phaser', () => ({ default: {} }))

import { NotificationDisplay } from '../src/ui/NotificationDisplay'
import { buildNotificationLayout } from '../src/ui/hudLayout'
import { clearNotification, createNotificationState, updateNotification } from '../src/ui/NotificationController'

// ── Scene factory ──────────────────────────────────────────────────────────────

interface TimerHandle {
  callback: () => void
  removed: boolean
}

function buildSceneMock(canvasWidth = 800, canvasHeight = 600) {
  // All mutable state is held in closure variables; access via getters.
  const bgScrollFactors: number[] = []
  const textScrollFactors: number[] = []
  let bgInteractive = false
  let textInteractive = false
  const bgVisibilityLog: boolean[] = []
  const textVisibilityLog: boolean[] = []
  const textContentLog: string[] = []
  let rectCx = 0
  let rectCy = 0
  let rectW = 0
  let rectH = 0
  let rectCreated = false
  const timers: TimerHandle[] = []

  const bg: Record<string, unknown> = {}
  bg.setStrokeStyle = () => bg
  bg.setScrollFactor = (f: number) => { bgScrollFactors.push(f); return bg }
  bg.setDepth = () => bg
  bg.setVisible = (v: boolean) => { bgVisibilityLog.push(v); return bg }
  bg.setInteractive = () => { bgInteractive = true; return bg }

  const txt: Record<string, unknown> = {}
  txt.setOrigin = () => txt
  txt.setScrollFactor = (f: number) => { textScrollFactors.push(f); return txt }
  txt.setDepth = () => txt
  txt.setVisible = (v: boolean) => { textVisibilityLog.push(v); return txt }
  txt.setText = (s: string) => { textContentLog.push(s); return txt }
  txt.setInteractive = () => { textInteractive = true; return txt }

  const scene = {
    scale: { width: canvasWidth, height: canvasHeight },
    add: {
      rectangle: (cx: number, cy: number, w: number, h: number) => {
        rectCx = cx; rectCy = cy; rectW = w; rectH = h; rectCreated = true
        return bg
      },
      text: () => txt,
    },
    time: {
      delayedCall: (_ms: number, cb: () => void) => {
        const handle: TimerHandle = { callback: cb, removed: false }
        timers.push(handle)
        return {
          remove: (_b: boolean) => { handle.removed = true },
        }
      },
    },
  } as unknown as import('phaser').Scene

  return {
    scene,
    // Getters — read current mutable state after construction
    getRectArgs: () => rectCreated ? { cx: rectCx, cy: rectCy, w: rectW, h: rectH } : null,
    getBgScrollFactors: () => bgScrollFactors,
    getTextScrollFactors: () => textScrollFactors,
    isBgInteractive: () => bgInteractive,
    isTextInteractive: () => textInteractive,
    getBgVisibilityLog: () => bgVisibilityLog,
    getTextVisibilityLog: () => textVisibilityLog,
    getTextContentLog: () => textContentLog,
    getTimers: () => timers,
    fireLastTimer: () => {
      const last = timers[timers.length - 1]
      if (last) last.callback()
    },
    activeTimerCount: () => timers.filter((t) => !t.removed).length,
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('RBATCH-010 — NotificationDisplay component geometry', () => {
  it('uses buildNotificationLayout geometry at 800×600', () => {
    const mock = buildSceneMock(800, 600)
    new NotificationDisplay(mock.scene)
    const layout = buildNotificationLayout(800, 600)
    const expectedCx = layout.left + Math.floor(layout.width / 2)
    const expectedCy = layout.top + Math.floor(layout.height / 2)
    const args = mock.getRectArgs()
    expect(args).not.toBeNull()
    expect(args!.cx).toBe(expectedCx)
    expect(args!.cy).toBe(expectedCy)
    expect(args!.w).toBe(layout.width)
    expect(args!.h).toBe(layout.height)
  })

  it('uses buildNotificationLayout geometry at 1280×720', () => {
    const mock = buildSceneMock(1280, 720)
    new NotificationDisplay(mock.scene)
    const layout = buildNotificationLayout(1280, 720)
    const expectedCx = layout.left + Math.floor(layout.width / 2)
    const expectedCy = layout.top + Math.floor(layout.height / 2)
    const args = mock.getRectArgs()
    expect(args).not.toBeNull()
    expect(args!.cx).toBe(expectedCx)
    expect(args!.cy).toBe(expectedCy)
    expect(args!.w).toBe(layout.width)
    expect(args!.h).toBe(layout.height)
  })

  it('background and text are camera-fixed (setScrollFactor(0))', () => {
    const mock = buildSceneMock()
    new NotificationDisplay(mock.scene)
    expect(mock.getBgScrollFactors()).toContain(0)
    expect(mock.getTextScrollFactors()).toContain(0)
  })

  it('notification is non-interactive — setInteractive is never called', () => {
    const mock = buildSceneMock()
    new NotificationDisplay(mock.scene)
    expect(mock.isBgInteractive()).toBe(false)
    expect(mock.isTextInteractive()).toBe(false)
  })
})

describe('RBATCH-010 — NotificationDisplay show/hide/timer lifecycle', () => {
  it('show() makes background and text visible and sets the message', () => {
    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene)
    display.show('Order accepted!')
    expect(mock.getTextContentLog()).toContain('Order accepted!')
    const bgLog = mock.getBgVisibilityLog()
    const txtLog = mock.getTextVisibilityLog()
    expect(bgLog[bgLog.length - 1]).toBe(true)
    expect(txtLog[txtLog.length - 1]).toBe(true)
  })

  it('rapid replacement removes the previous timer and creates exactly one replacement timer', () => {
    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene)
    display.show('first')
    expect(mock.getTimers()).toHaveLength(1)
    display.show('second')
    // First timer must have been removed before the second was created
    expect(mock.getTimers()[0].removed).toBe(true)
    expect(mock.getTimers()).toHaveLength(2)
    expect(mock.activeTimerCount()).toBe(1)
  })

  it('expiry hides the display and invokes onExpired exactly once', () => {
    const onExpired = vi.fn()
    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene, onExpired)
    display.show('test message')
    mock.fireLastTimer()
    const bgLog = mock.getBgVisibilityLog()
    const txtLog = mock.getTextVisibilityLog()
    expect(bgLog[bgLog.length - 1]).toBe(false)
    expect(txtLog[txtLog.length - 1]).toBe(false)
    expect(onExpired).toHaveBeenCalledOnce()
  })

  it('expiry therefore permits the scene callback to clear controller state', () => {
    let notifState = createNotificationState('PickedUp')
    const { state: afterShow } = updateNotification(notifState, 'Completed')
    notifState = afterShow

    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene, () => {
      notifState = clearNotification(notifState)
    })
    display.show('Delivery successful +100 money')
    expect(notifState.active).toBe(true)

    mock.fireLastTimer()
    expect(notifState.active).toBe(false)
    expect(notifState.message).toBeNull()
  })

  it('hide() hides background and text and removes the active timer', () => {
    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene)
    display.show('visible')
    const timerBeforeHide = mock.getTimers()[mock.getTimers().length - 1]
    expect(timerBeforeHide.removed).toBe(false)
    display.hide()
    expect(timerBeforeHide.removed).toBe(true)
    const bgLog = mock.getBgVisibilityLog()
    const txtLog = mock.getTextVisibilityLog()
    expect(bgLog[bgLog.length - 1]).toBe(false)
    expect(txtLog[txtLog.length - 1]).toBe(false)
  })

  it('destroy() removes an active timer safely', () => {
    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene)
    display.show('about to destroy')
    const timer = mock.getTimers()[mock.getTimers().length - 1]
    expect(timer.removed).toBe(false)
    display.destroy()
    expect(timer.removed).toBe(true)
  })

  it('repeated hide() and destroy() are safe and do not leak timers', () => {
    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene)
    display.show('leak test')
    expect(() => {
      display.hide()
      display.hide()
      display.destroy()
      display.destroy()
    }).not.toThrow()
    expect(mock.getTimers()).toHaveLength(1)
    expect(mock.activeTimerCount()).toBe(0)
  })

  it('hide() with no active timer (never shown) is safe', () => {
    const mock = buildSceneMock()
    const display = new NotificationDisplay(mock.scene)
    expect(() => display.hide()).not.toThrow()
    expect(mock.getTimers()).toHaveLength(0)
  })
})
