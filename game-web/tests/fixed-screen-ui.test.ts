import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { UrbanDPadInput, urbanHUDLayout } from '../src/ui/UrbanHUD'

const sceneSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)
const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')

describe('M-008 owner review — fixed screen-space UI architecture', () => {
  it('renders UI through a dedicated camera/layer independent from the world camera', () => {
    expect(sceneSource).toContain('this.fixedUiLayer = this.add.layer()')
    expect(sceneSource).toContain("'FixedScreenUI'")
    expect(sceneSource).toContain('this.fixedUiCamera.setZoom(1)')
    expect(sceneSource).toContain('this.fixedUiCamera.setRotation(0)')
    expect(sceneSource).toContain('this.fixedUiCamera.ignore(worldRenderObjects)')
    expect(sceneSource).toContain('this.cameras.main.ignore(this.fixedUiLayer)')
  })

  it('places HUD, notifications, navigation and D-pad on the fixed UI layer', () => {
    expect(sceneSource).toContain('new UrbanHUD(this, this.fixedUiLayer')
    expect(hudSource).toContain('this.layer.add(object)')
    expect(hudSource).toContain('this.createDPad()')
    expect(hudSource).toContain('this.toast = this.text(')
  })

  it('uses screen-owned held D-pad input rather than transforming arbitrary taps into world targets', () => {
    const pad = new UrbanDPadInput()
    pad.press(1, 'right')
    pad.release(2)
    expect(pad.value()).toEqual({ x: 1, y: 0 })
    pad.release(1)
    expect(pad.value()).toEqual({ x: 0, y: 0 })
    expect(sceneSource).not.toContain('getWorldPoint(')
    expect(sceneSource).not.toContain('pointer.worldX')
    expect(sceneSource).not.toContain('pointer.worldY')
  })

  it('keeps the menu outside the D-pad and action areas on the compact landscape screen', () => {
    const layout = urbanHUDLayout(740, 360)
    expect(layout.menu.x - layout.menu.width / 2).toBeGreaterThan(layout.pad.x + 3 * layout.pad.size)
    expect(layout.menu.y + 3.5 * layout.menu.rowHeight).toBeLessThan(layout.action.y - layout.action.height / 2)
  })

  it('keeps both cameras unrotated and removes dynamic zoom/rotation from the main RPG scene', () => {
    expect(sceneSource).toContain('this.cameras.main.setRotation(0).setZoom(1)')
    expect(sceneSource).not.toContain('applyCameraControl(')
    expect(sceneSource).not.toContain('this.fixedUiCamera.setZoom(zoom)')
    expect(sceneSource).not.toContain('this.fixedUiCamera.setRotation(rotation)')
  })
})
