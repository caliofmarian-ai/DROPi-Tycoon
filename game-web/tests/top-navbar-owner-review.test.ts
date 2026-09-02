import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildCameraControlButtons } from '../src/ui/cameraControls'
import {
  buildGameWorldTopBarLayout,
  GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX,
} from '../src/ui/gameWorldTopBar'
import { buildHUDLayout, boundsIntersect } from '../src/ui/hudLayout'
import { MIN_TOUCH_TARGET_PX, SUPPORTED_ANDROID_VIEWPORTS } from '../src/ui/mobileViewport'

const sceneSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)

describe('M-008 owner review — consolidated top navbar', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps all persistent controls in the top dock at ${viewport.width}x${viewport.height}`, () => {
      const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
      const hud = buildHUDLayout(viewport.width, viewport.height)
      const controls = buildCameraControlButtons(viewport.width, viewport.height)

      expect(topBar.menuToggle.top).toBeLessThan(topBar.hudRowTop)
      controls.forEach(({ bounds }) => {
        expect(bounds.top).toBe(topBar.menuToggle.top)
        expect(boundsIntersect(bounds, topBar.menuToggle)).toBe(false)
      })
      expect(hud.companyPanel.top).toBe(topBar.hudRowTop)
      expect(hud.orderPanel.top).toBe(topBar.hudRowTop)
      expect(hud.acceptButton.top).toBe(topBar.hudRowTop)
    })
  }

  it('keeps 48px touch targets while rendering camera/menu icons materially smaller', () => {
    expect(MIN_TOUCH_TARGET_PX).toBe(48)
    expect(GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX).toBeLessThan(MIN_TOUCH_TARGET_PX)
    expect(GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX).toBeGreaterThanOrEqual(36)
    expect(sceneSource).toContain('GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX')
    expect(sceneSource).toContain('0x0f172a, 0.001')
  })

  it('uses one navbar toggle instead of permanent Main Menu and Company map buttons', () => {
    expect(sceneSource).toContain("this.createTopIconButton(layout.menuToggle, '☰'")
    expect(sceneSource).toContain("[layout.dropdownItems[0], 'Main Menu'")
    expect(sceneSource).toContain("[layout.dropdownItems[1], 'Company'")
    expect(sceneSource).toContain('this.setNavigationMenuOpen(false)')
  })

  it('shows and hides dropdown destinations through explicit menu state', () => {
    expect(sceneSource).toContain('private navigationMenuOpen = false')
    expect(sceneSource).toContain('private setNavigationMenuOpen(open: boolean)')
    expect(sceneSource).toContain('button.setVisible(open)')
    expect(sceneSource).toContain('button.disableInteractive()')
    expect(sceneSource).toContain('this.menuDropdownLabels.forEach((label) => label.setVisible(open))')
  })

  it('prevents the fixed top toolbar from becoming a map gesture/tap surface', () => {
    expect(sceneSource).toContain('...(this.topControlBarBounds ? [this.topControlBarBounds] : [])')
    expect(sceneSource).toContain('shouldIgnorePointer: (point) => this.isPointOnFixedScreenUI')
  })
})
