import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildHUDLayout,
  buildNotificationLayout,
  boundsIntersect,
  isBoundsInsideCanvas,
} from '../src/ui/hudLayout'
import {
  buildGameWorldTopBarLayout,
  GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX,
} from '../src/ui/gameWorldTopBar'
import {
  buildCompanyManagementLayout,
  buildMainMenuLayout,
  MIN_TOUCH_TARGET_PX,
  rectInsideViewport,
  SUPPORTED_ANDROID_VIEWPORTS,
} from '../src/ui/mobileViewport'

const gameConfigSource = readFileSync(
  new URL('../src/config/gameConfig.ts', import.meta.url),
  'utf8',
)
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

const assertTouchRect = (rect: { width: number; height: number }): void => {
  expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
  expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
}

describe('ISSUE-018 — responsive Android viewport fit', () => {
  it('uses a viewport-sized Phaser canvas instead of fitting one fixed logical canvas', () => {
    expect(gameConfigSource).toContain('Phaser.Scale.RESIZE')
    expect(gameConfigSource).not.toContain('mode: Phaser.Scale.FIT')
  })

  it('does not block portrait or require a rotate-device overlay', () => {
    expect(indexSource).not.toContain('rotate-device')
    expect(indexSource).not.toContain('@media (orientation: portrait)')
    expect(indexSource).toContain('viewport-fit=cover')
  })

  it('tests representative portrait and landscape Android viewports', () => {
    expect(SUPPORTED_ANDROID_VIEWPORTS.some(({ width, height }) => height > width)).toBe(true)
    expect(SUPPORTED_ANDROID_VIEWPORTS.some(({ width, height }) => width > height)).toBe(true)
  })

  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps MainMenu actions and modal inside ${viewport.width}x${viewport.height}`, () => {
      for (const [count, notice] of [[5, false], [6, false], [4, true]] as const) {
        const layout = buildMainMenuLayout(viewport.width, viewport.height, count, notice)
        expect(layout.actionCenters).toHaveLength(count)
        layout.actionCenters.forEach((center) => {
          const rect = {
            left: center.x - layout.buttonWidth / 2,
            top: center.y - layout.buttonHeight / 2,
            width: layout.buttonWidth,
            height: layout.buttonHeight,
          }
          expect(rectInsideViewport(rect, viewport.width, viewport.height)).toBe(true)
        })
        expect(rectInsideViewport(layout.modal.panel, viewport.width, viewport.height)).toBe(true)
      }
    })

    it(`uses a two-column MainMenu for landscape action sets at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildMainMenuLayout(viewport.width, viewport.height, 5, false)
      const distinctX = new Set(layout.actionCenters.map(({ x }) => x))

      if (viewport.width > viewport.height) {
        expect(distinctX.size).toBeGreaterThanOrEqual(2)
        expect(layout.actionCenters[0].x).not.toBe(layout.actionCenters[1].x)
        expect(layout.actionCenters[4].x).toBe(viewport.width / 2)
      } else {
        expect(distinctX.size).toBe(1)
      }
    })

    it(`keeps CompanyManagement controls inside ${viewport.width}x${viewport.height}`, () => {
      const layout = buildCompanyManagementLayout(viewport.width, viewport.height)
      expect(rectInsideViewport(layout.card, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.purchase, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.returnButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.menuButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.identityBar, viewport.width, viewport.height)).toBe(true)
    })

    it(`never overlaps the CompanyManagement identity bar and asset card at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildCompanyManagementLayout(viewport.width, viewport.height)
      expect(boundsIntersect(layout.identityBar, layout.card)).toBe(false)
      expect(layout.card.top).toBeGreaterThanOrEqual(layout.identityBar.top + layout.identityBar.height)
    })

    it(`keeps GameWorld top dock, HUD and notification inside ${viewport.width}x${viewport.height}`, () => {
      const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
      const hud = buildHUDLayout(viewport.width, viewport.height)
      const notification = buildNotificationLayout(viewport.width, viewport.height)
      const navigation = [topBar.menuToggle, ...topBar.dropdownItems]

      expect(rectInsideViewport(topBar.controlBar, viewport.width, viewport.height)).toBe(true)
      expect(isBoundsInsideCanvas(hud.companyPanel, viewport.width, viewport.height)).toBe(true)
      expect(isBoundsInsideCanvas(hud.orderPanel, viewport.width, viewport.height)).toBe(true)
      expect(isBoundsInsideCanvas(hud.acceptButton, viewport.width, viewport.height)).toBe(true)
      expect(isBoundsInsideCanvas(notification, viewport.width, viewport.height)).toBe(true)
      navigation.forEach((rect) => {
        expect(rectInsideViewport(rect, viewport.width, viewport.height)).toBe(true)
      })

      expect(hud.companyPanel.top).toBe(topBar.hudRowTop)
      expect(hud.orderPanel.top).toBe(topBar.hudRowTop)
      expect(hud.acceptButton.top).toBe(topBar.menuToggle.top)
      expect(boundsIntersect(notification, topBar.dropdownItems[0])).toBe(false)
      expect(boundsIntersect(notification, topBar.dropdownItems[1])).toBe(false)
    })
  }
})

describe('ISSUE-019 — touch comfort in actual viewport pixels', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`meets touch floor across primary controls at ${viewport.width}x${viewport.height}`, () => {
      const menu = buildMainMenuLayout(viewport.width, viewport.height, 5, false)
      expect(menu.buttonHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(menu.buttonWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(menu.modal.actionHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(menu.modal.closeWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(menu.modal.dualWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)

      const company = buildCompanyManagementLayout(viewport.width, viewport.height)
      assertTouchRect(company.purchase)
      assertTouchRect(company.returnButton)
      assertTouchRect(company.menuButton)

      const hud = buildHUDLayout(viewport.width, viewport.height)
      expect(hud.acceptButton.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
      expect(hud.acceptButton.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)

      const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
      expect(topBar.menuToggle.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
      expect(topBar.menuToggle.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
      topBar.dropdownItems.forEach((rect) => {
        expect(rect.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
        expect(rect.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
      })
    })
  }

  it('keeps the numeric touch threshold an implementation-level constant', () => {
    expect(MIN_TOUCH_TARGET_PX).toBe(48)
  })
})
