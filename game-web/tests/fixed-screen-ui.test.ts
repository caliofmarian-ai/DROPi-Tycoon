import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const sceneSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)
const hudSource = readFileSync(new URL('../src/ui/GameHUD.ts', import.meta.url), 'utf8')
const notificationSource = readFileSync(
  new URL('../src/ui/NotificationDisplay.ts', import.meta.url),
  'utf8',
)
const gestureSource = readFileSync(
  new URL('../src/ui/CameraGestureController.ts', import.meta.url),
  'utf8',
)

describe('M-008 owner review — fixed screen-space UI architecture', () => {
  it('renders UI through a dedicated camera/layer independent from the world camera', () => {
    expect(sceneSource).toContain('this.fixedUiLayer = this.add.layer()')
    expect(sceneSource).toContain("'FixedScreenUI'")
    expect(sceneSource).toContain('this.fixedUiCamera.setZoom(1)')
    expect(sceneSource).toContain('this.fixedUiCamera.setRotation(0)')
    expect(sceneSource).toContain('this.fixedUiCamera.ignore(worldRenderObjects)')
    expect(sceneSource).toContain('this.cameras.main.ignore(this.fixedUiLayer)')
  })

  it('places HUD, notifications, navigation and camera controls on the fixed UI layer', () => {
    expect(sceneSource).toContain('this.fixedUiLayer.add([button, labelText])')
    expect(sceneSource).toContain('this.fixedUiLayer)')
    expect(hudSource).toContain('uiLayer?.add([')
    expect(notificationSource).toContain('uiLayer?.add([this.background, this.text])')
  })

  it('converts gameplay taps explicitly through the world camera instead of pointer.worldX/worldY', () => {
    expect(sceneSource).toContain('this.cameras.main.getWorldPoint(pointer.x, pointer.y)')
    expect(sceneSource).not.toContain('pointer.worldX')
    expect(sceneSource).not.toContain('pointer.worldY')
  })

  it('prevents map gestures from starting on fixed screen UI', () => {
    expect(sceneSource).toContain('shouldIgnorePointer: (point) => this.isPointOnFixedScreenUI')
    expect(gestureSource).toContain('shouldIgnorePointer?: (point: TouchPoint) => boolean')
    expect(gestureSource).toContain('this.ignoredPointerIds.add(event.pointerId)')
    expect(gestureSource).toContain('this.ignoredPointerIds.delete(event.pointerId)')
  })

  it('keeps the world camera as the only camera changed by zoom and rotation controls', () => {
    expect(sceneSource).toContain('const camera = this.cameras.main')
    expect(sceneSource).not.toContain('this.fixedUiCamera.setZoom(zoom)')
    expect(sceneSource).not.toContain('this.fixedUiCamera.setRotation(rotation)')
  })
})
