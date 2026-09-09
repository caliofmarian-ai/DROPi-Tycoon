import { describe, expect, it } from 'vitest'
import {
  BRAILA_FIRST_HOUR_AUTHORED_REFS,
  BRAILA_FIRST_HOUR_FACT_IDS,
  BRAILA_FIRST_HOUR_MISSION_IDS,
  BRAILA_FIRST_HOUR_SIGNALS,
} from '../src/missions/brailaFirstHourAuthoredRegistry'
import {
  FIRST_DELIVERY_CONSEQUENCE_SEQUENCE,
  FIRST_SHIFT_OPENING_SEQUENCE,
} from '../src/narrative/visualStorytelling'
import {
  BRAILA_FIRST_HOUR_ROLE_CHARACTER_REFS,
  FIRST_HOUR_AUTHORITY_CODES,
  FIRST_HOUR_HANDOFF_LINE_IDS,
  FIRST_HOUR_STORY_FORBIDDEN_AUTHORITIES,
  FIRST_HOUR_STORY_ROLE_IDS,
  FIRST_HOUR_STORY_RUNTIME_HANDOFF,
  FIRST_HOUR_STORY_TRIGGER_IDS,
  FIRST_SERVICE_OUTCOME_PRESENTATIONS,
  getFirstHourStoryTrigger,
  resolveFirstHourStoryRoles,
  resolveFirstServiceOutcomePresentation,
} from '../src/narrative/firstHourStoryRuntimeHandoff'

const trigger = (id: (typeof FIRST_HOUR_STORY_TRIGGER_IDS)[keyof typeof FIRST_HOUR_STORY_TRIGGER_IDS]) => {
  const found = getFirstHourStoryTrigger(id)
  if (!found) throw new Error(`Missing trigger ${id}`)
  return found
}

describe('first-hour executable Story handoff', () => {
  it('publishes unique stable triggers against canonical DT-09 mission identities', () => {
    const ids = FIRST_HOUR_STORY_RUNTIME_HANDOFF.map(item => item.triggerId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(trigger(FIRST_HOUR_STORY_TRIGGER_IDS.opening).gate).toMatchObject({
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart,
      authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.placeToStart,
      stageId: 'report-for-work',
    })
    expect(trigger(FIRST_HOUR_STORY_TRIGGER_IDS.oneSmallThing).gate).toMatchObject({
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.oneSmallThing,
      stageId: 'pickup',
    })
    expect(trigger(FIRST_HOUR_STORY_TRIGGER_IDS.workLeavesMark).gate).toMatchObject({
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence,
      statuses: ['Completed'],
    })
  })

  it('reuses DT-10 presentation assets as selectable beats rather than auto-running whole sequences', () => {
    const opening = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.opening).presentation[0]
    expect(opening.existingSequenceId).toBe(FIRST_SHIFT_OPENING_SEQUENCE.sequenceId)
    expect(opening.existingBeatIds).toEqual(['first-shift-card'])
    expect(FIRST_SHIFT_OPENING_SEQUENCE.beats.some(beat => beat.beatId === 'first-shift-card')).toBe(true)

    const clean = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.consequenceClean)
    const cleanMentor = clean.presentation.find(item => item.roleId === FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor)
    expect(cleanMentor?.existingSequenceId).toBe(FIRST_DELIVERY_CONSEQUENCE_SEQUENCE.sequenceId)
    expect(cleanMentor?.existingBeatIds).toEqual(['ana-first-consequence'])

    const mark = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.workLeavesMark).presentation[0]
    expect(mark.chapterLabel).toBe('YOUR WORK LEAVES A MARK')
    expect(mark.lineRefs).toEqual([FIRST_HOUR_HANDOFF_LINE_IDS.workLeavesMark])
  })

  it('makes One Small Thing visible only with real mission, order, cargo and local merchant authority', () => {
    const firstDelivery = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.oneSmallThing)
    expect(firstDelivery.presentation[0].chapterLabel).toBe('ONE SMALL THING')
    expect(firstDelivery.authority).toEqual(expect.arrayContaining([
      FIRST_HOUR_AUTHORITY_CODES.missionState,
      FIRST_HOUR_AUTHORITY_CODES.exactDeliveryReference,
      FIRST_HOUR_AUTHORITY_CODES.acceptedOrder,
      FIRST_HOUR_AUTHORITY_CODES.localityRoleBinding,
    ]))

    const arrival = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.merchantArrival)
    expect(arrival.authority).toContain(FIRST_HOUR_AUTHORITY_CODES.pickedUpCustody)
    expect(arrival.presentation[0].lineRefs).toEqual(['line:mirela:one-small-thing-arrival'])
  })

  it('fails closed when first-service history is missing or contradictory', () => {
    expect(resolveFirstServiceOutcomePresentation([])).toBeUndefined()
    expect(resolveFirstServiceOutcomePresentation([
      BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
      BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered,
    ])).toBeUndefined()

    expect(resolveFirstServiceOutcomePresentation([BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean])).toEqual(
      FIRST_SERVICE_OUTCOME_PRESENTATIONS.CLEAN,
    )
    expect(resolveFirstServiceOutcomePresentation([BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered])).toEqual(
      FIRST_SERVICE_OUTCOME_PRESENTATIONS.RECOVERED,
    )
    expect(resolveFirstServiceOutcomePresentation([BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed])).toEqual(
      FIRST_SERVICE_OUTCOME_PRESENTATIONS.FAILED,
    )
  })

  it('changes merchant and mentor dialogue for CLEAN, RECOVERED and FAILED without relationship scores', () => {
    const lines = (['CLEAN', 'RECOVERED', 'FAILED'] as const).map(outcome => FIRST_SERVICE_OUTCOME_PRESENTATIONS[outcome])
    expect(new Set(lines.map(item => item.merchantLineRef)).size).toBe(3)
    expect(new Set(lines.map(item => item.dispatcherLineRef)).size).toBe(3)
    expect(JSON.stringify(FIRST_HOUR_STORY_RUNTIME_HANDOFF)).not.toContain('RelationshipDelta')
    expect(JSON.stringify(FIRST_HOUR_STORY_RUNTIME_HANDOFF)).not.toContain('ReputationDelta')
    expect(FIRST_HOUR_STORY_FORBIDDEN_AUTHORITIES).toContain('relationship-or-reputation-score')
  })

  it('keeps presentation acknowledgements owned by DT-09 mission processing', () => {
    const standard = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.firstStandard)
    const coworker = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.coworker)
    const consequence = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.consequenceRecovered)
    const firstPay = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.firstPay)
    const horizon = trigger(FIRST_HOUR_STORY_TRIGGER_IDS.careerHorizon)

    expect(standard.ack).toMatchObject({ convertedBy: 'DT-09', signalType: BRAILA_FIRST_HOUR_SIGNALS.firstStandardAcknowledged })
    expect(coworker.ack).toMatchObject({ convertedBy: 'DT-09', signalType: BRAILA_FIRST_HOUR_SIGNALS.actorMet })
    expect(consequence.ack).toMatchObject({ convertedBy: 'DT-09', signalType: BRAILA_FIRST_HOUR_SIGNALS.firstConsequencePresented })
    expect(firstPay.ack).toMatchObject({ convertedBy: 'DT-09', signalType: BRAILA_FIRST_HOUR_SIGNALS.wageSettlementObserved })
    expect(horizon.ack).toMatchObject({ convertedBy: 'DT-09', signalType: BRAILA_FIRST_HOUR_SIGNALS.careerHorizonSeen })
    expect(FIRST_HOUR_STORY_RUNTIME_HANDOFF.some(item => item.ack?.signalType === BRAILA_FIRST_HOUR_SIGNALS.reportedForWork)).toBe(false)
  })

  it('accepts governed non-Brăila role bindings and never substitutes the Brăila cast', () => {
    const roles = resolveFirstHourStoryRoles({
      currentLocalityId: 'locality:ie:dublin',
      bindings: [
        { roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor, localityId: 'locality:ie:dublin', actorId: 'actor:dublin:mentor', characterRef: 'character:dublin:mentor', displayName: 'Local mentor' },
        { roleId: FIRST_HOUR_STORY_ROLE_IDS.coworkerPeer, localityId: 'locality:ie:dublin', actorId: 'actor:dublin:peer', characterRef: 'character:dublin:peer', displayName: 'Local coworker' },
      ],
    }, [FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor, FIRST_HOUR_STORY_ROLE_IDS.coworkerPeer])
    expect(roles.eligible).toBe(true)
    expect(roles.bindings[FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor]?.characterRef).toBe('character:dublin:mentor')
    expect(roles.bindings[FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor]?.characterRef).not.toBe(BRAILA_FIRST_HOUR_ROLE_CHARACTER_REFS[FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor])

    const missing = resolveFirstHourStoryRoles({ currentLocalityId: 'locality:de:berlin', bindings: [] }, [FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor])
    expect(missing).toMatchObject({ eligible: false, blockers: ['missing-role'] })
  })

  it('rejects ambiguous or shared-actor role bindings instead of fabricating local story identity', () => {
    const ambiguous = resolveFirstHourStoryRoles({
      currentLocalityId: 'locality:test',
      bindings: [
        { roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor, localityId: 'locality:test', actorId: 'actor:1', characterRef: 'character:1', displayName: 'One' },
        { roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor, localityId: 'locality:test', actorId: 'actor:2', characterRef: 'character:2', displayName: 'Two' },
      ],
    }, [FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor])
    expect(ambiguous).toMatchObject({ eligible: false, blockers: ['ambiguous-role'] })

    const shared = resolveFirstHourStoryRoles({
      currentLocalityId: 'locality:test',
      bindings: [
        { roleId: FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor, localityId: 'locality:test', actorId: 'actor:same', characterRef: 'character:mentor', displayName: 'Mentor' },
        { roleId: FIRST_HOUR_STORY_ROLE_IDS.coworkerPeer, localityId: 'locality:test', actorId: 'actor:same', characterRef: 'character:peer', displayName: 'Peer' },
      ],
    }, [FIRST_HOUR_STORY_ROLE_IDS.dispatcherMentor, FIRST_HOUR_STORY_ROLE_IDS.coworkerPeer])
    expect(shared.eligible).toBe(false)
    expect(shared.blockers).toContain('shared-actor')
  })

  it('keeps economy and capability as read-only authority dependencies', () => {
    expect(trigger(FIRST_HOUR_STORY_TRIGGER_IDS.firstPay).authority).toContain(FIRST_HOUR_AUTHORITY_CODES.wageSettlement)
    expect(trigger(FIRST_HOUR_STORY_TRIGGER_IDS.careerHorizon).authority).toContain(FIRST_HOUR_AUTHORITY_CODES.capabilityOpportunity)
    expect(FIRST_HOUR_STORY_FORBIDDEN_AUTHORITIES).toEqual(expect.arrayContaining([
      'money-or-wage-mutation',
      'work-capacity-mutation',
      'capability-or-qualification-grant',
      'demand-creation',
      'mission-completion-mutation',
    ]))
  })
})
