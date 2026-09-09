import {
  BRAILA_FIRST_HOUR_AUTHORED_REFS,
  BRAILA_FIRST_HOUR_FACT_IDS,
  BRAILA_FIRST_HOUR_MISSION_IDS,
  BRAILA_FIRST_HOUR_SIGNALS,
} from '../missions/brailaFirstHourAuthoredRegistry'

export const NARRATIVE_PRESENTATION_VERSION = 1 as const

export type NarrativeCharacterId =
  | 'ana-stoica'
  | 'radu-marin'
  | 'mirela-stan'
  | 'petru-neagu'
  | 'daria-iancu'
  | 'elena-dobre'
  | 'victor-lupu'

export type NarrativeCharacterRole =
  | 'Dispatcher / Mentor'
  | 'Coworker / Friendly Competitor'
  | 'Merchant / Business Customer'
  | 'Household Customer'
  | 'Producer / Business Owner'
  | 'Trainer / Instructor'
  | 'Competitor / Rival Professional'

export type NarrativeHairCue = 'short' | 'bob' | 'wave' | 'silver' | 'tied' | 'cropped' | 'swept'
export type NarrativeEquipmentCue = 'headset' | 'courier-bag' | 'shop-apron' | 'walking-cane' | 'clipboard' | 'training-folder' | 'route-case'

export interface NarrativeCharacterVisual {
  characterId: NarrativeCharacterId
  displayName: string
  role: NarrativeCharacterRole
  /** Stable silhouette/clothing/equipment cues survive until a governed portrait derivative is production-ready. */
  silhouette: 'slim' | 'average' | 'broad' | 'compact'
  hair: NarrativeHairCue
  equipment: NarrativeEquipmentCue
  clothingFill: number
  accentFill: number
  skinFill: number
  badge: string
  homeContext: string
  /** No candidate board crop is silently promoted. Runtime art can replace this only after #411/#412 promotion. */
  portrait: { kind: 'procedural-identity' } | { kind: 'runtime-texture'; textureKey: string; runtimePath: string }
}

export const NARRATIVE_CHARACTER_VISUALS: Readonly<Record<NarrativeCharacterId, NarrativeCharacterVisual>> = {
  'ana-stoica': {
    characterId: 'ana-stoica',
    displayName: 'Ana Stoica',
    role: 'Dispatcher / Mentor',
    silhouette: 'average',
    hair: 'bob',
    equipment: 'headset',
    clothingFill: 0x173f67,
    accentFill: 0x55dfff,
    skinFill: 0xe7b48e,
    badge: 'OPS',
    homeContext: 'Northstar Parcel Logistics · Station Commons',
    portrait: { kind: 'procedural-identity' },
  },
  'radu-marin': {
    characterId: 'radu-marin',
    displayName: 'Radu Marin',
    role: 'Coworker / Friendly Competitor',
    silhouette: 'slim',
    hair: 'short',
    equipment: 'courier-bag',
    clothingFill: 0x285940,
    accentFill: 0xf6c445,
    skinFill: 0xc98762,
    badge: 'RIDE',
    homeContext: 'Northstar Parcel Logistics · Station Commons',
    portrait: { kind: 'procedural-identity' },
  },
  'mirela-stan': {
    characterId: 'mirela-stan',
    displayName: 'Mirela Stan',
    role: 'Merchant / Business Customer',
    silhouette: 'compact',
    hair: 'wave',
    equipment: 'shop-apron',
    clothingFill: 0x7a315d,
    accentFill: 0x8fce45,
    skinFill: 0xf0bd96,
    badge: 'SHOP',
    homeContext: 'Independent local commerce · Brăila Commerce',
    portrait: { kind: 'procedural-identity' },
  },
  'petru-neagu': {
    characterId: 'petru-neagu',
    displayName: 'Petru Neagu',
    role: 'Household Customer',
    silhouette: 'average',
    hair: 'silver',
    equipment: 'walking-cane',
    clothingFill: 0x554a3d,
    accentFill: 0xd9c4a0,
    skinFill: 0xd8a27d,
    badge: 'OLD TOWN',
    homeContext: 'Old Town · recurring household customer',
    portrait: { kind: 'procedural-identity' },
  },
  'daria-iancu': {
    characterId: 'daria-iancu',
    displayName: 'Daria Iancu',
    role: 'Producer / Business Owner',
    silhouette: 'broad',
    hair: 'tied',
    equipment: 'clipboard',
    clothingFill: 0x4c4f56,
    accentFill: 0xf59e0b,
    skinFill: 0xb9795c,
    badge: 'PROD',
    homeContext: 'Foundry Quarter · packaging / processing',
    portrait: { kind: 'procedural-identity' },
  },
  'elena-dobre': {
    characterId: 'elena-dobre',
    displayName: 'Elena Dobre',
    role: 'Trainer / Instructor',
    silhouette: 'average',
    hair: 'cropped',
    equipment: 'training-folder',
    clothingFill: 0x314b76,
    accentFill: 0xb695ff,
    skinFill: 0xe1ac87,
    badge: 'TRAIN',
    homeContext: 'Brăila vocational / training facility',
    portrait: { kind: 'procedural-identity' },
  },
  'victor-lupu': {
    characterId: 'victor-lupu',
    displayName: 'Victor Lupu',
    role: 'Competitor / Rival Professional',
    silhouette: 'broad',
    hair: 'swept',
    equipment: 'route-case',
    clothingFill: 0x5b2637,
    accentFill: 0xef8354,
    skinFill: 0xc98e6d,
    badge: 'RIVAL',
    homeContext: 'Competing local logistics organization',
    portrait: { kind: 'procedural-identity' },
  },
}

export interface NarrativeCameraFocusRequest {
  kind: 'location' | 'character' | 'environment'
  targetId: string
  label: string
  /** Presentation request only; Agent 1 remains camera-architecture owner. */
  durationMs: number
}

export interface NarrativeObjectiveTransition {
  /** Read-only reference to an authoritative mission. DT-10 never applies a mission transition. */
  transitionRef: string
  label: string
}

export interface NarrativeAuthorityBinding {
  missionId: string
  authoredRef: string
  signalTypes: readonly string[]
  factIds: readonly string[]
}

export interface NarrativeChoice {
  choiceId: string
  label: string
  resultRef: string
}

export type NarrativeBeatKind = 'chapter' | 'dialogue' | 'outcome' | 'opportunity'

export interface NarrativePresentationBeat {
  beatId: string
  kind: NarrativeBeatKind
  chapterLabel?: string
  characterId?: NarrativeCharacterId
  contextLabel?: string
  text: string
  continueLabel?: string
  dismissible?: boolean
  choices?: readonly NarrativeChoice[]
  focusRequest?: NarrativeCameraFocusRequest
  objectiveTransition?: NarrativeObjectiveTransition
  /** Stable Story Director beat identity; presentation-local beat IDs remain implementation details. */
  canonicalBeatRef?: string
  /** Stable authored line identity when this beat presents canonical dialogue/content intent. */
  canonicalLineRef?: string
  /** Read-only authority required before an integration adapter may present this beat. */
  authorityBinding?: NarrativeAuthorityBinding
}

export interface NarrativePresentationSequence {
  version: typeof NARRATIVE_PRESENTATION_VERSION
  sequenceId: string
  beats: readonly NarrativePresentationBeat[]
}

export const FIRST_SHIFT_OPENING_SEQUENCE: NarrativePresentationSequence = {
  version: NARRATIVE_PRESENTATION_VERSION,
  sequenceId: 'prologue:first-shift:visual-opening:v1',
  beats: [
    {
      beatId: 'first-shift-card',
      kind: 'chapter',
      chapterLabel: 'PROLOGUE · FIRST SHIFT',
      contextLabel: 'Station Commons · Brăila',
      text: 'No company. No fleet. One phone, one backpack, and a first shift where somebody has to be able to rely on you.',
      continueLabel: 'Start shift',
      dismissible: true,
      focusRequest: { kind: 'location', targetId: 'station-commons', label: 'Station Commons', durationMs: 700 },
      canonicalBeatRef: 'beat:braila:first-day:a-place-to-start',
      canonicalLineRef: 'line:prologue:first-shift-card',
      authorityBinding: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart,
        authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.placeToStart,
        signalTypes: [BRAILA_FIRST_HOUR_SIGNALS.reportedForWork],
        factIds: [BRAILA_FIRST_HOUR_FACT_IDS.metAna],
      },
    },
    {
      beatId: 'ana-first-brief',
      kind: 'dialogue',
      characterId: 'ana-stoica',
      contextLabel: 'Northstar Parcel Logistics · Dispatch',
      text: 'Small route first. Check the address, keep the parcel with you, and do not promise what you cannot deliver. Reliable beats impressive.',
      continueLabel: 'Understood',
      dismissible: true,
      canonicalBeatRef: 'beat:braila:first-day:the-first-standard',
      canonicalLineRef: 'line:ana:first-standard',
      authorityBinding: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard,
        authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard,
        signalTypes: [BRAILA_FIRST_HOUR_SIGNALS.firstStandardAcknowledged],
        factIds: [BRAILA_FIRST_HOUR_FACT_IDS.metAna],
      },
    },
    {
      beatId: 'radu-first-meeting',
      kind: 'dialogue',
      characterId: 'radu-marin',
      contextLabel: 'Before the route',
      text: 'First day? Good. Then we can both pretend we know the shortcut. I am Radu. If you find one that actually works, tell me.',
      continueLabel: 'Head out',
      dismissible: true,
      objectiveTransition: { transitionRef: BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing, label: 'Follow the current work objective' },
      canonicalBeatRef: 'beat:braila:first-day:the-first-standard',
      canonicalLineRef: 'line:radu:first-meeting',
      authorityBinding: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard,
        authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard,
        signalTypes: [BRAILA_FIRST_HOUR_SIGNALS.actorMet],
        factIds: [BRAILA_FIRST_HOUR_FACT_IDS.metRadu],
      },
    },
  ],
}

export const FIRST_DELIVERY_CONSEQUENCE_SEQUENCE: NarrativePresentationSequence = {
  version: NARRATIVE_PRESENTATION_VERSION,
  sequenceId: 'prologue:first-settled-delivery:visual-consequence:v1',
  beats: [
    {
      beatId: 'ana-first-consequence',
      kind: 'outcome',
      characterId: 'ana-stoica',
      contextLabel: 'Shift consequence',
      text: 'That route is closed cleanly. The useful part is not the applause — it is that the next person can trust the handoff.',
      continueLabel: 'Continue shift',
      dismissible: true,
      canonicalBeatRef: 'beat:braila:first-day:first-consequence',
      canonicalLineRef: 'line:ana:first-consequence-clean',
      authorityBinding: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence,
        authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence,
        signalTypes: [BRAILA_FIRST_HOUR_SIGNALS.firstConsequencePresented],
        factIds: [BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean],
      },
    },
    {
      beatId: 'next-opportunity',
      kind: 'opportunity',
      chapterLabel: 'YOUR WORK LEAVES A MARK',
      contextLabel: 'Next opportunity',
      text: 'One completed route becomes history. Keep working, meet the people behind the addresses, and build the next option legitimately.',
      continueLabel: 'Back to Brăila',
      dismissible: true,
      objectiveTransition: { transitionRef: BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow, label: 'Return to current authoritative objective' },
      canonicalBeatRef: 'beat:braila:first-day:tomorrow-has-more-than-one-direction',
      authorityBinding: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow,
        authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.tomorrow,
        signalTypes: [BRAILA_FIRST_HOUR_SIGNALS.careerHorizonSeen],
        factIds: [BRAILA_FIRST_HOUR_FACT_IDS.firstDayCompleted],
      },
    },
  ],
}

export interface FirstHourVisualStoryBeat {
  id: string
  presentation: string
  characterIds: readonly NarrativeCharacterId[]
  place: string
  activation: 'mission-signal-required' | 'authoritative-state-required'
  authority: string
  authorityBindings: readonly NarrativeAuthorityBinding[]
  visualConsequence: string
}

const binding = (
  missionId: string,
  authoredRef: string,
  signalTypes: readonly string[],
  factIds: readonly string[],
): NarrativeAuthorityBinding => ({ missionId, authoredRef, signalTypes, factIds })

/**
 * Presentation mapping only. Every first-hour beat requires authoritative mission/story
 * evidence. This visual layer never starts missions, emits mission signals or fabricates facts.
 */
export const FIRST_HOUR_VISUAL_STORY_MAP: readonly FirstHourVisualStoryBeat[] = [
  {
    id: 'opening-story-moment',
    presentation: 'Chapter card + bounded in-world dialogue overlay',
    characterIds: ['ana-stoica', 'radu-marin'],
    place: 'Station Commons',
    activation: 'mission-signal-required',
    authority: 'Merged authored first-hour mission signals for reporting to work and meeting the opening team',
    authorityBindings: [
      binding(BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart, BRAILA_FIRST_HOUR_AUTHORED_REFS.placeToStart, [BRAILA_FIRST_HOUR_SIGNALS.reportedForWork], [BRAILA_FIRST_HOUR_FACT_IDS.metAna]),
      binding(BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard, BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard, [BRAILA_FIRST_HOUR_SIGNALS.firstStandardAcknowledged, BRAILA_FIRST_HOUR_SIGNALS.actorMet], [BRAILA_FIRST_HOUR_FACT_IDS.metRadu]),
    ],
    visualConsequence: 'The player begins as a worker inside a place and team, not as an abstract delivery cursor.',
  },
  {
    id: 'first-merchant-relationship',
    presentation: 'Merchant portrait dialogue + product/economic context',
    characterIds: ['mirela-stan'],
    place: 'Brăila Commerce',
    activation: 'mission-signal-required',
    authority: 'Canonical One Small Thing mission history plus authoritative merchant/order/cargo state',
    authorityBindings: [binding(
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      BRAILA_FIRST_HOUR_AUTHORED_REFS.oneSmallThing,
      [],
      [
        BRAILA_FIRST_HOUR_FACT_IDS.metMirela,
        BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
        BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered,
        BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed,
      ],
    )],
    visualConsequence: 'The pickup is attached to a remembered local business rather than an anonymous marker.',
  },
  {
    id: 'first-household-relationship',
    presentation: 'Customer portrait dialogue after a real delivery handoff',
    characterIds: ['petru-neagu'],
    place: 'Old Town',
    activation: 'mission-signal-required',
    authority: 'Canonical household mission history and authoritative delivery destination',
    authorityBindings: [binding(
      BRAILA_FIRST_HOUR_MISSION_IDS.personNotAddress,
      BRAILA_FIRST_HOUR_AUTHORED_REFS.personNotAddress,
      [],
      [BRAILA_FIRST_HOUR_FACT_IDS.metPetru],
    )],
    visualConsequence: 'A delivery ends with a person and a neighborhood memory.',
  },
  {
    id: 'first-complication',
    presentation: 'Short character beat + environment highlight; no fake failure state',
    characterIds: ['ana-stoica', 'radu-marin'],
    place: 'Current route / Station Commons',
    activation: 'mission-signal-required',
    authority: 'Canonical capacity mission and authoritative outcome confirmation only',
    authorityBindings: [binding(
      BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice,
      BRAILA_FIRST_HOUR_AUTHORED_REFS.capacityChoice,
      [BRAILA_FIRST_HOUR_SIGNALS.capacityOutcomeConfirmed],
      [BRAILA_FIRST_HOUR_FACT_IDS.capacityProtect, BRAILA_FIRST_HOUR_FACT_IDS.capacityAssist],
    )],
    visualConsequence: 'The complication is shown only after the mission layer proves that it happened.',
  },
  {
    id: 'first-mission-consequence',
    presentation: 'Outcome dialogue + next-opportunity card',
    characterIds: ['ana-stoica'],
    place: 'Current Brăila world context',
    activation: 'mission-signal-required',
    authority: 'Canonical first-consequence signal selected from truthful first-shift history',
    authorityBindings: [binding(
      BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence,
      BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence,
      [BRAILA_FIRST_HOUR_SIGNALS.firstConsequencePresented],
      [
        BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
        BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered,
        BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed,
      ],
    )],
    visualConsequence: 'Authoritative history receives a human story beat without changing money, cargo or mission authority.',
  },
  {
    id: 'producer-and-training-horizon',
    presentation: 'Role-specific visual identities and future chapter bridges',
    characterIds: ['daria-iancu', 'elena-dobre', 'victor-lupu'],
    place: 'Foundry Quarter / training facility / competing logistics presence',
    activation: 'authoritative-state-required',
    authority: 'Canonical career-horizon mission plus real production/training/competition availability',
    authorityBindings: [binding(
      BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow,
      BRAILA_FIRST_HOUR_AUTHORED_REFS.tomorrow,
      [BRAILA_FIRST_HOUR_SIGNALS.careerHorizonSeen],
      [BRAILA_FIRST_HOUR_FACT_IDS.firstDayCompleted],
    )],
    visualConsequence: 'Later opportunities become visually person-led only when their gameplay systems are actually available.',
  },
]

export interface EnvironmentalStoryPresentationRule {
  ruleId: string
  requiredState: string
  visibleEvidence: readonly string[]
  forbiddenShortcut: string
}

export const ENVIRONMENTAL_STORY_PRESENTATION_RULES: readonly EnvironmentalStoryPresentationRule[] = [
  {
    ruleId: 'employer-depot-active',
    requiredState: 'real employer/depot work activity',
    visibleEvidence: ['bounded staff presence', 'parcel/handling props', 'route/shift activity'],
    forbiddenShortcut: 'Do not display fake workers or stock merely because a story beat wants the depot busy.',
  },
  {
    ruleId: 'merchant-economic-identity',
    requiredState: 'merchant/product/order state',
    visibleEvidence: ['category-appropriate goods', 'pickup staging', 'storefront activity'],
    forbiddenShortcut: 'Do not imply products or shortages that the economy does not contain.',
  },
  {
    ruleId: 'workshop-after-repair',
    requiredState: 'authoritative repair/construction completion',
    visibleEvidence: ['before/after prop state', 'restored equipment cue', 'changed activity'],
    forbiddenShortcut: 'Do not mark a facility repaired from narrative flags alone.',
  },
  {
    ruleId: 'district-economic-improvement',
    requiredState: 'bounded authoritative district/economic indicator',
    visibleEvidence: ['higher legitimate activity density', 'open storefront/work cues', 'service movement'],
    forbiddenShortcut: 'Do not manufacture prosperity with decoration when the simulation says otherwise.',
  },
  {
    ruleId: 'temporary-disruption',
    requiredState: 'real route/facility/infrastructure disruption',
    visibleEvidence: ['barrier/signage', 'queued work', 'visible affected facility'],
    forbiddenShortcut: 'Do not place disruption props without a real disruption source.',
  },
  {
    ruleId: 'infrastructure-opening',
    requiredState: 'authoritative infrastructure available/open state',
    visibleEvidence: ['access change', 'operational activity', 'before/after presentation beat'],
    forbiddenShortcut: 'Do not visually open infrastructure that gameplay cannot use.',
  },
]

export const NARRATIVE_RUNTIME_ASSET_REFERENCES = [
  '/assets/production/icon-orders.webp',
] as const
