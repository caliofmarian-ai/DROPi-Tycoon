import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  BRAILA_FIRST_HOUR_AUTHORED_REFS,
  BRAILA_FIRST_HOUR_MISSION_IDS,
} from '../src/missions/brailaFirstHourAuthoredRegistry'
import {
  FIRST_HOUR_AUTHORITY_CODES,
  FIRST_HOUR_STORY_ROLE_IDS,
  FIRST_HOUR_STORY_TRIGGER_IDS,
} from '../src/narrative/firstHourStoryRuntimeHandoff'
import {
  presentFirstHourStoryTrigger,
  resolveFirstHourStoryPresentation,
  type FirstHourStoryPresentationEvidence,
} from '../src/narrative/firstHourStoryPresentationAdapter'
import type { NarrativePresentationCallbacks } from '../src/ui/NarrativePresentation'
import type { NarrativePresentationSequence } from '../src/narrative/visualStorytelling'

// Source-backed DT-11 locality IDs used only as coherence fixtures; DT-10 does not create locality identity.
const BRAILA_LOCALITY_ID = 'dropi:locality:geonames:683902'
const CLUJ_LOCALITY_ID = 'dropi:locality:geonames:681290'

const brailaFirstStandardEvidence = (): FirstHourStoryPresentationEvidence => ({
  triggerId: FIRST_HOUR_STORY_TRIGGER_IDS.firstStandard,
  mission: {
    missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard,
    authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard,
    localityId: BRAILA_LOCALITY_ID,
    status: 'Active',
    stageId: 'standard',
  },
  factIds: [],
  authorityCodes: [
    FIRST_HOUR_AUTHORITY_CODES.missionState,
    FIRST_HOUR_AUTHORITY_CODES.localityRoleBinding,
  ],
  roleContext: {
    currentLocalityId: BRAILA_LOCALITY_ID,
    bindings: [{
      roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor,
      localityId: BRAILA_LOCALITY_ID,
      actorId: 'actor:braila:ana',
      characterRef: 'ana-stoica',
      displayName: 'Ana Stoica',
      employerDisplayName: 'Northstar Parcel Logistics',
    }],
  },
})

describe('DT-10 #554 authoritative first-hour Story presentation adapter', () => {
  it('reuses the existing #558 Braila presentation beat only after the DT-08 gate is satisfied', () => {
    const resolved = resolveFirstHourStoryPresentation(brailaFirstStandardEvidence())

    expect(resolved.eligible).toBe(true)
    if (!resolved.eligible) return
    expect(resolved.sequence.beats).toHaveLength(1)
    expect(resolved.sequence.beats[0]).toMatchObject({
      beatId: 'ana-first-brief',
      characterId: 'ana-stoica',
      canonicalLineRef: 'line:ana:first-standard',
    })
    expect(resolved.acknowledgement).toEqual({
      receiptId: 'receipt:presentation:first-hour:first-standard-ack',
      signalType: 'braila-first-hour:first-standard-acknowledged',
      referenceActorId: 'actor:braila:ana',
      convertedBy: 'DT-09',
    })
  })

  it('requests the stable DT-09 acknowledgement only after the overlay reports completion', () => {
    let callbacks: NarrativePresentationCallbacks | undefined
    let sequence: NarrativePresentationSequence | undefined
    const requests: unknown[] = []
    const port = {
      present(next: NarrativePresentationSequence, nextCallbacks?: NarrativePresentationCallbacks): boolean {
        sequence = next
        callbacks = nextCallbacks
        return true
      },
    }

    const result = presentFirstHourStoryTrigger(port, brailaFirstStandardEvidence(), request => requests.push(request))
    expect(result.eligible).toBe(true)
    expect(requests).toEqual([])

    callbacks?.onComplete?.(sequence!.sequenceId)
    expect(requests).toEqual([{
      receiptId: 'receipt:presentation:first-hour:first-standard-ack',
      signalType: 'braila-first-hour:first-standard-acknowledged',
      referenceActorId: 'actor:braila:ana',
      convertedBy: 'DT-09',
    }])
  })

  it('blocks replay when DT-09 already exposes the stable acknowledgement receipt', () => {
    const evidence = brailaFirstStandardEvidence()
    evidence.acknowledgedReceiptIds = ['receipt:presentation:first-hour:first-standard-ack']

    expect(resolveFirstHourStoryPresentation(evidence)).toMatchObject({
      eligible: false,
      blocker: 'already-acknowledged',
    })
  })

  it('fails closed when an owning authority required by the trigger is absent', () => {
    const evidence = brailaFirstStandardEvidence()
    evidence.authorityCodes = [FIRST_HOUR_AUTHORITY_CODES.missionState]

    expect(resolveFirstHourStoryPresentation(evidence)).toMatchObject({
      eligible: false,
      blocker: 'authority-missing',
    })
  })

  it('fails closed when Braila-authored mission/story refs are presented in a non-Braila locality context', () => {
    const evidence: FirstHourStoryPresentationEvidence = {
      ...brailaFirstStandardEvidence(),
      roleContext: {
        currentLocalityId: CLUJ_LOCALITY_ID,
        bindings: [{
          roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor,
          localityId: CLUJ_LOCALITY_ID,
          actorId: 'actor:fixture:mentor',
          characterRef: 'character:fixture:mentor',
          displayName: 'Local mentor',
          employerDisplayName: 'Local employer',
        }],
      },
      authoredLines: {
        'line:ana:first-standard': 'This supplied line must not make Braila authored evidence portable.',
      },
    }

    expect(evidence.mission.missionId).toContain('mission:braila:')
    expect(evidence.mission.authoredRef).toContain('story:braila:')
    expect(resolveFirstHourStoryPresentation(evidence)).toMatchObject({
      eligible: false,
      blocker: 'locality-evidence-mismatch',
    })
  })

  it('fails closed when mission locality evidence is missing instead of inferring locality from authored refs', () => {
    const evidence = brailaFirstStandardEvidence()
    evidence.mission.localityId = ''

    expect(resolveFirstHourStoryPresentation(evidence)).toMatchObject({
      eligible: false,
      blocker: 'locality-evidence-mismatch',
    })
  })

  it('uses the DT-08 handoff copy for a role-free Brăila consequence card without inventing a character', () => {
    const evidence: FirstHourStoryPresentationEvidence = {
      triggerId: FIRST_HOUR_STORY_TRIGGER_IDS.workLeavesMark,
      mission: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence,
        authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence,
        localityId: BRAILA_LOCALITY_ID,
        status: 'Completed',
      },
      factIds: [],
      authorityCodes: [
        FIRST_HOUR_AUTHORITY_CODES.missionState,
        FIRST_HOUR_AUTHORITY_CODES.authoritativeOutcome,
      ],
      roleContext: { currentLocalityId: BRAILA_LOCALITY_ID, bindings: [] },
    }

    const resolved = resolveFirstHourStoryPresentation(evidence)
    expect(resolved.eligible).toBe(true)
    if (!resolved.eligible) return
    expect(resolved.sequence.beats[0].chapterLabel).toBe('YOUR WORK LEAVES A MARK')
    expect(resolved.sequence.beats[0].characterId).toBeUndefined()
  })

  it('contains no screen-open, revenue, raw mission-resume or Mara heuristic trigger path', () => {
    const source = readFileSync(new URL('../src/narrative/firstHourStoryPresentationAdapter.ts', import.meta.url), 'utf8')

    expect(source).not.toContain('world.activeOrder')
    expect(source).not.toContain('company.revenue')
    expect(source).not.toContain('session.missionResume')
    expect(source).not.toContain("'Mara'")
    expect(source).not.toContain('screen-open')
  })
})
