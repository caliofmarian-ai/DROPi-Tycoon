import { DROPITYCOON_VERSION } from '../version'

const readNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME ?? 'DROPi Tycoon',
  appVersion: DROPITYCOON_VERSION,
  width: readNumber(import.meta.env.VITE_GAME_WIDTH, 1280),
  height: readNumber(import.meta.env.VITE_GAME_HEIGHT, 720),
  enableDebugPanel: (import.meta.env.VITE_ENABLE_DEBUG_PANEL ?? 'true') === 'true',
}
