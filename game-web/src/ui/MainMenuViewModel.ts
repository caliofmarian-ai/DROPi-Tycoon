export type MainMenuPanel = 'none' | 'settings' | 'information'

export interface MainMenuState {
  activePanel: MainMenuPanel
}

export const createMainMenuState = (): MainMenuState => ({
  activePanel: 'none',
})

export const openMainMenuPanel = (
  state: MainMenuState,
  panel: Exclude<MainMenuPanel, 'none'>,
): MainMenuState => ({
  ...state,
  activePanel: panel,
})

export const closeMainMenuPanel = (state: MainMenuState): MainMenuState => ({
  ...state,
  activePanel: 'none',
})

export const isMainMenuPanelOpen = (state: MainMenuState): boolean => state.activePanel !== 'none'

export const SETTINGS_PANEL_LINES: ReadonlyArray<string> = [
  'Settings',
  '',
  'Controls: tap the world to move.',
  'HUD controls are touch-first.',
  '',
  'Save-backed preferences are added with Save & Load.',
]

export const INFORMATION_PANEL_LINES: ReadonlyArray<string> = [
  'Information',
  '',
  'Build a delivery company from a small local operation.',
  'Accept orders, collect packages, deliver them,',
  'earn rewards and improve the company.',
]
