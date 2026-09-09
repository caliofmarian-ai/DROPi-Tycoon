import { describe, expect, it } from 'vitest'
import {
  earnCapability,
  evaluateCapabilityAcquisition,
} from '../src/capabilities/capabilityEngine'
import {
  beginTrainingSession,
  completeTrainingSession,
  createCapabilityTrainingState,
  ROAD_TRAINING_MODULES,
  type CapabilityTrainingState,
  type RoadTrainingEvidenceId,
  type TrainingAuthorityPort,
} from '../src/capabilities/trainingAcquisition'
import {
  advanceWorldClock,
  createInitialWorldClockState,
  worldClockFromMinuteOrdinal,
} from '../src/systems/worldClockSystem'

const WORLD_ID = 'wi_dt06_training'
const LEARNER_ID = 'hero_dt06_training'

const trustedAuthority = (authorityId = 'trainer-road-01'): TrainingAuthorityPort => ({
  authorize: request => ({
    authorized: true,
    authorityId,
    role: request.requiredRole,
    authorizationRef: `authority:${request.requiredRole}:${request.evidenceId}`,
  }),
})

const completeModule = (
  state: CapabilityTrainingState,
  evidenceId: RoadTrainingEvidenceId,
  authority: TrainingAuthorityPort = trustedAuthority(),
): CapabilityTrainingState => {
  const startClock = createInitialWorldClockState(state.worldInstanceId)
  const started = beginTrainingSession(state, evidenceId, startClock, authority)
  expect(started.started).toBe(true)
  if (!started.started) throw new Error(`Expected ${evidenceId} to start`)
  const readyClock = worldClockFromMinuteOrdinal(state.worldInstanceId, started.session.readyAtMinuteOrdinal)
  const completed = completeTrainingSession(started.state, started.session.sessionId, readyClock, authority)
  expect(completed.completed).toBe(true)
  if (!completed.completed) throw new Error(`Expected ${evidenceId} to complete`)
  return completed.state
}

describe('DT-06 governed road training evidence acquisition', () => {
  it('publishes the ordered road training modules required by the merged capability graph', () => {
    expect(ROAD_TRAINING_MODULES.map(module => [module.evidenceId, module.kind])).toEqual([
      ['road-vehicle-theory', 'Theory'],
      ['car-operation-practical', 'PracticalTraining'],
      ['car-operation-qualification', 'Qualification'],
      ['van-cargo-practical', 'PracticalTraining'],
      ['road-delivery-supervised', 'SupervisedExperience'],
      ['delivery-van-qualification', 'Qualification'],
    ])
  })

  it('enforces prerequisite ordering before practical or van training can start', () => {
    const state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    const clock = createInitialWorldClockState(WORLD_ID)

    const carPractical = beginTrainingSession(state, 'car-operation-practical', clock, trustedAuthority())
    expect(carPractical).toMatchObject({
      started: false,
      failure: {
        reason: 'prerequisites-missing',
        missingEvidenceIds: ['road-vehicle-theory'],
        missingCapabilityIds: [],
      },
    })

    const vanPractical = beginTrainingSession(state, 'van-cargo-practical', clock, trustedAuthority())
    expect(vanPractical).toMatchObject({
      started: false,
      failure: {
        reason: 'prerequisites-missing',
        missingEvidenceIds: ['car-operation-qualification'],
        missingCapabilityIds: ['CarOperation'],
      },
    })
  })

  it('keeps theory-only evidence insufficient when practical training and qualification are still required', () => {
    let state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    state = completeModule(state, 'road-vehicle-theory')

    expect(evaluateCapabilityAcquisition(state.evidence, 'CarOperation').blockers).toEqual([
      { code: 'training-required', message: 'Training required: Car operation practice.' },
      { code: 'qualification-missing', message: 'Qualification missing: Car operation qualification.' },
    ])
  })

  it('requires C1 training time and produces authority-backed deterministic completion receipts', () => {
    const authority = trustedAuthority()
    const state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    const clock = createInitialWorldClockState(WORLD_ID)
    const started = beginTrainingSession(state, 'road-vehicle-theory', clock, authority)
    expect(started.started).toBe(true)
    if (!started.started) throw new Error('Road theory should start')

    const earlyClock = advanceWorldClock(clock, 119).clock
    const early = completeTrainingSession(started.state, started.session.sessionId, earlyClock, authority)
    expect(early).toMatchObject({
      completed: false,
      failure: { reason: 'training-not-ready' },
    })

    const readyClock = worldClockFromMinuteOrdinal(WORLD_ID, started.session.readyAtMinuteOrdinal)
    const completed = completeTrainingSession(started.state, started.session.sessionId, readyClock, authority)
    expect(completed.completed).toBe(true)
    if (!completed.completed) throw new Error('Road theory should complete')

    expect(completed.receipt).toEqual({
      receiptId: `training-receipt:${WORLD_ID}:${LEARNER_ID}:road-vehicle-theory`,
      sessionId: `training:${WORLD_ID}:${LEARNER_ID}:road-vehicle-theory`,
      evidenceId: 'road-vehicle-theory',
      evidenceKind: 'Theory',
      authorityId: 'trainer-road-01',
      authorizationRef: 'authority:Instructor:road-vehicle-theory',
      completedAtMinuteOrdinal: started.session.readyAtMinuteOrdinal,
    })
    expect(completed.state.evidence.theoryIds).toContain('road-vehicle-theory')
  })

  it('makes completion exactly-once and replay-safe without duplicating receipts or evidence', () => {
    const authority = trustedAuthority()
    let state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    state = completeModule(state, 'road-vehicle-theory', authority)

    const clock = createInitialWorldClockState(WORLD_ID)
    const started = beginTrainingSession(state, 'car-operation-practical', clock, authority)
    expect(started.started).toBe(true)
    if (!started.started) throw new Error('Car practical should start')
    const readyClock = worldClockFromMinuteOrdinal(WORLD_ID, started.session.readyAtMinuteOrdinal)
    const first = completeTrainingSession(started.state, started.session.sessionId, readyClock, authority)
    expect(first.completed).toBe(true)
    if (!first.completed) throw new Error('Car practical should complete')

    const replayClock = advanceWorldClock(readyClock, 60).clock
    const replay = completeTrainingSession(first.state, started.session.sessionId, replayClock, authority)
    expect(replay.completed).toBe(true)
    if (!replay.completed) throw new Error('Completed training should replay safely')
    expect(replay.replayed).toBe(true)
    expect(replay.receipt).toEqual(first.receipt)
    expect(replay.state.completionReceipts).toHaveLength(first.state.completionReceipts.length)
    expect(replay.state.evidence.practicalTrainingIds.filter(id => id === 'car-operation-practical')).toHaveLength(1)
  })

  it('rejects unknown evidence and self-authored authority instead of granting training locally', () => {
    const state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    const clock = createInitialWorldClockState(WORLD_ID)

    expect(beginTrainingSession(state, 'not-real-training', clock, trustedAuthority())).toMatchObject({
      started: false,
      failure: { reason: 'unknown-evidence' },
    })

    expect(beginTrainingSession(state, 'road-vehicle-theory', clock, trustedAuthority(LEARNER_ID))).toMatchObject({
      started: false,
      failure: { reason: 'self-authored-authority' },
    })
  })

  it('rejects completion if the external session authority changes', () => {
    const startAuthority = trustedAuthority('trainer-road-01')
    const state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    const clock = createInitialWorldClockState(WORLD_ID)
    const started = beginTrainingSession(state, 'road-vehicle-theory', clock, startAuthority)
    expect(started.started).toBe(true)
    if (!started.started) throw new Error('Road theory should start')

    const readyClock = worldClockFromMinuteOrdinal(WORLD_ID, started.session.readyAtMinuteOrdinal)
    expect(completeTrainingSession(
      started.state,
      started.session.sessionId,
      readyClock,
      trustedAuthority('different-trainer'),
    )).toMatchObject({
      completed: false,
      failure: { reason: 'authority-changed' },
    })
  })

  it('supports the full car evidence chain without auto-granting the CarOperation capability', () => {
    let state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    state = completeModule(state, 'road-vehicle-theory')
    state = completeModule(state, 'car-operation-practical')
    state = completeModule(state, 'car-operation-qualification')

    expect(state.evidence.learnedCapabilityIds).not.toContain('CarOperation')
    expect(evaluateCapabilityAcquisition(state.evidence, 'CarOperation')).toEqual({ eligible: true, blockers: [] })
  })

  it('records supervised road-delivery evidence once after earned CarOperation and prerequisite van practice', () => {
    let state = createCapabilityTrainingState(WORLD_ID, LEARNER_ID)
    state = completeModule(state, 'road-vehicle-theory')
    state = completeModule(state, 'car-operation-practical')
    state = completeModule(state, 'car-operation-qualification')

    const earnedCar = earnCapability(state.evidence, 'CarOperation')
    expect(earnedCar.earned).toBe(true)
    if (!earnedCar.earned) throw new Error('CarOperation should be earnable after governed evidence')
    state = { ...state, evidence: earnedCar.state }

    state = completeModule(state, 'van-cargo-practical')
    const authority = trustedAuthority()
    const clock = createInitialWorldClockState(WORLD_ID)
    const started = beginTrainingSession(state, 'road-delivery-supervised', clock, authority)
    expect(started.started).toBe(true)
    if (!started.started) throw new Error('Supervised road delivery should start')
    const readyClock = worldClockFromMinuteOrdinal(WORLD_ID, started.session.readyAtMinuteOrdinal)
    const completed = completeTrainingSession(started.state, started.session.sessionId, readyClock, authority)
    expect(completed.completed).toBe(true)
    if (!completed.completed) throw new Error('Supervised road delivery should complete')

    expect(completed.state.evidence.supervisedExperienceById['road-delivery-supervised']).toBe(1)
    const replay = completeTrainingSession(completed.state, started.session.sessionId, readyClock, authority)
    expect(replay.completed).toBe(true)
    if (!replay.completed) throw new Error('Supervised replay should succeed')
    expect(replay.state.evidence.supervisedExperienceById['road-delivery-supervised']).toBe(1)
  })
})
