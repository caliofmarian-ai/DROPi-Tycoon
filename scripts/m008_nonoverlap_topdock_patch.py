from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected block not found in {path}: {old[:80]!r}")
    p.write_text(text.replace(old, new, 1))


# Reserve the top dock physically outside the world-camera viewport.
scene = "game-web/src/scenes/GameWorldScene.ts"
replace_once(
    scene,
    "    this.cameras.main.setBackgroundColor('#91d0ff')\n    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)\n\n    this.renderWorldLayout()",
    "    this.cameras.main.setBackgroundColor('#91d0ff')\n    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)\n    const topDockLayout = buildGameWorldTopBarLayout(this.scale.width, this.scale.height)\n    this.cameras.main.setViewport(\n      0,\n      topDockLayout.worldViewportTop,\n      this.scale.width,\n      Math.max(1, this.scale.height - topDockLayout.worldViewportTop),\n    )\n\n    this.renderWorldLayout()",
)

# Keep order state to one shallow status line.
game_hud = "game-web/src/ui/GameHUD.ts"
replace_once(
    game_hud,
    "      this.orderText.setText([\n        `${compactOrderId(data.orderId)} ${data.orderStatus} · +${data.reward}`,\n        `${compactLocationLabel(data.pickupLocation)}→${compactLocationLabel(data.destination)} · ${\n          data.carryingPackage ? 'Carry' : 'Empty'\n        }`,\n      ])",
    "      this.orderText.setText(\n        `${compactOrderId(data.orderId)} ${data.orderStatus} +${data.reward} · ${compactLocationLabel(\n          data.pickupLocation,\n        )}→${compactLocationLabel(data.destination)} · ${data.carryingPackage ? 'Carry' : 'Empty'}`,\n      )",
)

# GameWorld-specific compact HUD: status strip below controls; Accept shares toolbar row.
hud = Path("game-web/src/ui/hudLayout.ts")
text = hud.read_text()
text = text.replace(
    "import { buildGameWorldTopBarLayout } from './gameWorldTopBar'",
    "import {\n  buildGameWorldTopBarLayout,\n  GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX,\n} from './gameWorldTopBar'",
)
start = text.index("export const buildHUDLayout =")
end = text.index("\n\n/**\n * Keeps transient feedback", start)
new_fn = '''export const buildHUDLayout = (canvasWidth: number, canvasHeight: number): HUDLayout => {
  const width = Math.max(1, Math.floor(canvasWidth))
  const height = Math.max(1, Math.floor(canvasHeight))
  const topBar = buildGameWorldTopBarLayout(width, height)
  const margin = topBar.menuToggle.left
  const compactLandscape = isCompactLandscape(width, height)
  const gap = 3
  const rightEdge = width - margin
  const rowTop = topBar.hudRowTop
  const rowHeight = topBar.hudRowHeight

  const companyWidth = compactLandscape ? 68 : 62
  const orderPanel: RectBounds = {
    left: margin + companyWidth + gap,
    top: rowTop,
    width: Math.max(120, rightEdge - (margin + companyWidth + gap)),
    height: rowHeight,
  }
  const companyPanel: RectBounds = {
    left: margin,
    top: rowTop,
    width: companyWidth,
    height: rowHeight,
  }

  // Accept is an action, so it lives in the toolbar row instead of increasing
  // the persistent dock height. It is hidden by GameHUD whenever not applicable.
  const acceptWidth = compactLandscape ? 58 : 56
  const acceptButton: RectBounds = {
    left: rightEdge - acceptWidth,
    top: topBar.menuToggle.top,
    width: acceptWidth,
    height: GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX,
  }

  return {
    companyPanel,
    orderPanel,
    acceptButton,
    orderTextWidth: Math.max(108, orderPanel.width - 12),
    companyFontSize: compactLandscape ? 10 : 10,
    orderFontSize: compactLandscape ? 10 : 10,
    acceptFontSize: 11,
  }
}'''
text = text[:start] + new_fn + text[end:]
hud.write_text(text)

# Replace owner-review contract with compact + non-overlap acceptance.
Path("game-web/tests/top-navbar-owner-review.test.ts").write_text('''import { readFileSync } from 'node:fs'
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
    it(`keeps persistent controls compact at the top in ${viewport.width}x${viewport.height}`, () => {
      const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
      const hud = buildHUDLayout(viewport.width, viewport.height)
      const controls = buildCameraControlButtons(viewport.width, viewport.height)

      expect(topBar.worldViewportTop).toBeLessThanOrEqual(84)
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

  it('shrinks visible GameWorld controls without changing global mobile touch sizing', () => {
    expect(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX).toBe(40)
    expect(GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX).toBe(28)
    expect(GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX).toBeLessThan(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)
  })

  it('reserves the world camera below the persistent dock instead of drawing the map beneath it', () => {
    expect(sceneSource).toContain('topDockLayout.worldViewportTop')
    expect(sceneSource).toContain('this.cameras.main.setViewport(')
    expect(sceneSource).toContain('this.scale.height - topDockLayout.worldViewportTop')
  })

  it('uses one navbar toggle instead of permanent Main Menu and Company map buttons', () => {
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
''')

# Original camera-control test used the former global 48px assumption for this dock.
cam_test = Path("game-web/tests/camera-controls.test.ts")
ct = cam_test.read_text()
ct = ct.replace(
    "import {\n  MIN_TOUCH_TARGET_PX,\n  rectInsideViewport,\n  SUPPORTED_ANDROID_VIEWPORTS,\n} from '../src/ui/mobileViewport'",
    "import { rectInsideViewport, SUPPORTED_ANDROID_VIEWPORTS } from '../src/ui/mobileViewport'\nimport { GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX } from '../src/ui/gameWorldTopBar'",
)
ct = ct.replace(
    "expect(bounds.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)\n        expect(bounds.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)",
    "expect(bounds.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)\n        expect(bounds.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)",
)
cam_test.write_text(ct)

# RBATCH-015 global floor still applies elsewhere; GameWorld dock is a later owner-tested exception.
mobile_test = Path("game-web/tests/mobile-viewport.test.ts")
mt = mobile_test.read_text()
mt = mt.replace(
    "  MIN_TOUCH_TARGET_PX,\n  rectInsideViewport,",
    "  MIN_TOUCH_TARGET_PX,\n  rectInsideViewport,",
)
mt = mt.replace(
    "import {\n  buildCompanyManagementLayout,",
    "import {\n  buildCompanyManagementLayout,",
)
mt = mt.replace(
    "import {\n  buildHUDLayout,",
    "import {\n  buildHUDLayout,",
)
mt = mt.replace(
    "      const hud = buildHUDLayout(viewport.width, viewport.height)\n      assertTouchRect(hud.acceptButton)",
    "      const hud = buildHUDLayout(viewport.width, viewport.height)\n      expect(hud.acceptButton.width).toBeGreaterThanOrEqual(40)\n      expect(hud.acceptButton.height).toBeGreaterThanOrEqual(40)",
)
mobile_test.write_text(mt)
