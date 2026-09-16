import type { MissionDefinition, MissionDeliveryReference } from './missionModel'
import {
  BASIC_PERSONAL_SMARTPHONE_ASSET_ID,
} from '../economy/personalAssetOwnership'
import {
  RECOVERY_ARC_IDS,
  RECOVERY_FACT_IDS,
} from '../narrative/recoveryOpeningV2'
import {
  RECOVERY_PHONE_AUTHORED_REFS,
  RECOVERY_PHONE_FACT_IDS,
} from '../narrative/recoveryPhoneProgression'

export const RECOVERY_PHONE_MISSION_IDS = Object.freeze({
  noticeNeed: 'mission:recovery:founder-seed:notice-phone-need',
  buyFirstPhone: 'mission:recovery:founder-seed:buy-first-phone',
})

export const RECOVERY_PHONE_SIGNALS = Object.freeze({
  observeRetailerSystems: 'recovery-phone:observe-retailer-systems',
  visitRetailerToBuy: 'recovery-phone:visit-retailer-to-buy',
  personalAssetAcquired: 'personal-asset:acquired',
})

export interface RecoveryPhoneMissionBindings {
  phoneRetailerActorId: string
  phoneRetailerLocationId: string
  /** One of the already-legitimate early delivery events whose recipient context exposes phone/tracking use. */
  observationDelivery: MissionDeliveryReference
  basicPhoneAssetId?: string
}

const validId = (value: string): boolean => value.trim().length > 0 && value.length <= 180
const assertId = (value: string, label: string): void => {
  if (!validId(value)) throw new Error(`Invalid ${label}`)
}
const assertDelivery = (delivery: MissionDeliveryReference): void => {
  assertId(delivery.deliveryMissionId, 'observationDelivery.deliveryMissionId')
  assertId(delivery.orderId, 'observationDelivery.orderId')
  if (delivery.parcelIds.length === 0 || delivery.parcelIds.some(id => !validId(id))) {
    throw new Error('Invalid observationDelivery.parcelIds')
  }
}

export const buildRecoveryPhoneMissionBundle = (
  bindings: RecoveryPhoneMissionBindings,
): readonly MissionDefinition[] => {
  assertId(bindings.phoneRetailerActorId, 'phoneRetailerActorId')
  assertId(bindings.phoneRetailerLocationId, 'phoneRetailerLocationId')
  assertDelivery(bindings.observationDelivery)
  const phoneAssetId = bindings.basicPhoneAssetId ?? BASIC_PERSONAL_SMARTPHONE_ASSET_ID
  assertId(phoneAssetId, 'basicPhoneAssetId')

  const noticeNeed: MissionDefinition = {
    missionId: RECOVERY_PHONE_MISSION_IDS.noticeNeed,
    arcId: RECOVERY_ARC_IDS.founderSeed,
    category: 'Character',
    source: { kind: 'Authored', authoredRef: RECOVERY_PHONE_AUTHORED_REFS.needRealized },
    label: 'Everybody Is Connected',
    prerequisites: [
      { kind: 'actorAvailable', actorId: bindings.phoneRetailerActorId },
      { kind: 'locationAvailable', locationId: bindings.phoneRetailerLocationId },
    ],
    availability: 'Prerequisites',
    startStageId: 'complete-observation-delivery',
    stages: [
      {
        stageId: 'complete-observation-delivery',
        label: 'Complete the legitimate delivery to the phone/electronics retailer',
        objectives: [{
          objectiveId: 'phone-retailer-delivery-complete',
          kind: 'delivery',
          delivery: bindings.observationDelivery,
          status: 'Delivered',
          label: 'Deliver the parcel to the retailer',
        }],
        next: { stageId: 'observe-systems' },
      },
      {
        stageId: 'observe-systems',
        label: 'Notice how the shop tracks and confirms deliveries',
        objectives: [{
          objectiveId: 'observe-phone-tracking',
          kind: 'signal',
          signalType: RECOVERY_PHONE_SIGNALS.observeRetailerSystems,
          referenceId: bindings.phoneRetailerActorId,
          label: 'Observe the tracking and confirmation process',
        }],
      },
    ],
    completionConsequences: [
      { kind: 'WorldFlag', flagId: RECOVERY_PHONE_FACT_IDS.needRealized, value: true },
    ],
    failurePolicy: { kind: 'Retry', stageId: 'complete-observation-delivery' },
  }

  const buyFirstPhone: MissionDefinition = {
    missionId: RECOVERY_PHONE_MISSION_IDS.buyFirstPhone,
    arcId: RECOVERY_ARC_IDS.founderSeed,
    category: 'Economic',
    source: { kind: 'Authored', authoredRef: RECOVERY_PHONE_AUTHORED_REFS.firstPhonePurchased },
    label: 'My First Phone',
    prerequisites: [
      { kind: 'worldFlag', flagId: RECOVERY_PHONE_FACT_IDS.needRealized },
      { kind: 'worldFlag', flagId: RECOVERY_FACT_IDS.founderThoughtFormed },
      { kind: 'actorAvailable', actorId: bindings.phoneRetailerActorId },
      { kind: 'locationAvailable', locationId: bindings.phoneRetailerLocationId },
    ],
    availability: 'Prerequisites',
    startStageId: 'visit-retailer',
    stages: [
      {
        stageId: 'visit-retailer',
        label: 'Go back to the retailer when you can afford a basic phone',
        objectives: [{
          objectiveId: 'visit-retailer-to-buy',
          kind: 'signal',
          signalType: RECOVERY_PHONE_SIGNALS.visitRetailerToBuy,
          referenceId: bindings.phoneRetailerLocationId,
          label: 'Visit the phone retailer',
        }],
        next: { stageId: 'acquire-phone' },
      },
      {
        stageId: 'acquire-phone',
        label: 'Buy and physically receive a basic smartphone',
        objectives: [{
          objectiveId: 'first-phone-owned',
          kind: 'signal',
          signalType: RECOVERY_PHONE_SIGNALS.personalAssetAcquired,
          referenceId: phoneAssetId,
          label: 'Complete the legitimate personal purchase and receive the phone',
        }],
      },
    ],
    completionConsequences: [
      { kind: 'WorldFlag', flagId: RECOVERY_PHONE_FACT_IDS.firstPhonePurchased, value: true },
    ],
    failurePolicy: { kind: 'Retry', stageId: 'visit-retailer' },
  }

  return [noticeNeed, buyFirstPhone]
}
