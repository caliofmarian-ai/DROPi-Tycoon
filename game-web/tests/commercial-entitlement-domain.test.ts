import { describe, expect, it } from 'vitest'
import {
  COMMERCIAL_EFFECT_NONE,
  V1_COMMERCIAL_CATALOG,
  validateCommercialCatalog,
  type CommercialCatalog,
} from '../src/commercial/commercialCatalog'
import {
  TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY,
  createCommercialEntitlementState,
  hasActiveCommercialEntitlement,
  projectActiveCommercialEntitlements,
  reconcileVerifiedCommercialEvidence,
  reconcileVerifiedOwnershipSnapshot,
  validateCommercialEntitlementState,
  type CommercialEntitlementState,
  type TrustedCommercialEvidence,
} from '../src/commercial/commercialEntitlementDomain'

const SUBJECT_A = 'commercial-subject-a'
const SUBJECT_B = 'commercial-subject-b'
const SUPPORTER_PRODUCT = 'commercial.product.supporter.early.v1'
const PHONE_PRODUCT = 'commercial.product.cosmetic.phone_theme_pack_01.v1'
const LIVERY_PRODUCT = 'commercial.product.cosmetic.vehicle_livery_pack_01.v1'

const SUPPORTER_ENTITLEMENTS = [
  'commercial.entitlement.account.cosmetic.phone_theme.early_supporter.v1',
  'commercial.entitlement.account.cosmetic.profile_frame.early_supporter.v1',
  'commercial.entitlement.account.cosmetic.vehicle_livery.early_supporter.v1',
  'commercial.entitlement.account.supporter.early_badge.v1',
]

const evidence = (
  evidenceId: string,
  productId: string,
  state: TrustedCommercialEvidence['state'] = 'VERIFIED_OWNED',
  verifiedAt = 10,
  subjectId = SUBJECT_A,
): TrustedCommercialEvidence => ({
  evidenceId,
  subjectId,
  productId,
  state,
  verifiedAt,
  verificationAuthority: TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY,
})

const requireAccepted = (
  result: ReturnType<typeof reconcileVerifiedCommercialEvidence>,
): CommercialEntitlementState => {
  expect(result.accepted).toBe(true)
  if (!result.accepted) throw new Error(`Expected accepted evidence: ${result.reason}`)
  return result.state
}

const requireProjection = (state: CommercialEntitlementState) => {
  const result = projectActiveCommercialEntitlements(state)
  expect(result.valid).toBe(true)
  if (!result.valid) throw new Error(`Expected valid projection: ${result.reason}`)
  return result.projection
}

describe('commercial entitlement domain', () => {
  it('materializes the canonical V1 catalog with no economic or world-power effects', () => {
    expect(validateCommercialCatalog(V1_COMMERCIAL_CATALOG)).toEqual({ valid: true })
    expect(V1_COMMERCIAL_CATALOG.products).toHaveLength(3)
    expect(V1_COMMERCIAL_CATALOG.products.every((product) => product.productType === 'NON_CONSUMABLE')).toBe(true)
    expect(V1_COMMERCIAL_CATALOG.products.every((product) => product.economicEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)
    expect(V1_COMMERCIAL_CATALOG.products.every((product) => product.worldPowerEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)
    expect(V1_COMMERCIAL_CATALOG.entitlements.every((item) => item.economicEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)
    expect(V1_COMMERCIAL_CATALOG.entitlements.every((item) => item.worldPowerEffect === COMMERCIAL_EFFECT_NONE)).toBe(true)
  })

  it('keeps pending evidence non-owning until trusted verification grants it', () => {
    const initial = createCommercialEntitlementState(SUBJECT_A)
    const pending = reconcileVerifiedCommercialEvidence(
      initial,
      evidence('purchase-pending', SUPPORTER_PRODUCT, 'PENDING'),
    )
    const pendingState = requireAccepted(pending)

    expect(pending.changed).toBe(true)
    expect(pendingState.fulfillments[0]?.status).toBe('PENDING')
    expect(requireProjection(pendingState).activeEntitlementIds).toEqual([])

    const granted = reconcileVerifiedCommercialEvidence(
      pendingState,
      evidence('purchase-pending', SUPPORTER_PRODUCT, 'VERIFIED_OWNED', 20),
    )
    const grantedState = requireAccepted(granted)
    expect(grantedState.fulfillments[0]?.status).toBe('GRANTED')
    expect(requireProjection(grantedState).activeEntitlementIds).toEqual(SUPPORTER_ENTITLEMENTS)
  })

  it('grants the Early Supporter bundle atomically as exactly four presentation entitlements', () => {
    const initial = createCommercialEntitlementState(SUBJECT_A)
    const state = requireAccepted(
      reconcileVerifiedCommercialEvidence(
        initial,
        evidence('supporter-purchase-1', SUPPORTER_PRODUCT),
      ),
    )

    const projection = requireProjection(state)
    expect(projection.activeEntitlementIds).toEqual(SUPPORTER_ENTITLEMENTS)
    expect(projection.economicEffect).toBe('NONE')
    expect(projection.worldPowerEffect).toBe('NONE')
    expect(hasActiveCommercialEntitlement(
      projection,
      'commercial.entitlement.account.supporter.early_badge.v1',
    )).toBe(true)
  })

  it('processes duplicate verified evidence exactly once without duplicate grants or audit events', () => {
    const initial = createCommercialEntitlementState(SUBJECT_A)
    const first = reconcileVerifiedCommercialEvidence(
      initial,
      evidence('duplicate-evidence', SUPPORTER_PRODUCT),
    )
    const firstState = requireAccepted(first)

    const duplicate = reconcileVerifiedCommercialEvidence(
      firstState,
      evidence('duplicate-evidence', SUPPORTER_PRODUCT),
    )

    expect(duplicate.accepted).toBe(true)
    if (!duplicate.accepted) throw new Error(`Expected duplicate no-op: ${duplicate.reason}`)
    expect(duplicate.changed).toBe(false)
    expect(duplicate.state).toEqual(firstState)
    expect(duplicate.state.fulfillments).toHaveLength(1)
    expect(duplicate.state.auditTrail).toHaveLength(1)
    expect(requireProjection(duplicate.state).activeEntitlementIds).toEqual(SUPPORTER_ENTITLEMENTS)
  })

  it('fails an unknown product closed without creating a fulfillment or entitlement', () => {
    const initial = createCommercialEntitlementState(SUBJECT_A)
    const result = reconcileVerifiedCommercialEvidence(
      initial,
      evidence('unknown-product-evidence', 'commercial.product.unknown.v1'),
    )

    expect(result).toMatchObject({
      accepted: false,
      changed: false,
      reason: 'unknown-product',
    })
    expect(result.state).toEqual(initial)
    expect(requireProjection(result.state).activeEntitlementIds).toEqual([])
  })

  it('fails a malformed multi-entitlement mapping atomically instead of partially granting it', () => {
    const supporter = V1_COMMERCIAL_CATALOG.products.find((product) => product.productId === SUPPORTER_PRODUCT)
    if (!supporter) throw new Error('Missing supporter product fixture')

    const malformedCatalog: CommercialCatalog = {
      ...V1_COMMERCIAL_CATALOG,
      products: V1_COMMERCIAL_CATALOG.products.map((product) =>
        product.productId === SUPPORTER_PRODUCT
          ? {
              ...supporter,
              entitlementIds: [...supporter.entitlementIds, 'commercial.entitlement.missing.v1'],
            }
          : product,
      ),
    }
    const validation = validateCommercialCatalog(malformedCatalog)
    expect(validation.valid).toBe(false)

    const initial = createCommercialEntitlementState(SUBJECT_A)
    const result = reconcileVerifiedCommercialEvidence(
      initial,
      evidence('malformed-bundle', SUPPORTER_PRODUCT),
      malformedCatalog,
    )

    expect(result).toMatchObject({ accepted: false, changed: false, reason: 'invalid-catalog' })
    expect(result.state).toEqual(initial)
    expect(result.state.fulfillments).toEqual([])
    expect(result.state.auditTrail).toEqual([])
  })

  it('projects the phone and livery products independently without granting vehicles or gameplay power', () => {
    const initial = createCommercialEntitlementState(SUBJECT_A)
    const phoneState = requireAccepted(
      reconcileVerifiedCommercialEvidence(initial, evidence('phone-1', PHONE_PRODUCT)),
    )
    const liveryState = requireAccepted(
      reconcileVerifiedCommercialEvidence(phoneState, evidence('livery-1', LIVERY_PRODUCT)),
    )
    const projection = requireProjection(liveryState)

    expect(projection.activeEntitlementIds).toEqual([
      'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
      'commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1',
    ])
    expect(projection).not.toHaveProperty('vehicleId')
    expect(projection).not.toHaveProperty('cargoCapacity')
    expect(projection).not.toHaveProperty('money')
    expect(projection).not.toHaveProperty('workCapacity')
    expect(projection).not.toHaveProperty('missionReward')
  })

  it('refunds only the governed source projection and preserves unrelated valid ownership plus audit history', () => {
    let state = createCommercialEntitlementState(SUBJECT_A)
    state = requireAccepted(
      reconcileVerifiedCommercialEvidence(state, evidence('supporter-refund', SUPPORTER_PRODUCT)),
    )
    state = requireAccepted(
      reconcileVerifiedCommercialEvidence(state, evidence('phone-survives', PHONE_PRODUCT)),
    )
    const beforeRefundAuditCount = state.auditTrail.length

    const refunded = reconcileVerifiedCommercialEvidence(
      state,
      evidence('supporter-refund', SUPPORTER_PRODUCT, 'REFUNDED', 30),
    )
    const refundedState = requireAccepted(refunded)
    const projection = requireProjection(refundedState)

    expect(refundedState.fulfillments.find((item) => item.evidenceId === 'supporter-refund')?.status).toBe('REFUNDED')
    expect(projection.activeEntitlementIds).toEqual([
      'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
    ])
    expect(refundedState.auditTrail).toHaveLength(beforeRefundAuditCount + 1)
    expect(refundedState.auditTrail.some((event) => event.toStatus === 'GRANTED')).toBe(true)
    expect(refundedState.auditTrail.some((event) => event.toStatus === 'REFUNDED')).toBe(true)
  })

  it('revokes a verified purchase without deleting its audit history', () => {
    const grantedState = requireAccepted(
      reconcileVerifiedCommercialEvidence(
        createCommercialEntitlementState(SUBJECT_A),
        evidence('revoked-livery', LIVERY_PRODUCT),
      ),
    )
    const revoked = reconcileVerifiedCommercialEvidence(
      grantedState,
      evidence('revoked-livery', LIVERY_PRODUCT, 'REVOKED', 40),
    )
    const revokedState = requireAccepted(revoked)

    expect(revokedState.fulfillments[0]?.status).toBe('REVOKED')
    expect(requireProjection(revokedState).activeEntitlementIds).toEqual([])
    expect(revokedState.auditTrail.map((event) => event.toStatus)).toEqual(['GRANTED', 'REVOKED'])
  })

  it('restores verified ownership deterministically from a clean local state', () => {
    const snapshotA = {
      snapshotId: 'restore-snapshot-1',
      subjectId: SUBJECT_A,
      evidence: [
        evidence('restore-livery', LIVERY_PRODUCT, 'RESTORED_OWNED', 50),
        evidence('restore-supporter', SUPPORTER_PRODUCT, 'RESTORED_OWNED', 50),
      ],
    }
    const snapshotB = {
      ...snapshotA,
      evidence: [...snapshotA.evidence].reverse(),
    }

    const first = reconcileVerifiedOwnershipSnapshot(
      createCommercialEntitlementState(SUBJECT_A),
      snapshotA,
    )
    const second = reconcileVerifiedOwnershipSnapshot(
      createCommercialEntitlementState(SUBJECT_A),
      snapshotB,
    )

    expect(first.reconciled).toBe(true)
    expect(second.reconciled).toBe(true)
    if (!first.reconciled || !second.reconciled) throw new Error('Expected deterministic restore')
    expect(first.state).toEqual(second.state)
    expect(first.projection).toEqual(second.projection)
    expect(first.state.fulfillments.every((record) => record.status === 'RESTORED')).toBe(true)
    expect(first.projection.activeEntitlementIds).toEqual([
      ...SUPPORTER_ENTITLEMENTS,
      'commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1',
    ].sort())
  })

  it('replays the same restore snapshot idempotently', () => {
    const snapshot = {
      snapshotId: 'restore-repeat',
      subjectId: SUBJECT_A,
      evidence: [evidence('restore-phone', PHONE_PRODUCT, 'RESTORED_OWNED', 60)],
    }
    const first = reconcileVerifiedOwnershipSnapshot(
      createCommercialEntitlementState(SUBJECT_A),
      snapshot,
    )
    expect(first.reconciled).toBe(true)
    if (!first.reconciled) throw new Error(`Expected restore: ${first.reason}`)

    const second = reconcileVerifiedOwnershipSnapshot(first.state, snapshot)
    expect(second.reconciled).toBe(true)
    if (!second.reconciled) throw new Error(`Expected repeated restore: ${second.reason}`)
    expect(second.changed).toBe(false)
    expect(second.state).toEqual(first.state)
    expect(second.state.auditTrail).toHaveLength(1)
  })

  it('rejects reactivation of the same refunded evidence but permits a legitimate repurchase under new evidence', () => {
    let state = createCommercialEntitlementState(SUBJECT_A)
    state = requireAccepted(
      reconcileVerifiedCommercialEvidence(state, evidence('purchase-old', PHONE_PRODUCT, 'VERIFIED_OWNED', 10)),
    )
    state = requireAccepted(
      reconcileVerifiedCommercialEvidence(state, evidence('purchase-old', PHONE_PRODUCT, 'REFUNDED', 20)),
    )

    const invalidReactivation = reconcileVerifiedCommercialEvidence(
      state,
      evidence('purchase-old', PHONE_PRODUCT, 'VERIFIED_OWNED', 30),
    )
    expect(invalidReactivation).toMatchObject({
      accepted: false,
      changed: false,
      reason: 'invalid-transition',
    })
    expect(requireProjection(invalidReactivation.state).activeEntitlementIds).toEqual([])

    const repurchase = reconcileVerifiedCommercialEvidence(
      state,
      evidence('purchase-new', PHONE_PRODUCT, 'VERIFIED_OWNED', 30),
    )
    const repurchasedState = requireAccepted(repurchase)
    expect(requireProjection(repurchasedState).activeEntitlementIds).toEqual([
      'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
    ])
  })

  it('rejects stale evidence after a newer refund so old restore data cannot reactivate ownership', () => {
    let state = createCommercialEntitlementState(SUBJECT_A)
    state = requireAccepted(
      reconcileVerifiedCommercialEvidence(state, evidence('stale-evidence', LIVERY_PRODUCT, 'VERIFIED_OWNED', 10)),
    )
    state = requireAccepted(
      reconcileVerifiedCommercialEvidence(state, evidence('stale-evidence', LIVERY_PRODUCT, 'REFUNDED', 30)),
    )

    const stale = reconcileVerifiedCommercialEvidence(
      state,
      evidence('stale-evidence', LIVERY_PRODUCT, 'RESTORED_OWNED', 20),
    )
    expect(stale).toMatchObject({ accepted: false, changed: false, reason: 'stale-evidence' })
    expect(stale.state).toEqual(state)
    expect(requireProjection(stale.state).activeEntitlementIds).toEqual([])
  })

  it('records failed verification without removing an already trusted grant and allows pending failures to recover', () => {
    const initial = createCommercialEntitlementState(SUBJECT_A)
    const failedState = requireAccepted(
      reconcileVerifiedCommercialEvidence(initial, evidence('retryable', PHONE_PRODUCT, 'FAILED', 10)),
    )
    expect(failedState.fulfillments[0]?.status).toBe('FAILED')
    expect(requireProjection(failedState).activeEntitlementIds).toEqual([])

    const recoveredState = requireAccepted(
      reconcileVerifiedCommercialEvidence(failedState, evidence('retryable', PHONE_PRODUCT, 'VERIFIED_OWNED', 20)),
    )
    expect(recoveredState.fulfillments[0]?.status).toBe('GRANTED')

    const transientFailureAfterGrant = reconcileVerifiedCommercialEvidence(
      recoveredState,
      evidence('retryable', PHONE_PRODUCT, 'FAILED', 30),
    )
    expect(transientFailureAfterGrant).toMatchObject({
      accepted: false,
      changed: false,
      reason: 'invalid-transition',
    })
    expect(requireProjection(transientFailureAfterGrant.state).activeEntitlementIds).toEqual([
      'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
    ])
  })

  it('keeps invalid evidence non-owning and terminal for the same source evidence', () => {
    const invalidState = requireAccepted(
      reconcileVerifiedCommercialEvidence(
        createCommercialEntitlementState(SUBJECT_A),
        evidence('invalid-source', SUPPORTER_PRODUCT, 'INVALID', 10),
      ),
    )
    expect(invalidState.fulfillments[0]?.status).toBe('INVALID')
    expect(requireProjection(invalidState).activeEntitlementIds).toEqual([])

    const forgedRecovery = reconcileVerifiedCommercialEvidence(
      invalidState,
      evidence('invalid-source', SUPPORTER_PRODUCT, 'VERIFIED_OWNED', 20),
    )
    expect(forgedRecovery).toMatchObject({
      accepted: false,
      changed: false,
      reason: 'invalid-transition',
    })
  })

  it('rejects untrusted client-shaped evidence instead of treating it as ownership authority', () => {
    const forged = {
      ...evidence('client-forged', SUPPORTER_PRODUCT),
      verificationAuthority: 'CLIENT',
    } as unknown as TrustedCommercialEvidence

    const result = reconcileVerifiedCommercialEvidence(
      createCommercialEntitlementState(SUBJECT_A),
      forged,
    )
    expect(result).toMatchObject({ accepted: false, changed: false, reason: 'invalid-evidence' })
    expect(requireProjection(result.state).activeEntitlementIds).toEqual([])
  })

  it('rejects subject mismatches and conflicting reuse of one evidence ID', () => {
    const initial = createCommercialEntitlementState(SUBJECT_A)
    const wrongSubject = reconcileVerifiedCommercialEvidence(
      initial,
      evidence('wrong-subject', SUPPORTER_PRODUCT, 'VERIFIED_OWNED', 10, SUBJECT_B),
    )
    expect(wrongSubject).toMatchObject({
      accepted: false,
      changed: false,
      reason: 'subject-mismatch',
    })

    const grantedState = requireAccepted(
      reconcileVerifiedCommercialEvidence(initial, evidence('collision', SUPPORTER_PRODUCT)),
    )
    const conflict = reconcileVerifiedCommercialEvidence(
      grantedState,
      evidence('collision', PHONE_PRODUCT, 'VERIFIED_OWNED', 20),
    )
    expect(conflict).toMatchObject({
      accepted: false,
      changed: false,
      reason: 'evidence-conflict',
    })
    expect(conflict.state).toEqual(grantedState)
  })

  it('does not accept local Save-like cosmetic claims as commercial ownership authority', () => {
    const forgedSaveV2Shape = {
      selectedPhoneThemeId: 'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
      selectedVehicleLiveryId: 'commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1',
      commercialEntitlements: SUPPORTER_ENTITLEMENTS,
    }
    const state = createCommercialEntitlementState(SUBJECT_A)
    const projection = requireProjection(state)

    expect(forgedSaveV2Shape.commercialEntitlements).toHaveLength(4)
    expect(projection.activeEntitlementIds).toEqual([])
    expect(projection.subjectId).toBe(SUBJECT_A)
  })

  it('fails closed on corrupted entitlement state rather than projecting partial commercial access', () => {
    const validState = requireAccepted(
      reconcileVerifiedCommercialEvidence(
        createCommercialEntitlementState(SUBJECT_A),
        evidence('valid-before-corruption', SUPPORTER_PRODUCT),
      ),
    )
    const corrupted: CommercialEntitlementState = {
      ...validState,
      fulfillments: [...validState.fulfillments, validState.fulfillments[0]!],
    }

    expect(validateCommercialEntitlementState(corrupted)).toBe(false)
    const projection = projectActiveCommercialEntitlements(corrupted)
    expect(projection).toMatchObject({ valid: false, reason: 'invalid-state' })
    expect(projection.projection.activeEntitlementIds).toEqual([])
  })
})
