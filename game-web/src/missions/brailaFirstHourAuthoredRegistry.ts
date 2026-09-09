import type {
  MissionDefinition,
  MissionDeliveryReference,
  MissionFailurePolicy,
  MissionRuntimeState,
} from './missionModel'

export const BRAILA_FIRST_DAY_ARC_ID = 'arc:braila:first-day' as const

export const BRAILA_FIRST_HOUR_MISSION_IDS = Object.freeze({
  placeToStart: 'mission:braila:first-day:a-place-to-start',
  firstStandard: 'mission:braila:first-day:the-first-standard',
  oneSmallThing: 'mission:braila:first-day:one-small-thing',
  personNotAddress: 'mission:braila:first-day:a-person-not-an-address',
  capacityChoice: 'mission:braila:first-day:capacity-has-a-cost',
  capacityProtectOutcome: 'mission:braila:first-day:capacity-protect-commitment',
  capacityAssistOutcome: 'mission:braila:first-day:capacity-assist-through-dispatch',
  firstConsequence: 'mission:braila:first-day:first-consequence',
  firstPay: 'mission:braila:first-day:first-pay-means-something',
  tomorrow: 'mission:braila:first-day:tomorrow-has-more-than-one-direction',
})

export const BRAILA_FIRST_HOUR_AUTHORED_REFS = Object.freeze({
  placeToStart: 'story:braila:first-day:a-place-to-start',
  firstStandard: 'story:braila:first-day:the-first-standard',
  oneSmallThing: 'story:braila:first-day:one-small-thing',
  personNotAddress: 'story:braila:first-day:a-person-not-an-address',
  capacityChoice: 'story:braila:first-day:capacity-has-a-cost',
  firstConsequence: 'story:braila:first-day:first-consequence',
  firstPay: 'story:braila:first-day:first-pay-means-something',
  tomorrow: 'story:braila:first-day:tomorrow-has-more-than-one-direction',
})

export const BRAILA_FIRST_HOUR_FACT_IDS = Object.freeze({
  metAna: 'fact:met:ana-stoica',
  metRadu: 'fact:met:radu-marin',
  metMirela: 'fact:met:mirela-stan',
  metPetru: 'fact:met:petru-neagu',
  oneSmallThingClean: 'fact:mirela:first-service:clean',
  oneSmallThingRecovered: 'fact:mirela:first-service:recovered',
  oneSmallThingFailed: 'fact:mirela:first-service:failed',
  capacityProtect: 'fact:braila:first-day:capacity-choice:protect-commitment',
  capacityAssist: 'fact:braila:first-day:capacity-choice:assist-through-dispatch',
  firstWageObserved: 'fact:braila:first-day:first-wage-observed',
  firstDayCompleted: 'fact:braila:first-day:completed',
})

export const BRAILA_FIRST_HOUR_CAPACITY_CHOICE = Object.freeze({
  choiceId: 'choice:braila:first-day:capacity-priority',
  protectCommitment: 'protect-commitment',
  assistThroughDispatch: 'assist-through-dispatch',
})

export const BRAILA_FIRST_HOUR_SIGNALS = Object.freeze({
  reportedForWork: 'braila-first-hour:reported-for-work',
  firstStandardAcknowledged: 'braila-first-hour:first-standard-acknowledged',
  actorMet: 'actor-met',
  capacityOutcomeConfirmed: 'braila-first-hour:capacity-outcome-confirmed',
  firstConsequencePresented: 'braila-first-hour:first-consequence-presented',
  wageSettlementObserved: 'braila-first-hour:wage-settlement-observed',
  careerHorizonSeen: 'braila-first-hour:career-horizon-seen',
})

export type OneSmallThingRecoveryContract =
  | { kind: 'Retry' }
  | { kind: 'DelayedSecondChance'; delayMinutes: number }
  | { kind: 'TerminalFailure' }

export interface FirstHourHouseholdAuthorityBinding {
  petruActorId: string
  petruLocationId: string
  delivery: MissionDeliveryReference
}

export interface FirstHourCapacityChoiceAuthorityBinding {
  /** Must mean that both canonical options are currently legitimate. */
  bothOptionsAvailableFlagId: string
  /** Real employer/dispatch authority required before the assist branch can settle. */
  assistDispatchAuthorizedFlagId: string
  protectConfirmationRef: string
  assistConfirmationRef: string
}

export interface FirstHourWageAuthorityBinding {
  /** Read-only fact projected by Player Economy after a real exactly-once settlement exists. */
  settledFlagId: string
  settlementRef: string
}

export interface BrailaFirstHourAuthoredBindings {
  /** External authority verifies the canonical employee-first opening context. */
  openingContextVerifiedFlagId: string
  dispatcherActorId: string
  dispatcherLocationId: string
  coworkerActorId: string
  coworkerLocationId: string
  mirelaActorId: string
  mirelaLocationId: string
  firstDelivery: MissionDeliveryReference
  firstDeliverySettlementRef: string
  oneSmallThingRecovery: OneSmallThingRecoveryContract
  /** Present only when a real communication mechanic can emit this event. */
  optionalCommunicationReferenceId?: string
  /** Omit when no authoritative household-service event exists yet. */
  household?: FirstHourHouseholdAuthorityBinding
  /** Omit unless both capacity options are legitimately available. */
  capacityChoice?: FirstHourCapacityChoiceAuthorityBinding
  /** Omit until Player Economy can expose real wage-settlement evidence. */
  firstWage?: FirstHourWageAuthorityBinding
}

export type OneSmallThingOutcome = 'PENDING' | 'CLEAN' | 'RECOVERED' | 'FAILED'

export interface OneSmallThingOutcomeClassification {
  outcome: OneSmallThingOutcome
  factId?: string
}

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const validDelay = (value: number): boolean => Number.isSafeInteger(value) && value >= 0

const assertId = (value: string, label: string): void => {
  if (!validId(value)) throw new Error(`Invalid ${label}`)
}

const assertDeliveryReference = (value: MissionDeliveryReference, label: string): void => {
  assertId(value.deliveryMissionId, `${label}.deliveryMissionId`)
  assertId(value.orderId, `${label}.orderId`)
  if (value.parcelIds.length === 0 || value.parcelIds.some(parcelId => !validId(parcelId)) ||
    new Set(value.parcelIds).size !== value.parcelIds.length) {
    throw new Error(`Invalid ${label}.parcelIds`)
  }
}

const failurePolicyFor = (
  contract: OneSmallThingRecoveryContract,
  terminalContinuationMissionId?: string,
): MissionFailurePolicy => {
  switch (contract.kind) {
    case 'Retry':
      return { kind: 'Retry', stageId: 'pickup' }
    case 'DelayedSecondChance':
      if (!validDelay(contract.delayMinutes)) throw new Error('Invalid oneSmallThingRecovery.delayMinutes')
      return { kind: 'DelayedSecondChance', delayMinutes: contract.delayMinutes, stageId: 'pickup' }
    case 'TerminalFailure': {
      const unlockMissionIds: string[] = [BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence]
      if (terminalContinuationMissionId && !unlockMissionIds.includes(terminalContinuationMissionId)) {
        unlockMissionIds.push(terminalContinuationMissionId)
      }
      return {
        kind: 'FailedBranch',
        unlocks: unlockMissionIds.map(missionId => ({ missionId })),
      }
    }
  }
}

const validateBindings = (bindings: BrailaFirstHourAuthoredBindings): void => {
  assertId(bindings.openingContextVerifiedFlagId, 'openingContextVerifiedFlagId')
  assertId(bindings.dispatcherActorId, 'dispatcherActorId')
  assertId(bindings.dispatcherLocationId, 'dispatcherLocationId')
  assertId(bindings.coworkerActorId, 'coworkerActorId')
  assertId(bindings.coworkerLocationId, 'coworkerLocationId')
  assertId(bindings.mirelaActorId, 'mirelaActorId')
  assertId(bindings.mirelaLocationId, 'mirelaLocationId')
  assertDeliveryReference(bindings.firstDelivery, 'firstDelivery')
  assertId(bindings.firstDeliverySettlementRef, 'firstDeliverySettlementRef')
  if (bindings.optionalCommunicationReferenceId !== undefined) {
    assertId(bindings.optionalCommunicationReferenceId, 'optionalCommunicationReferenceId')
  }
  if (bindings.household) {
    assertId(bindings.household.petruActorId, 'household.petruActorId')
    assertId(bindings.household.petruLocationId, 'household.petruLocationId')
    assertDeliveryReference(bindings.household.delivery, 'household.delivery')
  }
  if (bindings.capacityChoice) {
    assertId(bindings.capacityChoice.bothOptionsAvailableFlagId, 'capacityChoice.bothOptionsAvailableFlagId')
    assertId(bindings.capacityChoice.assistDispatchAuthorizedFlagId, 'capacityChoice.assistDispatchAuthorizedFlagId')
    assertId(bindings.capacityChoice.protectConfirmationRef, 'capacityChoice.protectConfirmationRef')
    assertId(bindings.capacityChoice.assistConfirmationRef, 'capacityChoice.assistConfirmationRef')
  }
  if (bindings.firstWage) {
    assertId(bindings.firstWage.settledFlagId, 'firstWage.settledFlagId')
    assertId(bindings.firstWage.settlementRef, 'firstWage.settlementRef')
  }
  failurePolicyFor(bindings.oneSmallThingRecovery)
}

const normalMissionAfterOneSmallThing = (bindings: BrailaFirstHourAuthoredBindings): string =>
  bindings.household
    ? BRAILA_FIRST_HOUR_MISSION_IDS.personNotAddress
    : bindings.capacityChoice
      ? BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice
      : BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence

const missionAfterHousehold = (bindings: BrailaFirstHourAuthoredBindings): string =>
  bindings.capacityChoice
    ? BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice
    : BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence

const buildPlaceToStart = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition => ({
  missionId: BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart,
  arcId: BRAILA_FIRST_DAY_ARC_ID,
  category: 'Employer',
  source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.placeToStart },
  label: 'A Place to Start',
  prerequisites: [
    { kind: 'worldFlag', flagId: bindings.openingContextVerifiedFlagId },
    { kind: 'actorAvailable', actorId: bindings.dispatcherActorId },
    { kind: 'locationAvailable', locationId: bindings.dispatcherLocationId },
  ],
  availability: 'Prerequisites',
  startStageId: 'report-for-work',
  stages: [{
    stageId: 'report-for-work',
    label: 'Report for the first shift',
    objectives: [{
      objectiveId: 'report-for-work',
      kind: 'signal',
      signalType: BRAILA_FIRST_HOUR_SIGNALS.reportedForWork,
      referenceId: bindings.dispatcherActorId,
      label: 'Report to dispatch at Station Commons through the real world interaction',
    }],
  }],
  completionConsequences: [{ kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.metAna, value: true }],
  unlocks: [{ missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard }],
  failurePolicy: { kind: 'Retry' },
})

const buildFirstStandard = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition => ({
  missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard,
  arcId: BRAILA_FIRST_DAY_ARC_ID,
  category: 'Employer',
  source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard },
  label: 'The First Standard',
  prerequisites: [
    { kind: 'actorAvailable', actorId: bindings.dispatcherActorId },
    { kind: 'actorAvailable', actorId: bindings.coworkerActorId },
    { kind: 'locationAvailable', locationId: bindings.coworkerLocationId },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'standard',
  stages: [
    {
      stageId: 'standard',
      label: 'Understand the first professional standard',
      objectives: [{
        objectiveId: 'first-standard-acknowledged',
        kind: 'signal',
        signalType: BRAILA_FIRST_HOUR_SIGNALS.firstStandardAcknowledged,
        referenceId: bindings.dispatcherActorId,
        label: 'Acknowledge the real custody and reliability standard',
      }],
      next: { stageId: 'meet-radu' },
    },
    {
      stageId: 'meet-radu',
      label: 'Meet a coworker who is also starting small',
      objectives: [{
        objectiveId: 'meet-radu',
        kind: 'signal',
        signalType: BRAILA_FIRST_HOUR_SIGNALS.actorMet,
        referenceId: bindings.coworkerActorId,
        label: 'Meet Radu through the world interaction authority',
      }],
    },
  ],
  completionConsequences: [{ kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.metRadu, value: true }],
  unlocks: [{ missionId: BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing }],
  failurePolicy: { kind: 'Retry' },
})

const buildOneSmallThing = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition => ({
  missionId: BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
  arcId: BRAILA_FIRST_DAY_ARC_ID,
  category: 'Employer',
  source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.oneSmallThing },
  label: 'One Small Thing',
  prerequisites: [
    { kind: 'actorAvailable', actorId: bindings.mirelaActorId },
    { kind: 'locationAvailable', locationId: bindings.mirelaLocationId },
    { kind: 'orderStatus', orderId: bindings.firstDelivery.orderId, status: 'Accepted' },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'pickup',
  stages: [
    {
      stageId: 'pickup',
      label: 'Take custody of the real assigned cargo',
      objectives: [{
        objectiveId: 'one-small-thing-pickup',
        kind: 'delivery',
        delivery: bindings.firstDelivery,
        status: 'PickedUp',
        label: 'Pick up the authoritative parcel assigned to Mirela’s order',
      }],
      next: { stageId: 'deliver' },
    },
    {
      stageId: 'deliver',
      label: 'Deliver the real business need to Mirela',
      objectives: [
        {
          objectiveId: 'one-small-thing-delivered',
          kind: 'delivery',
          delivery: bindings.firstDelivery,
          status: 'Delivered',
          label: 'Complete the authoritative delivery and custody handoff',
        },
        ...(bindings.optionalCommunicationReferenceId
          ? [{
              objectiveId: 'one-small-thing-communication',
              kind: 'signal' as const,
              signalType: 'braila-first-hour:customer-communication-recorded',
              referenceId: bindings.optionalCommunicationReferenceId,
              label: 'Optional: communicate through the real supported customer channel',
              optional: true,
            }]
          : []),
      ],
    },
  ],
  completionConsequences: [
    { kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.metMirela, value: true },
    { kind: 'EconomicSettlementReference', settlementRef: bindings.firstDeliverySettlementRef },
  ],
  unlocks: [{ missionId: normalMissionAfterOneSmallThing(bindings) }],
  failurePolicy: failurePolicyFor(
    bindings.oneSmallThingRecovery,
    normalMissionAfterOneSmallThing(bindings),
  ),
})

const buildHouseholdMission = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition | undefined => {
  const household = bindings.household
  if (!household) return undefined
  return {
    missionId: BRAILA_FIRST_HOUR_MISSION_IDS.personNotAddress,
    arcId: BRAILA_FIRST_DAY_ARC_ID,
    category: 'Character',
    source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.personNotAddress },
    label: 'A Person, Not an Address',
    prerequisites: [
      { kind: 'actorAvailable', actorId: household.petruActorId },
      { kind: 'locationAvailable', locationId: household.petruLocationId },
      { kind: 'orderStatus', orderId: household.delivery.orderId, status: 'Accepted' },
    ],
    availability: 'ExplicitUnlock',
    startStageId: 'pickup',
    stages: [
      {
        stageId: 'pickup',
        label: 'Take custody of the household delivery',
        objectives: [{
          objectiveId: 'household-pickup',
          kind: 'delivery',
          delivery: household.delivery,
          status: 'PickedUp',
          label: 'Pick up the authoritative household parcel',
        }],
        next: { stageId: 'deliver' },
      },
      {
        stageId: 'deliver',
        label: 'Complete the household handoff',
        objectives: [{
          objectiveId: 'household-delivered',
          kind: 'delivery',
          delivery: household.delivery,
          status: 'Delivered',
          label: 'Hand the real parcel to Petru through the logistics authority',
        }],
      },
    ],
    completionConsequences: [{ kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.metPetru, value: true }],
    unlocks: [{ missionId: missionAfterHousehold(bindings) }],
    failurePolicy: { kind: 'Retry', stageId: 'pickup' },
  }
}

const buildCapacityMissions = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition[] => {
  const capacity = bindings.capacityChoice
  if (!capacity) return []
  const firstConsequenceId = BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence
  return [
    {
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice,
      arcId: BRAILA_FIRST_DAY_ARC_ID,
      category: 'Character',
      source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.capacityChoice },
      label: 'Capacity Has a Cost',
      prerequisites: [{ kind: 'worldFlag', flagId: capacity.bothOptionsAvailableFlagId }],
      availability: 'ExplicitUnlock',
      startStageId: 'choose',
      stages: [{
        stageId: 'choose',
        label: 'Choose only between legitimate work options',
        objectives: [{
          objectiveId: 'capacity-priority-choice',
          kind: 'choice',
          choiceId: BRAILA_FIRST_HOUR_CAPACITY_CHOICE.choiceId,
          options: [
            BRAILA_FIRST_HOUR_CAPACITY_CHOICE.protectCommitment,
            BRAILA_FIRST_HOUR_CAPACITY_CHOICE.assistThroughDispatch,
          ],
          label: 'Choose how to use finite Work Capacity',
        }],
      }],
      completionConsequences: [],
      unlocks: [
        {
          missionId: BRAILA_FIRST_HOUR_MISSION_IDS.capacityProtectOutcome,
          choiceId: BRAILA_FIRST_HOUR_CAPACITY_CHOICE.choiceId,
          optionId: BRAILA_FIRST_HOUR_CAPACITY_CHOICE.protectCommitment,
        },
        {
          missionId: BRAILA_FIRST_HOUR_MISSION_IDS.capacityAssistOutcome,
          choiceId: BRAILA_FIRST_HOUR_CAPACITY_CHOICE.choiceId,
          optionId: BRAILA_FIRST_HOUR_CAPACITY_CHOICE.assistThroughDispatch,
        },
      ],
      failurePolicy: { kind: 'Retry' },
    },
    {
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.capacityProtectOutcome,
      arcId: BRAILA_FIRST_DAY_ARC_ID,
      category: 'Employer',
      source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.capacityChoice },
      label: 'Protect the Commitment',
      prerequisites: [],
      availability: 'ExplicitUnlock',
      startStageId: 'confirm',
      stages: [{
        stageId: 'confirm',
        label: 'Keep the work already accepted reliable',
        objectives: [{
          objectiveId: 'protect-confirmed',
          kind: 'signal',
          signalType: BRAILA_FIRST_HOUR_SIGNALS.capacityOutcomeConfirmed,
          referenceId: capacity.protectConfirmationRef,
          label: 'Confirm the existing commitment through real work state',
        }],
      }],
      completionConsequences: [{ kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.capacityProtect, value: true }],
      unlocks: [{ missionId: firstConsequenceId }],
      failurePolicy: { kind: 'Retry' },
    },
    {
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.capacityAssistOutcome,
      arcId: BRAILA_FIRST_DAY_ARC_ID,
      category: 'Employer',
      source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.capacityChoice },
      label: 'Assist Through Dispatch',
      prerequisites: [{ kind: 'worldFlag', flagId: capacity.assistDispatchAuthorizedFlagId }],
      availability: 'ExplicitUnlock',
      startStageId: 'confirm',
      stages: [{
        stageId: 'confirm',
        label: 'Help only through legitimate employer authority',
        objectives: [{
          objectiveId: 'assist-confirmed',
          kind: 'signal',
          signalType: BRAILA_FIRST_HOUR_SIGNALS.capacityOutcomeConfirmed,
          referenceId: capacity.assistConfirmationRef,
          label: 'Confirm the additional work through dispatch authority',
        }],
      }],
      completionConsequences: [{ kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.capacityAssist, value: true }],
      unlocks: [{ missionId: firstConsequenceId }],
      failurePolicy: { kind: 'Retry' },
    },
  ]
}

const buildFirstConsequence = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition => ({
  missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence,
  arcId: BRAILA_FIRST_DAY_ARC_ID,
  category: 'Employer',
  source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence },
  label: 'First Consequence',
  prerequisites: [
    { kind: 'actorAvailable', actorId: bindings.dispatcherActorId },
    { kind: 'locationAvailable', locationId: bindings.dispatcherLocationId },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'remember',
  stages: [{
    stageId: 'remember',
    label: 'Present the consequence of real work history',
    objectives: [{
      objectiveId: 'first-consequence-presented',
      kind: 'signal',
      signalType: BRAILA_FIRST_HOUR_SIGNALS.firstConsequencePresented,
      label: 'Present the consequence selected from authoritative first-shift history',
    }],
  }],
  completionConsequences: [],
  failurePolicy: { kind: 'Retry' },
})

const buildFirstPay = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition | undefined => {
  const firstWage = bindings.firstWage
  if (!firstWage) return undefined
  return {
    missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstPay,
    arcId: BRAILA_FIRST_DAY_ARC_ID,
    category: 'Career',
    source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstPay },
    label: 'First Pay Means Something',
    prerequisites: [{ kind: 'worldFlag', flagId: firstWage.settledFlagId }],
    availability: 'Prerequisites',
    startStageId: 'observe',
    stages: [{
      stageId: 'observe',
      label: 'Observe the real wage settlement',
      objectives: [{
        objectiveId: 'first-wage-observed',
        kind: 'signal',
        signalType: BRAILA_FIRST_HOUR_SIGNALS.wageSettlementObserved,
        referenceId: firstWage.settlementRef,
        label: 'Acknowledge the already-settled Player Economy result',
      }],
    }],
    completionConsequences: [{ kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.firstWageObserved, value: true }],
    failurePolicy: { kind: 'Retry' },
  }
}

const buildTomorrow = (bindings: BrailaFirstHourAuthoredBindings): MissionDefinition => ({
  missionId: BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow,
  arcId: BRAILA_FIRST_DAY_ARC_ID,
  category: 'Career',
  source: { kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.tomorrow },
  label: 'Tomorrow Has More Than One Direction',
  prerequisites: [
    { kind: 'missionCompleted', missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence },
    ...(bindings.household
      ? [{ kind: 'missionCompleted' as const, missionId: BRAILA_FIRST_HOUR_MISSION_IDS.personNotAddress }]
      : []),
    { kind: 'actorAvailable', actorId: bindings.dispatcherActorId },
    { kind: 'actorAvailable', actorId: bindings.coworkerActorId },
  ],
  availability: 'Prerequisites',
  startStageId: 'horizon',
  stages: [{
    stageId: 'horizon',
    label: 'See that reliability and capability create future options',
    objectives: [{
      objectiveId: 'career-horizon-seen',
      kind: 'signal',
      signalType: BRAILA_FIRST_HOUR_SIGNALS.careerHorizonSeen,
      label: 'See the next legitimate career horizon without granting it automatically',
    }],
  }],
  completionConsequences: [{ kind: 'WorldFlag', flagId: BRAILA_FIRST_HOUR_FACT_IDS.firstDayCompleted, value: true }],
  failurePolicy: { kind: 'Retry' },
})

/**
 * Materializes the merged DT-08 first-hour authored canon as MissionDefinition data.
 * All runtime authority is supplied by bindings. No item, amount, qualification,
 * employer ownership, cargo or inventory state is invented in this registry.
 */
export const buildBrailaFirstHourAuthoredMissionRegistry = (
  bindings: BrailaFirstHourAuthoredBindings,
): readonly MissionDefinition[] => {
  validateBindings(bindings)
  const missions: MissionDefinition[] = [
    buildPlaceToStart(bindings),
    buildFirstStandard(bindings),
    buildOneSmallThing(bindings),
  ]
  const household = buildHouseholdMission(bindings)
  if (household) missions.push(household)
  missions.push(...buildCapacityMissions(bindings))
  missions.push(buildFirstConsequence(bindings))
  const firstPay = buildFirstPay(bindings)
  if (firstPay) missions.push(firstPay)
  missions.push(buildTomorrow(bindings))
  return missions
}

/**
 * Derives the canonical One Small Thing narrative class strictly from mission history.
 * The caller may persist the returned canonical fact through its World Instance/narrative
 * authority; this helper does not create a second fact store.
 */
export const classifyOneSmallThingOutcome = (
  state: MissionRuntimeState,
): OneSmallThingOutcomeClassification => {
  const instance = state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing]
  if (!instance) return { outcome: 'PENDING' }
  if (instance.status === 'Completed') {
    return instance.failureCount > 0
      ? { outcome: 'RECOVERED', factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered }
      : { outcome: 'CLEAN', factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean }
  }
  if (instance.status === 'Failed') {
    return { outcome: 'FAILED', factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed }
  }
  return { outcome: 'PENDING' }
}
