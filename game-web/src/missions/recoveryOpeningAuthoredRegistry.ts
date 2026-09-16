import type { MissionDefinition, MissionDeliveryReference } from './missionModel'
import {
  RECOVERY_ARC_IDS,
  RECOVERY_AUTHORED_REFS,
  RECOVERY_FACT_IDS,
} from '../narrative/recoveryOpeningV2'

export const RECOVERY_OPENING_MISSION_IDS = Object.freeze({
  riseAndSearch: 'mission:recovery:origin:rise-and-search',
  mariaTest: 'mission:recovery:origin:maria-test',
  mariaReturn: 'mission:recovery:origin:maria-return',
  mariaTrialChain: 'mission:recovery:origin:maria-trial-chain',
  supplierIntroduction: 'mission:recovery:origin:supplier-introduction',
})

export const RECOVERY_OPENING_SIGNALS = Object.freeze({
  searchStarted: 'recovery-opening:search-started',
  enteredMariaShop: 'recovery-opening:entered-maria-shop',
  mariaTestAccepted: 'recovery-opening:maria-test-accepted',
  returnedToMaria: 'recovery-opening:returned-to-maria',
  supplierMet: 'recovery-opening:supplier-met',
})

export interface RecoveryOpeningAuthoredBindings {
  freshRecoveryOpeningFlagId: string
  mariaActorId: string
  mariaShopLocationId: string
  firstDelivery: MissionDeliveryReference
  firstDeliverySettlementRef: string
  /** Optional authoritative settlement/inventory reference for food/apples on first return. */
  firstReturnFoodSettlementRef?: string
  /** Brăila-authored trial chain: five legitimate, already-governed delivery references. */
  mariaTrialDeliveries: readonly MissionDeliveryReference[]
  mariaTrialSettlementRefs: readonly string[]
  supplierActorId: string
  supplierLocationId: string
}

const validId = (value: string): boolean => value.trim().length > 0 && value.length <= 180

const assertId = (value: string, label: string): void => {
  if (!validId(value)) throw new Error(`Invalid ${label}`)
}

const assertDelivery = (delivery: MissionDeliveryReference, label: string): void => {
  assertId(delivery.deliveryMissionId, `${label}.deliveryMissionId`)
  assertId(delivery.orderId, `${label}.orderId`)
  if (delivery.parcelIds.length === 0 || delivery.parcelIds.some(parcelId => !validId(parcelId))) {
    throw new Error(`Invalid ${label}.parcelIds`)
  }
  if (new Set(delivery.parcelIds).size !== delivery.parcelIds.length) {
    throw new Error(`Duplicate ${label}.parcelIds`)
  }
}

const validateBindings = (bindings: RecoveryOpeningAuthoredBindings): void => {
  assertId(bindings.freshRecoveryOpeningFlagId, 'freshRecoveryOpeningFlagId')
  assertId(bindings.mariaActorId, 'mariaActorId')
  assertId(bindings.mariaShopLocationId, 'mariaShopLocationId')
  assertDelivery(bindings.firstDelivery, 'firstDelivery')
  assertId(bindings.firstDeliverySettlementRef, 'firstDeliverySettlementRef')
  if (bindings.firstReturnFoodSettlementRef !== undefined) assertId(bindings.firstReturnFoodSettlementRef, 'firstReturnFoodSettlementRef')
  if (bindings.mariaTrialDeliveries.length !== 5) {
    throw new Error('Brăila Maria trial chain requires exactly five governed deliveries')
  }
  if (bindings.mariaTrialSettlementRefs.length !== bindings.mariaTrialDeliveries.length) {
    throw new Error('mariaTrialSettlementRefs must match mariaTrialDeliveries length')
  }
  bindings.mariaTrialDeliveries.forEach((delivery, index) => assertDelivery(delivery, `mariaTrialDeliveries[${index}]`))
  bindings.mariaTrialSettlementRefs.forEach((settlementRef, index) => assertId(settlementRef, `mariaTrialSettlementRefs[${index}]`))
  assertId(bindings.supplierActorId, 'supplierActorId')
  assertId(bindings.supplierLocationId, 'supplierLocationId')
}

const riseAndSearchMission = (bindings: RecoveryOpeningAuthoredBindings): MissionDefinition => ({
  missionId: RECOVERY_OPENING_MISSION_IDS.riseAndSearch,
  arcId: RECOVERY_ARC_IDS.origin,
  category: 'CampaignStory',
  source: { kind: 'Authored', authoredRef: RECOVERY_AUTHORED_REFS.rise },
  label: 'Get Up and Look for Work',
  prerequisites: [{ kind: 'worldFlag', flagId: bindings.freshRecoveryOpeningFlagId }],
  availability: 'Prerequisites',
  startStageId: 'rise',
  stages: [
    {
      stageId: 'rise',
      label: 'Get up and decide to keep going',
      objectives: [{
        objectiveId: 'begin-search',
        kind: 'signal',
        signalType: RECOVERY_OPENING_SIGNALS.searchStarted,
        label: 'Walk the streets and look for work opportunities',
      }],
    },
  ],
  completionConsequences: [
    { kind: 'WorldFlag', flagId: RECOVERY_FACT_IDS.prologueSeen, value: true },
    { kind: 'WorldFlag', flagId: RECOVERY_FACT_IDS.workSearchStarted, value: true },
  ],
  unlocks: [{ missionId: RECOVERY_OPENING_MISSION_IDS.mariaTest }],
  failurePolicy: { kind: 'Retry' },
})

const mariaTestMission = (bindings: RecoveryOpeningAuthoredBindings): MissionDefinition => ({
  missionId: RECOVERY_OPENING_MISSION_IDS.mariaTest,
  arcId: RECOVERY_ARC_IDS.origin,
  category: 'Character',
  source: { kind: 'Authored', authoredRef: RECOVERY_AUTHORED_REFS.merchantTest },
  label: "Maria's First Test",
  prerequisites: [
    { kind: 'actorAvailable', actorId: bindings.mariaActorId },
    { kind: 'locationAvailable', locationId: bindings.mariaShopLocationId },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'enter-shop',
  stages: [
    {
      stageId: 'enter-shop',
      label: "Enter Maria's shop and ask for work",
      objectives: [{
        objectiveId: 'enter-maria-shop',
        kind: 'signal',
        signalType: RECOVERY_OPENING_SIGNALS.enteredMariaShop,
        referenceId: bindings.mariaShopLocationId,
        label: "Enter Maria's shop",
      }],
      next: { stageId: 'accept-test' },
    },
    {
      stageId: 'accept-test',
      label: 'Accept one delivery as a test',
      objectives: [{
        objectiveId: 'accept-maria-test',
        kind: 'signal',
        signalType: RECOVERY_OPENING_SIGNALS.mariaTestAccepted,
        referenceId: bindings.mariaActorId,
        label: "Accept Maria's test delivery",
      }],
      next: { stageId: 'pickup' },
    },
    {
      stageId: 'pickup',
      label: 'Take custody of the parcel',
      objectives: [{
        objectiveId: 'pickup-first-delivery',
        kind: 'delivery',
        delivery: bindings.firstDelivery,
        status: 'PickedUp',
        label: 'Receive the parcel visibly from Maria',
      }],
      next: { stageId: 'deliver' },
    },
    {
      stageId: 'deliver',
      label: 'Complete the test delivery',
      objectives: [{
        objectiveId: 'deliver-first-delivery',
        kind: 'delivery',
        delivery: bindings.firstDelivery,
        status: 'Delivered',
        label: 'Deliver the parcel to the legitimate recipient',
      }],
    },
  ],
  completionConsequences: [
    { kind: 'WorldFlag', flagId: RECOVERY_FACT_IDS.metMaria, value: true },
    { kind: 'WorldFlag', flagId: RECOVERY_FACT_IDS.mariaTestCompleted, value: true },
    { kind: 'EconomicSettlementReference', settlementRef: bindings.firstDeliverySettlementRef },
  ],
  unlocks: [{ missionId: RECOVERY_OPENING_MISSION_IDS.mariaReturn }],
  failurePolicy: { kind: 'Retry', stageId: 'pickup' },
})

const mariaReturnMission = (bindings: RecoveryOpeningAuthoredBindings): MissionDefinition => ({
  missionId: RECOVERY_OPENING_MISSION_IDS.mariaReturn,
  arcId: RECOVERY_ARC_IDS.origin,
  category: 'Character',
  source: { kind: 'Authored', authoredRef: RECOVERY_AUTHORED_REFS.firstReturn },
  label: 'Return to Maria',
  prerequisites: [
    { kind: 'actorAvailable', actorId: bindings.mariaActorId },
    { kind: 'locationAvailable', locationId: bindings.mariaShopLocationId },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'return',
  stages: [{
    stageId: 'return',
    label: 'Return to Maria after the first delivery',
    objectives: [{
      objectiveId: 'return-to-maria',
      kind: 'signal',
      signalType: RECOVERY_OPENING_SIGNALS.returnedToMaria,
      referenceId: bindings.mariaActorId,
      label: 'Return to Maria and report the completed delivery',
    }],
  }],
  completionConsequences: [
    { kind: 'WorldFlag', flagId: RECOVERY_FACT_IDS.mariaFirstReturnCompleted, value: true },
    ...(bindings.firstReturnFoodSettlementRef
      ? [{ kind: 'EconomicSettlementReference' as const, settlementRef: bindings.firstReturnFoodSettlementRef }]
      : []),
  ],
  unlocks: [{ missionId: RECOVERY_OPENING_MISSION_IDS.mariaTrialChain }],
  failurePolicy: { kind: 'Retry' },
})

const mariaTrialChainMission = (bindings: RecoveryOpeningAuthoredBindings): MissionDefinition => ({
  missionId: RECOVERY_OPENING_MISSION_IDS.mariaTrialChain,
  arcId: RECOVERY_ARC_IDS.origin,
  category: 'Character',
  source: { kind: 'Authored', authoredRef: RECOVERY_AUTHORED_REFS.merchantTrialChain },
  label: "Maria's Five Deliveries",
  prerequisites: [
    { kind: 'actorAvailable', actorId: bindings.mariaActorId },
    { kind: 'locationAvailable', locationId: bindings.mariaShopLocationId },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'trial-deliveries',
  stages: [{
    stageId: 'trial-deliveries',
    label: 'Complete five legitimate deliveries for Maria',
    objectives: bindings.mariaTrialDeliveries.map((delivery, index) => ({
      objectiveId: `maria-trial-delivery-${index + 1}`,
      kind: 'delivery' as const,
      delivery,
      status: 'Delivered' as const,
      label: `Complete Maria delivery ${index + 1} of 5`,
    })),
  }],
  completionConsequences: [
    { kind: 'WorldFlag', flagId: RECOVERY_FACT_IDS.mariaTrialCompleted, value: true },
    { kind: 'WorldFlag', flagId: RECOVERY_FACT_IDS.supplierIntroductionEarned, value: true },
    ...bindings.mariaTrialSettlementRefs.map(settlementRef => ({
      kind: 'EconomicSettlementReference' as const,
      settlementRef,
    })),
  ],
  unlocks: [{ missionId: RECOVERY_OPENING_MISSION_IDS.supplierIntroduction }],
  failurePolicy: { kind: 'Retry', stageId: 'trial-deliveries' },
})

const supplierIntroductionMission = (bindings: RecoveryOpeningAuthoredBindings): MissionDefinition => ({
  missionId: RECOVERY_OPENING_MISSION_IDS.supplierIntroduction,
  arcId: RECOVERY_ARC_IDS.origin,
  category: 'ProducerSupplyChain',
  source: { kind: 'Authored', authoredRef: RECOVERY_AUTHORED_REFS.supplierIntroduction },
  label: "Maria's Recommendation",
  prerequisites: [
    { kind: 'actorAvailable', actorId: bindings.supplierActorId },
    { kind: 'locationAvailable', locationId: bindings.supplierLocationId },
  ],
  availability: 'ExplicitUnlock',
  startStageId: 'meet-supplier',
  stages: [{
    stageId: 'meet-supplier',
    label: 'Meet the local supplier Maria recommended',
    objectives: [{
      objectiveId: 'meet-supplier',
      kind: 'signal',
      signalType: RECOVERY_OPENING_SIGNALS.supplierMet,
      referenceId: bindings.supplierActorId,
      label: 'Speak with the supplier about legitimate work opportunities',
    }],
  }],
  completionConsequences: [],
  failurePolicy: { kind: 'Retry' },
})

export const buildRecoveryOpeningMissionBundle = (
  bindings: RecoveryOpeningAuthoredBindings,
): readonly MissionDefinition[] => {
  validateBindings(bindings)
  return [
    riseAndSearchMission(bindings),
    mariaTestMission(bindings),
    mariaReturnMission(bindings),
    mariaTrialChainMission(bindings),
    supplierIntroductionMission(bindings),
  ]
}
