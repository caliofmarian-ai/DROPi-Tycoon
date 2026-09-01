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

  it('provides Information content that explains the company-growth loop', () => {
    expect(INFORMATION_PANEL_LINES[0]).toBe('Information')
    expect(INFORMATION_PANEL_LINES.join(' ')).toContain('delivery company')
    expect(INFORMATION_PANEL_LINES.join(' ')).toContain('earn rewards')
  })
})

describe('ISSUE-008 — MainMenu scene contract and RBATCH-014 exclusion', () => {
  it('contains the three canonical first-launch actions', () => {
    expect(mainMenuSource).toContain("'Start Game'")
    expect(mainMenuSource).toContain("'Settings'")
    expect(mainMenuSource).toContain("'Information'")
  })

  it('has exactly one Start Game transition into GameWorld', () => {
    const matches = mainMenuSource.match(/scene\.start\('GameWorld'\)/g) ?? []
    expect(matches).toHaveLength(1)
  })

  it('does not implement Continue or persistence in RBATCH-011', () => {
    expect(mainMenuSource).not.toContain('Continue Game')
    expect(mainMenuSource).not.toContain('localStorage')
    expect(mainMenuSource).not.toContain('sessionStorage')
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
