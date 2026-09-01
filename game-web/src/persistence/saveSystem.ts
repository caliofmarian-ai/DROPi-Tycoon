import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../state/gameState'
import { synchronizePlayerMovementSpeed } from '../systems/bicycleSystem'
import {
  UPGRADE_IDS,
  type CompanyState,
  type GameSessionState,
  type GameSettingsState,
  type PurchasedUpgradeLevels,
} from '../types/game'

export const SAVE_FORMAT_VERSION = 1 as const
export const SAVE_STORAGE_KEY = 'dropi.tycoon.save.v1'
export const SAVE_STAGING_KEY = 'dropi.tycoon.save.staging.v1'
export const SAVE_CORRUPTED_BACKUP_KEY = 'dropi.tycoon.save.corrupted-backup.v1'

export const CANONICAL_AUTOSAVE_EVENTS = [
  'delivery-completed',
  'upgrade-purchased',
  'progression-changed',
  'tutorial-step-completed',
] as const

export type CanonicalAutosaveEvent = (typeof CANONICAL_AUTOSAVE_EVENTS)[number]

export interface SaveStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface SaveGameV1 {
  formatVersion: typeof SAVE_FORMAT_VERSION
  company: CompanyState
  settings: GameSettingsState
}

export type SaveDecodeResult =
  | { kind: 'valid'; save: SaveGameV1; repaired: boolean }
  | { kind: 'corrupted'; reason: string; raw: string }
  | { kind: 'incompatible'; reason: string; raw: string; foundVersion: unknown }

export type SaveSlotInspection =
  | { kind: 'missing' }
  | { kind: 'unavailable'; reason: string }
  | {
      kind: 'valid'
      save: SaveGameV1
      repaired: boolean
      source: 'primary' | 'staging'
    }
  | { kind: 'corrupted'; reason: string; raw: string }
  | { kind: 'incompatible'; reason: string; raw: string; foundVersion: unknown }

export type SaveWriteResult =
  | { ok: true; raw: string }
  | { ok: false; reason: string }

export type AutosaveResult =
  | { saved: true; event: CanonicalAutosaveEvent }
  | { saved: false; reason: 'not-approved' | 'write-failed'; message?: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const sanitizeCompany = (
  value: Record<string, unknown>,
): { company: CompanyState; repaired: boolean } => {
  const defaults = createInitialCompanyState()
  let repaired = false

  const companyName =
    typeof value.companyName === 'string' && value.companyName.trim().length > 0
      ? value.companyName
      : (repaired = true, defaults.companyName)

  const money =
    typeof value.money === 'number' && Number.isFinite(value.money) && value.money >= 0
      ? value.money
      : (repaired = true, defaults.money)

  const level =
    typeof value.level === 'number' && Number.isInteger(value.level) && value.level > 0
      ? value.level
      : (repaired = true, defaults.level)

  const reputation =
    typeof value.reputation === 'number' && Number.isFinite(value.reputation)
      ? value.reputation
      : (repaired = true, defaults.reputation)

  const rawLevels = isRecord(value.purchasedUpgradeLevels)
    ? value.purchasedUpgradeLevels
    : (repaired = true, {})

  const purchasedUpgradeLevels = UPGRADE_IDS.reduce<PurchasedUpgradeLevels>(
    (levels, upgradeId) => {
      const rawLevel = rawLevels[upgradeId]
      if (
        typeof rawLevel === 'number' &&
        Number.isSafeInteger(rawLevel) &&
        rawLevel >= 0
      ) {
        levels[upgradeId] = rawLevel
      } else {
        levels[upgradeId] = defaults.purchasedUpgradeLevels[upgradeId]
        repaired = true
      }
      return levels
    },
    { ...defaults.purchasedUpgradeLevels },
  )

  return {
    company: {
      companyName,
      money,
      level,
      reputation,
      purchasedUpgradeLevels,
    },
    repaired,
  }
}

const sanitizeSettings = (
  value: unknown,
): { settings: GameSettingsState; repaired: boolean } => {
  const defaults = createInitialGameSettingsState()
  if (!isRecord(value)) {
    return { settings: defaults, repaired: true }
  }

  if (typeof value.tutorialCompleted !== 'boolean') {
    return { settings: defaults, repaired: true }
  }

  return {
    settings: { tutorialCompleted: value.tutorialCompleted },
    repaired: false,
  }
}

export const createSaveGame = (session: GameSessionState): SaveGameV1 => ({
  formatVersion: SAVE_FORMAT_VERSION,
  company: {
    companyName: session.company.companyName,
    money: session.company.money,
    level: session.company.level,
    reputation: session.company.reputation,
    purchasedUpgradeLevels: { ...session.company.purchasedUpgradeLevels },
  },
  settings: {
    tutorialCompleted: session.settings.tutorialCompleted,
  },
})

export const serializeGameSession = (session: GameSessionState): string =>
  JSON.stringify(createSaveGame(session))

export const decodeSave = (raw: string): SaveDecodeResult => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      kind: 'corrupted',
      reason: 'Save data is not valid JSON.',
      raw,
    }
  }

  if (!isRecord(parsed)) {
    return {
      kind: 'corrupted',
      reason: 'Save root must be an object.',
      raw,
    }
  }

  if (!Object.prototype.hasOwnProperty.call(parsed, 'formatVersion')) {
    return {
      kind: 'corrupted',
      reason: 'Save format version is missing.',
      raw,
    }
  }

  if (parsed.formatVersion !== SAVE_FORMAT_VERSION) {
    return {
      kind: 'incompatible',
      reason: `Unsupported save format version: ${String(parsed.formatVersion)}.`,
      raw,
      foundVersion: parsed.formatVersion,
    }
  }

  if (!isRecord(parsed.company)) {
    return {
      kind: 'corrupted',
      reason: 'Company save data is missing or structurally invalid.',
      raw,
    }
  }

  const companyResult = sanitizeCompany(parsed.company)
  const settingsResult = sanitizeSettings(parsed.settings)

  return {
    kind: 'valid',
    save: {
      formatVersion: SAVE_FORMAT_VERSION,
      company: companyResult.company,
      settings: settingsResult.settings,
    },
    repaired: companyResult.repaired || settingsResult.repaired,
  }
}

export const restoreGameSessionFromSave = (save: SaveGameV1): GameSessionState => {
  const company: CompanyState = {
    ...save.company,
    purchasedUpgradeLevels: { ...save.company.purchasedUpgradeLevels },
  }
  const world = synchronizePlayerMovementSpeed(createInitialWorldState(), company)

  return {
    world,
    company,
    settings: { ...save.settings },
  }
}

const inspectRaw = (
  raw: string,
  source: 'primary' | 'staging',
): SaveSlotInspection => {
  const decoded = decodeSave(raw)
  if (decoded.kind === 'valid') {
    return {
      kind: 'valid',
      save: decoded.save,
      repaired: decoded.repaired,
      source,
    }
  }
  return decoded
}

export const inspectSaveSlot = (storage: SaveStorage): SaveSlotInspection => {
  let primary: string | null
  let staging: string | null

  try {
    primary = storage.getItem(SAVE_STORAGE_KEY)
    staging = storage.getItem(SAVE_STAGING_KEY)
  } catch (error) {
    return { kind: 'unavailable', reason: normalizeError(error) }
  }

  if (primary !== null) {
    const primaryResult = inspectRaw(primary, 'primary')
    if (primaryResult.kind === 'valid') {
      return primaryResult
    }

    if (staging !== null) {
      const stagingResult = inspectRaw(staging, 'staging')
      if (stagingResult.kind === 'valid') {
        return stagingResult
      }
    }

    return primaryResult
  }

  if (staging !== null) {
    return inspectRaw(staging, 'staging')
  }

  return { kind: 'missing' }
}

export const writeSaveSlot = (
  storage: SaveStorage,
  session: GameSessionState,
): SaveWriteResult => {
  const raw = serializeGameSession(session)

  try {
    // Staging-first makes an interrupted write recoverable on the next load.
    storage.setItem(SAVE_STAGING_KEY, raw)
    storage.setItem(SAVE_STORAGE_KEY, raw)
    storage.removeItem(SAVE_STAGING_KEY)
    return { ok: true, raw }
  } catch (error) {
    return { ok: false, reason: normalizeError(error) }
  }
}

export const preserveInvalidSaveBeforeReplacement = (
  storage: SaveStorage,
  inspection: SaveSlotInspection,
): void => {
  if (inspection.kind !== 'corrupted' && inspection.kind !== 'incompatible') {
    return
  }

  try {
    storage.setItem(SAVE_CORRUPTED_BACKUP_KEY, inspection.raw)
  } catch {
    // Best effort only. Replacement still requires explicit player confirmation.
  }
}

export const isCanonicalAutosaveEvent = (
  event: string,
): event is CanonicalAutosaveEvent =>
  CANONICAL_AUTOSAVE_EVENTS.some((approvedEvent) => approvedEvent === event)

export const autosaveIfApproved = (
  storage: SaveStorage,
  session: GameSessionState,
  event: string,
): AutosaveResult => {
  if (!isCanonicalAutosaveEvent(event)) {
    return { saved: false, reason: 'not-approved' }
  }

  const write = writeSaveSlot(storage, session)
  if (!write.ok) {
    return { saved: false, reason: 'write-failed', message: write.reason }
  }

  return { saved: true, event }
}
