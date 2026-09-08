import { describe, expect, it } from 'vitest'
import type { DeliveryMission } from '../src/systems/urbanLogistics'
import {
  applyMissionEvent,
  createMissionRuntimeState,
  deliveryReferenceMatches,
  evaluateMissionPrerequisites,
  refreshMissionAvailability,
  startMission,
  validateMissionGraph,
} from '../src/missions/missionEngine'
import {
  restoreMissionRuntimeState,
  serializeMissionRuntimeState,
} from '../src/missions/missionPersistence'
import { buildNeutralBrailaFirstHourBlueprint } from '../src/missions/brailaFirstHourBlueprint'
import type {
  MissionDefinition,
  MissionRuntimeState,
  MissionWorldFacts,
} from '../src/missions/missionModel'

const facts = (worldMinute = 10): MissionWorldFacts => ({
  worldMinute,
  capabilityIds: ['DeliveryAppLiteracy', 'WalkingCourierFundamentals'],
  equipmentIds: ['smartphone'],
  actorIds: ['actor:dispatcher', 'actor:local-contact'],
  locationIds: ['location:dispatcher', 'location:local-contact'],
  worldFlags: ['world:ready'],
  orderStatuses: { 'order:1': 'Available' },
  contractStatuses: { 'contract:1': 'Reserved' },
})

const validDelivery: DeliveryMission = {
  missionId: 'delivery:order-1',
  orderId: 'order:1',
  parcels: [{ parcelId: 'parcel:1', orderId: 'order:1', cargoUnits: 1 }],
  legs: [{
    legId: 'leg:1',
    mode: 'terrestrial',
    transport: 'walking',
    carrier: { kind: 'player', playerId: 'hero:test' },
    from: 'pickup:test',
    to: 'delivery:test',
    parcelIds: ['parcel:1'],
  }],
}

const deliveryResolver = (missionId: string): DeliveryMission | undefined =>
  missionId === validDelivery.missionId ? validDelivery : undefined

const signalMission = (input: {
  missionId: string
  source?: MissionDefinition['source']
  availability?: MissionDefinition['availability']
  prerequisites?: MissionDefinition['prerequisites']
  unlocks?: MissionDefinition['unlocks']
}): MissionDefinition => ({
  missionId: input.missionId,
  category: 'CampaignStory',
  source: input.source ?? { kind: 'Authored', authoredRef: 'test' },
  label: `Mission ${input.missionId}`,
  prerequisites: input.prerequisites ?? [],
  availability: input.availability ?? 'Prerequisites',
  startStageId: 'stage',
  stages: [{
    stageId: 'stage',
    label: 'Stage',
    objectives: [{ objectiveId: 'objective', kind: 'signal', signalType: 'done', label: 'Finish' }],
  }],
  completionConsequences: [],
  ...(input.unlocks ? { unlocks: input.unlocks } : {}),
})

const start = (
  definitions: readonly MissionDefinition[],
  state: MissionRuntimeState,
  missionId: string,
  worldFacts: MissionWorldFacts = facts(),
): MissionRuntimeState => {
  const result = startMission(definitions, state, missionId, worldFacts)
  expect(result.changed).toBe(true)
  return result.state
}

describe('#553 narrative + systemic mission framework', () => {
  it('runs authored and systemic missions through the same deterministic engine', () => {
    const authored = signalMission({ missionId: 'mission:authored' })
    const systemic = signalMission({
      missionId: 'mission:systemic',
      source: { kind: 'Systemic', causeRef: 'supply-shortage:packaging:market-1' },
    })
    const definitions = [authored, systemic]
    expect(validateMissionGraph(definitions)).toEqual({ valid: true, errors: [] })

    let authoredState = start(definitions, createMissionRuntimeState(definitions, facts()), authored.missionId)
    const authoredResult = applyMissionEvent(
      definitions,
      authoredState,
      authored.missionId,
      { eventId: 'event:authored', kind: 'Signal', signalType: 'done' },
      facts(),
    )
    authoredState = authoredResult.state
    expect(authoredState.missions[authored.missionId].status).toBe('Completed')

    let systemicState = start(definitions, createMissionRuntimeState(definitions, facts()), systemic.missionId)
    const systemicResult = applyMissionEvent(
      definitions,
      systemicState,
      systemic.missionId,
      { eventId: 'event:systemic', kind: 'Signal', signalType: 'done' },
      facts(),
    )
    systemicState = systemicResult.state
    expect(systemicState.missions[systemic.missionId].status).toBe('Completed')
    expect(systemic.source.kind).toBe('Systemic')
  })

  it('evaluates capability, equipment, actor, location, world, contract and time prerequisites without owning those systems', () => {
    const mission = signalMission({
      missionId: 'mission:requirements',
      prerequisites: [
        { kind: 'capability', capabilityId: 'WalkingCourierFundamentals' },
        { kind: 'equipment', equipmentId: 'smartphone' },
        { kind: 'actorAvailable', actorId: 'actor:dispatcher' },
        { kind: 'locationAvailable', locationId: 'location:dispatcher' },
        { kind: 'worldFlag', flagId: 'world:ready' },
        { kind: 'orderStatus', orderId: 'order:1', status: 'Available' },
        { kind: 'contractStatus', contractId: 'contract:1', status: 'Reserved' },
        { kind: 'worldMinuteAtLeast', worldMinute: 100 },
      ],
    })
    const earlyFacts = facts(99)
    const state = createMissionRuntimeState([mission], earlyFacts)
    expect(evaluateMissionPrerequisites(mission, state, earlyFacts)).toEqual({
      eligible: false,
      blockers: ['world-minute:100:required'],
    })
    expect(evaluateMissionPrerequisites(mission, state, facts(100))).toEqual({ eligible: true, blockers: [] })
  })

  it('transitions stages deterministically and selects one explicit branch', () => {
    const mission: MissionDefinition = {
      missionId: 'mission:branch',
      category: 'Character',
      source: { kind: 'Authored' },
      label: 'Branch test',
      prerequisites: [],
      availability: 'Prerequisites',
      startStageId: 'choose',
      stages: [
        {
          stageId: 'choose',
          label: 'Choose',
          objectives: [{
            objectiveId: 'choice-objective', kind: 'choice', choiceId: 'priority',
            options: ['assist', 'duty'], label: 'Choose a priority',
          }],
          branches: [
            { choiceId: 'priority', optionId: 'assist', target: { stageId: 'assist' } },
            { choiceId: 'priority', optionId: 'duty', target: { stageId: 'duty' } },
          ],
        },
        {
          stageId: 'assist', label: 'Assist',
          objectives: [{ objectiveId: 'assist-done', kind: 'signal', signalType: 'assist-done', label: 'Assist' }],
        },
        {
          stageId: 'duty', label: 'Duty',
          objectives: [{ objectiveId: 'duty-done', kind: 'signal', signalType: 'duty-done', label: 'Duty' }],
        },
      ],
      completionConsequences: [{ kind: 'AccessGrant', accessId: 'next' }],
      failurePolicy: { kind: 'Retry' },
    }
    const definitions = [mission]
    let state = start(definitions, createMissionRuntimeState(definitions, facts()), mission.missionId)
    const input = { eventId: 'choice:1', kind: 'Choice' as const, choiceId: 'priority', optionId: 'duty' }
    const first = applyMissionEvent(definitions, state, mission.missionId, input, facts())
    const replay = applyMissionEvent(definitions, state, mission.missionId, input, facts())
    expect(first).toEqual(replay)
    state = first.state
    expect(state.missions[mission.missionId].stageId).toBe('duty')
    expect(state.missions[mission.missionId].choices).toEqual([{ choiceId: 'priority', optionId: 'duty' }])

    const completed = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:duty-done', kind: 'Signal', signalType: 'duty-done' },
      facts(),
    )
    expect(completed.state.missions[mission.missionId].status).toBe('Completed')
    expect(completed.emittedConsequences).toHaveLength(1)
  })

  it('creates one completion receipt and cannot duplicate completion consequences', () => {
    const mission: MissionDefinition = {
      ...signalMission({ missionId: 'mission:exactly-once' }),
      completionConsequences: [
        { kind: 'RelationshipDelta', relationshipId: 'relationship:test', delta: 1 },
        { kind: 'EconomicSettlementReference', settlementRef: 'settlement:authoritative-order-1' },
      ],
    }
    const definitions = [mission]
    let state = start(definitions, createMissionRuntimeState(definitions, facts()), mission.missionId)
    const completed = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:complete', kind: 'Signal', signalType: 'done' },
      facts(),
    )
    state = completed.state
    expect(completed.emittedConsequences.map(item => item.intentId)).toEqual([
      'mission-consequence:mission:exactly-once:0',
      'mission-consequence:mission:exactly-once:1',
    ])
    expect(state.completionReceipts).toEqual([{
      receiptId: 'mission-completion:mission:exactly-once',
      missionId: 'mission:exactly-once',
      completedAtWorldMinute: 10,
    }])

    const duplicate = applyMissionEvent(
      definitions,
      state,
      mission.missionId,
      { eventId: 'event:complete-again', kind: 'Signal', signalType: 'done' },
      facts(),
    )
    expect(duplicate.emittedConsequences).toEqual([])
    expect(duplicate.state.completionReceipts).toHaveLength(1)
    expect(duplicate.state.missions[mission.missionId].emittedConsequenceIntentIds).toHaveLength(2)
  })

  it('keeps failure recoverable through retry and delayed second chance', () => {
    const retry: MissionDefinition = {
      ...signalMission({ missionId: 'mission:retry' }),
      failurePolicy: { kind: 'Retry' },
    }
    let retryState = start([retry], createMissionRuntimeState([retry], facts()), retry.missionId)
    const failedRetry = applyMissionEvent(
      [retry], retryState, retry.missionId,
      { eventId: 'failure:retry', kind: 'Fail', reason: 'parcel-damaged' }, facts(),
    )
    retryState = failedRetry.state
    expect(retryState.missions[retry.missionId]).toMatchObject({ status: 'Active', stageId: 'stage', failureCount: 1 })
    expect(retryState.completionReceipts).toEqual([])

    const delayed: MissionDefinition = {
      ...signalMission({ missionId: 'mission:second-chance' }),
      failurePolicy: { kind: 'DelayedSecondChance', delayMinutes: 30 },
    }
    let delayedState = start([delayed], createMissionRuntimeState([delayed], facts(10)), delayed.missionId, facts(10))
    delayedState = applyMissionEvent(
      [delayed], delayedState, delayed.missionId,
      { eventId: 'failure:delay', kind: 'Fail', reason: 'missed-window' }, facts(10),
    ).state
    expect(delayedState.missions[delayed.missionId]).toMatchObject({
      status: 'Delayed', availableAtWorldMinute: 40, failureCount: 1,
    })
    expect(refreshMissionAvailability([delayed], delayedState, facts(39)).missions[delayed.missionId].status).toBe('Delayed')
    expect(refreshMissionAvailability([delayed], delayedState, facts(40)).missions[delayed.missionId].status).toBe('Available')
  })

  it('supports a failed branch without corrupting unrelated campaign state', () => {
    const recovery = signalMission({ missionId: 'mission:recovery', availability: 'ExplicitUnlock' })
    const risky: MissionDefinition = {
      ...signalMission({ missionId: 'mission:risky' }),
      failurePolicy: { kind: 'FailedBranch', unlocks: [{ missionId: recovery.missionId }] },
    }
    const stable = signalMission({ missionId: 'mission:stable' })
    const definitions = [risky, recovery, stable]
    let state = createMissionRuntimeState(definitions, facts())
    state = start(definitions, state, risky.missionId)
    const result = applyMissionEvent(
      definitions, state, risky.missionId,
      { eventId: 'failure:risky', kind: 'Fail', reason: 'route-failed' }, facts(),
    )
    expect(result.state.missions[risky.missionId].status).toBe('Failed')
    expect(result.state.missions[recovery.missionId].status).toBe('Available')
    expect(result.state.missions[stable.missionId].status).toBe('Available')
  })

  it('references the existing DeliveryMission contract and rejects broken reference integrity', () => {
    const mission: MissionDefinition = {
      missionId: 'mission:delivery-reference',
      category: 'Employer',
      source: { kind: 'Authored' },
      label: 'Existing delivery reference',
      prerequisites: [],
      availability: 'Prerequisites',
      startStageId: 'deliver',
      stages: [{
        stageId: 'deliver',
        label: 'Deliver',
        objectives: [{
          objectiveId: 'delivery-objective',
          kind: 'delivery',
          delivery: { deliveryMissionId: validDelivery.missionId, orderId: validDelivery.orderId, parcelIds: ['parcel:1'] },
          status: 'Delivered',
          label: 'Complete existing delivery',
        }],
      }],
      completionConsequences: [],
    }
    expect(deliveryReferenceMatches({
      deliveryMissionId: validDelivery.missionId,
      orderId: validDelivery.orderId,
      parcelIds: ['parcel:1'],
    }, deliveryResolver)).toBe(true)

    const definitions = [mission]
    let state = start(definitions, createMissionRuntimeState(definitions, facts()), mission.missionId)
    const wrongParcel = applyMissionEvent(
      definitions, state, mission.missionId,
      {
        eventId: 'delivery:wrong', kind: 'DeliveryStatus', deliveryMissionId: validDelivery.missionId,
        orderId: validDelivery.orderId, parcelIds: ['parcel:other'], status: 'Delivered',
      }, facts(), deliveryResolver,
    )
    expect(wrongParcel.state.missions[mission.missionId].status).toBe('Active')
    state = wrongParcel.state

    const delivered = applyMissionEvent(
      definitions, state, mission.missionId,
      {
        eventId: 'delivery:correct', kind: 'DeliveryStatus', deliveryMissionId: validDelivery.missionId,
        orderId: validDelivery.orderId, parcelIds: ['parcel:1'], status: 'Delivered',
      }, facts(), deliveryResolver,
    )
    expect(delivered.state.missions[mission.missionId].status).toBe('Completed')

    const brokenDelivery: DeliveryMission = {
      ...validDelivery,
      parcels: [{ parcelId: 'parcel:1', orderId: 'order:wrong', cargoUnits: 1 }],
    }
    expect(deliveryReferenceMatches({
      deliveryMissionId: validDelivery.missionId,
      orderId: validDelivery.orderId,
      parcelIds: ['parcel:1'],
    }, () => brokenDelivery)).toBe(false)
  })

  it('round-trips active mission chain state across a persistence boundary', () => {
    const mission = signalMission({ missionId: 'mission:persist' })
    const definitions = [mission]
    const state = start(definitions, createMissionRuntimeState(definitions, facts()), mission.missionId)
    const raw = serializeMissionRuntimeState(state)
    const restored = restoreMissionRuntimeState(raw, definitions, facts())
    expect(restored.repaired).toBe(false)
    expect(restored.reasons).toEqual([])
    expect(restored.state).toEqual(state)
  })

  it('repairs malformed mission persistence without importing gameplay authority state', () => {
    const mission = signalMission({ missionId: 'mission:repair' })
    const restored = restoreMissionRuntimeState('{bad json', [mission], facts())
    expect(restored.repaired).toBe(true)
    expect(restored.reasons).toEqual(['mission-runtime-json-invalid'])
    expect(restored.state.missions[mission.missionId].status).toBe('Available')
  })

  it('rejects invalid stage links and unmarked cycles while allowing explicitly permitted retry cycles', () => {
    const unknownTarget: MissionDefinition = {
      ...signalMission({ missionId: 'mission:bad-target' }),
      stages: [{
        stageId: 'stage', label: 'Stage',
        objectives: [{ objectiveId: 'objective', kind: 'signal', signalType: 'done', label: 'Done' }],
        next: { stageId: 'missing' },
      }],
    }
    expect(validateMissionGraph([unknownTarget]).errors).toContain(
      'Mission mission:bad-target stage stage points to unknown stage missing',
    )

    const cyclic: MissionDefinition = {
      missionId: 'mission:cycle', category: 'CampaignStory', source: { kind: 'Authored' },
      label: 'Cycle', prerequisites: [], availability: 'Prerequisites', startStageId: 'a',
      stages: [
        { stageId: 'a', label: 'A', objectives: [{ objectiveId: 'a', kind: 'signal', signalType: 'a', label: 'A' }], next: { stageId: 'b' } },
        { stageId: 'b', label: 'B', objectives: [{ objectiveId: 'b', kind: 'signal', signalType: 'b', label: 'B' }], next: { stageId: 'a' } },
      ],
      completionConsequences: [],
    }
    expect(validateMissionGraph([cyclic]).errors).toContain('Mission mission:cycle stage cycle detected: a -> b -> a')

    const permitted: MissionDefinition = {
      ...cyclic,
      missionId: 'mission:permitted-cycle',
      stages: [
        { stageId: 'a', label: 'A', objectives: [{ objectiveId: 'a', kind: 'signal', signalType: 'a', label: 'A' }], next: { stageId: 'b' } },
        { stageId: 'b', label: 'B', objectives: [{ objectiveId: 'b', kind: 'signal', signalType: 'b', label: 'B' }], next: { stageId: 'a', allowCycle: true } },
      ],
    }
    expect(validateMissionGraph([permitted])).toEqual({ valid: true, errors: [] })
  })

  it('detects mission-level unlock cycles unless the cyclic edge is explicitly permitted', () => {
    const a = signalMission({ missionId: 'mission:a', unlocks: [{ missionId: 'mission:b' }] })
    const b = signalMission({ missionId: 'mission:b', unlocks: [{ missionId: 'mission:a' }] })
    expect(validateMissionGraph([a, b]).errors).toContain('Mission dependency cycle detected: mission:a -> mission:b -> mission:a')

    const permittedB = signalMission({
      missionId: 'mission:b',
      unlocks: [{ missionId: 'mission:a', allowCycle: true }],
    })
    expect(validateMissionGraph([a, permittedB])).toEqual({ valid: true, errors: [] })
  })

  it('keeps the first-hour Brăila story fixture replaceable while proving the requested experiential chain shape', () => {
    const definitions = buildNeutralBrailaFirstHourBlueprint({
      dispatcherActorId: 'actor:dispatcher',
      dispatcherLocationId: 'location:dispatcher',
      localContactActorId: 'actor:local-contact',
      localContactLocationId: 'location:local-contact',
      firstDelivery: {
        deliveryMissionId: validDelivery.missionId,
        orderId: validDelivery.orderId,
        parcelIds: ['parcel:1'],
      },
      firstDeliverySettlementRef: 'settlement:first-delivery',
    })
    const validation = validateMissionGraph(definitions)
    expect(validation).toEqual({ valid: true, errors: [] })
    expect(definitions.every(definition => definition.source.kind === 'Authored')).toBe(true)
    expect(definitions.map(definition => definition.missionId)).toEqual(expect.arrayContaining([
      'first-hour:meet-dispatcher',
      'first-hour:light-job',
      'first-hour:meet-local-contact',
      'first-hour:complication-choice',
      'first-hour:return-report',
      'first-hour:next-opportunity',
    ]))
    expect(JSON.stringify(definitions)).toContain('agent8-canon-pending')
    expect(JSON.stringify(definitions)).not.toContain('reward')
  })
})
