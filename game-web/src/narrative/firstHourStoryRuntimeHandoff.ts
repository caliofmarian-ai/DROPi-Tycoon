import {
  BRAILA_FIRST_HOUR_AUTHORED_REFS,
  BRAILA_FIRST_HOUR_FACT_IDS,
  BRAILA_FIRST_HOUR_MISSION_IDS,
  BRAILA_FIRST_HOUR_SIGNALS,
} from '../missions/brailaFirstHourAuthoredRegistry'
import type { MissionStatus } from '../missions/missionModel'

export const FIRST_HOUR_STORY_HANDOFF_VERSION = 1 as const

export const FIRST_HOUR_STORY_ROLE_IDS = Object.freeze({
  dispatcherMentor: 'dispatcher-mentor',
  coworkerPeer: 'coworker-peer',
  merchant: 'merchant-business-customer',
  householdCustomer: 'household-customer',
  producer: 'producer-business-owner',
  trainer: 'trainer-instructor',
  rival: 'rival-professional',
} as const)
export type FirstHourStoryRoleId = (typeof FIRST_HOUR_STORY_ROLE_IDS)[keyof typeof FIRST_HOUR_STORY_ROLE_IDS]

export const BRAILA_FIRST_HOUR_ROLE_CHARACTER_REFS = Object.freeze({
  [FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor]: 'ana-stoica',
  [FIRST_HOUR_STORY_ROLE_IDS.coworkerPeer]: 'radu-marin',
  [FIRST_HOUR_STORY_ROLE_IDS.merchant]: 'mirela-stan',
  [FIRST_HOUR_STORY_ROLE_IDS.householdCustomer]: 'petru-neagu',
  [FIRST_HOUR_STORY_ROLE_IDS.producer]: 'daria-iancu',
  [FIRST_HOUR_STORY_ROLE_IDS.trainer]: 'elena-dobre',
  [FIRST_HOUR_STORY_ROLE_IDS.rival]: 'victor-lupu',
} as const)

export interface FirstHourStoryRoleBinding {
  roleId: FirstHourStoryRoleId
  localityId: string
  actorId: string
  characterRef: string
  displayName: string
  employerDisplayName?: string
}
export interface FirstHourStoryRoleContext {
  currentLocalityId: string
  bindings: readonly FirstHourStoryRoleBinding[]
}
export type FirstHourStoryRoleBlocker =
  | 'invalid-current-locality'
  | 'missing-role'
  | 'ambiguous-role'
  | 'invalid-binding'
  | 'shared-actor'
export interface FirstHourStoryRoleResolution {
  eligible: boolean
  blockers: readonly FirstHourStoryRoleBlocker[]
  bindings: Readonly<Partial<Record<FirstHourStoryRoleId, FirstHourStoryRoleBinding>>>
}
const validRef = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180

/** No Brăila fallback: only explicit current-locality bindings may satisfy a portable role. */
export const resolveFirstHourStoryRoles = (
  context: FirstHourStoryRoleContext,
  requiredRoles: readonly FirstHourStoryRoleId[],
): FirstHourStoryRoleResolution => {
  if (!validRef(context.currentLocalityId)) return { eligible: false, blockers: ['invalid-current-locality'], bindings: {} }
  const blockers: FirstHourStoryRoleBlocker[] = []
  const resolved: Partial<Record<FirstHourStoryRoleId, FirstHourStoryRoleBinding>> = {}
  for (const roleId of [...new Set(requiredRoles)]) {
    const matches = context.bindings.filter(binding => binding.roleId === roleId && binding.localityId === context.currentLocalityId)
    if (matches.length === 0) { blockers.push('missing-role'); continue }
    if (matches.length !== 1) { blockers.push('ambiguous-role'); continue }
    const binding = matches[0]
    if (![binding.localityId, binding.actorId, binding.characterRef, binding.displayName].every(validRef) ||
      (binding.employerDisplayName !== undefined && !validRef(binding.employerDisplayName))) {
      blockers.push('invalid-binding'); continue
    }
    resolved[roleId] = { ...binding }
  }
  const actors = Object.values(resolved).map(binding => binding?.actorId).filter((value): value is string => Boolean(value))
  if (new Set(actors).size !== actors.length) blockers.push('shared-actor')
  const uniqueBlockers = [...new Set(blockers)]
  return {
    eligible: uniqueBlockers.length === 0 && [...new Set(requiredRoles)].every(roleId => Boolean(resolved[roleId])),
    blockers: uniqueBlockers,
    bindings: resolved,
  }
}

export const FIRST_HOUR_AUTHORITY_CODES = Object.freeze({
  missionState: 'mission-state',
  localityRoleBinding: 'locality-role-binding',
  employeeOpeningContext: 'employee-opening-context',
  exactDeliveryReference: 'exact-delivery-reference',
  acceptedOrder: 'accepted-order',
  pickedUpCustody: 'picked-up-custody',
  authoritativeOutcome: 'authoritative-first-service-outcome',
  wageSettlement: 'player-economy-wage-settlement',
  capabilityOpportunity: 'capability-opportunity-if-shown',
  presentationOnly: 'presentation-only',
} as const)
export type FirstHourAuthorityCode = (typeof FIRST_HOUR_AUTHORITY_CODES)[keyof typeof FIRST_HOUR_AUTHORITY_CODES]

export const FIRST_HOUR_STORY_TRIGGER_IDS = Object.freeze({
  opening: 'trigger:first-hour:opening-context-ready',
  firstStandard: 'trigger:first-hour:first-standard-ready',
  coworker: 'trigger:first-hour:coworker-meeting-ready',
  oneSmallThing: 'trigger:first-hour:one-small-thing-ready',
  merchantArrival: 'trigger:first-hour:one-small-thing-arrival',
  consequenceClean: 'trigger:first-hour:first-consequence-clean',
  consequenceRecovered: 'trigger:first-hour:first-consequence-recovered',
  consequenceFailed: 'trigger:first-hour:first-consequence-failed',
  workLeavesMark: 'trigger:first-hour:work-leaves-a-mark-ready',
  firstPay: 'trigger:first-hour:first-pay-ready',
  careerHorizon: 'trigger:first-hour:career-horizon-ready',
} as const)
export type FirstHourStoryTriggerId = (typeof FIRST_HOUR_STORY_TRIGGER_IDS)[keyof typeof FIRST_HOUR_STORY_TRIGGER_IDS]

export const FIRST_HOUR_HANDOFF_LINE_IDS = Object.freeze({
  oneSmallThingFrame: 'line:prologue:one-small-thing-framing',
  workLeavesMark: 'line:prologue:work-leaves-a-mark',
} as const)
export const FIRST_HOUR_HANDOFF_LINE_COPY = Object.freeze({
  [FIRST_HOUR_HANDOFF_LINE_IDS.oneSmallThingFrame]: 'One small delivery. One real business need. Get it there cleanly.',
  [FIRST_HOUR_HANDOFF_LINE_IDS.workLeavesMark]: 'One completed route becomes history. What you do next starts from what really happened.',
} as const)

export interface FirstHourStoryMissionGate {
  missionId: string
  authoredRef: string
  statuses: readonly MissionStatus[]
  stageId?: string
  requiredFactIds?: readonly string[]
  forbiddenFactIds?: readonly string[]
}
export interface FirstHourStoryPresentation {
  presentationId: string
  beatRef: string
  lineRefs: readonly string[]
  roleId?: FirstHourStoryRoleId
  chapterLabel?: string
  existingSequenceId?: string
  existingBeatIds?: readonly string[]
  optional?: boolean
}
export interface FirstHourStoryAck {
  receiptId: string
  signalType: string
  referenceRoleId?: FirstHourStoryRoleId
  convertedBy: 'DT-09'
}
export interface FirstHourStoryTrigger {
  triggerId: FirstHourStoryTriggerId
  requiredRoles: readonly FirstHourStoryRoleId[]
  authority: readonly FirstHourAuthorityCode[]
  gate: FirstHourStoryMissionGate
  presentation: readonly FirstHourStoryPresentation[]
  ack?: FirstHourStoryAck
}

export const FIRST_HOUR_STORY_FORBIDDEN_AUTHORITIES = Object.freeze([
  'money-or-wage-mutation',
  'work-capacity-mutation',
  'capability-or-qualification-grant',
  'equipment-or-vehicle-grant',
  'demand-creation',
  'order-or-cargo-mutation',
  'mission-completion-mutation',
  'relationship-or-reputation-score',
  'locality-identity-creation',
] as const)

export type FirstServiceOutcome = 'CLEAN' | 'RECOVERED' | 'FAILED'
export interface FirstServiceOutcomePresentation {
  outcome: FirstServiceOutcome
  factId: string
  merchantLineRef: string
  dispatcherLineRef: string
}
export const FIRST_SERVICE_OUTCOME_PRESENTATIONS: Readonly<Record<FirstServiceOutcome, FirstServiceOutcomePresentation>> = Object.freeze({
  CLEAN: {
    outcome: 'CLEAN', factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
    merchantLineRef: 'line:mirela:one-small-thing-clean', dispatcherLineRef: 'line:ana:first-consequence-clean',
  },
  RECOVERED: {
    outcome: 'RECOVERED', factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered,
    merchantLineRef: 'line:mirela:one-small-thing-recovered', dispatcherLineRef: 'line:ana:first-consequence-recovered',
  },
  FAILED: {
    outcome: 'FAILED', factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed,
    merchantLineRef: 'line:mirela:one-small-thing-failed', dispatcherLineRef: 'line:ana:first-consequence-failed',
  },
})
export const resolveFirstServiceOutcomePresentation = (factIds: readonly string[]): FirstServiceOutcomePresentation | undefined => {
  const facts = new Set(factIds)
  const matches = Object.values(FIRST_SERVICE_OUTCOME_PRESENTATIONS).filter(candidate => facts.has(candidate.factId))
  return matches.length === 1 ? { ...matches[0] } : undefined
}

const gate = (missionId: string, authoredRef: string, statuses: readonly MissionStatus[], stageId?: string,
  requiredFactIds?: readonly string[], forbiddenFactIds?: readonly string[]): FirstHourStoryMissionGate =>
  ({ missionId, authoredRef, statuses, stageId, requiredFactIds, forbiddenFactIds })
const AUTH = FIRST_HOUR_AUTHORITY_CODES
const ROLE = FIRST_HOUR_STORY_ROLE_IDS
const TRIGGER = FIRST_HOUR_STORY_TRIGGER_IDS
const outcomeFacts = [
  BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
  BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered,
  BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed,
] as const
const consequenceTriggerId = (outcome: FirstServiceOutcome): FirstHourStoryTriggerId =>
  outcome === 'CLEAN' ? TRIGGER.consequenceClean : outcome === 'RECOVERED' ? TRIGGER.consequenceRecovered : TRIGGER.consequenceFailed

const outcomeTriggers = (Object.keys(FIRST_SERVICE_OUTCOME_PRESENTATIONS) as FirstServiceOutcome[]).map((outcome): FirstHourStoryTrigger => {
  const selected = FIRST_SERVICE_OUTCOME_PRESENTATIONS[outcome]
  return {
    triggerId: consequenceTriggerId(outcome),
    requiredRoles: [ROLE.merchant, ROLE.dispatcherMentor],
    authority: [AUTH.missionState, AUTH.authoritativeOutcome, AUTH.localityRoleBinding, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence, BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence,
      ['Available', 'Active'], undefined, [selected.factId], outcomeFacts.filter(factId => factId !== selected.factId)),
    presentation: [
      { presentationId: `presentation:first-hour:first-service-${outcome.toLowerCase()}-merchant`,
        beatRef: 'beat:braila:first-day:one-small-thing', lineRefs: [selected.merchantLineRef], roleId: ROLE.merchant },
      { presentationId: `presentation:first-hour:first-consequence-${outcome.toLowerCase()}-mentor`,
        beatRef: 'beat:braila:first-day:first-consequence', lineRefs: [selected.dispatcherLineRef], roleId: ROLE.dispatcherMentor,
        ...(outcome === 'CLEAN' ? { existingSequenceId: 'prologue:first-settled-delivery:visual-consequence:v1', existingBeatIds: ['ana-first-consequence'] } : {}) },
    ],
    ack: { receiptId: 'receipt:presentation:first-hour:first-consequence-ack',
      signalType: BRAILA_FIRST_HOUR_SIGNALS.firstConsequencePresented, referenceRoleId: ROLE.dispatcherMentor, convertedBy: 'DT-09' },
  }
})

export const FIRST_HOUR_STORY_RUNTIME_HANDOFF: readonly FirstHourStoryTrigger[] = Object.freeze([
  {
    triggerId: TRIGGER.opening, requiredRoles: [ROLE.dispatcherMentor],
    authority: [AUTH.missionState, AUTH.localityRoleBinding, AUTH.employeeOpeningContext, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart, BRAILA_FIRST_HOUR_AUTHORED_REFS.placeToStart, ['Available', 'Active'], 'report-for-work'),
    presentation: [{ presentationId: 'presentation:first-hour:first-shift-opening', beatRef: 'beat:braila:first-day:a-place-to-start',
      lineRefs: ['line:prologue:first-shift-card', 'line:ana:first-phone-report'], roleId: ROLE.dispatcherMentor,
      chapterLabel: 'PROLOGUE · FIRST SHIFT', existingSequenceId: 'prologue:first-shift:visual-opening:v1', existingBeatIds: ['first-shift-card'] }],
  },
  {
    triggerId: TRIGGER.firstStandard, requiredRoles: [ROLE.dispatcherMentor],
    authority: [AUTH.missionState, AUTH.localityRoleBinding, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard, BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard, ['Available', 'Active'], 'standard'),
    presentation: [{ presentationId: 'presentation:first-hour:first-standard', beatRef: 'beat:braila:first-day:the-first-standard',
      lineRefs: ['line:ana:first-standard'], roleId: ROLE.dispatcherMentor,
      existingSequenceId: 'prologue:first-shift:visual-opening:v1', existingBeatIds: ['ana-first-brief'] }],
    ack: { receiptId: 'receipt:presentation:first-hour:first-standard-ack', signalType: BRAILA_FIRST_HOUR_SIGNALS.firstStandardAcknowledged,
      referenceRoleId: ROLE.dispatcherMentor, convertedBy: 'DT-09' },
  },
  {
    triggerId: TRIGGER.coworker, requiredRoles: [ROLE.coworkerPeer],
    authority: [AUTH.missionState, AUTH.localityRoleBinding, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard, BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard, ['Active'], 'meet-radu'),
    presentation: [{ presentationId: 'presentation:first-hour:coworker-meeting', beatRef: 'beat:braila:first-day:the-first-standard',
      lineRefs: ['line:radu:first-meeting'], roleId: ROLE.coworkerPeer,
      existingSequenceId: 'prologue:first-shift:visual-opening:v1', existingBeatIds: ['radu-first-meeting'] }],
    ack: { receiptId: 'receipt:presentation:first-hour:coworker-meeting-ack', signalType: BRAILA_FIRST_HOUR_SIGNALS.actorMet,
      referenceRoleId: ROLE.coworkerPeer, convertedBy: 'DT-09' },
  },
  {
    triggerId: TRIGGER.oneSmallThing, requiredRoles: [ROLE.merchant],
    authority: [AUTH.missionState, AUTH.localityRoleBinding, AUTH.employeeOpeningContext, AUTH.exactDeliveryReference, AUTH.acceptedOrder, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing, BRAILA_FIRST_HOUR_AUTHORED_REFS.oneSmallThing, ['Available', 'Active'], 'pickup'),
    presentation: [{ presentationId: 'presentation:first-hour:one-small-thing-frame', beatRef: 'beat:braila:first-day:one-small-thing',
      lineRefs: [FIRST_HOUR_HANDOFF_LINE_IDS.oneSmallThingFrame], roleId: ROLE.merchant, chapterLabel: 'ONE SMALL THING' }],
  },
  {
    triggerId: TRIGGER.merchantArrival, requiredRoles: [ROLE.merchant],
    authority: [AUTH.missionState, AUTH.localityRoleBinding, AUTH.exactDeliveryReference, AUTH.pickedUpCustody, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing, BRAILA_FIRST_HOUR_AUTHORED_REFS.oneSmallThing, ['Active'], 'deliver'),
    presentation: [{ presentationId: 'presentation:first-hour:one-small-thing-arrival', beatRef: 'beat:braila:first-day:one-small-thing',
      lineRefs: ['line:mirela:one-small-thing-arrival'], roleId: ROLE.merchant }],
  },
  ...outcomeTriggers,
  {
    triggerId: TRIGGER.workLeavesMark, requiredRoles: [],
    authority: [AUTH.missionState, AUTH.authoritativeOutcome, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence, BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence, ['Completed']),
    presentation: [{ presentationId: 'presentation:first-hour:work-leaves-a-mark', beatRef: 'beat:braila:first-day:first-consequence',
      lineRefs: [FIRST_HOUR_HANDOFF_LINE_IDS.workLeavesMark], chapterLabel: 'YOUR WORK LEAVES A MARK',
      existingSequenceId: 'prologue:first-settled-delivery:visual-consequence:v1', existingBeatIds: ['next-opportunity'] }],
  },
  {
    triggerId: TRIGGER.firstPay, requiredRoles: [],
    authority: [AUTH.missionState, AUTH.wageSettlement, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.firstPay, BRAILA_FIRST_HOUR_AUTHORED_REFS.firstPay, ['Available', 'Active']),
    presentation: [{ presentationId: 'presentation:first-hour:first-pay', beatRef: 'beat:braila:first-day:first-pay-means-something',
      lineRefs: ['line:prologue:first-pay-reflection'] }],
    ack: { receiptId: 'receipt:presentation:first-hour:first-pay-ack', signalType: BRAILA_FIRST_HOUR_SIGNALS.wageSettlementObserved, convertedBy: 'DT-09' },
  },
  {
    triggerId: TRIGGER.careerHorizon, requiredRoles: [ROLE.dispatcherMentor, ROLE.coworkerPeer],
    authority: [AUTH.missionState, AUTH.localityRoleBinding, AUTH.capabilityOpportunity, AUTH.presentationOnly],
    gate: gate(BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow, BRAILA_FIRST_HOUR_AUTHORED_REFS.tomorrow, ['Available', 'Active']),
    presentation: [
      { presentationId: 'presentation:first-hour:career-horizon-peer', beatRef: 'beat:braila:first-day:tomorrow-has-more-than-one-direction',
        lineRefs: ['line:radu:first-career-horizon'], roleId: ROLE.coworkerPeer, optional: true },
      { presentationId: 'presentation:first-hour:career-horizon-mentor', beatRef: 'beat:braila:first-day:tomorrow-has-more-than-one-direction',
        lineRefs: ['line:ana:first-career-horizon', 'line:prologue:first-hour-close'], roleId: ROLE.dispatcherMentor },
    ],
    ack: { receiptId: 'receipt:presentation:first-hour:career-horizon-ack', signalType: BRAILA_FIRST_HOUR_SIGNALS.careerHorizonSeen,
      referenceRoleId: ROLE.dispatcherMentor, convertedBy: 'DT-09' },
  },
])

export const getFirstHourStoryTrigger = (triggerId: FirstHourStoryTriggerId): FirstHourStoryTrigger | undefined =>
  FIRST_HOUR_STORY_RUNTIME_HANDOFF.find(trigger => trigger.triggerId === triggerId)
