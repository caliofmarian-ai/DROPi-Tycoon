import {
  COMMERCIAL_EFFECT_NONE,
  COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY,
  V1_COMMERCIAL_CATALOG,
  getCommercialEntitlement,
  type CommercialCatalog,
  type CommercialEntitlementId,
} from './commercialCatalog'
import {
  projectActiveCommercialEntitlements,
  type CommercialEntitlementState,
} from './commercialEntitlementDomain'

export const COMMERCIAL_PRESENTATION_SURFACES = [
  'SUPPORTER_BADGE',
  'PROFILE_FRAME',
  'PHONE_THEME',
  'VEHICLE_LIVERY',
] as const

export type CommercialPresentationSurface =
  (typeof COMMERCIAL_PRESENTATION_SURFACES)[number]

export interface CommercialPresentationBinding {
  entitlementId: CommercialEntitlementId
  accessId: string
  surface: CommercialPresentationSurface
  economicEffect: typeof COMMERCIAL_EFFECT_NONE
  worldPowerEffect: typeof COMMERCIAL_EFFECT_NONE
}

export interface CommercialPresentationAccess {
  entitlementId: CommercialEntitlementId
  accessId: string
  surface: CommercialPresentationSurface
  economicEffect: typeof COMMERCIAL_EFFECT_NONE
  worldPowerEffect: typeof COMMERCIAL_EFFECT_NONE
}

export interface CommercialPresentationProjection {
  subjectId: string
  access: readonly CommercialPresentationAccess[]
  economicEffect: typeof COMMERCIAL_EFFECT_NONE
  worldPowerEffect: typeof COMMERCIAL_EFFECT_NONE
}

export type CommercialPresentationProjectionFailureReason =
  | 'invalid-entitlement-state'
  | 'invalid-catalog'
  | 'unknown-product'
  | 'invalid-binding'
  | 'unknown-entitlement'

export type CommercialPresentationProjectionResult =
  | {
      valid: true
      projection: CommercialPresentationProjection
    }
  | {
      valid: false
      projection: CommercialPresentationProjection
      reason: CommercialPresentationProjectionFailureReason
    }

export interface CommercialPresentationLocalPreferences {
  supporterBadgeAccessId?: string
  profileFrameAccessId?: string
  phoneThemeAccessId?: string
  vehicleLiveryAccessId?: string
}

export interface CommercialPresentationResolvedSelection {
  supporterBadgeAccessId: string | null
  profileFrameAccessId: string | null
  phoneThemeAccessId: string | null
  vehicleLiveryAccessId: string | null
}

export interface CommercialPresentationSelectionResolution {
  valid: boolean
  projection: CommercialPresentationProjection
  selected: CommercialPresentationResolvedSelection
  rejectedLocalPreferenceIds: readonly string[]
  reason?: CommercialPresentationProjectionFailureReason
}

const MAX_ID_LENGTH = 180

const validId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_ID_LENGTH &&
  value.trim() === value

const isPresentationSurface = (
  value: unknown,
): value is CommercialPresentationSurface =>
  typeof value === 'string' &&
  COMMERCIAL_PRESENTATION_SURFACES.includes(value as CommercialPresentationSurface)

const V1_BINDINGS: readonly CommercialPresentationBinding[] = Object.freeze([
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.supporter.early_badge.v1',
    accessId: 'presentation.supporter.early_badge.v1',
    surface: 'SUPPORTER_BADGE',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.profile_frame.early_supporter.v1',
    accessId: 'presentation.profile_frame.early_supporter.v1',
    surface: 'PROFILE_FRAME',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.phone_theme.early_supporter.v1',
    accessId: 'presentation.phone_theme.early_supporter.v1',
    surface: 'PHONE_THEME',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.vehicle_livery.early_supporter.v1',
    accessId: 'presentation.vehicle_livery.early_supporter.v1',
    surface: 'VEHICLE_LIVERY',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
    accessId: 'presentation.phone_theme.pack_01.v1',
    surface: 'PHONE_THEME',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1',
    accessId: 'presentation.vehicle_livery.pack_01.v1',
    surface: 'VEHICLE_LIVERY',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
])

export const V1_COMMERCIAL_PRESENTATION_BINDINGS = V1_BINDINGS

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

export const validateCommercialPresentationBindings = (
  bindings: readonly CommercialPresentationBinding[],
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
): boolean => {
  if (!Array.isArray(bindings)) return false

  const entitlementIds = new Set<string>()
  const accessIds = new Set<string>()

  for (const binding of bindings) {
    if (
      !validId(binding.entitlementId) ||
      !validId(binding.accessId) ||
      !isPresentationSurface(binding.surface) ||
      binding.economicEffect !== COMMERCIAL_EFFECT_NONE ||
      binding.worldPowerEffect !== COMMERCIAL_EFFECT_NONE ||
      entitlementIds.has(binding.entitlementId) ||
      accessIds.has(binding.accessId)
    ) {
      return false
    }

    const entitlement = getCommercialEntitlement(catalog, binding.entitlementId)
    if (
      !entitlement ||
      entitlement.scope !== COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY ||
      entitlement.economicEffect !== COMMERCIAL_EFFECT_NONE ||
      entitlement.worldPowerEffect !== COMMERCIAL_EFFECT_NONE
    ) {
      return false
    }

    entitlementIds.add(binding.entitlementId)
    accessIds.add(binding.accessId)
  }

  return true
}

export const projectCommercialPresentationAccess = (
  state: CommercialEntitlementState,
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
  bindings: readonly CommercialPresentationBinding[] = V1_COMMERCIAL_PRESENTATION_BINDINGS,
): CommercialPresentationProjectionResult => {
  const entitlementProjection = projectActiveCommercialEntitlements(state, catalog)
  if (!entitlementProjection.valid) {
    const reason: CommercialPresentationProjectionFailureReason =
      entitlementProjection.reason === 'invalid-state'
        ? 'invalid-entitlement-state'
        : entitlementProjection.reason
    return {
      valid: false,
      projection: emptyProjection(state.subjectId),
      reason,
    }
  }

  if (!validateCommercialPresentationBindings(bindings, catalog)) {
    return {
      valid: false,
      projection: emptyProjection(state.subjectId),
      reason: 'invalid-binding',
    }
  }

  const bindingByEntitlement = new Map(
    bindings.map((binding) => [binding.entitlementId, binding] as const),
  )

  const access: CommercialPresentationAccess[] = []
  for (const entitlementId of entitlementProjection.projection.activeEntitlementIds) {
    const binding = bindingByEntitlement.get(entitlementId)
    if (!binding) {
      return {
        valid: false,
        projection: emptyProjection(state.subjectId),
        reason: 'unknown-entitlement',
      }
    }
    access.push({ ...binding })
  }

  access.sort((left, right) => left.accessId.localeCompare(right.accessId))

  return {
    valid: true,
    projection: {
      subjectId: state.subjectId,
      access,
      economicEffect: COMMERCIAL_EFFECT_NONE,
      worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    },
  }
}

const preferredAccessForSurface = (
  projection: CommercialPresentationProjection,
  surface: CommercialPresentationSurface,
  requestedAccessId: unknown,
  rejected: string[],
): string | null => {
  if (requestedAccessId === undefined) return null
  if (!validId(requestedAccessId)) {
    if (typeof requestedAccessId === 'string') rejected.push(requestedAccessId)
    return null
  }

  const allowed = projection.access.some(
    (item) => item.surface === surface && item.accessId === requestedAccessId,
  )
  if (!allowed) {
    rejected.push(requestedAccessId)
    return null
  }

  return requestedAccessId
}

/**
 * Resolves local presentation preferences against authoritative commercial state.
 * Local preferences are selection only: they never create ownership or entitlement state.
 */
export const resolveCommercialPresentationSelection = (
  state: CommercialEntitlementState,
  preferences: CommercialPresentationLocalPreferences,
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
  bindings: readonly CommercialPresentationBinding[] = V1_COMMERCIAL_PRESENTATION_BINDINGS,
): CommercialPresentationSelectionResolution => {
  const result = projectCommercialPresentationAccess(state, catalog, bindings)
  if (!result.valid) {
    return {
      valid: false,
      projection: result.projection,
      selected: emptySelection(),
      rejectedLocalPreferenceIds: [],
      reason: result.reason,
    }
  }

  const rejected: string[] = []
  const selected: CommercialPresentationResolvedSelection = {
    supporterBadgeAccessId: preferredAccessForSurface(
      result.projection,
      'SUPPORTER_BADGE',
      preferences.supporterBadgeAccessId,
      rejected,
    ),
    profileFrameAccessId: preferredAccessForSurface(
      result.projection,
      'PROFILE_FRAME',
      preferences.profileFrameAccessId,
      rejected,
    ),
    phoneThemeAccessId: preferredAccessForSurface(
      result.projection,
      'PHONE_THEME',
      preferences.phoneThemeAccessId,
      rejected,
    ),
    vehicleLiveryAccessId: preferredAccessForSurface(
      result.projection,
      'VEHICLE_LIVERY',
      preferences.vehicleLiveryAccessId,
      rejected,
    ),
  }

  return {
    valid: true,
    projection: result.projection,
    selected,
    rejectedLocalPreferenceIds: [...new Set(rejected)].sort(),
  }
}
