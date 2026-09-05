import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  closeMainMenuPanel,
  createMainMenuState,
  INFORMATION_PANEL_LINES,
  isMainMenuPanelOpen,
  openMainMenuPanel,
  SETTINGS_PANEL_LINES,
} from '../src/ui/MainMenuViewModel'

const mainMenuSource = readFileSync(
  new URL('../src/scenes/MainMenuScene.ts', import.meta.url),
  'utf8',
)

describe('RBATCH-011 — MainMenu pure view model', () => {
  it('starts with no modal panel open', () => {
    const state = createMainMenuState()
    expect(state.activePanel).toBe('none')
    expect(isMainMenuPanelOpen(state)).toBe(false)
  })

  it('opens Settings deterministically', () => {
    const state = openMainMenuPanel(createMainMenuState(), 'settings')
    expect(state.activePanel).toBe('settings')
    expect(isMainMenuPanelOpen(state)).toBe(true)
  })

  it('opens Information deterministically', () => {
    const state = openMainMenuPanel(createMainMenuState(), 'information')
    expect(state.activePanel).toBe('information')
    expect(isMainMenuPanelOpen(state)).toBe(true)
  })

  it('replaces an open panel rather than stacking panels', () => {
    const settings = openMainMenuPanel(createMainMenuState(), 'settings')
    const information = openMainMenuPanel(settings, 'information')
    expect(information.activePanel).toBe('information')
  })

  it('closes either panel back to none', () => {
    const open = openMainMenuPanel(createMainMenuState(), 'settings')
    expect(closeMainMenuPanel(open).activePanel).toBe('none')
  })

  it('does not mutate the prior state object', () => {
    const initial = createMainMenuState()
    const opened = openMainMenuPanel(initial, 'settings')
    expect(initial.activePanel).toBe('none')
    expect(opened).not.toBe(initial)
  })

  it('provides Settings player-facing content', () => {
    expect(SETTINGS_PANEL_LINES[0]).toBe('Settings')
    expect(SETTINGS_PANEL_LINES.join(' ')).toContain('tap the world to move')
  })

  it('provides Information content that explains broader company growth', () => {
    expect(INFORMATION_PANEL_LINES[0]).toBe('Information')
    expect(INFORMATION_PANEL_LINES.join(' ')).toContain('local operation')
    expect(INFORMATION_PANEL_LINES.join(' ')).toContain('marketplace and drone ecosystem')
  })
})

describe('RBATCH-014 — save-aware MainMenu extension', () => {
  it('preserves the first-launch Start Game, Settings and Information actions', () => {
    expect(mainMenuSource).toContain("'Start Game'")
    expect(mainMenuSource).toContain("'Settings'")
    expect(mainMenuSource).toContain("'Information'")
  })

  it('adds Continue and explicit Start New Game actions for persisted progress', () => {
    expect(mainMenuSource).toContain("'Continue Game'")
    expect(mainMenuSource).toContain("'Start New Game'")
    expect(mainMenuSource).toContain('inspectSaveSlot')
    expect(mainMenuSource).toContain('restoreGameSessionFromSave')
  })

  it('requires an in-game confirmation before replacing an existing save', () => {
    expect(mainMenuSource).toContain('showConfirmation')
    expect(mainMenuSource).toContain('confirmNewGameReplacement')
    expect(mainMenuSource).toContain('preserveInvalidSaveBeforeReplacement')
    expect(mainMenuSource).toContain("'Confirm'")
    expect(mainMenuSource).toContain("'Cancel'")
  })

  it('does not use sessionStorage or a generic browser confirm dialog', () => {
    expect(mainMenuSource).not.toContain('sessionStorage')
    expect(mainMenuSource).not.toContain('window.confirm')
  })

  it('keeps menu labels non-interactive so one tap has one action owner', () => {
    const createButtonBody = mainMenuSource.slice(
      mainMenuSource.indexOf('private createButton'),
      mainMenuSource.indexOf('private createModal'),
    )
    expect(createButtonBody).toContain("button.on('pointerdown', onTap)")
    expect(createButtonBody).not.toContain('text.setInteractive')
  })
})

describe('ISSUE-307 — approved product identity on MainMenu', () => {
  it('loads and displays the approved DROPi Tycoon logo', () => {
    expect(mainMenuSource).toContain("const BRAND_LOGO_URL = '/assets/branding/dropi-tycoon-logo.png'")
    expect(mainMenuSource).toContain('this.load.image(BRAND_LOGO_KEY, BRAND_LOGO_URL)')
    expect(mainMenuSource).toContain('.image(layout.title.x, logoCenterY, BRAND_LOGO_KEY)')
  })

  it('removes developer-facing runtime-candidate copy while retaining semantic version visibility', () => {
    expect(mainMenuSource).not.toContain('Web Runtime Candidate')
    expect(mainMenuSource).toContain('`v${appConfig.appVersion}`')
    expect(mainMenuSource).toContain('Play. Deliver. Trade. Grow.')
  })
})
