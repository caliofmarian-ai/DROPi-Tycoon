import {
  COMMERCIAL_EFFECT_NONE,
  V1_COMMERCIAL_CATALOG,
  getCommercialProduct,
  validateCommercialCatalog,
  type CommercialCatalog,
  type CommercialEntitlementId,
} from './commercialCatalog'

export const COMMERCIAL_ENTITLEMENT_STATE_VERSION = 1 as const
export const TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY = 'TRUSTED_COMMERCIAL_ADAPTER' as const

export const COMMERCIAL_FULFILLMENT_STATUSES = [
  'PENDING',
  'GRANTED',
  'RESTORED',
  'REVOKED',
  'REFUNDED',
  'FAILED',
  'INVALID',
] as const
export type CommercialFulfillmentStatus = (typeof COMMERCIAL_FULFILLMENT_STATUSES)[number]

export const COMMERCIAL_EVIDENCE_STATES = [
  'PENDING',
  'VERIFIED_OWNED',
  'RESTORED_OWNED',
  'REVOKED',
  'REFUNDED',
  'FAILED',
  'INVALID',
] as const
export type CommercialEvidenceState = (typeof COMMERCIAL_EVIDENCE_STATES)[number]

export interface TrustedCommercialEvidence {
  evidenceId: string
  subjectId: string
  productId: string
  state: CommercialEvidenceState
  verifiedAt: number
  verificationAuthority: typeof TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY
}

export interface CommercialFulfillmentRecord {
  evidenceId: string
  subjectId: string
  productId: string
  status: CommercialFulfillmentStatus
  firstSeenAt: number
  lastVerifiedAt: number
  revision: number
}

export interface CommercialAuditEvent {
  eventId: string
  subjectId: string
  evidenceId: string
  productId: string
  fromStatus: CommercialFulfillmentStatus | null
  toStatus: CommercialFulfillmentStatus
  evidenceState: CommercialEvidenceState
  verifiedAt: number
  revision: number
}

export interface CommercialEntitlementState {
  version: typeof COMMERCIAL_ENTITLEMENT_STATE_VERSION
  subjectId: string
  fulfillments: readonly CommercialFulfillmentRecord[]
  auditTrail: readonly CommercialAuditEvent[]
}

export interface CommercialEntitlementProjection {
  subjectId: string
  activeEntitlementIds: readonly CommercialEntitlementId[]
  economicEffect: typeof COMMERCIAL_EFFECT_NONE
  worldPowerEffect: typeof COMMERCIAL_EFFECT_NONE
}

export type CommercialProjectionResult =
  | { valid: true; projection: CommercialEntitlementProjection }
  | { valid: false; projection: CommercialEntitlementProjection; reason: 'invalid-state' | 'invalid-catalog' | 'unknown-product' }

export type CommercialEvidenceApplyFailureReason =
  | 'invalid-state'
  | 'invalid-catalog'
  | 'invalid-evidence'
  | 'subject-mismatch'
  | 'unknown-product'
  | 'evidence-conflict'
  | 'stale-evidence'
  | 'invalid-transition'

export type CommercialEvidenceApplyResult =
  | {
      accepted: true
      changed: boolean
      state: CommercialEntitlementState
      record: CommercialFulfillmentRecord
    }
  | {
      accepted: false
      changed: false
      state: CommercialEntitlementState
      reason: CommercialEvidenceApplyFailureReason
    }

export interface VerifiedCommercialOwnershipSnapshot {
  snapshotId: string
  subjectId: string
  evidence: readonly TrustedCommercialEvidence[]
}

export type CommercialSnapshotReconciliationResult =
  | {
      reconciled: true
      changed: boolean
      state: CommercialEntitlementState
      projection: CommercialEntitlementProjection
    }
  | {
      reconciled: false
      changed: false
      state: CommercialEntitlementState
      reason: CommercialEvidenceApplyFailureReason | 'invalid-snapshot'
    }

const MAX_TOKEN_LENGTH = 180

const validToken = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_TOKEN_LENGTH &&
  value.trim() === value

const validTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const validPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

const isFulfillmentStatus = (value: unknown): value is CommercialFulfillmentStatus =>
  typeof value === 'string' &&
  COMMERCIAL_FULFILLMENT_STATUSES.includes(value as CommercialFulfillmentStatus)

const isEvidenceState = (value: unknown): value is CommercialEvidenceState =>
  typeof value === 'string' &&
  COMMERCIAL_EVIDENCE_STATES.includes(value as CommercialEvidenceState)

const ACTIVE_FULFILLMENT_STATUSES: readonly CommercialFulfillmentStatus[] = [
  'GRANTED',
  'RESTORED',
]

const ALLOWED_TRANSITIONS: Readonly<Record<CommercialFulfillmentStatus, readonly CommercialFulfillmentStatus[]>> = {
  PENDING: ['PENDING', 'GRANTED', 'RESTORED', 'REVOKED', 'REFUNDED', 'FAILED', 'INVALID'],
  GRANTED: ['GRANTED', 'RESTORED', 'REVOKED', 'REFUNDED'],
  RESTORED: ['RESTORED', 'GRANTED', 'REVOKED', 'REFUNDED'],
  REVOKED: ['REVOKED'],
  REFUNDED: ['REFUNDED'],
  FAILED: ['FAILED', 'PENDING', 'GRANTED', 'RESTORED', 'REVOKED', 'REFUNDED', 'INVALID'],
  INVALID: ['INVALID'],
}

const statusForEvidence = (state: CommercialEvidenceState): CommercialFulfillmentStatus => {
  switch (state) {
    case 'PENDING':
      return 'PENDING'
    case 'VERIFIED_OWNED':
      return 'GRANTED'
    case 'RESTORED_OWNED':
      return 'RESTORED'
    case 'REVOKED':
      return 'REVOKED'
    case 'REFUNDED':
      return 'REFUNDED'
    case 'FAILED':
      return 'FAILED'
    case 'INVALID':
      return 'INVALID'
  }
}

const validEvidence = (evidence: TrustedCommercialEvidence): boolean =>
  validToken(evidence.evidenceId) &&
  validToken(evidence.subjectId) &&
  validToken(evidence.productId) &&
  isEvidenceState(evidence.state) &&
  validTimestamp(evidence.verifiedAt) &&
  evidence.verificationAuthority === TRUSTED_COMMERCIAL_VERIFICATION_AUTHORITY

const validFulfillment = (
  record: CommercialFulfillmentRecord,
  subjectId: string,
): boolean =>
  validToken(record.evidenceId) &&
  record.subjectId === subjectId &&
  validToken(record.productId) &&
  isFulfillmentStatus(record.status) &&
  validTimestamp(record.firstSeenAt) &&
  validTimestamp(record.lastVerifiedAt) &&
  record.lastVerifiedAt >= record.firstSeenAt &&
  validPositiveInteger(record.revision)

const validAuditEvent = (event: CommercialAuditEvent, subjectId: string): boolean =>
  validToken(event.eventId) &&
  event.subjectId === subjectId &&
  validToken(event.evidenceId) &&
  validToken(event.productId) &&
  (event.fromStatus === null || isFulfillmentStatus(event.fromStatus)) &&
  isFulfillmentStatus(event.toStatus) &&
  isEvidenceState(event.evidenceState) &&
  validTimestamp(event.verifiedAt) &&
  validPositiveInteger(event.revision)

export const validateCommercialEntitlementState = (
  state: CommercialEntitlementState,
): boolean => {
  if (
    state.version !== COMMERCIAL_ENTITLEMENT_STATE_VERSION ||
    !validToken(state.subjectId) ||
    !Array.isArray(state.fulfillments) ||
    !Array.isArray(state.auditTrail)
  ) {
    return false
  }

  const evidenceIds = new Set<string>()
  for (const record of state.fulfillments) {
    if (!validFulfillment(record, state.subjectId) || evidenceIds.has(record.evidenceId)) {
      return false
    }
    evidenceIds.add(record.evidenceId)
  }

  const eventIds = new Set<string>()
  for (const event of state.auditTrail) {
    if (!validAuditEvent(event, state.subjectId) || eventIds.has(event.eventId)) {
      return false
    }
    eventIds.add(event.eventId)
  }

  return true
}

export const createCommercialEntitlementState = (
  subjectId: string,
): CommercialEntitlementState => {
  if (!validToken(subjectId)) throw new Error('Invalid CommercialSubjectId')
  return {
    version: COMMERCIAL_ENTITLEMENT_STATE_VERSION,
    subjectId,
    fulfillments: [],
    auditTrail: [],
  }
}

const emptyProjection = (subjectId: string): CommercialEntitlementProjection => ({
  subjectId,
  activeEntitlementIds: [],
  economicEffect: COMMERCIAL_EFFECT_NONE,
  worldPowerEffect: COMMERCIAL_EFFECT_NONE,
})

export const projectActiveCommercialEntitlements = (
  state: CommercialEntitlementState,
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
): CommercialProjectionResult => {
  if (!validateCommercialEntitlementState(state)) {
    return { valid: false, projection: emptyProjection(state.subjectId), reason: 'invalid-state' }
  }

  const catalogValidation = validateCommercialCatalog(catalog)
  if (!catalogValidation.valid) {
    return { valid: false, projection: emptyProjection(state.subjectId), reason: 'invalid-catalog' }
  }

  const activeEntitlementIds = new Set<CommercialEntitlementId>()
  for (const record of state.fulfillments) {
    const product = getCommercialProduct(catalog, record.productId)
    if (!product) {
      return { valid: false, projection: emptyProjection(state.subjectId), reason: 'unknown-product' }
    }
    if (!ACTIVE_FULFILLMENT_STATUSES.includes(record.status)) continue
    for (const entitlementId of product.entitlementIds) {
      activeEntitlementIds.add(entitlementId)
    }
  }

  return {
    valid: true,
    projection: {
      subjectId: state.subjectId,
      activeEntitlementIds: [...activeEntitlementIds].sort(),
      economicEffect: COMMERCIAL_EFFECT_NONE,
      worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    },
  }
}

const sortFulfillments = (
  records: readonly CommercialFulfillmentRecord[],
): readonly CommercialFulfillmentRecord[] =>
  [...records].sort((left, right) => left.evidenceId.localeCompare(right.evidenceId))

const sortAuditTrail = (
  events: readonly CommercialAuditEvent[],
): readonly CommercialAuditEvent[] =>
  [...events].sort((left, right) => left.eventId.localeCompare(right.eventId))

const makeAuditEvent = (
  evidence: TrustedCommercialEvidence,
  fromStatus: CommercialFulfillmentStatus | null,
  toStatus: CommercialFulfillmentStatus,
  revision: number,
): CommercialAuditEvent => ({
  eventId: `commercial-evidence:${evidence.evidenceId}:r${revision}:${toStatus}`,
  subjectId: evidence.subjectId,
  evidenceId: evidence.evidenceId,
  productId: evidence.productId,
  fromStatus,
  toStatus,
  evidenceState: evidence.state,
  verifiedAt: evidence.verifiedAt,
  revision,
})

export const reconcileVerifiedCommercialEvidence = (
  state: CommercialEntitlementState,
  evidence: TrustedCommercialEvidence,
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
): CommercialEvidenceApplyResult => {
  if (!validateCommercialEntitlementState(state)) {
    return { accepted: false, changed: false, state, reason: 'invalid-state' }
  }

  const catalogValidation = validateCommercialCatalog(catalog)
  if (!catalogValidation.valid) {
    return { accepted: false, changed: false, state, reason: 'invalid-catalog' }
  }

  if (!validEvidence(evidence)) {
    return { accepted: false, changed: false, state, reason: 'invalid-evidence' }
  }
  if (evidence.subjectId !== state.subjectId) {
    return { accepted: false, changed: false, state, reason: 'subject-mismatch' }
  }
  if (!getCommercialProduct(catalog, evidence.productId)) {
    return { accepted: false, changed: false, state, reason: 'unknown-product' }
  }

  const existing = state.fulfillments.find((record) => record.evidenceId === evidence.evidenceId)
  if (existing && (existing.subjectId !== evidence.subjectId || existing.productId !== evidence.productId)) {
    return { accepted: false, changed: false, state, reason: 'evidence-conflict' }
  }
  if (existing && evidence.verifiedAt < existing.lastVerifiedAt) {
    return { accepted: false, changed: false, state, reason: 'stale-evidence' }
  }

  const targetStatus = statusForEvidence(evidence.state)
  if (existing && existing.status === targetStatus) {
    return { accepted: true, changed: false, state, record: existing }
  }
  if (existing && !ALLOWED_TRANSITIONS[existing.status].includes(targetStatus)) {
    return { accepted: false, changed: false, state, reason: 'invalid-transition' }
  }

  const revision = existing ? existing.revision + 1 : 1
  const nextRecord: CommercialFulfillmentRecord = existing
    ? {
        ...existing,
        status: targetStatus,
        lastVerifiedAt: evidence.verifiedAt,
        revision,
      }
    : {
        evidenceId: evidence.evidenceId,
        subjectId: evidence.subjectId,
        productId: evidence.productId,
        status: targetStatus,
        firstSeenAt: evidence.verifiedAt,
        lastVerifiedAt: evidence.verifiedAt,
        revision,
      }

  const nextFulfillments = existing
    ? state.fulfillments.map((record) =>
        record.evidenceId === evidence.evidenceId ? nextRecord : record,
      )
    : [...state.fulfillments, nextRecord]

  const nextState: CommercialEntitlementState = {
    ...state,
    fulfillments: sortFulfillments(nextFulfillments),
    auditTrail: sortAuditTrail([
      ...state.auditTrail,
      makeAuditEvent(evidence, existing?.status ?? null, targetStatus, revision),
    ]),
  }

  if (!validateCommercialEntitlementState(nextState)) {
    return { accepted: false, changed: false, state, reason: 'invalid-state' }
  }

  return { accepted: true, changed: true, state: nextState, record: nextRecord }
}

const validSnapshot = (snapshot: VerifiedCommercialOwnershipSnapshot): boolean => {
  if (!validToken(snapshot.snapshotId) || !validToken(snapshot.subjectId) || !Array.isArray(snapshot.evidence)) {
    return false
  }
  const evidenceIds = new Set<string>()
  for (const evidence of snapshot.evidence) {
    if (
      !validEvidence(evidence) ||
      evidence.subjectId !== snapshot.subjectId ||
      evidenceIds.has(evidence.evidenceId)
    ) {
      return false
    }
    evidenceIds.add(evidence.evidenceId)
  }
  return true
}

export const reconcileVerifiedOwnershipSnapshot = (
  state: CommercialEntitlementState,
  snapshot: VerifiedCommercialOwnershipSnapshot,
  catalog: CommercialCatalog = V1_COMMERCIAL_CATALOG,
): CommercialSnapshotReconciliationResult => {
  if (!validateCommercialEntitlementState(state)) {
    return { reconciled: false, changed: false, state, reason: 'invalid-state' }
  }
  if (!validSnapshot(snapshot)) {
    return { reconciled: false, changed: false, state, reason: 'invalid-snapshot' }
  }
  if (snapshot.subjectId !== state.subjectId) {
    return { reconciled: false, changed: false, state, reason: 'subject-mismatch' }
  }

  let nextState = state
  let changed = false
  const evidenceInDeterministicOrder = [...snapshot.evidence].sort((left, right) =>
    left.evidenceId.localeCompare(right.evidenceId),
  )

  for (const evidence of evidenceInDeterministicOrder) {
    const result = reconcileVerifiedCommercialEvidence(nextState, evidence, catalog)
    if (!result.accepted) {
      return { reconciled: false, changed: false, state, reason: result.reason }
    }
    nextState = result.state
    changed = changed || result.changed
  }

  const projectionResult = projectActiveCommercialEntitlements(nextState, catalog)
  if (!projectionResult.valid) {
    return {
      reconciled: false,
      changed: false,
      state,
      reason: projectionResult.reason === 'unknown-product' ? 'unknown-product' : projectionResult.reason,
    }
  }

  return {
    reconciled: true,
    changed,
    state: nextState,
    projection: projectionResult.projection,
  }
}

export const hasActiveCommercialEntitlement = (
  projection: CommercialEntitlementProjection,
  entitlementId: CommercialEntitlementId,
): boolean => projection.activeEntitlementIds.includes(entitlementId)
