import {
  NARRATIVE_PRESENTATION_VERSION,
  type NarrativePresentationBeat,
  type NarrativePresentationSequence,
} from './visualStorytelling'

export const RECOVERY_OPENING_PRESENTATION_VERSION = 2 as const

export type HeroPresentationSex = 'Male' | 'Female'

export const RECOVERY_ARC_IDS = Object.freeze({
  origin: 'arc:recovery:origin',
  founderSeed: 'arc:recovery:founder-seed',
  socialCompany: 'arc:recovery:social-company',
})

export const RECOVERY_BEAT_IDS = Object.freeze({
  rise: 'beat:recovery:origin:rise',
  searchWork: 'beat:recovery:origin:search-work',
  merchantTest: 'beat:recovery:origin:merchant-test',
  firstReturn: 'beat:recovery:origin:first-return',
  merchantTrialChain: 'beat:recovery:origin:merchant-trial-chain',
  supplierIntroduction: 'beat:recovery:origin:supplier-introduction',
  firstRoof: 'beat:recovery:origin:first-roof',
  founderIdea: 'beat:recovery:founder-seed:idea',
  administrativePath: 'beat:recovery:founder-seed:administrative-path',
  starterVenture: 'beat:recovery:founder-seed:starter-venture',
  socialCapacityWall: 'beat:recovery:social-company:capacity-wall',
  findHumans: 'beat:recovery:social-company:find-humans',
  humanCompany: 'beat:recovery:social-company:human-company',
})

export const RECOVERY_AUTHORED_REFS = Object.freeze({
  rise: 'story:recovery:origin:rise',
  searchWork: 'story:recovery:origin:search-work',
  merchantTest: 'story:recovery:origin:merchant-test',
  firstReturn: 'story:recovery:origin:first-return',
  merchantTrialChain: 'story:recovery:origin:merchant-trial-chain',
  supplierIntroduction: 'story:recovery:origin:supplier-introduction',
  firstRoof: 'story:recovery:origin:first-roof',
  founderIdea: 'story:recovery:founder-seed:idea',
  administrativePath: 'story:recovery:founder-seed:administrative-path',
  starterVenture: 'story:recovery:founder-seed:starter-venture',
  socialCapacityWall: 'story:recovery:social-company:capacity-wall',
  findHumans: 'story:recovery:social-company:find-humans',
  humanCompany: 'story:recovery:social-company:human-company',
})

export const RECOVERY_ROLE_IDS = Object.freeze({
  openingMerchant: 'role:opening-merchant',
  localProducerSupplier: 'role:local-producer-supplier',
  businessAdministrationSpecialist: 'role:business-administration-specialist',
  humanCofounderMember: 'role:human-cofounder-member',
})

export const BRAILA_RECOVERY_CHARACTER_BINDINGS = Object.freeze({
  openingMerchant: 'maria-ionescu',
  businessAdministrationSpecialist: 'mihai-enache',
})

export const RECOVERY_FACT_IDS = Object.freeze({
  prologueSeen: 'fact:recovery:prologue-seen',
  workSearchStarted: 'fact:recovery:work-search-started',
  metMaria: 'fact:met:maria-ionescu',
  mariaTestOffered: 'fact:maria:first-test:offered',
  mariaTestCompleted: 'fact:maria:first-test:completed',
  mariaFirstReturnCompleted: 'fact:maria:first-return:completed',
  mariaTrialCompleted: 'fact:maria:trial-chain:completed',
  supplierIntroductionEarned: 'fact:recovery:supplier-introduction:earned',
  firstRoofSecured: 'fact:recovery:first-roof:secured',
  founderThoughtFormed: 'fact:recovery:founder-thought:formed',
  starterVentureFormed: 'fact:recovery:starter-venture:formed',
  socialCapacityWallReached: 'fact:recovery:social-capacity-wall:reached',
  humanCompanyJoinedOrFormed: 'fact:recovery:human-company:joined-or-formed',
})

export const LEGACY_FIRST_HOUR_ARC_ID = 'arc:braila:first-day' as const

export const LEGACY_FIRST_HOUR_AUTHORED_PREFIX = 'story:braila:first-day:' as const

export interface RecoveryOpeningHeroCopy {
  parentNoun: 'father' | 'mother'
  parentNounRo: 'tată' | 'mamă'
  riseMonologue: string
}

export const recoveryOpeningHeroCopy = (sex: HeroPresentationSex): RecoveryOpeningHeroCopy => sex === 'Male'
  ? {
      parentNoun: 'father',
      parentNounRo: 'tată',
      riseMonologue: "I have to get up. I have to keep going. My children are not beside me anymore, but I still have to become the father they can be proud of. I have to get out of this. First, I need work.",
    }
  : {
      parentNoun: 'mother',
      parentNounRo: 'mamă',
      riseMonologue: "I have to get up. I have to keep going. My children are not beside me anymore, but I still have to become the mother they can be proud of. I have to get out of this. First, I need work.",
    }

export const RECOVERY_LINE_COPY = Object.freeze({
  heroMerchantNotice: 'This place has customers. Maybe she needs help here. If not, maybe the farm she buys from does. I have to ask.',
  mariaFirstTest: 'I do not have a job for you here. But if you want to show me I can rely on you, take this delivery. Get it to the right person, intact and on time. Then come back.',
  mariaFirstReturn: 'You came back, and the customer confirmed it. Good. Take these. You earned something today — and you look like you need to eat.',
  mariaTrialOffer: 'Do these properly and I will speak to one of the farmers I buy from. I cannot promise you a job. I can promise I will tell him whether you are reliable.',
  founderThought: 'Everyone needs something moved, but nobody has a permanent place for me. Maybe one day I build the work myself. A delivery company. Not today. First I need a roof, money, and to understand how this world works.',
  socialScaleRealization: 'I can keep this small, or I can build with other people. If I want something bigger, I need people I can actually trust — not just more names on a list.',
})

export interface RecoveryPresentationAuthority {
  missionId: string
  authoredRef: string
  signalTypes?: readonly string[]
  factIds?: readonly string[]
}

const validId = (value: string): boolean => value.trim().length > 0 && value.length <= 180

const authority = (input?: RecoveryPresentationAuthority) => input
  ? {
      missionId: input.missionId,
      authoredRef: input.authoredRef,
      signalTypes: input.signalTypes ?? [],
      factIds: input.factIds ?? [],
    }
  : undefined

/**
 * Presentation-only cinematic/gameplay bridge. It does not settle money, create cargo,
 * mutate housing, grant qualifications, form companies or write story facts.
 */
export const buildRecoveryPrologueSequence = (
  sex: HeroPresentationSex,
  localityLabel: string,
  searchMission?: RecoveryPresentationAuthority,
): NarrativePresentationSequence => {
  if (!localityLabel.trim()) throw new Error('localityLabel is required')
  const hero = recoveryOpeningHeroCopy(sex)

  const beats: NarrativePresentationBeat[] = [
    {
      beatId: 'recovery-v2:rough-night',
      kind: 'chapter',
      chapterLabel: 'PROLOGUE · GET UP',
      contextLabel: localityLabel,
      text: 'A cold night. Worn clothes. No vehicle, no company, no room to go back to.',
      continueLabel: 'Wake up',
      dismissible: false,
      canonicalBeatRef: RECOVERY_BEAT_IDS.rise,
      canonicalLineRef: 'line:hero:recovery-rise',
    },
    {
      beatId: 'recovery-v2:inner-decision',
      kind: 'outcome',
      contextLabel: `${hero.parentNoun} · starting again`,
      text: hero.riseMonologue,
      continueLabel: 'Get up',
      dismissible: false,
      canonicalBeatRef: RECOVERY_BEAT_IDS.rise,
      canonicalLineRef: 'line:hero:recovery-rise',
    },
    {
      beatId: 'recovery-v2:search-work-objective',
      kind: 'opportunity',
      contextLabel: localityLabel,
      text: 'Walk the streets and look for work opportunities.',
      continueLabel: 'Start looking',
      dismissible: false,
      objectiveTransition: searchMission
        ? { transitionRef: searchMission.missionId, label: 'Walk the streets and look for work opportunities' }
        : undefined,
      canonicalBeatRef: RECOVERY_BEAT_IDS.searchWork,
      canonicalLineRef: 'line:hero:search-work-objective',
      authorityBinding: authority(searchMission),
    },
  ]

  return {
    version: NARRATIVE_PRESENTATION_VERSION,
    sequenceId: `recovery-opening:${sex.toLowerCase()}:${localityLabel}:v${RECOVERY_OPENING_PRESENTATION_VERSION}`,
    beats,
  }
}

export interface MariaTestPresentationInput {
  localityLabel: string
  shopLabel: string
  mariaActorId: string
  merchantTestMission: RecoveryPresentationAuthority
}

export const buildMariaTestOfferSequence = (
  input: MariaTestPresentationInput,
): NarrativePresentationSequence => {
  if (![input.localityLabel, input.shopLabel, input.mariaActorId, input.merchantTestMission.missionId, input.merchantTestMission.authoredRef].every(validId)) {
    throw new Error('Invalid Maria test presentation input')
  }

  return {
    version: NARRATIVE_PRESENTATION_VERSION,
    sequenceId: `recovery-opening:maria-test:${input.merchantTestMission.missionId}:v${RECOVERY_OPENING_PRESENTATION_VERSION}`,
    beats: [
      {
        beatId: 'recovery-v2:notice-maria-shop',
        kind: 'outcome',
        contextLabel: input.localityLabel,
        text: RECOVERY_LINE_COPY.heroMerchantNotice,
        continueLabel: 'Go inside',
        dismissible: true,
        focusRequest: {
          kind: 'location',
          targetId: input.shopLabel,
          label: input.shopLabel,
          durationMs: 700,
        },
        canonicalBeatRef: RECOVERY_BEAT_IDS.searchWork,
        canonicalLineRef: 'line:hero:merchant-notice',
      },
      {
        beatId: 'recovery-v2:maria-first-test',
        kind: 'dialogue',
        contextLabel: `Maria · ${input.shopLabel}`,
        text: RECOVERY_LINE_COPY.mariaFirstTest,
        continueLabel: 'Take the delivery',
        dismissible: false,
        focusRequest: {
          kind: 'character',
          targetId: input.mariaActorId,
          label: 'Maria',
          durationMs: 650,
        },
        objectiveTransition: {
          transitionRef: input.merchantTestMission.missionId,
          label: 'Take the legitimate delivery from Maria',
        },
        canonicalBeatRef: RECOVERY_BEAT_IDS.merchantTest,
        canonicalLineRef: 'line:maria:first-test-offer',
        authorityBinding: authority(input.merchantTestMission),
      },
    ],
  }
}

export interface MariaReturnPresentationInput {
  shopLabel: string
  mariaActorId: string
  returnMission: RecoveryPresentationAuthority
  foodRewardAuthorityConfirmed: boolean
}

export const buildMariaFirstReturnSequence = (
  input: MariaReturnPresentationInput,
): NarrativePresentationSequence => {
  if (![input.shopLabel, input.mariaActorId, input.returnMission.missionId, input.returnMission.authoredRef].every(validId)) {
    throw new Error('Invalid Maria return presentation input')
  }

  const returnText = input.foodRewardAuthorityConfirmed
    ? RECOVERY_LINE_COPY.mariaFirstReturn
    : 'You came back, and the customer confirmed it. Good. I will remember that you finished what you took responsibility for.'

  return {
    version: NARRATIVE_PRESENTATION_VERSION,
    sequenceId: `recovery-opening:maria-return:${input.returnMission.missionId}:v${RECOVERY_OPENING_PRESENTATION_VERSION}`,
    beats: [
      {
        beatId: 'recovery-v2:maria-first-return',
        kind: 'dialogue',
        contextLabel: `Maria · ${input.shopLabel}`,
        text: returnText,
        continueLabel: 'Listen',
        dismissible: false,
        focusRequest: {
          kind: 'character',
          targetId: input.mariaActorId,
          label: 'Maria',
          durationMs: 650,
        },
        canonicalBeatRef: RECOVERY_BEAT_IDS.firstReturn,
        canonicalLineRef: 'line:maria:first-return-food',
        authorityBinding: authority(input.returnMission),
      },
      {
        beatId: 'recovery-v2:maria-trial-offer',
        kind: 'opportunity',
        contextLabel: `Maria · ${input.shopLabel}`,
        text: RECOVERY_LINE_COPY.mariaTrialOffer,
        continueLabel: 'Accept the chance',
        dismissible: true,
        canonicalBeatRef: RECOVERY_BEAT_IDS.merchantTrialChain,
        canonicalLineRef: 'line:maria:trial-chain-offer',
        authorityBinding: authority(input.returnMission),
      },
    ],
  }
}

export const isLegacyEmployeeFirstAuthoredRef = (authoredRef: string): boolean =>
  authoredRef.startsWith(LEGACY_FIRST_HOUR_AUTHORED_PREFIX)
