import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildCameraControlButtons,
  CAMERA_DEFAULT_ZOOM,
  CAMERA_MAX_ZOOM,
  CAMERA_MIN_ZOOM,
  CAMERA_PAN_THRESHOLD_PX,
  clampCameraZoom,
  normalizeCameraRotation,
  rotateByStep,
  rotationFromTwist,
  shouldPanCamera,
  touchAngle,
  touchCentroid,
  touchDistance,
  zoomByStep,
  zoomFromPinch,
} from '../src/ui/cameraControls'
import { rectInsideViewport, SUPPORTED_ANDROID_VIEWPORTS } from '../src/ui/mobileViewport'
import { GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX } from '../src/ui/gameWorldTopBar'

const sceneSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)
const pointerIsolationSource = readFileSync(
  new URL('../src/ui/pointerIsolation.ts', import.meta.url),
  'utf8',
)

describe('release blocker #269 — camera control math', () => {
  it('clamps zoom to a deterministic mobile-safe range', () => {
    expect(clampCameraZoom(-5)).toBe(CAMERA_MIN_ZOOM)
    expect(clampCameraZoom(99)).toBe(CAMERA_MAX_ZOOM)
    expect(clampCameraZoom(Number.NaN)).toBe(CAMERA_DEFAULT_ZOOM)
  })

  it('supports explicit zoom-in and zoom-out steps', () => {
    expect(zoomByStep(1, 'in')).toBeGreaterThan(1)
    expect(zoomByStep(1, 'out')).toBeLessThan(1)
    expect(zoomByStep(CAMERA_MAX_ZOOM, 'in')).toBe(CAMERA_MAX_ZOOM)
    expect(zoomByStep(CAMERA_MIN_ZOOM, 'out')).toBe(CAMERA_MIN_ZOOM)
  })

  it('maps pinch distance changes to bounded zoom', () => {
    expect(zoomFromPinch(1, 100, 150)).toBe(1.5)
    expect(zoomFromPinch(1, 100, 50)).toBe(CAMERA_MIN_ZOOM)
    expect(zoomFromPinch(1, 0, 200)).toBe(1)
  })

  it('normalizes rotation and supports explicit rotate steps', () => {
    expect(normalizeCameraRotation(Math.PI * 2)).toBeCloseTo(0)
    expect(normalizeCameraRotation(Math.PI * 3)).toBeCloseTo(-Math.PI)
    expect(rotateByStep(0, 'right')).toBeGreaterThan(0)
    expect(rotateByStep(0, 'left')).toBeLessThan(0)
  })

  it('applies two-finger twist deltas deterministically', () => {
    const quarterTurn = rotationFromTwist(0, 0, Math.PI / 2)
    expect(quarterTurn).toBeCloseTo(Math.PI / 2)
  })

  it('provides reusable touch geometry helpers', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 3, y: 4 }
    expect(touchDistance(a, b)).toBe(5)
    expect(touchAngle(a, { x: 1, y: 0 })).toBe(0)
    expect(touchCentroid(a, b)).toEqual({ x: 1.5, y: 2 })
  })

  it('does not classify tiny pointer jitter as a camera pan', () => {
    expect(shouldPanCamera(CAMERA_PAN_THRESHOLD_PX - 1)).toBe(false)
    expect(shouldPanCamera(CAMERA_PAN_THRESHOLD_PX)).toBe(true)
  })
})

describe('release blocker #269 — mobile camera fallback controls', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps all camera controls touchable and inside ${viewport.width}x${viewport.height}`, () => {
      const controls = buildCameraControlButtons(viewport.width, viewport.height)
      expect(controls.map(({ action }) => action)).toEqual([
        'zoom-in',
        'zoom-out',
        'rotate-left',
        'rotate-right',
        'recenter',
      ])
      controls.forEach(({ bounds }) => {
        expect(bounds.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
        expect(bounds.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
        expect(rectInsideViewport(bounds, viewport.width, viewport.height)).toBe(true)
      })
    })
  }
})

describe('release blocker #269 — GameWorld integration contract', () => {
  it('replaces free-camera gestures with a stable unrotated direct-control camera', () => {
    expect(sceneSource).not.toContain('CameraGestureController')
    expect(sceneSource).not.toContain('buildCameraControlButtons')
    expect(sceneSource).toContain('this.cameras.main.setRotation(0).setZoom(1)')
  })

  it('removes free-tap movement and consumes held direction input instead', () => {
    expect(sceneSource).not.toContain('getWorldPoint(pointer.x, pointer.y)')
    expect(sceneSource).toContain('const touch = this.hud.movement()')
    expect(sceneSource).toContain('moveUrbanPlayer(before, input')
  })

  it('retains legacy pointer isolation while the playable scene blocks movement under its menu', () => {
    expect(pointerIsolationSource).toContain('cameraControlBounds')
    expect(sceneSource).toContain('this.hud.isMenuOpen() ? { x: 0, y: 0 }')
    expect(sceneSource).not.toContain('cameraControlBounds:')
  })

  it('keeps following the player without manual pan or rotation', () => {
    expect(sceneSource).not.toContain('stopFollow()')
    expect(sceneSource).not.toContain('panCameraByScreenDelta')
    expect(sceneSource).toContain('startFollow(this.player')
    expect(sceneSource).toContain('setRotation(0)')
  })
})
