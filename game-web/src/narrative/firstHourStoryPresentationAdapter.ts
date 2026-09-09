import type { MissionStatus } from '../missions/missionModel'
import {
  BRAILA_FIRST_HOUR_ROLE_CHARACTER_REFS,
  FIRST_HOUR_AUTHORITY_CODES,
  FIRST_HOUR_HANDOFF_LINE_COPY,
  getFirstHourStoryTrigger,
  resolveFirstHourStoryRoles,
  type FirstHourAuthorityCode,
  type FirstHourStoryAck,
  type FirstHourStoryPresentation,
  type FirstHourStoryRoleBinding,
  type FirstHourStoryRoleContext,
  type FirstHourStoryRoleId,
  type FirstHourStoryTrigger,
  type FirstHourStoryTriggerId,
} from './firstHourStoryRuntimeHandoff'
import {
  FIRST_DELIVERY_CONSEQUENCE_SEQUENCE,
  FIRST_SHIFT_OPENING_SEQUENCE,
  NARRATIVE_CHARACTER_VISUALS,
  NARRATIVE_PRESENTATION_VERSION,
  type NarrativeAuthorityBinding,
  type NarrativeCharacterId,
  type NarrativePresentationBeat,
  type NarrativePresentationSequence,
} from './visualStorytelling'
import type { NarrativePresentationCallbacks } from '../ui/NarrativePresentation'

export const FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION = 1 as const

/**
 * Braila authored copy mirrored from the current Story Director contract by stable line ID.
 * It is used only when the resolved role is the canonical Braila character. A locality-specific
 * role binding must supply its own governed line copy and can never inherit Ana/Radu/Mirela text.
 */
export const BRAILA_FIRST_HOUR_RUNTIME_LINE_COPY: Readonly<Record<string, string>> = Object.freeze({
  'line:prologue:first-shift-card': 'Braila. First shift. One phone, one backpack, and a day that has to add up.',
  'line:ana:first-phone-report': 'Station Commons. Report to dispatch on time. Walking and light work only today. Bring the phone.',
  'line:ana:first-standard': 'Check the address. Keep custody clean. Do not promise what you cannot deliver. Reliable beats impressive.',
  'line:radu:first-meeting': "First day? Good. Then neither of us has to pretend this route is easy. I'm Radu.",
  'line:mirela:one-small-thing-arrival': "You're from Northstar? Good. I'm waiting on this for today's orders, not for decoration.",
  'line:mirela:one-small-thing-clean': "That was simple. Simple is good when people are waiting on you. I'll remember that.",
  'line:mirela:one-small-thing-recovered': 'I needed it earlier. But you came back and finished what you could finish.',
  'line:mirela:one-small-thing-failed': 'I still have orders waiting. Fix the record with dispatch first. Then we can talk about the next one.',
  'line:ana:first-consequence-clean': 'Good. Not dramatic. Just clean work somebody can rely on. That is how the next responsibility starts.',
  'line:ana:first-consequence-recovered': 'A problem is not the same as a cover-up. You recovered it and reported what happened. Learn from that.',
  'line:ana:first-consequence-failed': 'We do not erase a bad route. We close the record, fix what can be fixed, and decide what you are ready for next.',
  'line:prologue:first-pay-reflection': 'Paid work buys breathing room. What comes next still has a cost: living, saving, equipment, training, time.',
  'line:radu:first-career-horizon': "Walking is where I started, not where I plan to stop. I'm looking at bicycle work first, then something technical if I can qualify.",
  'line:ana:first-career-horizon': 'Reliability opens conversations. Capability decides which ones you are actually ready for.',
  'line:prologue:first-hour-close': 'I have a job today. Tomorrow can become something else.',
  ...FIRST_HOUR_HANDOFF_LINE_COPY,
})

export interface FirstHourStoryMissionPresentationEvidence {
  missionId: string
  authoredRef: string
  status: MissionStatus
  stageId?: string
}

export interface FirstHourStoryPresentationEvidence {
  triggerId: FirstHourStoryTriggerId
  mission: FirstHourStoryMissionPresentationEvidence
  factIds: readonly string[]
  authorityCodes: readonly FirstHourAuthorityCode[]
  roleContext: FirstHourStoryRoleContext
  /** Durable acknowledgement receipt IDs already accepted by DT-09. */
  acknowledgedReceiptIds?: readonly string[]
  /** Governed locality-specific line copy keyed by DT-08 line ref. */
  authoredLines?: Readonly<Record<string, string>>
}

export interface FirstHourStoryAcknowledgementRequest {
  receiptId: string
  signalType: string
  referenceActorId?: string
  convertedBy: 'DT-09'
}

export interface FirstHourStoryPresentationPort {
  present(sequence: NarrativePresentationSequence, callbacks?: NarrativePresentationCallbacks): boolean
}

export type FirstHourStoryPresentationBlocker =
  | 'unknown-trigger'
  | 'mission-gate-mismatch'
  | 'required-fact-missing'
  | 'forbidden-fact-present'
  | 'authority-missing'
  | 'role-binding-invalid'
  | 'already-acknowledged'
  | 'authored-line-missing'
  | 'presentation-busy-or-finished'

export type FirstHourStoryPresentationResolution =
  | {
      eligible: true
      version: typeof FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION
      trigger: FirstHourStoryTrigger
      sequence: NarrativePresentationSequence
      acknowledgement?: FirstHourStoryAcknowledgementRequest
    }
  | {
      eligible: false
      version: typeof FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION
      blocker: FirstHourStoryPresentationBlocker
    }

const existingSequences: readonly NarrativePresentationSequence[] = [
  FIRST_SHIFT_OPENING_SEQUENCE,
  FIRST_DELIVERY_CONSEQUENCE_SEQUENCE,
]

const canonicalCharacterForRole = (
  roleId: FirstHourStoryRoleId,
  binding: FirstHourStoryRoleBinding,
): NarrativeCharacterId | undefined => {
  const characterRef = BRAILA_FIRST_HOUR_ROLE_CHARACTER_REFS[roleId]
  if (binding.characterRef !== characterRef || !(characterRef in NARRATIVE_CHARACTER_VISUALS)) return undefined
  return characterRef as NarrativeCharacterId
}

const authorityBindingFor = (trigger: FirstHourStoryTrigger): NarrativeAuthorityBinding => ({
  missionId: trigger.gate.missionId,
  authoredRef: trigger.gate.authoredRef,
  signalTypes: trigger.ack ? [trigger.ack.signalType] : [],
  factIds: trigger.gate.requiredFactIds ? [...trigger.gate.requiredFactIds] : [],
})

const selectedExistingBeats = (
  presentation: FirstHourStoryPresentation,
  roleBinding?: FirstHourStoryRoleBinding,
): NarrativePresentationBeat[] | null => {
  if (!presentation.existingSequenceId || !presentation.existingBeatIds?.length) return null
  if (presentation.roleId && (!roleBinding || !canonicalCharacterForRole(presentation.roleId, roleBinding))) return null
  const sequence = existingSequences.find(candidate => candidate.sequenceId === presentation.existingSequenceId)
  if (!sequence) return null
  const beats = presentation.existingBeatIds
    .map(beatId => sequence.beats.find(beat => beat.beatId === beatId))
  if (beats.some(beat => !beat)) return null
  return beats.map(beat => ({ ...beat! }))
}

const lineTextFor = (
  lineRef: string,
  presentation: FirstHourStoryPresentation,
  roleBinding: FirstHourStoryRoleBinding | undefined,
  authoredLines: Readonly<Record<string, string>> | undefined,
): string | undefined => {
  const supplied = authoredLines?.[lineRef]
  if (typeof supplied === 'string' && supplied.trim().length > 0) return supplied.trim()

  if (presentation.roleId) {
    if (!roleBinding || !canonicalCharacterForRole(presentation.roleId, roleBinding)) return undefined
  }
  return BRAILA_FIRST_HOUR_RUNTIME_LINE_COPY[lineRef]
}

const materializePresentationBeat = (
  trigger: FirstHourStoryTrigger,
  presentation: FirstHourStoryPresentation,
  roleBinding: FirstHourStoryRoleBinding | undefined,
  authoredLines: Readonly<Record<string, string>> | undefined,
): NarrativePresentationBeat | undefined => {
  const lines = presentation.lineRefs.map(lineRef => lineTextFor(lineRef, presentation, roleBinding, authoredLines))
  if (lines.some(line => !line)) return undefined
  const characterId = presentation.roleId && roleBinding
    ? canonicalCharacterForRole(presentation.roleId, roleBinding)
    : undefined
  const contextLabel = roleBinding
    ? `${roleBinding.displayName}${roleBinding.employerDisplayName ? ` · ${roleBinding.employerDisplayName}` : ''}`
    : undefined

  return {
    beatId: presentation.presentationId,
    kind: presentation.chapterLabel ? 'chapter' : presentation.roleId ? 'dialogue' : 'outcome',
    ...(presentation.chapterLabel ? { chapterLabel: presentation.chapterLabel } : {}),
    ...(characterId ? { characterId } : {}),
    ...(contextLabel ? { contextLabel } : {}),
    text: lines.join('\n\n'),
    continueLabel: 'Continue',
    dismissible: true,
    canonicalBeatRef: presentation.beatRef,
    canonicalLineRef: presentation.lineRefs[0],
    authorityBinding: authorityBindingFor(trigger),
  }
}

const acknowledgementFor = (
  ack: FirstHourStoryAck | undefined,
  bindings: Readonly<Partial<Record<FirstHourStoryRoleId, FirstHourStoryRoleBinding>>>,
): FirstHourStoryAcknowledgementRequest | undefined => {
  if (!ack) return undefined
  const referenceActorId = ack.referenceRoleId ? bindings[ack.referenceRoleId]?.actorId : undefined
  if (ack.referenceRoleId && !referenceActorId) return undefined
  return {
    receiptId: ack.receiptId,
    signalType: ack.signalType,
    ...(referenceActorId ? { referenceActorId } : {}),
    convertedBy: 'DT-09',
  }
}

/**
 * Resolves one explicit DT-08 trigger from caller-supplied authoritative evidence.
 * It never reads screen state, revenue, raw Save envelopes, active-order heuristics or local
 * merchant onboarding to decide whether story is allowed to appear.
 */
export const resolveFirstHourStoryPresentation = (
  evidence: FirstHourStoryPresentationEvidence,
): FirstHourStoryPresentationResolution => {
  const trigger = getFirstHourStoryTrigger(evidence.triggerId)
  if (!trigger) return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'unknown-trigger' }

  const gate = trigger.gate
  if (
    evidence.mission.missionId !== gate.missionId ||
    evidence.mission.authoredRef !== gate.authoredRef ||
    !gate.statuses.includes(evidence.mission.status) ||
    (gate.stageId !== undefined && evidence.mission.stageId !== gate.stageId)
  ) return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'mission-gate-mismatch' }

  const facts = new Set(evidence.factIds)
  if (gate.requiredFactIds?.some(factId => !facts.has(factId))) {
    return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'required-fact-missing' }
  }
  if (gate.forbiddenFactIds?.some(factId => facts.has(factId))) {
    return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'forbidden-fact-present' }
  }

  const suppliedAuthority = new Set(evidence.authorityCodes)
  const missingAuthority = trigger.authority.some(code =>
    code !== FIRST_HOUR_AUTHORITY_CODES.presentationOnly && !suppliedAuthority.has(code),
  )
  if (missingAuthority) {
    return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'authority-missing' }
  }

  const roles = resolveFirstHourStoryRoles(evidence.roleContext, trigger.requiredRoles)
  if (!roles.eligible) {
    return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'role-binding-invalid' }
  }

  if (trigger.ack && evidence.acknowledgedReceiptIds?.includes(trigger.ack.receiptId)) {
    return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'already-acknowledged' }
  }

  const beats: NarrativePresentationBeat[] = []
  for (const presentation of trigger.presentation) {
    const roleBinding = presentation.roleId ? roles.bindings[presentation.roleId] : undefined
    const existing = selectedExistingBeats(presentation, roleBinding)
    if (existing) {
      beats.push(...existing)
      continue
    }
    const materialized = materializePresentationBeat(trigger, presentation, roleBinding, evidence.authoredLines)
    if (!materialized) {
      if (presentation.optional) continue
      return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'authored-line-missing' }
    }
    beats.push(materialized)
  }

  if (beats.length === 0) {
    return { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'authored-line-missing' }
  }

  return {
    eligible: true,
    version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION,
    trigger,
    sequence: {
      version: NARRATIVE_PRESENTATION_VERSION,
      sequenceId: `first-hour-presentation:${trigger.triggerId}:v1`,
      beats,
    },
    ...(trigger.ack ? { acknowledgement: acknowledgementFor(trigger.ack, roles.bindings) } : {}),
  }
}

/**
 * Thin executable bridge to the existing #558 overlay. Completion only requests the stable
 * DT-09 acknowledgement; this adapter never marks mission/story facts complete itself.
 */
export const presentFirstHourStoryTrigger = (
  port: FirstHourStoryPresentationPort,
  evidence: FirstHourStoryPresentationEvidence,
  onAcknowledgementRequested?: (request: FirstHourStoryAcknowledgementRequest) => void,
): FirstHourStoryPresentationResolution => {
  const resolved = resolveFirstHourStoryPresentation(evidence)
  if (!resolved.eligible) return resolved
  const accepted = port.present(resolved.sequence, {
    onComplete: () => {
      if (resolved.acknowledgement) onAcknowledgementRequested?.(resolved.acknowledgement)
    },
  })
  return accepted
    ? resolved
    : { eligible: false, version: FIRST_HOUR_STORY_PRESENTATION_ADAPTER_VERSION, blocker: 'presentation-busy-or-finished' }
}
