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

const brailaFirstStandardEvidence = (): FirstHourStoryPresentationEvidence => ({
  triggerId: FIRST_HOUR_STORY_TRIGGER_IDS.firstStandard,
  mission: {
    missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard,
    authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstStandard,
    status: 'Active',
    stageId: 'standard',
  },
  factIds: [],
  authorityCodes: [
    FIRST_HOUR_AUTHORITY_CODES.missionState,
    FIRST_HOUR_AUTHORITY_CODES.localityRoleBinding,
  ],
  roleContext: {
    currentLocalityId: 'locality:ro:braila-fixture',
    bindings: [{
      roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor,
      localityId: 'locality:ro:braila-fixture',
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

  it('supports a second-locality role fixture without ever substituting Ana/Radu or a Braila portrait', () => {
    const evidence: FirstHourStoryPresentationEvidence = {
      ...brailaFirstStandardEvidence(),
      roleContext: {
        currentLocalityId: 'locality:fixture:second-city',
        bindings: [{
          roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor,
          localityId: 'locality:fixture:second-city',
          actorId: 'actor:fixture:mentor',
          characterRef: 'character:fixture:mentor',
          displayName: 'Local mentor',
          employerDisplayName: 'Local employer',
        }],
      },
      authoredLines: {
        'line:ana:first-standard': 'Check the handoff, keep custody clean, and close the work you accept.',
      },
    }

    const resolved = resolveFirstHourStoryPresentation(evidence)
    expect(resolved.eligible).toBe(true)
    if (!resolved.eligible) return

    expect(resolved.sequence.beats).toHaveLength(1)
    expect(resolved.sequence.beats[0]).toMatchObject({
      beatId: 'presentation:first-hour:first-standard',
      contextLabel: 'Local mentor · Local employer',
      text: 'Check the handoff, keep custody clean, and close the work you accept.',
    })
    expect(resolved.sequence.beats[0].characterId).toBeUndefined()
    const visible = JSON.stringify(resolved.sequence)
    expect(visible).not.toContain('ana-stoica')
    expect(visible).not.toContain('radu-marin')
    expect(visible).not.toContain('Ana Stoica')
    expect(visible).not.toContain('Radu Marin')
    expect(visible).not.toContain('Braila')
    expect(visible).not.toContain('Brăila')
  })

  it('does not fall back to Braila authored copy when a non-Braila role has no governed local line', () => {
    const evidence: FirstHourStoryPresentationEvidence = {
      ...brailaFirstStandardEvidence(),
      roleContext: {
        currentLocalityId: 'locality:fixture:second-city',
        bindings: [{
          roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor,
          localityId: 'locality:fixture:second-city',
          actorId: 'actor:fixture:mentor',
          characterRef: 'character:fixture:mentor',
          displayName: 'Local mentor',
        }],
      },
    }

    expect(resolveFirstHourStoryPresentation(evidence)).toMatchObject({
      eligible: false,
      blocker: 'authored-line-missing',
    })
  })

  it('uses the DT-08 handoff copy for a role-free consequence card without inventing a character', () => {
    const evidence: FirstHourStoryPresentationEvidence = {
      triggerId: FIRST_HOUR_STORY_TRIGGER_IDS.workLeavesMark,
      mission: {
        missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence,
        authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.firstConsequence,
        status: 'Completed',
      },
      factIds: [],
      authorityCodes: [
        FIRST_HOUR_AUTHORITY_CODES.missionState,
        FIRST_HOUR_AUTHORITY_CODES.authoritativeOutcome,
      ],
      roleContext: { currentLocalityId: 'locality:fixture:any', bindings: [] },
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
