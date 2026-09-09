import type {
  MissionDefinition,
  MissionDeliveryReference,
  MissionFailurePolicy,
} from './missionModel'
import { BRAILA_FIRST_HOUR_FACT_IDS } from './brailaFirstHourAuthoredRegistry'

export const BRAILA_ACT1_EARLY_ARC_ID = 'arc:braila:act1-early' as const
export const BRAILA_FAMILIAR_ROUTES_SESSION_ID = 'session:braila:act1:familiar-routes' as const
export const BRAILA_FAMILIAR_ROUTES_AUTHORED_REF = 'story:braila:act1:familiar-routes' as const

export const BRAILA_FAMILIAR_ROUTES_BEAT_IDS = Object.freeze({
  lessSupervision: 'beat:braila:act1:familiar-routes:less-supervision',
  mirelaRemembers: 'beat:braila:act1:familiar-routes:mirela-remembers',
  petruRecognizes: 'beat:braila:act1:familiar-routes:petru-recognizes',
  reliabilityPattern: 'beat:braila:act1:familiar-routes:reliability-pattern',
})

export const BRAILA_FAMILIAR_ROUTES_MISSION_IDS = Object.freeze({
  lessSupervision: 'mission:braila:act1:familiar-routes:less-supervision',
  mirelaRemembers: 'mission:braila:act1:familiar-routes:mirela-remembers',
  mirelaRepeatRoute: 'mission:braila:act1:familiar-routes:mirela-repeat-route',
  petruRepeatRoute: 'mission:braila:act1:familiar-routes:petru-repeat-route',
  reliabilityPattern: 'mission:braila:act1:familiar-routes:reliability-pattern',
})

export const BRAILA_FAMILIAR_ROUTES_FACT_IDS = Object.freeze({
  reducedSupervision: 'fact:braila:act1:ana:reduced-supervision',
  mirelaAfterClean: 'fact:mirela:repeat-contact:after-clean',
  mirelaAfterRecovered: 'fact:mirela:repeat-contact:after-recovered',
  mirelaAfterFailed: 'fact:mirela:repeat-contact:after-failed',
  mirelaFirstFailureRepaired: 'fact:mirela:relationship:first-failure-repaired',
  petruFirstRecognition: 'fact:petru:repeat-contact:first-recognition',
  reliabilityPatternRecognized: 'fact:braila:act1:reliability-pattern:recognized',
  sessionCompleted: 'fact:braila:act1:familiar-routes:completed',
})

export const BRAILA_FAMILIAR_ROUTES_SIGNALS = Object.freeze({
  lessSupervisionAcknowledged: 'braila-act1:familiar-routes:less-supervision-acknowledged',
  mirelaRepeatContactPresented: 'braila-act1:familiar-routes:mirela-repeat-contact-presented',
  petruRecognitionPresented: 'braila-act1:familiar-routes:petru-recognition-presented',
  reliabilityPatternPresented: 'braila-act1:familiar-routes:reliability-pattern-presented',
})

export type MirelaFirstServiceHistory = 'CLEAN' | 'RECOVERED' | 'FAILED'

export type FamiliarRoutesDeliveryRecovery =
  | { kind: 'Retry' }
  | { kind: 'DelayedSecondChance'; delayMinutes: number }

export interface FamiliarRoutesRepeatDeliveryBinding {
  actorId: string
  locationId: string
  delivery: MissionDeliveryReference
  recovery: FamiliarRoutesDeliveryRecovery
}

export interface BrailaAct1FamiliarRoutesBindings {
  /** Persisted World Instance narrative facts. This is read-only input to deterministic materialization. */
  persistedSemanticFactIds: readonly string[]
  dispatcherActorId: string
  dispatcherLocationId: string
  mirela: FamiliarRoutesRepeatDeliveryBinding
  /**
   * Read-only authority flag proving multiple legitimate work outcomes exist.
   * Narrative never increments or fabricates the underlying work-history count.
   */
  reliabilityEvidenceFlagId: string
  /** Optional repeated household work. Omitted unless Petru was actually met in persisted history. */
  petru?: FamiliarRoutesRepeatDeliveryBinding
}

export interface MirelaHistoryBranch {
  history: MirelaFirstServiceHistory
  sourceFactId: string
  continuationFactId: string
}

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const validDelay = (value: number): boolean => Number.isSafeInteger(value) && value > 0

const assertId = (value: string, label: string): void => {
  if (!validId(value)) throw new Error(`Invalid ${label}`)
}

const assertDeliveryReference = (value: MissionDeliveryReference, label: string): void => {
  assertId(value.deliveryMissionId, `${label}.deliveryMissionId`)
  assertId(value.orderId, `${label}.orderId`)
  if (value.parcelIds.length === 0 ||
    value.parcelIds.some(parcelId => !validId(parcelId)) ||
    new Set(value.parcelIds).size !== value.parcelIds.length) {
    throw new Error(`Invalid ${label}.parcelIds`)
  }
}

const failurePolicyFor = (recovery: FamiliarRoutesDeliveryRecovery): MissionFailurePolicy => {
  if (recovery.kind === 'Retry') return { kind: 'Retry', stageId: 'pickup' }
  if (!validDelay(recovery.delayMinutes)) throw new Error('Invalid delivery recovery delayMinutes')
  return { kind: 'DelayedSecondChance', delayMinutes: recovery.delayMinutes, stageId: 'pickup' }
}

const uniqueFacts = (facts: readonly string[]): ReadonlySet<string> => {
  if (facts.some(factId => !validId(factId))) throw new Error('Invalid persistedSemanticFactIds')
  return new Set(facts)
}

/**
 * Selects exactly one durable first-service history branch. Ambiguous or missing history is
 * rejected instead of guessing, because future authored consequences must be replay-stable.
 */
export const selectMirelaFirstServiceHistory = (
  persistedSemanticFactIds: readonly string[],
): MirelaHistoryBranch => {
  const facts = uniqueFacts(persistedSemanticFactIds)
  const branches: MirelaHistoryBranch[] = [
    {
      history: 'CLEAN' as const,
      sourceFactId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
      continuationFactId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaAfterClean,
    },
    {
      history: 'RECOVERED' as const,
      sourceFactId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered,
      continuationFactId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaAfterRecovered,
    },
    {
      history: 'FAILED' as const,
      sourceFactId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed,
      continuationFactId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaAfterFailed,
    },
  ].filter(branch => facts.has(branch.sourceFactId))

  if (branches.length !== 1) {
    throw new Error('Familiar Routes requires exactly one persisted Mirela first-service outcome')
  }
  return branches[0]
}

const validateRepeatBinding = (binding: FamiliarRoutesRepeatDeliveryBinding, label: string): void => {
  assertId(binding.actorId, `${label}.actorId`)
  assertId(binding.locationId, `${label}.locationId`)
  assertDeliveryReference(binding.delivery, `${label}.delivery`)
  failurePolicyFor(binding.recovery)
}

const validateBindings = (bindings: BrailaAct1FamiliarRoutesBindings): MirelaHistoryBranch => {
  const facts = uniqueFacts(bindings.persistedSemanticFactIds)
  if (!facts.has(BRAILA_FIRST_HOUR_FACT_IDS.firstDayCompleted)) {
    throw new Error('Familiar Routes requires persisted first-day completion')
  }
  assertId(bindings.dispatcherActorId, 'dispatcherActorId')
  assertId(bindings.dispatcherLocationId, 'dispatcherLocationId')
  assertId(bindings.reliabilityEvidenceFlagId, 'reliabilityEvidenceFlagId')
  validateRepeatBinding(bindings.mirela, 'mirela')
  if (bindings.petru) validateRepeatBinding(bindings.petru, 'petru')
  return selectMirelaFirstServiceHistory(bindings.persistedSemanticFactIds)
}

const buildLessSupervision = (
  bindings: BrailaAct1FamiliarRoutesBindings,
  history: MirelaHistoryBranch,
): MissionDefinition => ({
  missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision,
  arcId: BRAILA_ACT1_EARLY_ARC_ID,
  category: 'Employer',
  source: { kind: 'Authored', authoredRef: BRAILA_FAMILIAR_ROUTES_AUTHORED_REF },
  label: 'Familiar Routes — Less Supervision',
  prerequisites: [
    { kind: 'worldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.firstDayCompleted },
    { kind: 'worldFlag', flagId: history.sourceFactId },
    { kind: 'actorAvailable', actorId: bindings.dispatcherActorId },
    { kind: 'locationAvailable', locationId: bindings.dispatcherLocationId },
    { kind: 'orderStatus', orderId: bindings.mirela.delivery.orderId, status: 'Accepted' },
  ],
  availability: 'Prerequisites',
  startStageId: 'brief',
  stages: [{
    stageId: 'brief',
    label: 'Receive less-supervised work without receiving a promotion',
    objectives: [{
      objectiveId: 'less-supervision-acknowledged',
      kind: 'signal',
      signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.lessSupervisionAcknowledged,
      referenceId: bindings.dispatcherActorId,
      label: 'Acknowledge the legitimate available work and reduced instruction',
    }],
  }],
  completionConsequences: [{
    kind: 'WorldFlag',
    flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.reducedSupervision,
    value: true,
  }],
  unlocks: [{ missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers }],
  failurePolicy: { kind: 'Retry' },
})

const buildMirelaRemembers = (
  bindings: BrailaAct1FamiliarRoutesBindings,
  history: MirelaHistoryBranch,
): MissionDefinition => ({
  missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers,
  arcId: BRAILA_ACT1_EARLY_ARC_ID,
  category: 'Character',
  source: { kind: 'Authored', authoredRef: BRAILA_FAMILIAR_ROUTES_AUTHORED_REF },
  label: `Familiar Routes — Mirela Remembers (${history.history})`,
  prerequisites: [
    { kind: 'worldFlag', flagId: history.sourceFactId },
    { kind: 'actorAvailable', actorId: bindings.mirela.actorId },
    { kind: 'locationAvailable', locationId: bindings.mirela.locationId },
    { kind: 'orderStatus', orderId: bindings.mirela.delivery.orderId, status: 'Accepted' },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'recognition',
  stages: [{
    stageId: 'recognition',
    label: 'Present the repeat-contact variant selected from durable service history',
    objectives: [{
      objectiveId: 'mirela-repeat-contact-presented',
      kind: 'signal',
      signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.mirelaRepeatContactPresented,
      referenceId: bindings.mirela.actorId,
      label: 'Present Mirela’s deterministic remembered-history variant',
    }],
  }],
  completionConsequences: [{ kind: 'WorldFlag', flagId: history.continuationFactId, value: true }],
  unlocks: [{ missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute }],
  failurePolicy: { kind: 'Retry' },
})

const buildMirelaRepeatRoute = (
  bindings: BrailaAct1FamiliarRoutesBindings,
  history: MirelaHistoryBranch,
  nextMissionId: string,
): MissionDefinition => ({
  missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
  arcId: BRAILA_ACT1_EARLY_ARC_ID,
  category: 'Employer',
  source: { kind: 'Authored', authoredRef: BRAILA_FAMILIAR_ROUTES_AUTHORED_REF },
  label: 'Familiar Routes — Repeat Merchant Service',
  prerequisites: [
    { kind: 'orderStatus', orderId: bindings.mirela.delivery.orderId, status: 'Accepted' },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'pickup',
  stages: [
    {
      stageId: 'pickup',
      label: 'Take custody of the authoritative repeat-service parcel',
      objectives: [{
        objectiveId: 'mirela-repeat-pickup',
        kind: 'delivery',
        delivery: bindings.mirela.delivery,
        status: 'PickedUp',
        label: 'Pick up the exact parcel owned by the active order and logistics authority',
      }],
      next: { stageId: 'deliver' },
    },
    {
      stageId: 'deliver',
      label: 'Complete the real repeat service to Mirela',
      objectives: [{
        objectiveId: 'mirela-repeat-delivered',
        kind: 'delivery',
        delivery: bindings.mirela.delivery,
        status: 'Delivered',
        label: 'Complete the same authoritative DeliveryMission without copying cargo state',
      }],
    },
  ],
  completionConsequences: history.history === 'FAILED'
    ? [{ kind: 'WorldFlag', flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaFirstFailureRepaired, value: true }]
    : [],
  unlocks: [{ missionId: nextMissionId }],
  failurePolicy: failurePolicyFor(bindings.mirela.recovery),
})

const buildPetruRepeatRoute = (
  _bindings: BrailaAct1FamiliarRoutesBindings,
  petru: FamiliarRoutesRepeatDeliveryBinding,
): MissionDefinition => ({
  missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.petruRepeatRoute,
  arcId: BRAILA_ACT1_EARLY_ARC_ID,
  category: 'Character',
  source: { kind: 'Authored', authoredRef: BRAILA_FAMILIAR_ROUTES_AUTHORED_REF },
  label: 'Familiar Routes — Petru Recognizes the Route',
  prerequisites: [
    { kind: 'worldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.metPetru },
    { kind: 'actorAvailable', actorId: petru.actorId },
    { kind: 'locationAvailable', locationId: petru.locationId },
    { kind: 'orderStatus', orderId: petru.delivery.orderId, status: 'Accepted' },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'pickup',
  stages: [
    {
      stageId: 'pickup',
      label: 'Take custody of the real repeat household parcel',
      objectives: [{
        objectiveId: 'petru-repeat-pickup',
        kind: 'delivery',
        delivery: petru.delivery,
        status: 'PickedUp',
        label: 'Pick up the authoritative household parcel',
      }],
      next: { stageId: 'deliver' },
    },
    {
      stageId: 'deliver',
      label: 'Complete the real repeat household service',
      objectives: [{
        objectiveId: 'petru-repeat-delivered',
        kind: 'delivery',
        delivery: petru.delivery,
        status: 'Delivered',
        label: 'Complete the authoritative household DeliveryMission',
      }],
      next: { stageId: 'recognition' },
    },
    {
      stageId: 'recognition',
      label: 'Present neighborhood recognition only after real repeated service',
      objectives: [{
        objectiveId: 'petru-recognition-presented',
        kind: 'signal',
        signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.petruRecognitionPresented,
        referenceId: petru.actorId,
        label: 'Present Petru’s recognition after the authoritative handoff',
      }],
    },
  ],
  completionConsequences: [{
    kind: 'WorldFlag',
    flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.petruFirstRecognition,
    value: true,
  }],
  unlocks: [{ missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern }],
  failurePolicy: failurePolicyFor(petru.recovery),
})

const buildReliabilityPattern = (bindings: BrailaAct1FamiliarRoutesBindings): MissionDefinition => ({
  missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern,
  arcId: BRAILA_ACT1_EARLY_ARC_ID,
  category: 'Employer',
  source: { kind: 'Authored', authoredRef: BRAILA_FAMILIAR_ROUTES_AUTHORED_REF },
  label: 'Familiar Routes — Reliability Pattern',
  prerequisites: [
    { kind: 'worldFlag', flagId: bindings.reliabilityEvidenceFlagId },
    { kind: 'actorAvailable', actorId: bindings.dispatcherActorId },
    { kind: 'locationAvailable', locationId: bindings.dispatcherLocationId },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'recognize',
  stages: [{
    stageId: 'recognize',
    label: 'Recognize a real pattern rather than a single success',
    objectives: [{
      objectiveId: 'reliability-pattern-presented',
      kind: 'signal',
      signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.reliabilityPatternPresented,
      referenceId: bindings.dispatcherActorId,
      label: 'Present the authored reliability beat after external work-history evidence exists',
    }],
  }],
  completionConsequences: [
    {
      kind: 'WorldFlag',
      flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.reliabilityPatternRecognized,
      value: true,
    },
    {
      kind: 'WorldFlag',
      flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.sessionCompleted,
      value: true,
    },
  ],
  failurePolicy: { kind: 'Retry' },
})

/**
 * Materializes only Session One — Familiar Routes from the merged DT-08 early Act I canon.
 * Production/supply-demand hooks intentionally do not appear here because the first canonical
 * producer-pressure beat belongs to Session Two — Before the Parcel. This builder does not
 * pre-empt DT-07 authority by fabricating a systemic opportunity before canon requires one.
 */
export const buildBrailaAct1FamiliarRoutesMissionRegistry = (
  bindings: BrailaAct1FamiliarRoutesBindings,
): readonly MissionDefinition[] => {
  const history = validateBindings(bindings)
  const persistedFacts = uniqueFacts(bindings.persistedSemanticFactIds)
  const includePetru = bindings.petru !== undefined && persistedFacts.has(BRAILA_FIRST_HOUR_FACT_IDS.metPetru)
  const nextAfterMirela = includePetru
    ? BRAILA_FAMILIAR_ROUTES_MISSION_IDS.petruRepeatRoute
    : BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern

  const definitions: MissionDefinition[] = [
    buildLessSupervision(bindings, history),
    buildMirelaRemembers(bindings, history),
    buildMirelaRepeatRoute(bindings, history, nextAfterMirela),
  ]
  if (includePetru && bindings.petru) definitions.push(buildPetruRepeatRoute(bindings, bindings.petru))
  definitions.push(buildReliabilityPattern(bindings))
  return definitions
}
