import {
  COMMERCIAL_EFFECT_NONE,
  V1_COMMERCIAL_CATALOG,
  type CommercialCatalog,
} from './commercialCatalog'
import {
  validateCommercialEntitlementState,
  type CommercialEntitlementState,
} from './commercialEntitlementDomain'
import {
  COMMERCIAL_PRESENTATION_SURFACES,
  projectCommercialPresentationAccess,
  resolveCommercialPresentationSelection,
  type CommercialPresentationAccess,
  type CommercialPresentationLocalPreferences,
  type CommercialPresentationProjection,
  type CommercialPresentationResolvedSelection,
} from './commercialPresentationProjection'

export const COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_VERSION = 1 as const
export const TRUSTED_COMMERCIAL_ACCOUNT_AUTHORITY = 'TRUSTED_COMMERCIAL_ACCOUNT_AUTHORITY' as const
export const COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_SOURCE = 'ACCOUNT_AUTHORITY_DISPLAY_CACHE' as const

const COMMERCIAL_ACCOUNT_RUNTIME_CACHE_BRAND = Symbol('commercial-account-runtime-cache')
const MAX_TOKEN_LENGTH = 180

export interface TrustedCommercialAccountAuthoritySnapshot {
  snapshotId: string
  subjectId: string
  authorityRevision: number
  synchronizedAt: number
  entitlementState: CommercialEntitlementState
  authority: typeof TRUSTED_COMMERCIAL_ACCOUNT_AUTHORITY
}

/**
 * Future authenticated account/server adapters implement this interface.
 * This module deliberately does not authenticate a user, call a server, or verify a store receipt.
 */
export interface CommercialAccountAuthorityAdapter {
  readAuthoritativeSnapshot(subjectId: string): Promise<TrustedCommercialAccountAuthoritySnapshot>
}

export interface CommercialAccountPresentationCache {
  version: typeof COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_VERSION
  subjectId: string
  authoritySnapshotId: string | null
  authorityRevision: number | null
  synchronizedAt: number | null
  projection: CommercialPresentationProjection
  source: typeof COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_SOURCE
  economicEffect: typeof COMMERCIAL_EFFECT_NONE
  worldPowerEffect: typeof COMMERCIAL_EFFECT_NONE
  readonly [COMMERCIAL_ACCOUNT_RUNTIME_CACHE_BRAND]: true
}

export type CommercialAccountAuthoritySyncFailureReason =
  | 'untrusted-authority'
  | 'invalid-authority-snapshot'
  | 'invalid-entitlement-state'
  | 'invalid-presentation-projection'
  | 'stale-authority-snapshot'
  | 'conflicting-authority-revision'

export type CommercialAccountAuthoritySyncResult =
  | {
      synchronized: true
      changed: boolean
      cache: CommercialAccountPresentationCache
      selected: CommercialPresentationResolvedSelection
      rejectedLocalPreferenceIds: readonly string[]
    }
  | {
      synchronized: false
      changed: boolean
      cache: CommercialAccountPresentationCache
      selected: CommercialPresentationResolvedSelection
      rejectedLocalPreferenceIds: readonly string[]
      reason: CommercialAccountAuthoritySyncFailureReason
    }

const validToken = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_TOKEN_LENGTH &&
  value.trim() === value

const validTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const validRevision = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

const emptyProjection = (subjectId: string): CommercialPresentationProjection => ({
  subjectId,
  access: [],
  economicEffect: COMMERCIAL_EFFECT_NONE,
  worldPowerEffect: COMMERCIAL_EFFECT_NONE,
})

const emptySelection = (): CommercialPresentationResolvedSelection => ({
  supporterBadgeAccessId: null,
  profileFrameAccessId: null,
  phoneThemeAccessId: null,
  vehicleLiveryAccessId: null,
})

const validPresentationAccess = (access: CommercialPresentationAccess): boolean =>
  validToken(access.entitlementId) &&
  validToken(access.accessId) &&
  typeof access.surface === 'string' &&
  COMMERCIAL_PRESENTATION_SURFACES.includes(access.surface) &&
  access.economicEffect === COMMERCIAL_EFFECT_NONE &&
  access.worldPowerEffect === COMMERCIAL_EFFECT_NONE

const validPresentationProjection = (
  projection: CommercialPresentationProjection,
  subjectId: string,
): boolean => {
  if (
    projection.subjectId !== subjectId ||
    !Array.isArray(projection.access) ||
    projection.economicEffect !== COMMERCIAL_EFFECT_NONE ||
    projection.worldPowerEffect !== COMMERCIAL_EFFECT_NONE
  ) {
    return false
  }

  const entitlementIds = new Set<string>()
  const accessIds = new Set<string>()
  for (const access of projection.access) {
    if (
      !validPresentationAccess(access) ||
      entitlementIds.has(access.entitlementId) ||
      accessIds.has(access.accessId)
    ) {
      return false
    }
    entitlementIds.add(access.entitlementId)
    accessIds.add(access.accessId)
  }

  return true
}

const makeCache = (
  subjectId: string,
  authoritySnapshotId: string | null,
  authorityRevision: number | null,
  synchronizedAt: number | null,
  projection: CommercialPresentationProjection,
): CommercialAccountPresentationCache => ({
  version: COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_VERSION,
  subjectId,
  authoritySnapshotId,
  authorityRevision,
  synchronizedAt,
  projection,
  source: COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_SOURCE,
  economicEffect: COMMERCIAL_EFFECT_NONE,
  worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  [COMMERCIAL_ACCOUNT_RUNTIME_CACHE_BRAND]: true,
})

export const createEmptyCommercialAccountPresentationCache = (
  subjectId: string,
): CommercialAccountPresentationCache => {
  if (!validToken(subjectId)) throw new Error('Invalid CommercialSubjectId')
  return makeCache(subjectId, null, null, null, emptyProjection(subjectId))
}

export const validateCommercialAccountPresentationCache = (
  cache: CommercialAccountPresentationCache,
): boolean => {
  if (
    cache.version !== COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_VERSION ||
    cache[COMMERCIAL_ACCOUNT_RUNTIME_CACHE_BRAND] !== true ||
    !validToken(cache.subjectId) ||
    cache.source !== COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_SOURCE ||
    cache.economicEffect !== COMMERCIAL_EFFECT_NONE ||
    cache.worldPowerEffect !== COMMERCIAL_EFFECT_NONE ||
    !validPresentationProjection(cache.projection, cache.subjectId)
  ) {
    return false
  }

  const emptyAuthority =
    cache.authoritySnapshotId === null &&
    cache.authorityRevision === null &&
    cache.synchronizedAt === null
  const synchronizedAuthority =
    validToken(cache.authoritySnapshotId) &&
    validRevision(cache.authorityRevision) &&
    validTimestamp(cache.synchronizedAt)

  return emptyAuthority || synchronizedAuthority
}

const validateAuthoritySnapshot = (
  snapshot: TrustedCommercialAccountAuthoritySnapshot,
): CommercialAccountAuthoritySyncFailureReason | null => {
  if (snapshot.authority !== TRUSTED_COMMERCIAL_ACCOUNT_AUTHORITY) {
    return 'untrusted-authority'
  }
  if (
    !validToken(snapshot.snapshotId) ||
    !validToken(snapshot.subjectId) ||
    !validRevision(snapshot.authorityRevision) ||
    !validTimestamp(snapshot.synchronizedAt) ||
    !snapshot.entitlementState ||
    snapshot.entitlementState.subjectId !== snapshot.subjectId
  ) {
    return 'invalid-authority-snapshot'
  }
  if (!validateCommercialEntitlementState(snapshot.entitlementState)) {
    return 'invalid-entitlement-state'
  }
  return null
}

const sameProjection = (
  left: CommercialPresentationProjection,
  right: CommercialPresentationProjection,
): boolean => JSON.stringify(left) === JSON.stringify(right)

const failClosedCache = (subjectId: string): CommercialAccountPresentationCache =>
  createEmptyCommercialAccountPresentationCache(subjectId)

const failure = (
  cache: CommercialAccountPresentationCache,
  reason: CommercialAccountAuthoritySyncFailureReason,
  changed: boolean,
): CommercialAccountAuthoritySyncResult => ({
  synchronized: false,
  changed,
  cache,
  selected: emptySelection(),
  rejectedLocalPreferenceIds: [],
  reason,
})

/**
 * Rebuilds the runtime presentation cache from account/server authority.
 *
 * The cache is never merged with local ownership claims. A valid newer authority snapshot replaces it
 * completely. Local preferences are resolved only after the authoritative projection exists.
 *
 * This is a provider-neutral contract, not authentication. The authority marker must only be attached
 * by a future authenticated server/account adapter. #560 remains the production authority blocker.
 */
export const synchronizeCommercialAccountPresentationCache = (
  currentCache: CommercialAccountPresentationCache,
  snapshot: TrustedCommercialAccountAuthoritySnapshot,
  preferences: CommercialPresentationLocalPreferences = {},
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
): CommercialAccountAuthoritySyncResult => {
  const snapshotFailure = validateAuthoritySnapshot(snapshot)
  if (snapshotFailure) {
    const subjectId = validToken(snapshot.subjectId) ? snapshot.subjectId : currentCache.subjectId
    const nextCache = failClosedCache(subjectId)
    return failure(nextCache, snapshotFailure, !sameProjection(currentCache.projection, nextCache.projection))
  }

  const projectionResult = projectCommercialPresentationAccess(snapshot.entitlementState, catalog)
  if (!projectionResult.valid || !validPresentationProjection(projectionResult.projection, snapshot.subjectId)) {
    const nextCache = failClosedCache(snapshot.subjectId)
    return failure(
      nextCache,
      'invalid-presentation-projection',
      !sameProjection(currentCache.projection, nextCache.projection),
    )
  }

  const currentCacheValid = validateCommercialAccountPresentationCache(currentCache)
  const comparableCurrent = currentCacheValid && currentCache.subjectId === snapshot.subjectId

  if (
    comparableCurrent &&
    currentCache.authorityRevision !== null &&
    snapshot.authorityRevision < currentCache.authorityRevision
  ) {
    return failure(currentCache, 'stale-authority-snapshot', false)
  }

  if (
    comparableCurrent &&
    currentCache.authorityRevision === snapshot.authorityRevision &&
    currentCache.authorityRevision !== null
  ) {
    const sameAuthoritySnapshot =
      currentCache.authoritySnapshotId === snapshot.snapshotId &&
      sameProjection(currentCache.projection, projectionResult.projection)

    if (!sameAuthoritySnapshot) {
      const nextCache = failClosedCache(snapshot.subjectId)
      return failure(nextCache, 'conflicting-authority-revision', true)
    }

    const resolution = resolveCommercialPresentationSelection(
      snapshot.entitlementState,
      preferences,
      catalog,
    )
    if (!resolution.valid) {
      const nextCache = failClosedCache(snapshot.subjectId)
      return failure(nextCache, 'invalid-presentation-projection', true)
    }

    return {
      synchronized: true,
      changed: false,
      cache: currentCache,
      selected: resolution.selected,
      rejectedLocalPreferenceIds: resolution.rejectedLocalPreferenceIds,
    }
  }

  const resolution = resolveCommercialPresentationSelection(
    snapshot.entitlementState,
    preferences,
    catalog,
  )
  if (!resolution.valid) {
    const nextCache = failClosedCache(snapshot.subjectId)
    return failure(nextCache, 'invalid-presentation-projection', true)
  }

  const nextCache = makeCache(
    snapshot.subjectId,
    snapshot.snapshotId,
    snapshot.authorityRevision,
    snapshot.synchronizedAt,
    projectionResult.projection,
  )

  const changed =
    !currentCacheValid ||
    currentCache.subjectId !== nextCache.subjectId ||
    currentCache.authoritySnapshotId !== nextCache.authoritySnapshotId ||
    currentCache.authorityRevision !== nextCache.authorityRevision ||
    currentCache.synchronizedAt !== nextCache.synchronizedAt ||
    !sameProjection(currentCache.projection, nextCache.projection)

  return {
    synchronized: true,
    changed,
    cache: nextCache,
    selected: resolution.selected,
    rejectedLocalPreferenceIds: resolution.rejectedLocalPreferenceIds,
  }
}
