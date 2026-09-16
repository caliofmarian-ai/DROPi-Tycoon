import {
  NARRATIVE_PRESENTATION_VERSION,
  type NarrativePresentationSequence,
} from './visualStorytelling'
import {
  RECOVERY_ARC_IDS,
  RECOVERY_BEAT_IDS,
  RECOVERY_FACT_IDS,
  type RecoveryPresentationAuthority,
} from './recoveryOpeningV2'

export const RECOVERY_PHONE_BEAT_IDS = Object.freeze({
  needRealized: 'beat:recovery:founder-seed:phone-need-realized',
  firstPhonePurchased: 'beat:recovery:founder-seed:first-phone-purchased',
  businessAppsAwaken: 'beat:recovery:founder-seed:business-apps-awaken',
})

export const RECOVERY_PHONE_AUTHORED_REFS = Object.freeze({
  needRealized: 'story:recovery:founder-seed:phone-need-realized',
  firstPhonePurchased: 'story:recovery:founder-seed:first-phone-purchased',
  businessAppsAwaken: 'story:recovery:founder-seed:business-apps-awaken',
})

export const RECOVERY_PHONE_FACT_IDS = Object.freeze({
  needRealized: 'fact:recovery:phone:need-realized',
  firstPhonePurchased: 'fact:recovery:phone:first-owned',
  businessAppsUnlocked: 'fact:recovery:phone:registered-business-apps-unlocked',
})

export const RECOVERY_PHONE_LINE_COPY = Object.freeze({
  observeTracking: 'Everybody here is connected. They can see where things are going, confirm deliveries, find businesses. If I ever want to do this seriously, I need a phone of my own.',
  firstPhone: 'It is not much, but it is mine. For the first time I can see more of the city than the streets in front of me.',
  businessApps: 'The city did not suddenly become full of work. I finally have a legal way to see the work that is actually available to my business.',
})

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const authority = (input: RecoveryPresentationAuthority) => ({
  missionId: input.missionId,
  authoredRef: input.authoredRef,
  signalTypes: input.signalTypes ?? [],
  factIds: input.factIds ?? [],
})

export interface PhoneNeedPresentationInput {
  retailerLabel: string
  mission: RecoveryPresentationAuthority
}

export const buildPhoneNeedRealizationSequence = (
  input: PhoneNeedPresentationInput,
): NarrativePresentationSequence => {
  if (![input.retailerLabel, input.mission.missionId, input.mission.authoredRef].every(validId)) {
    throw new Error('Invalid phone-need presentation input')
  }
  return {
    version: NARRATIVE_PRESENTATION_VERSION,
    sequenceId: `recovery-phone:need:${input.mission.missionId}:v1`,
    beats: [{
      beatId: 'recovery-phone:observe-connected-commerce',
      kind: 'outcome',
      contextLabel: input.retailerLabel,
      text: RECOVERY_PHONE_LINE_COPY.observeTracking,
      continueLabel: 'Remember this',
      dismissible: false,
      canonicalBeatRef: RECOVERY_PHONE_BEAT_IDS.needRealized,
      canonicalLineRef: 'line:hero:phone-need-realized',
      authorityBinding: authority(input.mission),
    }],
  }
}

export interface FirstPhonePresentationInput {
  retailerLabel: string
  mission: RecoveryPresentationAuthority
}

export const buildFirstPhonePurchasedSequence = (
  input: FirstPhonePresentationInput,
): NarrativePresentationSequence => {
  if (![input.retailerLabel, input.mission.missionId, input.mission.authoredRef].every(validId)) {
    throw new Error('Invalid first-phone presentation input')
  }
  return {
    version: NARRATIVE_PRESENTATION_VERSION,
    sequenceId: `recovery-phone:first-owned:${input.mission.missionId}:v1`,
    beats: [{
      beatId: 'recovery-phone:first-owned',
      kind: 'outcome',
      contextLabel: input.retailerLabel,
      text: RECOVERY_PHONE_LINE_COPY.firstPhone,
      continueLabel: 'Open the map',
      dismissible: false,
      canonicalBeatRef: RECOVERY_PHONE_BEAT_IDS.firstPhonePurchased,
      canonicalLineRef: 'line:hero:first-phone-owned',
      authorityBinding: authority(input.mission),
    }],
  }
}

export const recoveryPhoneFounderGateFacts = Object.freeze([
  RECOVERY_PHONE_FACT_IDS.needRealized,
  RECOVERY_FACT_IDS.founderThoughtFormed,
])

export const recoveryPhoneArcId = RECOVERY_ARC_IDS.founderSeed
export const recoveryPhoneFounderIdeaBeatId = RECOVERY_BEAT_IDS.founderIdea
