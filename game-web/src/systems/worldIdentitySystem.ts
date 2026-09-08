import { WORLD_IDENTITY_MODES, type WorldIdentityMode, type WorldIdentityState } from '../types/worldIdentity'

export const LOCAL_LEGACY_WORLD_INSTANCE_ID = 'wi_local_legacy_v1'
export const LOCAL_PRIMARY_ACCOUNT_ID = 'acct_local_primary_v1'
export const CURRENT_WORLD_BASELINE_VERSION = 'phase1-baseline-v1'
export const CURRENT_MAP_DATASET_VERSION = 'world-atlas-2.0.2-natural-earth-110m'

const MAX_ID_LENGTH = 128
const MAX_VERSION_LENGTH = 128

const cleanToken = (value: unknown, maxLength = MAX_ID_LENGTH): string | null => {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  if (cleaned.length === 0 || cleaned.length > maxLength) return null
  return cleaned
}

const isMode = (value: unknown): value is WorldIdentityMode =>
  typeof value === 'string' && WORLD_IDENTITY_MODES.some(mode => mode === value)

/** Deterministic local/offline fingerprint only; never authentication proof. */
const stableFingerprint = (value: string): string => {
  let a = 0x811c9dc5
  let b = 0x9e3779b9
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    a = Math.imul(a ^ code, 0x01000193) >>> 0
    b = Math.imul(b ^ code, 0x85ebca6b) >>> 0
  }
  return `${a.toString(36).padStart(7, '0')}${b.toString(36).padStart(7, '0')}`
}

export const deriveHeroActorId = (accountId: string, worldInstanceId: string): string =>
  `hero_${stableFingerprint(`${accountId}\u001f${worldInstanceId}`)}`

export const createInitialWorldIdentityState = (): WorldIdentityState => ({
  worldInstanceId: LOCAL_LEGACY_WORLD_INSTANCE_ID,
  accountId: LOCAL_PRIMARY_ACCOUNT_ID,
  heroActorId: deriveHeroActorId(LOCAL_PRIMARY_ACCOUNT_ID, LOCAL_LEGACY_WORLD_INSTANCE_ID),
  baselineVersion: CURRENT_WORLD_BASELINE_VERSION,
  mapDatasetVersion: CURRENT_MAP_DATASET_VERSION,
  mode: 'LegacyLocal',
})

export const createFreshLocalWorldIdentity = (
  worldInstanceId: string,
  accountId = LOCAL_PRIMARY_ACCOUNT_ID,
  baselineVersion = CURRENT_WORLD_BASELINE_VERSION,
  mapDatasetVersion = CURRENT_MAP_DATASET_VERSION,
): WorldIdentityState => {
  const safeWorld = cleanToken(worldInstanceId) ?? `wi_local_${stableFingerprint(worldInstanceId)}`
  const safeAccount = cleanToken(accountId) ?? LOCAL_PRIMARY_ACCOUNT_ID
  const safeBaseline = cleanToken(baselineVersion, MAX_VERSION_LENGTH) ?? CURRENT_WORLD_BASELINE_VERSION
  const safeDataset = cleanToken(mapDatasetVersion, MAX_VERSION_LENGTH) ?? CURRENT_MAP_DATASET_VERSION
  return {
    worldInstanceId: safeWorld,
    accountId: safeAccount,
    heroActorId: deriveHeroActorId(safeAccount, safeWorld),
    baselineVersion: safeBaseline,
    mapDatasetVersion: safeDataset,
    mode: 'FreshLocal',
  }
}

export interface WorldIdentitySanitizeResult {
  state: WorldIdentityState
  repaired: boolean
}

export const sanitizeWorldIdentityState = (value: unknown): WorldIdentitySanitizeResult => {
  const fallback = createInitialWorldIdentityState()
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { state: fallback, repaired: value !== undefined }
  }
  const source = value as Record<string, unknown>
  const worldInstanceId = cleanToken(source.worldInstanceId)
  const accountId = cleanToken(source.accountId)
  const baselineVersion = cleanToken(source.baselineVersion, MAX_VERSION_LENGTH)
  const mapDatasetVersion = cleanToken(source.mapDatasetVersion, MAX_VERSION_LENGTH)
  const mode = isMode(source.mode) ? source.mode : null
  if (!worldInstanceId || !accountId || !baselineVersion || !mapDatasetVersion || !mode) {
    return { state: fallback, repaired: true }
  }

  const expectedHeroActorId = deriveHeroActorId(accountId, worldInstanceId)
  const suppliedHeroActorId = cleanToken(source.heroActorId)
  return {
    state: {
      worldInstanceId,
      accountId,
      heroActorId: expectedHeroActorId,
      baselineVersion,
      mapDatasetVersion,
      mode,
    },
    repaired: suppliedHeroActorId !== expectedHeroActorId,
  }
}

export const isWorldIdentityStateValid = (value: unknown): value is WorldIdentityState =>
  sanitizeWorldIdentityState(value).repaired === false
