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

  it.each(SUPPORTED_ANDROID_VIEWPORTS.filter(viewport => viewport.width < viewport.height))(
    'keeps portrait Phone/Menu hit row above status text at $width x $height',
    ({ width, height }) => {
      const layout = urbanHUDLayout(width, height)
      const hitBottom = layout.topControlY + GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX / 2
      const phoneRight = layout.phone.x + layout.phone.width / 2
      const menuLeft = width - 47 - 78 / 2

      expect(layout.portrait).toBe(true)
      expect(hitBottom).toBeLessThanOrEqual(layout.statusY)
      expect(layout.phone.y).toBe(layout.topControlY)
      expect(phoneRight).toBeLessThan(menuLeft)
      expect(layout.statusY).toBeLessThan(layout.headerHeight)
    },
  )

  it('keeps Main Menu behind the navbar while Company management is entered physically through HQ', () => {
    const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')
    expect(hudSource).toContain("'☰  Menu', () => this.toggleMenu()")
    expect(hudSource).toContain('this.button(width - 47, this.layout.topControlY, 78, 36')
    expect(hudSource).toContain("['Main menu', callbacks.menu]")
    expect(hudSource).not.toContain("['Company', callbacks.company]")
    // The Android recovery control abstraction hides both visual chrome and the native
    // Rectangle hit target, then disables input through the same control wrapper.
    expect(hudSource).toContain('entry.setVisible(false)')
    expect(hudSource).toContain('entry.setEnabled(false)')
    expect(hudSource).toContain('this.scene.add.rectangle(x, y, hitWidth, hitHeight, 0xffffff, 0.001)')
    // #323/#339 remains intact for the analog joystick: the hit target is still a native
    // Phaser Rectangle, now sized by the larger Android-safe shared hit diameter.
    expect(hudSource).toContain('ANALOG_JOYSTICK_HIT_DIAMETER, ANALOG_JOYSTICK_HIT_DIAMETER, 0xffffff, 0.001')
    expect(hudSource).toContain("hit.on('pointerdown', this.pressJoystickPointer)")
  })

  it('does not let tapping the fixed dock create movement or a delivery target', () => {
    expect(sceneSource).not.toContain('getWorldPoint(pointer.x, pointer.y)')
    expect(sceneSource).not.toContain('selectDeliveryIntentFromTap')
    expect(sceneSource).toContain('this.hud.isMenuOpen() || this.zoomGesture.isPinching() ? { x: 0, y: 0 }')
  })
})
