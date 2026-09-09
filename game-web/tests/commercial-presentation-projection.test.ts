import { describe, expect, it } from 'vitest'
import {
  COMMERCIAL_EFFECT_NONE,
  V1_COMMERCIAL_CATALOG,
  type CommercialCatalog,
} from '../src/commercial/commercialCatalog'
import {
  TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY,
  createCommercialEntitlementState,
  reconcileVerifiedCommercialEvidence,
  type CommercialEntitlementState,
  type TrustedCommercialEvidence,
} from '../src/commercial/commercialEntitlementDomain'
import {
  V1_COMMERCIAL_PRESENTATION_BINDINGS,
  projectCommercialPresentationAccess,
  resolveCommercialPresentationSelection,
} from '../src/commercial/commercialPresentationProjection'

const SUBJECT = 'commercial-presentation-subject'
const SUPPORTER_PRODUCT = 'commercial.product.supporter.early.v1'
const PHONE_PRODUCT = 'commercial.product.cosmetic.phone_theme_pack_01.v1'
const LIVERY_PRODUCT = 'commercial.product.cosmetic.vehicle_livery_pack_01.v1'

const SUPPORTER_ACCESS = [
  'presentation.phone_theme.early_supporter.v1',
  'presentation.profile_frame.early_supporter.v1',
  'presentation.supporter.early_badge.v1',
  'presentation.vehicle_livery.early_supporter.v1',
]

const trustedEvidence = (
  evidenceId: string,
  productId: string,
  state: TrustedCommercialEvidence['state'] = 'VERIFIED_OWNED',
  verifiedAt = 10,
): TrustedCommercialEvidence => ({
  evidenceId,
  subjectId: SUBJECT,
  productId,
  state,
  verifiedAt,
  verificationAuthority: TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY,
})

const apply = (
  state: CommercialEntitlementState,
  evidence: TrustedCommercialEvidence,
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
): CommercialEntitlementState => {
  const result = reconcileVerifiedCommercialEvidence(state, evidence, catalog)
  expect(result.accepted).toBe(true)
  if (!result.accepted) throw new Error(`Expected accepted evidence: ${result.reason}`)
  return result.state
}

const accessIds = (state: CommercialEntitlementState) => {
  const result = projectCommercialPresentationAccess(state)
  expect(result.valid).toBe(true)
  if (!result.valid) throw new Error(`Expected valid projection: ${result.reason}`)
  return result.projection.access.map((item) => item.accessId)
}

describe('commercial presentation projection adapter', () => {
  it('projects only active GRANTED supporter entitlements into presentation-only access', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT),
      trustedEvidence('supporter-grant', SUPPORTER_PRODUCT),
    )

    const result = projectCommercialPresentationAccess(granted)
    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error(`Expected valid projection: ${result.reason}`)

    expect(result.projection.access.map((item) => item.accessId)).toEqual(SUPPORTER_ACCESS)
    expect(result.projection.economicEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(result.projection.worldPowerEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(result.projection.access.every((item) => item.economicEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)
    expect(result.projection.access.every((item) => item.worldPowerEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)
    expect(result.projection).not.toHaveProperty('money')
    expect(result.projection).not.toHaveProperty('workCapacity')
    expect(result.projection).not.toHaveProperty('vehicle')
    expect(result.projection).not.toHaveProperty('inventory')
    expect(result.projection).not.toHaveProperty('missionReward')
  })

  it('projects RESTORED ownership but not pending ownership', () => {
    const pending = apply(
      createCommercialEntitlementState(SUBJECT),
      trustedEvidence('phone-pending', PHONE_PRODUCT, 'PENDING'),
    )
    expect(accessIds(pending)).toEqual([])

    const restored = apply(
      pending,
      trustedEvidence('phone-pending', PHONE_PRODUCT, 'RESTORED_OWNED', 20),
    )
    expect(accessIds(restored)).toEqual(['presentation.phone_theme.pack_01.v1'])
  })

  it('removes revoked presentation access deterministically', () => {
    let state = createCommercialEntitlementState(SUBJECT)
    state = apply(state, trustedEvidence('livery-revoke', LIVERY_PRODUCT))
    expect(accessIds(state)).toEqual(['presentation.vehicle_livery.pack_01.v1'])

    state = apply(state, trustedEvidence('livery-revoke', LIVERY_PRODUCT, 'REVOKED', 30))
    expect(accessIds(state)).toEqual([])
  })

  it('removes only refunded source access while unrelated valid presentation access remains', () => {
    let state = createCommercialEntitlementState(SUBJECT)
    state = apply(state, trustedEvidence('phone-kept', PHONE_PRODUCT))
    state = apply(state, trustedEvidence('livery-refunded', LIVERY_PRODUCT))
    expect(accessIds(state)).toEqual([
      'presentation.phone_theme.pack_01.v1',
      'presentation.vehicle_livery.pack_01.v1',
    ])

    state = apply(state, trustedEvidence('livery-refunded', LIVERY_PRODUCT, 'REFUNDED', 40))
    expect(accessIds(state)).toEqual(['presentation.phone_theme.pack_01.v1'])
  })

  it('fails closed when an active catalog entitlement has no governed presentation binding', () => {
    const unknownEntitlementId = 'commercial.entitlement.account.cosmetic.phone_theme.future_unknown.v1'
    const phone = V1_COMMERCIAL_CATALOG.products.find((item) => item.productId === PHONE_PRODUCT)
    const seedEntitlement = V1_COMMERCIAL_CATALOG.entitlements.find(
      (item) => item.entitlementId === 'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
    )
    if (!phone || !seedEntitlement) throw new Error('Missing V1 fixtures')

    const catalog: CommercialCatalog = {
      ...V1_COMMERCIAL_CATALOG,
      entitlements: [
        ...V1_COMMERCIAL_CATALOG.entitlements,
        { ...seedEntitlement, entitlementId: unknownEntitlementId },
      ],
      products: V1_COMMERCIAL_CATALOG.products.map((item) =>
        item.productId === PHONE_PRODUCT
          ? { ...phone, entitlementIds: [...phone.entitlementIds, unknownEntitlementId] }
          : item,
      ),
    }

    const granted = apply(
      createCommercialEntitlementState(SUBJECT),
      trustedEvidence('future-unknown', PHONE_PRODUCT),
      catalog,
    )
    const result = projectCommercialPresentationAccess(
      granted,
      catalog,
      V1_COMMERCIAL_PRESENTATION_BINDINGS,
    )

    expect(result).toMatchObject({ valid: false, reason: 'unknown-entitlement' })
    expect(result.projection.access).toEqual([])
  })

  it('fails closed for corrupted commercial entitlement state', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT),
      trustedEvidence('corrupt-source', PHONE_PRODUCT),
    )
    const first = granted.fulfillments[0]
    if (!first) throw new Error('Missing fulfillment fixture')

    const corrupted: CommercialEntitlementState = {
      ...granted,
      fulfillments: [...granted.fulfillments, { ...first }],
    }
    const result = projectCommercialPresentationAccess(corrupted)

    expect(result).toMatchObject({ valid: false, reason: 'invalid-entitlement-state' })
    expect(result.projection.access).toEqual([])
  })

  it('does not let forged local cosmetic preferences manufacture ownership', () => {
    const empty = createCommercialEntitlementState(SUBJECT)
    const resolution = resolveCommercialPresentationSelection(empty, {
      supporterBadgeAccessId: 'presentation.supporter.early_badge.v1',
      profileFrameAccessId: 'presentation.profile_frame.early_supporter.v1',
      phoneThemeAccessId: 'presentation.phone_theme.pack_01.v1',
      vehicleLiveryAccessId: 'presentation.vehicle_livery.pack_01.v1',
    })

    expect(resolution.valid).toBe(true)
    expect(resolution.projection.access).toEqual([])
    expect(resolution.selected).toEqual({
      supporterBadgeAccessId: null,
      profileFrameAccessId: null,
      phoneThemeAccessId: null,
      vehicleLiveryAccessId: null,
    })
    expect(resolution.rejectedLocalPreferenceIds).toEqual([
      'presentation.phone_theme.pack_01.v1',
      'presentation.profile_frame.early_supporter.v1',
      'presentation.supporter.early_badge.v1',
      'presentation.vehicle_livery.pack_01.v1',
    ])
  })

  it('accepts a local selection only when its matching presentation surface is already authorized', () => {
    const phone = apply(
      createCommercialEntitlementState(SUBJECT),
      trustedEvidence('phone-select', PHONE_PRODUCT),
    )
    const resolution = resolveCommercialPresentationSelection(phone, {
      phoneThemeAccessId: 'presentation.phone_theme.pack_01.v1',
      vehicleLiveryAccessId: 'presentation.phone_theme.pack_01.v1',
    })

    expect(resolution.selected.phoneThemeAccessId).toBe('presentation.phone_theme.pack_01.v1')
    expect(resolution.selected.vehicleLiveryAccessId).toBeNull()
    expect(resolution.rejectedLocalPreferenceIds).toEqual(['presentation.phone_theme.pack_01.v1'])
  })

  it('clears a formerly valid local selection after refund without mutating ownership state', () => {
    let state = createCommercialEntitlementState(SUBJECT)
    state = apply(state, trustedEvidence('phone-refund-select', PHONE_PRODUCT))

    const selected = resolveCommercialPresentationSelection(state, {
      phoneThemeAccessId: 'presentation.phone_theme.pack_01.v1',
    })
    expect(selected.selected.phoneThemeAccessId).toBe('presentation.phone_theme.pack_01.v1')

    const refunded = apply(
      state,
      trustedEvidence('phone-refund-select', PHONE_PRODUCT, 'REFUNDED', 50),
    )
    const beforeResolve = structuredClone(refunded)
    const afterRefund = resolveCommercialPresentationSelection(refunded, {
      phoneThemeAccessId: 'presentation.phone_theme.pack_01.v1',
    })

    expect(afterRefund.selected.phoneThemeAccessId).toBeNull()
    expect(afterRefund.rejectedLocalPreferenceIds).toEqual(['presentation.phone_theme.pack_01.v1'])
    expect(refunded).toEqual(beforeResolve)
  })

  it('rejects malformed or unknown local access IDs without affecting authorized access', () => {
    const supporter = apply(
      createCommercialEntitlementState(SUBJECT),
      trustedEvidence('supporter-local-corruption', SUPPORTER_PRODUCT),
    )
    const resolution = resolveCommercialPresentationSelection(supporter, {
      profileFrameAccessId: ' presentation.profile_frame.early_supporter.v1 ',
      phoneThemeAccessId: 'presentation.phone_theme.unknown-local.v1',
    })

    expect(resolution.projection.access.map((item) => item.accessId)).toEqual(SUPPORTER_ACCESS)
    expect(resolution.selected.profileFrameAccessId).toBeNull()
    expect(resolution.selected.phoneThemeAccessId).toBeNull()
    expect(resolution.rejectedLocalPreferenceIds).toEqual([
      ' presentation.profile_frame.early_supporter.v1 ',
      'presentation.phone_theme.unknown-local.v1',
    ])
  })

  it('keeps presentation binding vocabulary strictly non-economic and account-presentation scoped', () => {
    expect(V1_COMMERCIAL_PRESENTATION_BINDINGS).toHaveLength(6)
    expect(V1_COMMERCIAL_PRESENTATION_BINDINGS.every((item) => item.economicEffect === 'NONE')).toBe(true)
    expect(V1_COMMERCIAL_PRESENTATION_BINDINGS.every((item) => item.worldPowerEffect === 'NONE')).toBe(true)

    const serialized = JSON.stringify(V1_COMMERCIAL_PRESENTATION_BINDINGS)
    expect(serialized).not.toContain('PersonalMoney')
    expect(serialized).not.toContain('CompanyMoney')
    expect(serialized).not.toContain('WorkCapacity')
    expect(serialized).not.toContain('qualification')
    expect(serialized).not.toContain('cargoCapacity')
    expect(serialized).not.toContain('missionReward')
    expect(serialized).not.toContain('inventory')
    expect(serialized).not.toContain('production')
  })
})
