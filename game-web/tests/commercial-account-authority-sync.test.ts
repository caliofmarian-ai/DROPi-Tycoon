import { describe, expect, it } from 'vitest'
import {
  COMMERCIAL_EFFECT_NONE,
  V1_COMMERCIAL_CATALOG,
} from '../src/commercial/commercialCatalog'
import {
  TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY,
  createCommercialEntitlementState,
  reconcileVerifiedCommercialEvidence,
  type CommercialEntitlementState,
  type TrustedCommercialEvidence,
} from '../src/commercial/commercialEntitlementDomain'
import {
  COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_SOURCE,
  TRUSTED_COMMERCIAL_ACCOUNT_AUTHORITY,
  createEmptyCommercialAccountPresentationCache,
  synchronizeCommercialAccountPresentationCache,
  validateCommercialAccountPresentationCache,
  type CommercialAccountPresentationCache,
  type TrustedCommercialAccountAuthoritySnapshot,
} from '../src/commercial/commercialAccountAuthoritySync'

const SUBJECT_A = 'commercial-account-a'
const SUBJECT_B = 'commercial-account-b'
const PHONE_PRODUCT = 'commercial.product.cosmetic.phone_theme_pack_01.v1'
const LIVERY_PRODUCT = 'commercial.product.cosmetic.vehicle_livery_pack_01.v1'
const PHONE_ACCESS = 'presentation.phone_theme.pack_01.v1'
const LIVERY_ACCESS = 'presentation.vehicle_livery.pack_01.v1'

const trustedEvidence = (
  subjectId: string,
  evidenceId: string,
  productId: string,
  state: TrustedCommercialEvidence['state'] = 'VERIFIED_OWNED',
  verifiedAt = 10,
): TrustedCommercialEvidence => ({
  evidenceId,
  subjectId,
  productId,
  state,
  verifiedAt,
  verificationAuthority: TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY,
})

const apply = (
  state: CommercialEntitlementState,
  evidence: TrustedCommercialEvidence,
): CommercialEntitlementState => {
  const result = reconcileVerifiedCommercialEvidence(state, evidence)
  expect(result.accepted).toBe(true)
  if (!result.accepted) throw new Error(`Expected accepted evidence: ${result.reason}`)
  return result.state
}

const snapshot = (
  subjectId: string,
  authorityRevision: number,
  entitlementState: CommercialEntitlementState,
  snapshotId = `account-snapshot-${subjectId}-r${authorityRevision}`,
  synchronizedAt = authorityRevision * 100,
): TrustedCommercialAccountAuthoritySnapshot => ({
  snapshotId,
  subjectId,
  authorityRevision,
  synchronizedAt,
  entitlementState,
  authority: TRUSTED_COMMERCIAL_ACCOUNT_AUTHORITY,
})

const accessIds = (cache: CommercialAccountPresentationCache) =>
  cache.projection.access.map((item) => item.accessId)

describe('commercial account authority synchronization contract', () => {
  it('rebuilds presentation cache only from trusted account authority truth', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'phone-grant', PHONE_PRODUCT),
    )

    const result = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, granted),
      { phoneThemeAccessId: PHONE_ACCESS },
    )

    expect(result.synchronized).toBe(true)
    expect(result.changed).toBe(true)
    expect(accessIds(result.cache)).toEqual([PHONE_ACCESS])
    expect(result.selected.phoneThemeAccessId).toBe(PHONE_ACCESS)
    expect(result.cache.authorityRevision).toBe(1)
    expect(result.cache.source).toBe(COMMERCIAL_ACCOUNT_PRESENTATION_CACHE_SOURCE)
    expect(result.cache.economicEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(result.cache.worldPowerEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(validateCommercialAccountPresentationCache(result.cache)).toBe(true)
  })

  it('is idempotent for the same authority snapshot and revision', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'phone-idempotent', PHONE_PRODUCT),
    )
    const authoritative = snapshot(SUBJECT_A, 1, granted)
    const first = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      authoritative,
    )
    expect(first.synchronized).toBe(true)

    const second = synchronizeCommercialAccountPresentationCache(first.cache, authoritative)
    expect(second).toMatchObject({ synchronized: true, changed: false })
    expect(second.cache).toBe(first.cache)
    expect(accessIds(second.cache)).toEqual([PHONE_ACCESS])
  })

  it('rejects stale authority snapshots without overwriting a newer trusted cache', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'phone-newer', PHONE_PRODUCT),
    )
    const newer = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 2, granted),
    )
    expect(newer.synchronized).toBe(true)

    const stale = synchronizeCommercialAccountPresentationCache(
      newer.cache,
      snapshot(SUBJECT_A, 1, createCommercialEntitlementState(SUBJECT_A), 'older-snapshot'),
    )

    expect(stale).toMatchObject({
      synchronized: false,
      changed: false,
      reason: 'stale-authority-snapshot',
    })
    expect(stale.cache).toBe(newer.cache)
    expect(accessIds(stale.cache)).toEqual([PHONE_ACCESS])
  })

  it('fails closed when the same authority revision carries conflicting truth', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'phone-conflict', PHONE_PRODUCT),
    )
    const current = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 4, granted, 'snapshot-r4-a'),
    )
    expect(current.synchronized).toBe(true)

    const conflict = synchronizeCommercialAccountPresentationCache(
      current.cache,
      snapshot(
        SUBJECT_A,
        4,
        createCommercialEntitlementState(SUBJECT_A),
        'snapshot-r4-b',
      ),
    )

    expect(conflict).toMatchObject({
      synchronized: false,
      changed: true,
      reason: 'conflicting-authority-revision',
    })
    expect(accessIds(conflict.cache)).toEqual([])
    expect(conflict.cache.authorityRevision).toBeNull()
  })

  it('replaces the whole cache on account subject change so access cannot leak across accounts', () => {
    const grantedA = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'phone-account-a', PHONE_PRODUCT),
    )
    const accountA = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, grantedA),
    )
    expect(accessIds(accountA.cache)).toEqual([PHONE_ACCESS])

    const accountB = synchronizeCommercialAccountPresentationCache(
      accountA.cache,
      snapshot(SUBJECT_B, 1, createCommercialEntitlementState(SUBJECT_B)),
      { phoneThemeAccessId: PHONE_ACCESS },
    )

    expect(accountB.synchronized).toBe(true)
    expect(accountB.cache.subjectId).toBe(SUBJECT_B)
    expect(accessIds(accountB.cache)).toEqual([])
    expect(accountB.selected.phoneThemeAccessId).toBeNull()
    expect(accountB.rejectedLocalPreferenceIds).toEqual([PHONE_ACCESS])
  })

  it('removes refunded access immediately while unrelated authoritative ownership remains', () => {
    let state = createCommercialEntitlementState(SUBJECT_A)
    state = apply(state, trustedEvidence(SUBJECT_A, 'phone-refund', PHONE_PRODUCT))
    state = apply(state, trustedEvidence(SUBJECT_A, 'livery-kept', LIVERY_PRODUCT))

    const beforeRefund = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, state),
      { phoneThemeAccessId: PHONE_ACCESS, vehicleLiveryAccessId: LIVERY_ACCESS },
    )
    expect(accessIds(beforeRefund.cache)).toEqual([PHONE_ACCESS, LIVERY_ACCESS])

    const refundedState = apply(
      state,
      trustedEvidence(SUBJECT_A, 'phone-refund', PHONE_PRODUCT, 'REFUNDED', 20),
    )
    const afterRefund = synchronizeCommercialAccountPresentationCache(
      beforeRefund.cache,
      snapshot(SUBJECT_A, 2, refundedState),
      { phoneThemeAccessId: PHONE_ACCESS, vehicleLiveryAccessId: LIVERY_ACCESS },
    )

    expect(afterRefund.synchronized).toBe(true)
    expect(accessIds(afterRefund.cache)).toEqual([LIVERY_ACCESS])
    expect(afterRefund.selected.phoneThemeAccessId).toBeNull()
    expect(afterRefund.selected.vehicleLiveryAccessId).toBe(LIVERY_ACCESS)
    expect(afterRefund.rejectedLocalPreferenceIds).toEqual([PHONE_ACCESS])
  })

  it('removes revoked access immediately and does not preserve a stale local selection', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'livery-revoke', LIVERY_PRODUCT),
    )
    const beforeRevoke = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, granted),
      { vehicleLiveryAccessId: LIVERY_ACCESS },
    )

    const revoked = apply(
      granted,
      trustedEvidence(SUBJECT_A, 'livery-revoke', LIVERY_PRODUCT, 'REVOKED', 30),
    )
    const afterRevoke = synchronizeCommercialAccountPresentationCache(
      beforeRevoke.cache,
      snapshot(SUBJECT_A, 2, revoked),
      { vehicleLiveryAccessId: LIVERY_ACCESS },
    )

    expect(accessIds(afterRevoke.cache)).toEqual([])
    expect(afterRevoke.selected.vehicleLiveryAccessId).toBeNull()
    expect(afterRevoke.rejectedLocalPreferenceIds).toEqual([LIVERY_ACCESS])
  })

  it('supports restored ownership as server truth without using local Save ownership', () => {
    const restored = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'phone-restored', PHONE_PRODUCT, 'RESTORED_OWNED'),
    )
    const result = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, restored),
    )

    expect(result.synchronized).toBe(true)
    expect(accessIds(result.cache)).toEqual([PHONE_ACCESS])
  })

  it('rejects client-shaped untrusted authority and cannot manufacture ownership', () => {
    const forgedState = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'forged-client-shape', PHONE_PRODUCT),
    )
    const forgedSnapshot = {
      ...snapshot(SUBJECT_A, 1, forgedState),
      authority: 'CLIENT',
    } as unknown as TrustedCommercialAccountAuthoritySnapshot

    const result = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      forgedSnapshot,
      { phoneThemeAccessId: PHONE_ACCESS },
    )

    expect(result).toMatchObject({
      synchronized: false,
      reason: 'untrusted-authority',
    })
    expect(accessIds(result.cache)).toEqual([])
    expect(result.selected.phoneThemeAccessId).toBeNull()
  })

  it('fails closed on corrupted authoritative entitlement state', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'corrupt-authority', PHONE_PRODUCT),
    )
    const first = granted.fulfillments[0]
    if (!first) throw new Error('Missing fulfillment fixture')
    const corrupted: CommercialEntitlementState = {
      ...granted,
      fulfillments: [...granted.fulfillments, { ...first }],
    }

    const result = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, corrupted),
    )

    expect(result).toMatchObject({
      synchronized: false,
      reason: 'invalid-entitlement-state',
    })
    expect(accessIds(result.cache)).toEqual([])
  })

  it('treats serialized local cache as non-authoritative and rebuilds from server/account truth', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'serialized-cache', PHONE_PRODUCT),
    )
    const synchronized = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, granted),
    )
    expect(synchronized.synchronized).toBe(true)

    const serializedCopy = JSON.parse(JSON.stringify(synchronized.cache)) as CommercialAccountPresentationCache
    expect(validateCommercialAccountPresentationCache(serializedCopy)).toBe(false)

    const rebuilt = synchronizeCommercialAccountPresentationCache(
      serializedCopy,
      snapshot(SUBJECT_A, 2, createCommercialEntitlementState(SUBJECT_A)),
      { phoneThemeAccessId: PHONE_ACCESS },
    )

    expect(rebuilt.synchronized).toBe(true)
    expect(accessIds(rebuilt.cache)).toEqual([])
    expect(rebuilt.selected.phoneThemeAccessId).toBeNull()
  })

  it('stores presentation projection only, never raw entitlement evidence or provider secrets', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'sensitive-evidence-id', PHONE_PRODUCT),
    )
    const result = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, granted),
    )
    const serialized = JSON.stringify(result.cache)

    expect(serialized).not.toContain('sensitive-evidence-id')
    expect(serialized).not.toContain('auditTrail')
    expect(serialized).not.toContain('fulfillments')
    expect(serialized).not.toContain('purchaseToken')
    expect(serialized).not.toContain('receipt')
    expect(serialized).not.toContain('providerPayload')
    expect(serialized).not.toContain('paymentSecret')
  })

  it('keeps the synchronization contract presentation-only and non-pay-to-win', () => {
    const granted = apply(
      createCommercialEntitlementState(SUBJECT_A),
      trustedEvidence(SUBJECT_A, 'none-none', PHONE_PRODUCT),
    )
    const result = synchronizeCommercialAccountPresentationCache(
      createEmptyCommercialAccountPresentationCache(SUBJECT_A),
      snapshot(SUBJECT_A, 1, granted),
    )

    expect(result.cache.economicEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(result.cache.worldPowerEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(result.cache.projection.economicEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(result.cache.projection.worldPowerEffect).toBe(COMMERCIAL_EFFECT_NONE)
    expect(result.cache.projection.access.every((item) => item.economicEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)
    expect(result.cache.projection.access.every((item) => item.worldPowerEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)

    const serialized = JSON.stringify({ cache: result.cache, catalog: V1_COMMERCIAL_CATALOG.products })
    expect(serialized).not.toContain('PersonalMoney')
    expect(serialized).not.toContain('CompanyMoney')
    expect(serialized).not.toContain('WorkCapacity')
    expect(serialized).not.toContain('qualificationProgress')
    expect(serialized).not.toContain('cargoCapacity')
    expect(serialized).not.toContain('vehiclePerformance')
    expect(serialized).not.toContain('missionReward')
    expect(serialized).not.toContain('inventoryGrant')
    expect(serialized).not.toContain('productionPower')
    expect(serialized).not.toContain('companyShares')
  })
})
