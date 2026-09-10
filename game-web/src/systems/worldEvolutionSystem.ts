import type { ProductiveNodeState } from '../production/production'
import type { WorldClockState } from '../world/globalWorld'
import {
  worldClockMinuteOrdinal,
  type WorldClockAdvanceResult,
} from './worldClockSystem'

export const WORLD_EVOLUTION_STATE_VERSION = 1 as const
export const WORLD_EVOLUTION_POLICY_ID = 'phase1-world-evolution-v1' as const

export const WORLD_EVOLUTION_TICK_CLASSES = [
  'HOUR',
  'WORK_SHIFT',
  'OPERATING_DAY',
  'MARKET_CYCLE',
  'SEASON',
  'STRUCTURAL_YEAR',
] as const
export type WorldEvolutionTickClass = (typeof WORLD_EVOLUTION_TICK_CLASSES)[number]

export interface WorldEvolutionTickSummary {
  HOUR: number
  WORK_SHIFT: number
  OPERATING_DAY: number
  MARKET_CYCLE: number
  SEASON: number
  STRUCTURAL_YEAR: number
}

export const summarizeWorldEvolutionTicks = (
  advance: WorldClockAdvanceResult,
): WorldEvolutionTickSummary => ({
  HOUR: advance.boundaries.hourTicks,
  WORK_SHIFT: advance.boundaries.shiftTransitions,
  OPERATING_DAY: advance.boundaries.operatingDays,
  MARKET_CYCLE: advance.boundaries.marketCycles,
  SEASON: advance.boundaries.seasons,
  STRUCTURAL_YEAR: advance.boundaries.years,
})

export const SETTLEMENT_DEVELOPMENT_TIERS = [
  'LATENT',
  'RURAL_POINT',
  'HAMLET',
  'VILLAGE',
  'SMALL_TOWN',
  'TOWN',
  'CITY',
  'LARGE_CITY',
] as const
export type SettlementDevelopmentTier = (typeof SETTLEMENT_DEVELOPMENT_TIERS)[number]

/**
 * DT-18 accepts one authoritative DT-07 fact plus two explicitly non-authoritative production-model
 * proxy/index observations. Proxy/index observations must never be interpreted as DT-06 specialist,
 * qualification or company capability authority, nor as DT-20 physical facility authority.
 */
export const SETTLEMENT_EVOLUTION_EVIDENCE_CODES = [
  'LOCAL_PRODUCTION_CYCLE_COMPLETED',
  'PRODUCTION_MODEL_INFRASTRUCTURE_INDEX_POSITIVE',
  'PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE',
] as const
export type SettlementEvolutionEvidenceCode = (typeof SETTLEMENT_EVOLUTION_EVIDENCE_CODES)[number]

export const SETTLEMENT_EVOLUTION_EVIDENCE_CLASSES = [
  'AUTHORITATIVE_PRODUCTION_FACT',
  'PRODUCTION_MODEL_PROXY',
] as const
export type SettlementEvolutionEvidenceClass = (typeof SETTLEMENT_EVOLUTION_EVIDENCE_CLASSES)[number]

export const SETTLEMENT_TRANSITION_REASON_CODES = [
  'PRODUCTION_MODEL_BASELINE_ESTABLISHED',
] as const
export type SettlementTransitionReasonCode = (typeof SETTLEMENT_TRANSITION_REASON_CODES)[number]

export interface SettlementEvolutionEvidenceReceipt {
  evidenceId: string
  worldInstanceId: string
  localityId: string
  code: SettlementEvolutionEvidenceCode
  evidenceClass: SettlementEvolutionEvidenceClass
  sourceDomain: 'DT-07_PRODUCTION'
  sourceRef: string
  observedAtMinute: number
}

export interface SettlementDevelopmentTransitionReceipt {
  transitionId: string
  worldInstanceId: string
  localityId: string
  fromTier: SettlementDevelopmentTier
  toTier: SettlementDevelopmentTier
  reasonCode: SettlementTransitionReasonCode
  evidenceIds: readonly string[]
  evidenceCodes: readonly SettlementEvolutionEvidenceCode[]
  structuralTickId: string
  evaluatedAtMinute: number
}

export interface SettlementDevelopmentState {
  version: typeof WORLD_EVOLUTION_STATE_VERSION
  policyId: typeof WORLD_EVOLUTION_POLICY_ID
  worldInstanceId: string
  localityId: string
  tier: SettlementDevelopmentTier
  revision: number
  evidenceReceipts: readonly SettlementEvolutionEvidenceReceipt[]
  transitionReceipts: readonly SettlementDevelopmentTransitionReceipt[]
  processedStructuralTickIds: readonly string[]
}

export interface SettlementDevelopmentSnapshot extends SettlementDevelopmentState {}

export type ApplySettlementEvidenceResult =
  | { status: 'applied'; state: SettlementDevelopmentState; appliedEvidenceIds: readonly string[] }
  | { status: 'duplicate'; state: SettlementDevelopmentState; appliedEvidenceIds: readonly [] }
  | { status: 'rejected'; state: SettlementDevelopmentState; reason: string; appliedEvidenceIds: readonly [] }

export type SettlementDevelopmentEvaluationResult =
  | { status: 'advanced'; state: SettlementDevelopmentState; transition: SettlementDevelopmentTransitionReceipt }
  | { status: 'unchanged'; state: SettlementDevelopmentState; reason: string }
  | { status: 'duplicate'; state: SettlementDevelopmentState; reason: string }
  | { status: 'rejected'; state: SettlementDevelopmentState; reason: string }

export type RestoreSettlementDevelopmentResult =
  | { status: 'restored'; state: SettlementDevelopmentState }
  | { status: 'rejected'; reason: string }

const nonBlankId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 256

const safeNonNegativeInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0

const safePositiveInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) > 0

const isSettlementTier = (value: unknown): value is SettlementDevelopmentTier =>
  SETTLEMENT_DEVELOPMENT_TIERS.includes(value as SettlementDevelopmentTier)

const isEvidenceCode = (value: unknown): value is SettlementEvolutionEvidenceCode =>
  SETTLEMENT_EVOLUTION_EVIDENCE_CODES.includes(value as SettlementEvolutionEvidenceCode)

const isEvidenceClass = (value: unknown): value is SettlementEvolutionEvidenceClass =>
  SETTLEMENT_EVOLUTION_EVIDENCE_CLASSES.includes(value as SettlementEvolutionEvidenceClass)

const isTransitionReasonCode = (value: unknown): value is SettlementTransitionReasonCode =>
  SETTLEMENT_TRANSITION_REASON_CODES.includes(value as SettlementTransitionReasonCode)

const evidenceClassForCode = (code: SettlementEvolutionEvidenceCode): SettlementEvolutionEvidenceClass =>
  code === 'LOCAL_PRODUCTION_CYCLE_COMPLETED'
    ? 'AUTHORITATIVE_PRODUCTION_FACT'
    : 'PRODUCTION_MODEL_PROXY'

const cloneEvidence = (receipt: SettlementEvolutionEvidenceReceipt): SettlementEvolutionEvidenceReceipt => ({ ...receipt })

const cloneTransition = (
  receipt: SettlementDevelopmentTransitionReceipt,
): SettlementDevelopmentTransitionReceipt => ({
  ...receipt,
  evidenceIds: [...receipt.evidenceIds],
  evidenceCodes: [...receipt.evidenceCodes],
})

const cloneState = (state: SettlementDevelopmentState): SettlementDevelopmentState => ({
  ...state,
  evidenceReceipts: state.evidenceReceipts.map(cloneEvidence),
  transitionReceipts: state.transitionReceipts.map(cloneTransition),
  processedStructuralTickIds: [...state.processedStructuralTickIds],
})

export const createSettlementDevelopmentState = (input: {
  worldInstanceId: string
  localityId: string
  tier?: SettlementDevelopmentTier
}): SettlementDevelopmentState => {
  if (!nonBlankId(input.worldInstanceId) || !nonBlankId(input.localityId)) {
    throw new Error('Invalid settlement identity')
  }
  const tier = input.tier ?? 'LATENT'
  if (!isSettlementTier(tier)) throw new Error('Invalid settlement tier')
  return {
    version: WORLD_EVOLUTION_STATE_VERSION,
    policyId: WORLD_EVOLUTION_POLICY_ID,
    worldInstanceId: input.worldInstanceId.trim(),
    localityId: input.localityId.trim(),
    tier,
    revision: 0,
    evidenceReceipts: [],
    transitionReceipts: [],
    processedStructuralTickIds: [],
  }
}

const productionEvidenceId = (
  node: ProductiveNodeState,
  localityId: string,
  cycleId: string,
  code: SettlementEvolutionEvidenceCode,
): string => `settlement-evidence:${node.location.worldInstanceId}:${localityId}:${node.nodeId}:${cycleId}:${code}`

/**
 * Adapts an already-completed DT-07 production cycle into DT-18 development evidence.
 * `infrastructureIndex` and `specialistIndex` are production-model tuning/proxy values only. They do
 * not establish a real facility, specialist, qualification, employment relation or company capability.
 */
export const deriveProductionSettlementEvidence = (
  node: ProductiveNodeState,
  cycleId: string,
  observedAt: WorldClockState,
): readonly SettlementEvolutionEvidenceReceipt[] => {
  const localityId = node.location.localityId
  if (!nonBlankId(localityId) || !nonBlankId(cycleId)) return []
  if (observedAt.worldInstanceId !== node.location.worldInstanceId) return []
  if (!node.completedCycleIds.includes(cycleId)) return []

  const observedAtMinute = worldClockMinuteOrdinal(observedAt)
  const sourceRef = `production-cycle:${node.nodeId}:${cycleId}`
  const codes: SettlementEvolutionEvidenceCode[] = ['LOCAL_PRODUCTION_CYCLE_COMPLETED']
  if (node.infrastructureIndex > 0) codes.push('PRODUCTION_MODEL_INFRASTRUCTURE_INDEX_POSITIVE')
  if (node.specialistIndex > 0) codes.push('PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE')

  return codes.map(code => ({
    evidenceId: productionEvidenceId(node, localityId, cycleId, code),
    worldInstanceId: node.location.worldInstanceId,
    localityId,
    code,
    evidenceClass: evidenceClassForCode(code),
    sourceDomain: 'DT-07_PRODUCTION',
    sourceRef,
    observedAtMinute,
  }))
}

const evidenceSemanticallyEqual = (
  left: SettlementEvolutionEvidenceReceipt,
  right: SettlementEvolutionEvidenceReceipt,
): boolean => left.evidenceId === right.evidenceId &&
  left.worldInstanceId === right.worldInstanceId &&
  left.localityId === right.localityId &&
  left.code === right.code &&
  left.evidenceClass === right.evidenceClass &&
  left.sourceDomain === right.sourceDomain &&
  left.sourceRef === right.sourceRef &&
  left.observedAtMinute === right.observedAtMinute

export const applySettlementEvolutionEvidence = (
  state: SettlementDevelopmentState,
  receipts: readonly SettlementEvolutionEvidenceReceipt[],
): ApplySettlementEvidenceResult => {
  const existingById = new Map(state.evidenceReceipts.map(receipt => [receipt.evidenceId, receipt]))
  const incomingById = new Map<string, SettlementEvolutionEvidenceReceipt>()
  const additions: SettlementEvolutionEvidenceReceipt[] = []

  for (const receipt of receipts) {
    if (receipt.worldInstanceId !== state.worldInstanceId || receipt.localityId !== state.localityId) {
      return { status: 'rejected', state, reason: 'settlement-evidence-scope-mismatch', appliedEvidenceIds: [] }
    }
    if (!nonBlankId(receipt.evidenceId) || !nonBlankId(receipt.sourceRef) ||
        !isEvidenceCode(receipt.code) || !isEvidenceClass(receipt.evidenceClass) ||
        receipt.evidenceClass !== evidenceClassForCode(receipt.code) ||
        receipt.sourceDomain !== 'DT-07_PRODUCTION' || !safeNonNegativeInteger(receipt.observedAtMinute)) {
      return { status: 'rejected', state, reason: 'invalid-settlement-evidence', appliedEvidenceIds: [] }
    }

    const incoming = incomingById.get(receipt.evidenceId)
    if (incoming && !evidenceSemanticallyEqual(incoming, receipt)) {
      return { status: 'rejected', state, reason: 'inconsistent-settlement-evidence', appliedEvidenceIds: [] }
    }
    incomingById.set(receipt.evidenceId, receipt)

    const existing = existingById.get(receipt.evidenceId)
    if (existing && !evidenceSemanticallyEqual(existing, receipt)) {
      return { status: 'rejected', state, reason: 'inconsistent-settlement-evidence', appliedEvidenceIds: [] }
    }
    if (!existing && !additions.some(candidate => candidate.evidenceId === receipt.evidenceId)) {
      additions.push(cloneEvidence(receipt))
    }
  }

  if (additions.length === 0) {
    return { status: 'duplicate', state, appliedEvidenceIds: [] }
  }

  additions.sort((left, right) =>
    left.observedAtMinute - right.observedAtMinute || left.evidenceId.localeCompare(right.evidenceId))

  return {
    status: 'applied',
    state: {
      ...state,
      revision: state.revision + 1,
      evidenceReceipts: [...state.evidenceReceipts.map(cloneEvidence), ...additions],
      transitionReceipts: state.transitionReceipts.map(cloneTransition),
      processedStructuralTickIds: [...state.processedStructuralTickIds],
    },
    appliedEvidenceIds: additions.map(receipt => receipt.evidenceId),
  }
}

const firstTransitionEvidenceCodes = [
  'LOCAL_PRODUCTION_CYCLE_COMPLETED',
  'PRODUCTION_MODEL_INFRASTRUCTURE_INDEX_POSITIVE',
  'PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE',
] as const satisfies readonly SettlementEvolutionEvidenceCode[]

const sameStringSet = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && new Set(left).size === left.length &&
  new Set(right).size === right.length && left.every(value => right.includes(value))

const firstTransitionEvidenceFor = (
  state: SettlementDevelopmentState,
): readonly SettlementEvolutionEvidenceReceipt[] | null => {
  const bySource = new Map<string, Map<SettlementEvolutionEvidenceCode, SettlementEvolutionEvidenceReceipt>>()
  for (const receipt of state.evidenceReceipts) {
    if (!firstTransitionEvidenceCodes.includes(receipt.code as typeof firstTransitionEvidenceCodes[number])) continue
    const group = bySource.get(receipt.sourceRef) ?? new Map()
    if (!group.has(receipt.code)) group.set(receipt.code, receipt)
    bySource.set(receipt.sourceRef, group)
  }

  const candidates = [...bySource.entries()]
    .filter(([, group]) => firstTransitionEvidenceCodes.every(code => group.has(code)))
    .sort(([leftRef, left], [rightRef, right]) => {
      const leftMinute = Math.min(...[...left.values()].map(receipt => receipt.observedAtMinute))
      const rightMinute = Math.min(...[...right.values()].map(receipt => receipt.observedAtMinute))
      return leftMinute - rightMinute || leftRef.localeCompare(rightRef)
    })

  if (candidates.length === 0) return null
  const group = candidates[0][1]
  return firstTransitionEvidenceCodes.map(code => group.get(code) as SettlementEvolutionEvidenceReceipt)
}

const structuralTickIdFor = (clock: WorldClockState): string =>
  `world-structural-year:${clock.worldInstanceId}:${clock.year}`

export const evaluateSettlementDevelopment = (
  state: SettlementDevelopmentState,
  advance: WorldClockAdvanceResult,
): SettlementDevelopmentEvaluationResult => {
  if (advance.clock.worldInstanceId !== state.worldInstanceId) {
    return { status: 'rejected', state, reason: 'world-instance-mismatch' }
  }
  if (summarizeWorldEvolutionTicks(advance).STRUCTURAL_YEAR < 1) {
    return { status: 'unchanged', state, reason: 'no-structural-tick' }
  }

  const structuralTickId = structuralTickIdFor(advance.clock)
  if (state.processedStructuralTickIds.includes(structuralTickId)) {
    return { status: 'duplicate', state, reason: 'structural-tick-already-processed' }
  }

  const processedBase: SettlementDevelopmentState = {
    ...cloneState(state),
    revision: state.revision + 1,
    processedStructuralTickIds: [...state.processedStructuralTickIds, structuralTickId],
  }

  if (state.tier !== 'LATENT') {
    return { status: 'unchanged', state: processedBase, reason: 'next-tier-transition-not-implemented' }
  }

  const selectedEvidence = firstTransitionEvidenceFor(state)
  if (!selectedEvidence) {
    return { status: 'unchanged', state: processedBase, reason: 'insufficient-causal-evidence' }
  }

  const evidenceIds = selectedEvidence.map(receipt => receipt.evidenceId)
  const evidenceCodes = [...firstTransitionEvidenceCodes]
  const transitionId = `settlement-transition:${state.worldInstanceId}:${state.localityId}:LATENT:RURAL_POINT:${structuralTickId}`
  const transition: SettlementDevelopmentTransitionReceipt = {
    transitionId,
    worldInstanceId: state.worldInstanceId,
    localityId: state.localityId,
    fromTier: 'LATENT',
    toTier: 'RURAL_POINT',
    reasonCode: 'PRODUCTION_MODEL_BASELINE_ESTABLISHED',
    evidenceIds,
    evidenceCodes,
    structuralTickId,
    evaluatedAtMinute: worldClockMinuteOrdinal(advance.clock),
  }

  return {
    status: 'advanced',
    state: {
      ...processedBase,
      tier: 'RURAL_POINT',
      transitionReceipts: [...processedBase.transitionReceipts, transition],
    },
    transition,
  }
}

export const captureSettlementDevelopmentState = (
  state: SettlementDevelopmentState,
): SettlementDevelopmentSnapshot => cloneState(state)

const validEvidenceReceipt = (
  value: unknown,
  worldInstanceId: string,
  localityId: string,
): value is SettlementEvolutionEvidenceReceipt => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const source = value as Record<string, unknown>
  if (source.worldInstanceId !== worldInstanceId || source.localityId !== localityId ||
      !nonBlankId(source.evidenceId) || !isEvidenceCode(source.code) || !isEvidenceClass(source.evidenceClass) ||
      source.evidenceClass !== evidenceClassForCode(source.code) || source.sourceDomain !== 'DT-07_PRODUCTION' ||
      !nonBlankId(source.sourceRef) || !safeNonNegativeInteger(source.observedAtMinute)) return false

  const expectedPrefix = `settlement-evidence:${worldInstanceId}:${localityId}:`
  return source.evidenceId.startsWith(expectedPrefix) && source.evidenceId.endsWith(`:${source.code}`) &&
    source.sourceRef.startsWith('production-cycle:')
}

const validTransitionReceipt = (
  value: unknown,
  worldInstanceId: string,
  localityId: string,
): value is SettlementDevelopmentTransitionReceipt => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const source = value as Record<string, unknown>
  if (source.worldInstanceId !== worldInstanceId || source.localityId !== localityId ||
      !nonBlankId(source.transitionId) || !isSettlementTier(source.fromTier) || !isSettlementTier(source.toTier) ||
      !isTransitionReasonCode(source.reasonCode) || !nonBlankId(source.structuralTickId) ||
      !safeNonNegativeInteger(source.evaluatedAtMinute) || !Array.isArray(source.evidenceIds) ||
      !Array.isArray(source.evidenceCodes)) return false
  return source.evidenceIds.length > 0 && source.evidenceIds.every(nonBlankId) &&
    source.evidenceCodes.length > 0 && source.evidenceCodes.every(isEvidenceCode)
}

const validStructuralTickId = (tickId: string, worldInstanceId: string): boolean => {
  const prefix = `world-structural-year:${worldInstanceId}:`
  if (!tickId.startsWith(prefix)) return false
  const yearText = tickId.slice(prefix.length)
  if (!/^\d+$/.test(yearText)) return false
  const year = Number(yearText)
  return safePositiveInteger(year) && String(year) === yearText
}

const transitionPolicyIsLegal = (
  receipt: SettlementDevelopmentTransitionReceipt,
): boolean => receipt.reasonCode === 'PRODUCTION_MODEL_BASELINE_ESTABLISHED' &&
  receipt.fromTier === 'LATENT' && receipt.toTier === 'RURAL_POINT' &&
  sameStringSet(receipt.evidenceCodes, firstTransitionEvidenceCodes)

const expectedTransitionId = (receipt: SettlementDevelopmentTransitionReceipt): string =>
  `settlement-transition:${receipt.worldInstanceId}:${receipt.localityId}:${receipt.fromTier}:${receipt.toTier}:${receipt.structuralTickId}`

const restoreReferentialIntegrityError = (
  tier: SettlementDevelopmentTier,
  evidenceReceipts: readonly SettlementEvolutionEvidenceReceipt[],
  transitionReceipts: readonly SettlementDevelopmentTransitionReceipt[],
  processedStructuralTickIds: readonly string[],
  worldInstanceId: string,
): string | null => {
  const evidenceById = new Map(evidenceReceipts.map(receipt => [receipt.evidenceId, receipt]))
  const processedTicks = new Set(processedStructuralTickIds)
  const transitionTicks = new Set<string>()

  const semanticEvidenceKeys = new Set<string>()
  for (const receipt of evidenceReceipts) {
    const semanticKey = `${receipt.sourceDomain}|${receipt.sourceRef}|${receipt.code}`
    if (semanticEvidenceKeys.has(semanticKey)) return 'inconsistent-settlement-state-evidence'
    semanticEvidenceKeys.add(semanticKey)
  }

  for (const receipt of transitionReceipts) {
    if (!validStructuralTickId(receipt.structuralTickId, worldInstanceId) ||
        !processedTicks.has(receipt.structuralTickId)) {
      return 'invalid-settlement-state-structural-tick-reference'
    }
    if (transitionTicks.has(receipt.structuralTickId)) return 'duplicate-settlement-state-transition-tick'
    transitionTicks.add(receipt.structuralTickId)

    if (!transitionPolicyIsLegal(receipt) || receipt.transitionId !== expectedTransitionId(receipt)) {
      return 'illegal-settlement-state-transition'
    }
    if (new Set(receipt.evidenceIds).size !== receipt.evidenceIds.length ||
        new Set(receipt.evidenceCodes).size !== receipt.evidenceCodes.length) {
      return 'duplicate-settlement-state-transition-reference'
    }

    const referenced = receipt.evidenceIds.map(evidenceId => evidenceById.get(evidenceId))
    if (referenced.some(evidence => !evidence)) return 'missing-settlement-state-evidence-reference'
    const concrete = referenced as SettlementEvolutionEvidenceReceipt[]
    const referencedCodes = [...new Set(concrete.map(evidence => evidence.code))]
    if (!sameStringSet(receipt.evidenceCodes, referencedCodes)) {
      return 'inconsistent-settlement-state-evidence-code-reference'
    }
    if (new Set(concrete.map(evidence => evidence.sourceRef)).size !== 1 ||
        concrete.some(evidence => evidence.observedAtMinute > receipt.evaluatedAtMinute)) {
      return 'inconsistent-settlement-state-transition-evidence'
    }
  }

  if (transitionReceipts.length > 1) return 'illegal-settlement-state-transition-history'
  if (transitionReceipts.length === 1 && tier !== transitionReceipts[0].toTier) {
    return 'inconsistent-settlement-state-tier-history'
  }
  return null
}

export const restoreSettlementDevelopmentState = (
  value: unknown,
  expected: { worldInstanceId: string; localityId: string },
): RestoreSettlementDevelopmentResult => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { status: 'rejected', reason: 'settlement-state-not-object' }
  }
  const source = value as Record<string, unknown>
  if (source.version !== WORLD_EVOLUTION_STATE_VERSION || source.policyId !== WORLD_EVOLUTION_POLICY_ID) {
    return { status: 'rejected', reason: 'settlement-state-version-policy-mismatch' }
  }
  if (source.worldInstanceId !== expected.worldInstanceId || source.localityId !== expected.localityId) {
    return { status: 'rejected', reason: 'settlement-state-scope-mismatch' }
  }
  if (!isSettlementTier(source.tier) || !safeNonNegativeInteger(source.revision) ||
      !Array.isArray(source.evidenceReceipts) || !Array.isArray(source.transitionReceipts) ||
      !Array.isArray(source.processedStructuralTickIds)) {
    return { status: 'rejected', reason: 'invalid-settlement-state-shape' }
  }
  if (!source.evidenceReceipts.every(receipt => validEvidenceReceipt(receipt, expected.worldInstanceId, expected.localityId)) ||
      !source.transitionReceipts.every(receipt => validTransitionReceipt(receipt, expected.worldInstanceId, expected.localityId)) ||
      !source.processedStructuralTickIds.every(tickId =>
        nonBlankId(tickId) && validStructuralTickId(tickId, expected.worldInstanceId))) {
    return { status: 'rejected', reason: 'invalid-settlement-state-receipt' }
  }

  const evidenceReceipts = source.evidenceReceipts as SettlementEvolutionEvidenceReceipt[]
  const transitionReceipts = source.transitionReceipts as SettlementDevelopmentTransitionReceipt[]
  const processedStructuralTickIds = source.processedStructuralTickIds as string[]
  if (new Set(evidenceReceipts.map(receipt => receipt.evidenceId)).size !== evidenceReceipts.length ||
      new Set(transitionReceipts.map(receipt => receipt.transitionId)).size !== transitionReceipts.length ||
      new Set(processedStructuralTickIds).size !== processedStructuralTickIds.length) {
    return { status: 'rejected', reason: 'duplicate-settlement-state-receipt' }
  }

  const integrityError = restoreReferentialIntegrityError(
    source.tier,
    evidenceReceipts,
    transitionReceipts,
    processedStructuralTickIds,
    expected.worldInstanceId,
  )
  if (integrityError) return { status: 'rejected', reason: integrityError }

  return {
    status: 'restored',
    state: {
      version: WORLD_EVOLUTION_STATE_VERSION,
      policyId: WORLD_EVOLUTION_POLICY_ID,
      worldInstanceId: expected.worldInstanceId,
      localityId: expected.localityId,
      tier: source.tier,
      revision: source.revision,
      evidenceReceipts: evidenceReceipts.map(cloneEvidence),
      transitionReceipts: transitionReceipts.map(cloneTransition),
      processedStructuralTickIds: [...processedStructuralTickIds],
    },
  }
}
