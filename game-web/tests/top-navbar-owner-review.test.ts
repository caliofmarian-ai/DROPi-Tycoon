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

  it('reserves the world camera below the dock instead of drawing the map beneath it', () => {
    expect(sceneSource).toContain('topDockLayout.worldViewportTop')
    expect(sceneSource).toContain('this.cameras.main.setViewport(')
    expect(sceneSource).toContain('this.scale.height - topDockLayout.worldViewportTop')
  })

  it('keeps Main Menu and Company behind the single navbar toggle', () => {
    expect(sceneSource).toContain("this.createTopIconButton(layout.menuToggle, '☰'")
    expect(sceneSource).toContain("[layout.dropdownItems[0], 'Main Menu'")
    expect(sceneSource).toContain("[layout.dropdownItems[1], 'Company'")
    expect(sceneSource).toContain('this.setNavigationMenuOpen(false)')
  })

  it('prevents the fixed dock from becoming a map gesture/tap surface', () => {
    expect(sceneSource).toContain('...(this.topControlBarBounds ? [this.topControlBarBounds] : [])')
    expect(sceneSource).toContain('shouldIgnorePointer: (point) => this.isPointOnFixedScreenUI')
  })
})
