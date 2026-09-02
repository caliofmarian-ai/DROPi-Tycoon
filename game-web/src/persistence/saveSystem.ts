import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../state/gameState'
import { synchronizePlayerMovementSpeed } from '../systems/bicycleSystem'
import {
  EMPLOYEE_ROLES,
  EMPLOYMENT_STATUSES,
  UPGRADE_IDS,
  type CompanyState,
  type EmployeeRole,
  type EmployeeState,
  type EmploymentStatus,
  type GameSessionState,
  type GameSettingsState,
  type PayrollState,
  type PurchasedUpgradeLevels,
} from '../types/game'

export const SAVE_FORMAT_VERSION = 2 as const
export const SAVE_STORAGE_KEY = 'dropi.tycoon.save.v2'
export const SAVE_STAGING_KEY = 'dropi.tycoon.save.staging.v2'
export const SAVE_CORRUPTED_BACKUP_KEY = 'dropi.tycoon.save.corrupted-backup.v2'

export const LEGACY_SAVE_FORMAT_VERSION = 1 as const
export const LEGACY_SAVE_STORAGE_KEY = 'dropi.tycoon.save.v1'
export const LEGACY_SAVE_STAGING_KEY = 'dropi.tycoon.save.staging.v1'

export const CANONICAL_AUTOSAVE_EVENTS = [
  'delivery-completed',
  'upgrade-purchased',
  'progression-changed',
  'tutorial-step-completed',
  'employee-hired',
  'employee-onboarding-completed',
  'salary-cycle-processed',
] as const

export type CanonicalAutosaveEvent = (typeof CANONICAL_AUTOSAVE_EVENTS)[number]

export interface SaveStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface SaveGameV2 {
  formatVersion: typeof SAVE_FORMAT_VERSION
  company: CompanyState
  settings: GameSettingsState
}

export type SaveDecodeResult =
  | { kind: 'valid'; save: SaveGameV2; repaired: boolean; migratedFrom?: 1 }
  | { kind: 'corrupted'; reason: string; raw: string }
  | { kind: 'incompatible'; reason: string; raw: string; foundVersion: unknown }

export type SaveSlotInspection =
  | { kind: 'missing' }
  | { kind: 'unavailable'; reason: string }
  | {
      kind: 'valid'
      save: SaveGameV2
      repaired: boolean
      migratedFrom?: 1
      source: 'primary' | 'staging' | 'legacy-primary' | 'legacy-staging'
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

const isEmployeeRole = (value: unknown): value is EmployeeRole =>
  typeof value === 'string' && EMPLOYEE_ROLES.some((role) => role === value)

const isEmploymentStatus = (value: unknown): value is EmploymentStatus =>
  typeof value === 'string' && EMPLOYMENT_STATUSES.some((status) => status === value)

const sanitizeEmployees = (
  value: unknown,
): { employees: EmployeeState[]; repaired: boolean } => {
  if (!Array.isArray(value)) {
    return { employees: [], repaired: true }
  }

  let repaired = false
  const employees: EmployeeState[] = []
  const seenIds = new Set<string>()

  value.forEach((entry) => {
    if (!isRecord(entry)) {
      repaired = true
      return
    }

    const employeeId =
      typeof entry.employeeId === 'string' && entry.employeeId.trim().length > 0
        ? entry.employeeId.trim()
        : null
    const name =
      typeof entry.name === 'string' && entry.name.trim().length > 0
        ? entry.name.trim()
        : null
    const role = isEmployeeRole(entry.role) ? entry.role : null
    const status = isEmploymentStatus(entry.status) ? entry.status : null
    const salaryPerCycle =
      typeof entry.salaryPerCycle === 'number' &&
      Number.isSafeInteger(entry.salaryPerCycle) &&
      entry.salaryPerCycle >= 0
        ? entry.salaryPerCycle
        : null

    if (
      employeeId === null ||
      name === null ||
      role === null ||
      status === null ||
      salaryPerCycle === null ||
      seenIds.has(employeeId)
    ) {
      repaired = true
      return
    }

    seenIds.add(employeeId)
    employees.push({ employeeId, name, role, status, salaryPerCycle })
  })

  return { employees, repaired }
}

const sanitizePayroll = (
  value: unknown,
): { payroll: PayrollState; repaired: boolean } => {
  if (!isRecord(value)) {
    return { payroll: { lastProcessedCycle: 0 }, repaired: true }
  }

  if (
    typeof value.lastProcessedCycle !== 'number' ||
    !Number.isSafeInteger(value.lastProcessedCycle) ||
    value.lastProcessedCycle < 0
  ) {
    return { payroll: { lastProcessedCycle: 0 }, repaired: true }
  }

  return {
    payroll: { lastProcessedCycle: value.lastProcessedCycle },
    repaired: false,
  }
}

const sanitizeCompany = (
  value: Record<string, unknown>,
  requirePhase2Fields: boolean,
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

  let employees: EmployeeState[] = []
  let payroll: PayrollState = { lastProcessedCycle: 0 }

  if (requirePhase2Fields) {
    const employeeResult = sanitizeEmployees(value.employees)
    const payrollResult = sanitizePayroll(value.payroll)
    employees = employeeResult.employees
    payroll = payrollResult.payroll
    repaired = repaired || employeeResult.repaired || payrollResult.repaired
  }

  return {
    company: {
      companyName,
      money,
      level,
      reputation,
      purchasedUpgradeLevels,
      employees,
      payroll,
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

export const createSaveGame = (session: GameSessionState): SaveGameV2 => ({
  formatVersion: SAVE_FORMAT_VERSION,
  company: {
    companyName: session.company.companyName,
    money: session.company.money,
    level: session.company.level,
    reputation: session.company.reputation,
    purchasedUpgradeLevels: { ...session.company.purchasedUpgradeLevels },
    employees: session.company.employees.map((employee) => ({ ...employee })),
    payroll: { ...session.company.payroll },
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

  if (
    parsed.formatVersion !== SAVE_FORMAT_VERSION &&
    parsed.formatVersion !== LEGACY_SAVE_FORMAT_VERSION
  ) {
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

  const migratingV1 = parsed.formatVersion === LEGACY_SAVE_FORMAT_VERSION
  const companyResult = sanitizeCompany(parsed.company, !migratingV1)
  const settingsResult = sanitizeSettings(parsed.settings)

  return {
    kind: 'valid',
    save: {
      formatVersion: SAVE_FORMAT_VERSION,
      company: companyResult.company,
      settings: settingsResult.settings,
    },
    // Migration is a normalization write even when every v1 field was valid.
    repaired: migratingV1 || companyResult.repaired || settingsResult.repaired,
    ...(migratingV1 ? { migratedFrom: 1 as const } : {}),
  }
}

export const restoreGameSessionFromSave = (save: SaveGameV2): GameSessionState => {
  const company: CompanyState = {
    ...save.company,
    purchasedUpgradeLevels: { ...save.company.purchasedUpgradeLevels },
    employees: save.company.employees.map((employee) => ({ ...employee })),
    payroll: { ...save.company.payroll },
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
  source: 'primary' | 'staging' | 'legacy-primary' | 'legacy-staging',
): SaveSlotInspection => {
  const decoded = decodeSave(raw)
  if (decoded.kind === 'valid') {
    return {
      kind: 'valid',
      save: decoded.save,
      repaired: decoded.repaired,
      source,
      ...(decoded.migratedFrom ? { migratedFrom: decoded.migratedFrom } : {}),
    }
  }
  return decoded
}

const inspectPair = (
  primary: string | null,
  staging: string | null,
  primarySource: 'primary' | 'legacy-primary',
  stagingSource: 'staging' | 'legacy-staging',
): SaveSlotInspection | null => {
  if (primary !== null) {
    const primaryResult = inspectRaw(primary, primarySource)
    if (primaryResult.kind === 'valid') {
      return primaryResult
    }

    if (staging !== null) {
      const stagingResult = inspectRaw(staging, stagingSource)
      if (stagingResult.kind === 'valid') {
        return stagingResult
      }
    }

    return primaryResult
  }

  if (staging !== null) {
    return inspectRaw(staging, stagingSource)
  }

  return null
}

export const inspectSaveSlot = (storage: SaveStorage): SaveSlotInspection => {
  let primary: string | null
  let staging: string | null
  let legacyPrimary: string | null
  let legacyStaging: string | null

  try {
    primary = storage.getItem(SAVE_STORAGE_KEY)
    staging = storage.getItem(SAVE_STAGING_KEY)
    legacyPrimary = storage.getItem(LEGACY_SAVE_STORAGE_KEY)
    legacyStaging = storage.getItem(LEGACY_SAVE_STAGING_KEY)
  } catch (error) {
    return { kind: 'unavailable', reason: normalizeError(error) }
  }

  const current = inspectPair(primary, staging, 'primary', 'staging')
  if (current) return current

  const legacy = inspectPair(
    legacyPrimary,
    legacyStaging,
    'legacy-primary',
    'legacy-staging',
  )
  if (legacy) return legacy

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
