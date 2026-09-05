import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildCameraControlButtons } from '../src/ui/cameraControls'
import {
  buildGameWorldTopBarLayout,
  GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX,
  GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX,
} from '../src/ui/gameWorldTopBar'
import { buildHUDLayout, boundsIntersect } from '../src/ui/hudLayout'
import { SUPPORTED_ANDROID_VIEWPORTS } from '../src/ui/mobileViewport'
import { urbanHUDLayout } from '../src/ui/UrbanHUD'

const sceneSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)

describe('M-008 owner review — compact non-overlapping top dock', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`reserves a compact fixed dock above the world at ${viewport.width}x${viewport.height}`, () => {
      const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
      const hud = buildHUDLayout(viewport.width, viewport.height)
      const controls = buildCameraControlButtons(viewport.width, viewport.height)

      expect(topBar.worldViewportTop).toBe(84)
      expect(topBar.worldViewportTop / viewport.height).toBeLessThan(0.25)
      controls.forEach(({ bounds }) => {
        expect(bounds.top).toBe(topBar.menuToggle.top)
        expect(bounds.width).toBe(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
        expect(bounds.height).toBe(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
        expect(boundsIntersect(bounds, topBar.menuToggle)).toBe(false)
      })
      expect(hud.companyPanel.top).toBe(topBar.hudRowTop)
      expect(hud.orderPanel.top).toBe(topBar.hudRowTop)
      expect(hud.acceptButton.top).toBe(topBar.menuToggle.top)
    })
  }

  it('shrinks visible GameWorld controls while retaining a usable local hit area', () => {
    expect(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX).toBe(44)
    expect(GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX).toBe(28)
    expect(GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX).toBeLessThan(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
  })

  it('keeps compact urban objectives and minimap above the direct controls', () => {
    const layout = urbanHUDLayout(740, 360)
    expect(layout.objective.y).toBeGreaterThanOrEqual(44)
    expect(layout.objective.y + 72).toBeLessThan(layout.pad.y)
    expect(layout.minimap.y + layout.minimap.height).toBeLessThan(layout.pad.y)
    expect(sceneSource).toContain('this.cameras.main.ignore(this.fixedUiLayer)')
  })

  it('keeps Main Menu and Company behind the single navbar toggle', () => {
    const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')
    expect(hudSource).toContain("'☰  Menu', () => this.toggleMenu()")
    expect(hudSource).toContain("['Main menu', callbacks.menu]")
    expect(hudSource).toContain("['Company', callbacks.company]")
    expect(hudSource).toContain('entry.button.setVisible(false).disableInteractive()')
  })

  it('does not let tapping the fixed dock create movement or a delivery target', () => {
    expect(sceneSource).not.toContain('getWorldPoint(pointer.x, pointer.y)')
    expect(sceneSource).not.toContain('selectDeliveryIntentFromTap')
    expect(sceneSource).toContain('this.hud.isMenuOpen() || this.zoomGesture.isPinching() ? { x: 0, y: 0 }')
  })
})
