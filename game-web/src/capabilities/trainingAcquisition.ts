import type { PersonalCapabilityId } from '../types/game'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  isWorldClockStateValid,
  worldClockMinuteOrdinal,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'
import {
  awardQualification,
  completePracticalTraining,
  completeTheory,
  recordSupervisedExperience,
} from './capabilityEngine'
import {
  createStarterCapabilityEvidence,
  type CapabilityEvidenceState,
} from './capabilityModel'

export const TRAINING_ACQUISITION_STATE_VERSION = 1 as const

export const ROAD_TRAINING_EVIDENCE_IDS = [
  'road-vehicle-theory',
  'car-operation-practical',
  'car-operation-qualification',
  'van-cargo-practical',
  'road-delivery-supervised',
  'delivery-van-qualification',
] as const

export type RoadTrainingEvidenceId = (typeof ROAD_TRAINING_EVIDENCE_IDS)[number]
export type TrainingEvidenceKind = 'Theory' | 'PracticalTraining' | 'SupervisedExperience' | 'Qualification'
export type TrainingAuthorityRole = 'Instructor' | 'Assessor' | 'Supervisor'
export type TrainingAuthorityPhase = 'Start' | 'Complete'

export interface TrainingModuleDefinition {
  evidenceId: RoadTrainingEvidenceId
  label: string
  kind: TrainingEvidenceKind
  requiredAuthorityRole: TrainingAuthorityRole
  durationMinutes: number
  prerequisiteEvidenceIds: readonly RoadTrainingEvidenceId[]
  prerequisiteCapabilityIds: readonly PersonalCapabilityId[]
  supervisedExperienceUnits?: number
}

/**
 * Phase-1 training durations are replaceable balancing data. The stable contract is
 * ordered, authority-backed, C1-timed evidence acquisition with deterministic receipts.
 */
export const ROAD_TRAINING_MODULES: readonly TrainingModuleDefinition[] = [
  {
    evidenceId: 'road-vehicle-theory',
    label: 'Road vehicle theory',
    kind: 'Theory',
    requiredAuthorityRole: 'Instructor',
    durationMinutes: 120,
    prerequisiteEvidenceIds: [],
    prerequisiteCapabilityIds: ['WalkingCourierFundamentals'],
  },
  {
    evidenceId: 'car-operation-practical',
    label: 'Car operation practice',
    kind: 'PracticalTraining',
    requiredAuthorityRole: 'Instructor',
    durationMinutes: 180,
    prerequisiteEvidenceIds: ['road-vehicle-theory'],
    prerequisiteCapabilityIds: ['WalkingCourierFundamentals'],
  },
  {
    evidenceId: 'car-operation-qualification',
    label: 'Car operation qualification',
    kind: 'Qualification',
    requiredAuthorityRole: 'Assessor',
    durationMinutes: 60,
    prerequisiteEvidenceIds: ['road-vehicle-theory', 'car-operation-practical'],
    prerequisiteCapabilityIds: ['WalkingCourierFundamentals'],
  },
  {
    evidenceId: 'van-cargo-practical',
    label: 'Van cargo-handling practice',
    kind: 'PracticalTraining',
    requiredAuthorityRole: 'Instructor',
    durationMinutes: 120,
    prerequisiteEvidenceIds: ['car-operation-qualification'],
    prerequisiteCapabilityIds: ['CarOperation'],
  },
  {
    evidenceId: 'road-delivery-supervised',
    label: 'Supervised road-delivery experience',
    kind: 'SupervisedExperience',
    requiredAuthorityRole: 'Supervisor',
    durationMinutes: 180,
    prerequisiteEvidenceIds: ['van-cargo-practical'],
    prerequisiteCapabilityIds: ['CarOperation'],
    supervisedExperienceUnits: 1,
  },
  {
    evidenceId: 'delivery-van-qualification',
    label: 'Delivery van qualification',
    kind: 'Qualification',
    requiredAuthorityRole: 'Assessor',
    durationMinutes: 60,
    prerequisiteEvidenceIds: [
      'car-operation-qualification',
      'van-cargo-practical',
      'road-delivery-supervised',
    ],
    prerequisiteCapabilityIds: ['CarOperation'],
  },
] as const

export interface TrainingAuthorityRequest {
  phase: TrainingAuthorityPhase
  worldInstanceId: string
  learnerActorId: string
  evidenceId: RoadTrainingEvidenceId
  requiredRole: TrainingAuthorityRole
  sessionId?: string
}

export type TrainingAuthorityDecision =
  | {
      authorized: true
      authorityId: string
      role: TrainingAuthorityRole
      authorizationRef: string
    }
  | {
      authorized: false
      reason?: string
    }

/**
 * Trust boundary only. The capability layer asks an owning instructor/assessment
 * authority whether a session may start/complete; it never self-issues that authority.
 */
export interface TrainingAuthorityPort {
  authorize(request: TrainingAuthorityRequest): TrainingAuthorityDecision
}

export interface TrainingSession {
  sessionId: string
  evidenceId: RoadTrainingEvidenceId
  authorityId: string
  authorityRole: TrainingAuthorityRole
  authorizationRef: string
  startedAtMinuteOrdinal: number
  readyAtMinuteOrdinal: number
}

export interface TrainingCompletionReceipt {
  receiptId: string
  sessionId: string
  evidenceId: RoadTrainingEvidenceId
  evidenceKind: TrainingEvidenceKind
  authorityId: string
  authorizationRef: string
  completedAtMinuteOrdinal: number
}

export interface CapabilityTrainingState {
  version: typeof TRAINING_ACQUISITION_STATE_VERSION
  worldInstanceId: string
  learnerActorId: string
  evidence: CapabilityEvidenceState
  sessions: TrainingSession[]
  completionReceipts: TrainingCompletionReceipt[]
}

export type TrainingFailureReason =
  | 'unknown-evidence'
  | 'invalid-state'
  | 'invalid-clock'
  | 'wrong-world'
  | 'prerequisites-missing'
  | 'evidence-already-present'
  | 'authority-required'
  | 'authority-rejected'
  | 'self-authored-authority'
  | 'invalid-authority'
  | 'authority-role-mismatch'
  | 'authority-changed'
  | 'unknown-session'
  | 'training-not-ready'

export interface TrainingFailure {
  reason: TrainingFailureReason
  message: string
  missingEvidenceIds?: RoadTrainingEvidenceId[]
  missingCapabilityIds?: PersonalCapabilityId[]
}

export type BeginTrainingResult =
  | { started: true; replayed: boolean; state: CapabilityTrainingState; session: TrainingSession }
  | { started: false; state: CapabilityTrainingState; failure: TrainingFailure }

export type CompleteTrainingResult =
  | { completed: true; replayed: boolean; state: CapabilityTrainingState; receipt: TrainingCompletionReceipt }
  | { completed: false; state: CapabilityTrainingState; failure: TrainingFailure }

const validToken = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 160

const cloneEvidence = (evidence: CapabilityEvidenceState): CapabilityEvidenceState => ({
  ...evidence,
  learnedCapabilityIds: [...evidence.learnedCapabilityIds],
  theoryIds: [...evidence.theoryIds],
  practicalTrainingIds: [...evidence.practicalTrainingIds],
  qualificationIds: [...evidence.qualificationIds],
  supervisedExperienceById: { ...evidence.supervisedExperienceById },
})

export const createCapabilityTrainingState = (
  worldInstanceId: string,
  learnerActorId: string,
  evidence: CapabilityEvidenceState = createStarterCapabilityEvidence(),
): CapabilityTrainingState => {
  if (!validToken(worldInstanceId) || !validToken(learnerActorId)) {
    throw new Error('Capability training requires valid world and learner identity')
  }
  return {
    version: TRAINING_ACQUISITION_STATE_VERSION,
    worldInstanceId: worldInstanceId.trim(),
    learnerActorId: learnerActorId.trim(),
    evidence: cloneEvidence(evidence),
    sessions: [],
    completionReceipts: [],
  }
}

const moduleFor = (evidenceId: string): TrainingModuleDefinition | null =>
  ROAD_TRAINING_MODULES.find(module => module.evidenceId === evidenceId) ?? null

const hasEvidence = (state: CapabilityEvidenceState, evidenceId: RoadTrainingEvidenceId): boolean =>
  state.theoryIds.includes(evidenceId) ||
  state.practicalTrainingIds.includes(evidenceId) ||
  state.qualificationIds.includes(evidenceId) ||
  (state.supervisedExperienceById[evidenceId] ?? 0) > 0

export const trainingPrerequisitesFor = (
  state: CapabilityTrainingState,
  evidenceId: RoadTrainingEvidenceId,
): { missingEvidenceIds: RoadTrainingEvidenceId[]; missingCapabilityIds: PersonalCapabilityId[] } => {
  const module = moduleFor(evidenceId)
  if (!module) return { missingEvidenceIds: [], missingCapabilityIds: [] }
  return {
    missingEvidenceIds: module.prerequisiteEvidenceIds.filter(id => !hasEvidence(state.evidence, id)),
    missingCapabilityIds: module.prerequisiteCapabilityIds.filter(id => !state.evidence.learnedCapabilityIds.includes(id)),
  }
}

const fail = (
  state: CapabilityTrainingState,
  reason: TrainingFailureReason,
  message: string,
  extras: Pick<TrainingFailure, 'missingEvidenceIds' | 'missingCapabilityIds'> = {},
): { state: CapabilityTrainingState; failure: TrainingFailure } => ({
  state,
  failure: { reason, message, ...extras },
})

const authorityDecision = (
  authority: TrainingAuthorityPort | undefined,
  request: TrainingAuthorityRequest,
): TrainingAuthorityDecision | null => {
  if (!authority) return null
  try {
    return authority.authorize(request)
  } catch {
    return { authorized: false, reason: 'authority-error' }
  }
}

const validateAuthority = (
  state: CapabilityTrainingState,
  module: TrainingModuleDefinition,
  authority: TrainingAuthorityPort | undefined,
  phase: TrainingAuthorityPhase,
  sessionId?: string,
  expectedAuthorityId?: string,
): TrainingFailure | { decision: Extract<TrainingAuthorityDecision, { authorized: true }> } => {
  const decision = authorityDecision(authority, {
    phase,
    worldInstanceId: state.worldInstanceId,
    learnerActorId: state.learnerActorId,
    evidenceId: module.evidenceId,
    requiredRole: module.requiredAuthorityRole,
    ...(sessionId ? { sessionId } : {}),
  })
  if (decision === null) {
    return { reason: 'authority-required', message: 'Authorized training authority is required.' }
  }
  if (!decision.authorized) {
    return { reason: 'authority-rejected', message: 'Training authority rejected this completion.' }
  }
  if (!validToken(decision.authorityId) || !validToken(decision.authorizationRef)) {
    return { reason: 'invalid-authority', message: 'Training authority evidence is invalid.' }
  }
  if (decision.authorityId.trim() === state.learnerActorId) {
    return { reason: 'self-authored-authority', message: 'Learners cannot authorize their own training evidence.' }
  }
  if (decision.role !== module.requiredAuthorityRole) {
    return { reason: 'authority-role-mismatch', message: `Required training authority: ${module.requiredAuthorityRole}.` }
  }
  if (expectedAuthorityId !== undefined && decision.authorityId.trim() !== expectedAuthorityId) {
    return { reason: 'authority-changed', message: 'Training completion must be confirmed by the session authority.' }
  }
  return {
    decision: {
      ...decision,
      authorityId: decision.authorityId.trim(),
      authorizationRef: decision.authorizationRef.trim(),
    },
  }
}

const validClockForState = (
  state: CapabilityTrainingState,
  clock: WorldClockState,
  policy: WorldClockPolicy,
): TrainingFailure | null => {
  if (!isWorldClockStateValid(clock, policy)) {
    return { reason: 'invalid-clock', message: 'Training requires a valid World Clock.' }
  }
  if (clock.worldInstanceId !== state.worldInstanceId) {
    return { reason: 'wrong-world', message: 'Training clock belongs to a different world.' }
  }
  return null
}

export const beginTrainingSession = (
  state: CapabilityTrainingState,
  evidenceId: string,
  clock: WorldClockState,
  authority?: TrainingAuthorityPort,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): BeginTrainingResult => {
  const module = moduleFor(evidenceId)
  if (!module) {
    return { started: false, ...fail(state, 'unknown-evidence', 'This training evidence is not available.') }
  }
  const clockFailure = validClockForState(state, clock, policy)
  if (clockFailure) return { started: false, state, failure: clockFailure }

  const sessionId = `training:${state.worldInstanceId}:${state.learnerActorId}:${module.evidenceId}`
  const existingSession = state.sessions.find(session => session.sessionId === sessionId)
  if (existingSession) {
    return { started: true, replayed: true, state, session: existingSession }
  }
  if (hasEvidence(state.evidence, module.evidenceId)) {
    return { started: false, ...fail(state, 'evidence-already-present', 'This training evidence is already complete.') }
  }

  const missing = trainingPrerequisitesFor(state, module.evidenceId)
  if (missing.missingEvidenceIds.length > 0 || missing.missingCapabilityIds.length > 0) {
    return {
      started: false,
      ...fail(state, 'prerequisites-missing', 'Training prerequisites are incomplete.', missing),
    }
  }

  const authorityResult = validateAuthority(state, module, authority, 'Start')
  if (!('decision' in authorityResult)) return { started: false, state, failure: authorityResult }

  const startedAtMinuteOrdinal = worldClockMinuteOrdinal(clock, policy)
  const readyAtMinuteOrdinal = startedAtMinuteOrdinal + module.durationMinutes
  if (!Number.isSafeInteger(readyAtMinuteOrdinal)) {
    return { started: false, ...fail(state, 'invalid-state', 'Training duration exceeds the supported clock range.') }
  }

  const session: TrainingSession = {
    sessionId,
    evidenceId: module.evidenceId,
    authorityId: authorityResult.decision.authorityId,
    authorityRole: authorityResult.decision.role,
    authorizationRef: authorityResult.decision.authorizationRef,
    startedAtMinuteOrdinal,
    readyAtMinuteOrdinal,
  }
  return {
    started: true,
    replayed: false,
    state: { ...state, sessions: [...state.sessions, session] },
    session,
  }
}

const applyCompletedEvidence = (
  evidence: CapabilityEvidenceState,
  module: TrainingModuleDefinition,
): CapabilityEvidenceState => {
  switch (module.kind) {
    case 'Theory':
      return completeTheory(evidence, module.evidenceId)
    case 'PracticalTraining':
      return completePracticalTraining(evidence, module.evidenceId)
    case 'Qualification':
      return awardQualification(evidence, module.evidenceId)
    case 'SupervisedExperience':
      return recordSupervisedExperience(evidence, module.evidenceId, module.supervisedExperienceUnits ?? 1)
  }
}

export const completeTrainingSession = (
  state: CapabilityTrainingState,
  sessionId: string,
  clock: WorldClockState,
  authority?: TrainingAuthorityPort,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): CompleteTrainingResult => {
  if (!validToken(sessionId)) {
    return { completed: false, ...fail(state, 'unknown-session', 'Training session is not available.') }
  }
  const session = state.sessions.find(candidate => candidate.sessionId === sessionId)
  if (!session) {
    return { completed: false, ...fail(state, 'unknown-session', 'Training session is not available.') }
  }
  const clockFailure = validClockForState(state, clock, policy)
  if (clockFailure) return { completed: false, state, failure: clockFailure }

  const existingReceipt = state.completionReceipts.find(receipt => receipt.sessionId === session.sessionId)
  if (existingReceipt) {
    return { completed: true, replayed: true, state, receipt: existingReceipt }
  }

  const module = moduleFor(session.evidenceId)
  if (!module) {
    return { completed: false, ...fail(state, 'invalid-state', 'Training session references unavailable evidence.') }
  }
  const now = worldClockMinuteOrdinal(clock, policy)
  if (now < session.readyAtMinuteOrdinal) {
    return { completed: false, ...fail(state, 'training-not-ready', 'Required training time has not completed yet.') }
  }

  const missing = trainingPrerequisitesFor(state, module.evidenceId)
  if (missing.missingEvidenceIds.length > 0 || missing.missingCapabilityIds.length > 0) {
    return {
      completed: false,
      ...fail(state, 'prerequisites-missing', 'Training prerequisites are no longer satisfied.', missing),
    }
  }

  const authorityResult = validateAuthority(
    state,
    module,
    authority,
    'Complete',
    session.sessionId,
    session.authorityId,
  )
  if (!('decision' in authorityResult)) return { completed: false, state, failure: authorityResult }

  const evidence = applyCompletedEvidence(state.evidence, module)
  const receipt: TrainingCompletionReceipt = {
    receiptId: `training-receipt:${state.worldInstanceId}:${state.learnerActorId}:${module.evidenceId}`,
    sessionId: session.sessionId,
    evidenceId: module.evidenceId,
    evidenceKind: module.kind,
    authorityId: authorityResult.decision.authorityId,
    authorizationRef: authorityResult.decision.authorizationRef,
    completedAtMinuteOrdinal: now,
  }
  return {
    completed: true,
    replayed: false,
    state: {
      ...state,
      evidence,
      completionReceipts: [...state.completionReceipts, receipt],
    },
    receipt,
  }
}
