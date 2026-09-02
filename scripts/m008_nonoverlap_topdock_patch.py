from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected block not found in {path}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1))


# Reserve the top dock physically outside the world-camera viewport.
scene = "game-web/src/scenes/GameWorldScene.ts"
replace_once(
    scene,
    "    this.cameras.main.setBackgroundColor('#91d0ff')\n    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)\n\n    this.renderWorldLayout()",
    "    this.cameras.main.setBackgroundColor('#91d0ff')\n    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)\n    const topDockLayout = buildGameWorldTopBarLayout(this.scale.width, this.scale.height)\n    this.cameras.main.setViewport(\n      0,\n      topDockLayout.worldViewportTop,\n      this.scale.width,\n      Math.max(1, this.scale.height - topDockLayout.worldViewportTop),\n    )\n\n    this.renderWorldLayout()",
)

# Keep active order copy to one shallow line.
game_hud = "game-web/src/ui/GameHUD.ts"
replace_once(
    game_hud,
    "      this.orderText.setText([\n        `${compactOrderId(data.orderId)} ${data.orderStatus} · +${data.reward}`,\n        `${compactLocationLabel(data.pickupLocation)}→${compactLocationLabel(data.destination)} · ${\n          data.carryingPackage ? 'Carry' : 'Empty'\n        }`,\n      ])",
    "      this.orderText.setText(\n        `${compactOrderId(data.orderId)} ${data.orderStatus} +${data.reward} · ${compactLocationLabel(data.pickupLocation)}→${compactLocationLabel(data.destination)} · ${data.carryingPackage ? 'Carry' : 'Empty'}`,\n      )",
)

# GameWorld HUD: shallow status strip + Accept in toolbar row.
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
  const availableOrderWidth = Math.max(120, width - margin * 2 - companyWidth - gap)
  const orderWidth = Math.min(compactLandscape ? 240 : 198, availableOrderWidth)
  const orderPanel: RectBounds = {
    left: rightEdge - orderWidth,
    top: rowTop,
    width: orderWidth,
    height: rowHeight,
  }
  const companyPanel: RectBounds = {
    left: orderPanel.left - gap - companyWidth,
    top: rowTop,
    width: companyWidth,
    height: rowHeight,
  }

  // Accept is an action, so it shares the toolbar row rather than increasing
  // persistent dock height. It is hidden by GameHUD whenever not applicable.
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
    companyFontSize: 10,
    orderFontSize: 10,
    acceptFontSize: 11,
  }
}'''
text = text[:start] + new_fn + text[end:]
hud.write_text(text)

# Current owner-review acceptance supersedes earlier geometry while preserving intent.
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
''')

Path("game-web/tests/hud-mobile-owner-review.test.ts").write_text('''import { describe, expect, it } from 'vitest'
import { buildCameraControlButtons } from '../src/ui/cameraControls'
import { buildGameWorldTopBarLayout } from '../src/ui/gameWorldTopBar'
import { buildHUDLayout, boundsIntersect } from '../src/ui/hudLayout'

describe('M-008 Android owner-review top-dock acceptance', () => {
  it('keeps navigation and camera controls in one compact horizontal toolbar', () => {
    const viewport = { width: 915, height: 412 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const controls = buildCameraControlButtons(viewport.width, viewport.height)

    expect(controls).toHaveLength(5)
    controls.forEach(({ bounds }) => {
      expect(bounds.top).toBe(topBar.menuToggle.top)
      expect(bounds.top + bounds.height).toBeLessThanOrEqual(topBar.controlBar.height)
      expect(boundsIntersect(bounds, topBar.menuToggle)).toBe(false)
    })
  })

  it('keeps status in one 28px row and Accept in the toolbar row', () => {
    const viewport = { width: 915, height: 412 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const layout = buildHUDLayout(viewport.width, viewport.height)

    expect(layout.companyPanel.top).toBe(topBar.hudRowTop)
    expect(layout.orderPanel.top).toBe(topBar.hudRowTop)
    expect(layout.companyPanel.height).toBe(28)
    expect(layout.orderPanel.height).toBe(28)
    expect(layout.acceptButton.top).toBe(topBar.menuToggle.top)
    expect(layout.acceptButton.height).toBe(44)
    expect(layout.orderPanel.width).toBeLessThanOrEqual(240)
    expect(boundsIntersect(layout.companyPanel, layout.orderPanel)).toBe(false)
  })

  it('reserves map rendering below the entire persistent dock', () => {
    const topBar = buildGameWorldTopBarLayout(915, 412)
    expect(topBar.worldViewportTop).toBe(84)
    expect(topBar.worldViewportTop).toBeGreaterThan(topBar.hudRowTop + topBar.hudRowHeight)
  })

  it('keeps portrait controls consolidated at the top', () => {
    const viewport = { width: 360, height: 640 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const controls = buildCameraControlButtons(viewport.width, viewport.height)
    controls.forEach(({ bounds }) => {
      expect(bounds.top).toBe(topBar.menuToggle.top)
      expect(bounds.top + bounds.height).toBeLessThan(viewport.height * 0.1)
    })
  })
})
''')

Path("game-web/tests/gamehud-copy.test.ts").write_text('''import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const hudSource = readFileSync(new URL('../src/ui/GameHUD.ts', import.meta.url), 'utf8')

describe('M-008 compact HUD copy', () => {
  it('uses an abbreviated one-line active-order presentation', () => {
    expect(hudSource).toContain('compactOrderId(data.orderId)')
    expect(hudSource).toContain('compactLocationLabel(data.pickupLocation)')
    expect(hudSource).toContain('compactLocationLabel(data.destination)')
    expect(hudSource).toContain("data.carryingPackage ? 'Carry' : 'Empty'")
    expect(hudSource).not.toContain('this.orderText.setText([')
  })

  it('uses a one-line compact company status', () => {
    expect(hudSource).toContain('`M ${data.money} · R ${data.reputation}`')
  })

  it('does not restore verbose order labels', () => {
    expect(hudSource).not.toContain('`Order: ${data.orderId}`')
    expect(hudSource).not.toContain('`Status: ${data.orderStatus}`')
    expect(hudSource).not.toContain('`Destination: ${data.destination}`')
    expect(hudSource).not.toContain('Not carrying')
  })
})
''')

# Camera controls now use the owner-tested local 44px dock target.
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

# RBATCH-016 full-loop verification recognizes the later owner-tested GameWorld dock target.
full_loop = Path("game-web/tests/full-loop-integration.test.ts")
ft = full_loop.read_text()
if "GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX" not in ft:
    ft = ft.replace(
        "import { buildHUDLayout, buildNotificationLayout, boundsIntersect } from '../src/ui/hudLayout'",
        "import { buildHUDLayout, buildNotificationLayout, boundsIntersect } from '../src/ui/hudLayout'\nimport { GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX } from '../src/ui/gameWorldTopBar'",
    )
ft = ft.replace(
    "expect(hud.acceptButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)",
    "expect(hud.acceptButton.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)",
)
full_loop.write_text(ft)

# ISSUE-018/019: keep the global 48px contract everywhere else, with the later owner-tested
# GameWorld dock exception explicitly tied to its local implementation constant.
mobile_test = Path("game-web/tests/mobile-viewport.test.ts")
mt = mobile_test.read_text()
mt = mt.replace(
    "import { buildGameWorldTopBarLayout } from '../src/ui/gameWorldTopBar'",
    "import {\n  buildGameWorldTopBarLayout,\n  GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX,\n} from '../src/ui/gameWorldTopBar'",
)
mt = mt.replace(
    "      expect(hud.acceptButton.top).toBe(topBar.hudRowTop)",
    "      expect(hud.acceptButton.top).toBe(topBar.menuToggle.top)",
)
mt = mt.replace(
    "      const hud = buildHUDLayout(viewport.width, viewport.height)\n      assertTouchRect(hud.acceptButton)\n\n      const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)\n      assertTouchRect(topBar.menuToggle)\n      topBar.dropdownItems.forEach(assertTouchRect)",
    "      const hud = buildHUDLayout(viewport.width, viewport.height)\n      expect(hud.acceptButton.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)\n      expect(hud.acceptButton.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)\n\n      const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)\n      expect(topBar.menuToggle.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)\n      expect(topBar.menuToggle.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)\n      topBar.dropdownItems.forEach((rect) => {\n        expect(rect.width).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)\n        expect(rect.height).toBeGreaterThanOrEqual(GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX)\n      })",
)
mobile_test.write_text(mt)
