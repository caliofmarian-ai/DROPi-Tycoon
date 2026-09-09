import { describe, expect, it } from 'vitest'
import type { DeliveryMission } from '../src/systems/urbanLogistics'
import {
  applyMissionEvent,
  createMissionRuntimeState,
  startMission,
  validateMissionGraph,
} from '../src/missions/missionEngine'
import type { MissionDefinition, MissionRuntimeState, MissionWorldFacts } from '../src/missions/missionModel'
import {
  createMissionResumePayload,
  restoreMissionResumePayload,
  validateMissionResumeReferences,
} from '../src/missions/missionResumeContract'
import { BRAILA_FIRST_HOUR_FACT_IDS } from '../src/missions/brailaFirstHourAuthoredRegistry'
import {
  BRAILA_ACT1_EARLY_ARC_ID,
  BRAILA_FAMILIAR_ROUTES_AUTHORED_REF,
  BRAILA_FAMILIAR_ROUTES_FACT_IDS,
  BRAILA_FAMILIAR_ROUTES_MISSION_IDS,
  BRAILA_FAMILIAR_ROUTES_SIGNALS,
  buildBrailaAct1FamiliarRoutesMissionRegistry,
  selectMirelaFirstServiceHistory,
  type BrailaAct1FamiliarRoutesBindings,
  type MirelaFirstServiceHistory,
} from '../src/missions/brailaAct1FamiliarRoutesRegistry'

const mirelaDelivery: DeliveryMission = {
  missionId: 'delivery:act1:mirela-repeat',
  orderId: 'order:act1:mirela-repeat',
  parcels: [{ parcelId: 'parcel:act1:mirela-authoritative', orderId: 'order:act1:mirela-repeat', cargoUnits: 1 }],
  legs: [{
    legId: 'leg:act1:mirela-repeat',
    mode: 'terrestrial',
    carrier: { kind: 'player', playerId: 'hero:test' },
    transport: 'walking',
    from: 'station-commons:dispatch',
    to: 'braila-commerce:mirela',
    parcelIds: ['parcel:act1:mirela-authoritative'],
  }],
}

const petruDelivery: DeliveryMission = {
  missionId: 'delivery:act1:petru-repeat',
  orderId: 'order:act1:petru-repeat',
  parcels: [{ parcelId: 'parcel:act1:petru-authoritative', orderId: 'order:act1:petru-repeat', cargoUnits: 1 }],
  legs: [{
    legId: 'leg:act1:petru-repeat',
    mode: 'terrestrial',
    carrier: { kind: 'player', playerId: 'hero:test' },
    transport: 'walking',
    from: 'station-commons:dispatch',
    to: 'old-town:petru',
    parcelIds: ['parcel:act1:petru-authoritative'],
  }],
}

const resolver = (missionId: string): DeliveryMission | undefined => {
  if (missionId === mirelaDelivery.missionId) return mirelaDelivery
  if (missionId === petruDelivery.missionId) return petruDelivery
  return undefined
}

const firstServiceFact = (history: MirelaFirstServiceHistory): string => {
  switch (history) {
    case 'CLEAN': return BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean
    case 'RECOVERED': return BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered
    case 'FAILED': return BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed
  }
}

const bindingsFor = (
  history: MirelaFirstServiceHistory = 'CLEAN',
  overrides: Partial<BrailaAct1FamiliarRoutesBindings> = {},
): BrailaAct1FamiliarRoutesBindings => ({
  persistedSemanticFactIds: [
    BRAILA_FIRST_HOUR_FACT_IDS.firstDayCompleted,
    firstServiceFact(history),
  ],
  dispatcherActorId: 'actor:ana-runtime',
  dispatcherLocationId: 'location:station-commons-dispatch',
  mirela: {
    actorId: 'actor:mirela-runtime',
    locationId: 'location:braila-commerce-mirela',
    delivery: {
      deliveryMissionId: mirelaDelivery.missionId,
      orderId: mirelaDelivery.orderId,
      parcelIds: mirelaDelivery.parcels.map(parcel => parcel.parcelId),
    },
    recovery: { kind: 'Retry' },
  },
  reliabilityEvidenceFlagId: 'authority:work-history:multiple-legitimate-outcomes',
  ...overrides,
})

const withPetru = (history: MirelaFirstServiceHistory = 'CLEAN'): BrailaAct1FamiliarRoutesBindings => {
  const bindings = bindingsFor(history)
  return {
    ...bindings,
    persistedSemanticFactIds: [
      ...bindings.persistedSemanticFactIds,
      BRAILA_FIRST_HOUR_FACT_IDS.metPetru,
    ],
    petru: {
      actorId: 'actor:petru-runtime',
      locationId: 'location:old-town-petru',
      delivery: {
        deliveryMissionId: petruDelivery.missionId,
        orderId: petruDelivery.orderId,
        parcelIds: petruDelivery.parcels.map(parcel => parcel.parcelId),
      },
      recovery: { kind: 'Retry' },
    },
  }
}

const factsFor = (
  bindings: BrailaAct1FamiliarRoutesBindings,
  options: { reliability?: boolean; worldMinute?: number } = {},
): MissionWorldFacts => ({
  worldMinute: options.worldMinute ?? 100,
  worldFlags: [
    ...bindings.persistedSemanticFactIds,
    ...(options.reliability ? [bindings.reliabilityEvidenceFlagId] : []),
  ],
  actorIds: [
    bindings.dispatcherActorId,
    bindings.mirela.actorId,
    ...(bindings.petru ? [bindings.petru.actorId] : []),
  ],
  locationIds: [
    bindings.dispatcherLocationId,
    bindings.mirela.locationId,
    ...(bindings.petru ? [bindings.petru.locationId] : []),
  ],
  orderStatuses: {
    [bindings.mirela.delivery.orderId]: 'Accepted',
    ...(bindings.petru ? { [bindings.petru.delivery.orderId]: 'Accepted' as const } : {}),
  },
})

const mustStart = (
  definitions: readonly MissionDefinition[],
  state: MissionRuntimeState,
  missionId: string,
  facts: MissionWorldFacts,
): MissionRuntimeState => {
  const result = startMission(definitions, state, missionId, facts)
  expect(result.changed).toBe(true)
  expect(result.state.missions[missionId].status).toBe('Active')
  return result.state
}

const openMirelaRoute = (
  definitions: readonly MissionDefinition[],
  bindings: BrailaAct1FamiliarRoutesBindings,
  facts: MissionWorldFacts,
): MissionRuntimeState => {
  let state = createMissionRuntimeState(definitions, facts)
  state = mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision, facts)
  state = applyMissionEvent(
    definitions,
    state,
    BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision,
    {
      eventId: 'event:familiar:less-supervision',
      kind: 'Signal',
      signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.lessSupervisionAcknowledged,
      referenceId: bindings.dispatcherActorId,
    },
    facts,
  ).state
  state = mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers, facts)
  state = applyMissionEvent(
    definitions,
    state,
    BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers,
    {
      eventId: 'event:familiar:mirela-remembers',
      kind: 'Signal',
      signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.mirelaRepeatContactPresented,
      referenceId: bindings.mirela.actorId,
    },
    facts,
  ).state
  return mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute, facts)
}

const pickupMirela = (
  definitions: readonly MissionDefinition[],
  state: MissionRuntimeState,
  facts: MissionWorldFacts,
  eventId = 'event:familiar:mirela-pickup',
): MissionRuntimeState => applyMissionEvent(
  definitions,
  state,
  BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
  {
    eventId,
    kind: 'DeliveryStatus',
    deliveryMissionId: mirelaDelivery.missionId,
    orderId: mirelaDelivery.orderId,
    parcelIds: mirelaDelivery.parcels.map(parcel => parcel.parcelId),
    status: 'PickedUp',
  },
  facts,
  resolver,
).state

const deliverMirela = (
  definitions: readonly MissionDefinition[],
  state: MissionRuntimeState,
  facts: MissionWorldFacts,
  eventId = 'event:familiar:mirela-delivered',
) => applyMissionEvent(
  definitions,
  state,
  BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
  {
    eventId,
    kind: 'DeliveryStatus',
    deliveryMissionId: mirelaDelivery.missionId,
    orderId: mirelaDelivery.orderId,
    parcelIds: mirelaDelivery.parcels.map(parcel => parcel.parcelId),
    status: 'Delivered',
  },
  facts,
  resolver,
)

describe('Act I Familiar Routes authored mission slice', () => {
  it('materializes one bounded valid canonical session without a second engine or fabricated authority', () => {
    const bindings = bindingsFor('CLEAN')
    const definitions = buildBrailaAct1FamiliarRoutesMissionRegistry(bindings)

    expect(validateMissionGraph(definitions)).toEqual({ valid: true, errors: [] })
    expect(definitions).toHaveLength(4)
    expect(definitions.every(definition => definition.arcId === BRAILA_ACT1_EARLY_ARC_ID)).toBe(true)
    expect(definitions.every(definition => definition.source.kind === 'Authored' &&
      definition.source.authoredRef === BRAILA_FAMILIAR_ROUTES_AUTHORED_REF)).toBe(true)
    expect(JSON.stringify(definitions)).not.toContain('EconomicSettlementReference')
    expect(JSON.stringify(definitions)).not.toContain('CapabilityOpportunity')
    expect(JSON.stringify(definitions)).not.toContain('RelationshipDelta')
    expect(JSON.stringify(definitions)).not.toContain('amount')
    expect(JSON.stringify(definitions)).not.toContain('inventory')
  })

  it('requires completed first-day history and exactly one durable Mirela outcome', () => {
    const missingDay = bindingsFor('CLEAN', {
      persistedSemanticFactIds: [BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean],
    })
    expect(() => buildBrailaAct1FamiliarRoutesMissionRegistry(missingDay))
      .toThrow('requires persisted first-day completion')

    expect(() => selectMirelaFirstServiceHistory([BRAILA_FIRST_HOUR_FACT_IDS.firstDayCompleted]))
      .toThrow('requires exactly one persisted Mirela first-service outcome')
    expect(() => selectMirelaFirstServiceHistory([
      BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
      BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed,
    ])).toThrow('requires exactly one persisted Mirela first-service outcome')
  })

  it.each([
    ['CLEAN', BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaAfterClean, false],
    ['RECOVERED', BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaAfterRecovered, false],
    ['FAILED', BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaAfterFailed, true],
  ] as const)('selects the %s history deterministically and only repairs a real first failure after successful repeat service', (
    history,
    continuationFactId,
    expectsRepair,
  ) => {
    const bindings = bindingsFor(history)
    const definitions = buildBrailaAct1FamiliarRoutesMissionRegistry(bindings)
    const facts = factsFor(bindings)
    let state = createMissionRuntimeState(definitions, facts)

    state = mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision, facts)
    const less = applyMissionEvent(
      definitions,
      state,
      BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision,
      {
        eventId: `event:${history}:less`,
        kind: 'Signal',
        signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.lessSupervisionAcknowledged,
        referenceId: bindings.dispatcherActorId,
      },
      facts,
    )
    state = less.state
    expect(less.emittedConsequences.map(intent => intent.consequence)).toEqual([
      { kind: 'WorldFlag', flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.reducedSupervision, value: true },
    ])

    state = mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers, facts)
    const remembered = applyMissionEvent(
      definitions,
      state,
      BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers,
      {
        eventId: `event:${history}:remembered`,
        kind: 'Signal',
        signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.mirelaRepeatContactPresented,
        referenceId: bindings.mirela.actorId,
      },
      facts,
    )
    state = remembered.state
    expect(remembered.emittedConsequences.map(intent => intent.consequence)).toEqual([
      { kind: 'WorldFlag', flagId: continuationFactId, value: true },
    ])

    const duplicate = applyMissionEvent(
      definitions,
      state,
      BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers,
      {
        eventId: `event:${history}:remembered`,
        kind: 'Signal',
        signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.mirelaRepeatContactPresented,
        referenceId: bindings.mirela.actorId,
      },
      facts,
    )
    expect(duplicate.emittedConsequences).toEqual([])
    expect(duplicate.state.completionReceipts.filter(receipt =>
      receipt.missionId === BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers)).toHaveLength(1)

    state = mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute, facts)
    state = pickupMirela(definitions, state, facts, `event:${history}:pickup`)
    const delivered = deliverMirela(definitions, state, facts, `event:${history}:delivered`)
    expect(delivered.state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute].status).toBe('Completed')
    expect(delivered.emittedConsequences.map(intent => intent.consequence)).toEqual(expectsRepair
      ? [{ kind: 'WorldFlag', flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.mirelaFirstFailureRepaired, value: true }]
      : [])
  })

  it('keeps the session locked until persisted history and a real accepted ActiveOrder are projected into world facts', () => {
    const bindings = bindingsFor('CLEAN')
    const definitions = buildBrailaAct1FamiliarRoutesMissionRegistry(bindings)
    const missingOrder: MissionWorldFacts = {
      ...factsFor(bindings),
      orderStatuses: {},
    }
    const stateWithoutOrder = createMissionRuntimeState(definitions, missingOrder)
    expect(stateWithoutOrder.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision].status).toBe('Locked')

    const missingHistory: MissionWorldFacts = {
      ...factsFor(bindings),
      worldFlags: [],
    }
    const stateWithoutHistory = createMissionRuntimeState(definitions, missingHistory)
    expect(stateWithoutHistory.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision].status).toBe('Locked')

    const ready = createMissionRuntimeState(definitions, factsFor(bindings))
    expect(ready.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision].status).toBe('Available')
  })

  it('rejects mismatched parcel events and resumes an active repeat route against the exact DeliveryMission authority', () => {
    const bindings = bindingsFor('RECOVERED')
    const definitions = buildBrailaAct1FamiliarRoutesMissionRegistry(bindings)
    const facts = factsFor(bindings)
    let state = openMirelaRoute(definitions, bindings, facts)

    const wrong = applyMissionEvent(
      definitions,
      state,
      BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
      {
        eventId: 'event:familiar:wrong-parcel',
        kind: 'DeliveryStatus',
        deliveryMissionId: mirelaDelivery.missionId,
        orderId: mirelaDelivery.orderId,
        parcelIds: ['parcel:not-authoritative'],
        status: 'PickedUp',
      },
      facts,
      resolver,
    )
    expect(wrong.state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute].stageId).toBe('pickup')

    state = pickupMirela(definitions, wrong.state, facts)
    expect(state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute].stageId).toBe('deliver')

    const payload = createMissionResumePayload(state)
    const restored = restoreMissionResumePayload(payload, definitions, facts)
    expect(restored.status).toBe('restored')
    expect(restored.state).toEqual(state)

    const validation = validateMissionResumeReferences(restored.state, definitions, {
      hasOrder: orderId => orderId === mirelaDelivery.orderId,
      resolveDeliveryMission: resolver,
    })
    expect(validation.resumable).toBe(true)
    expect(validation.issues).toEqual([])
    expect(validation.references).toEqual([{
      kind: 'delivery',
      missionId: BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
      stageId: 'deliver',
      objectiveId: 'mirela-repeat-delivered',
      required: true,
      expectedStatus: 'Delivered',
      delivery: bindings.mirela.delivery,
    }])
  })

  it('supports delayed recovery without converting a failed attempt into fake completion', () => {
    const base = bindingsFor('CLEAN')
    const bindings = bindingsFor('CLEAN', {
      mirela: {
        ...base.mirela,
        recovery: { kind: 'DelayedSecondChance', delayMinutes: 15 },
      },
    })
    const definitions = buildBrailaAct1FamiliarRoutesMissionRegistry(bindings)
    const initialFacts = factsFor(bindings, { worldMinute: 100 })
    let state = openMirelaRoute(definitions, bindings, initialFacts)

    const failed = applyMissionEvent(
      definitions,
      state,
      BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
      { eventId: 'event:familiar:route-problem', kind: 'Fail', reason: 'authoritative-route-complication' },
      initialFacts,
    )
    state = failed.state
    expect(failed.reason).toBe('second-chance-delayed')
    expect(state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute]).toMatchObject({
      status: 'Delayed',
      stageId: 'pickup',
      failureCount: 1,
      availableAtWorldMinute: 115,
    })
    expect(state.completionReceipts.filter(receipt =>
      receipt.missionId === BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute)).toHaveLength(0)

    const tooEarly = startMission(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
      factsFor(bindings, { worldMinute: 114 }))
    expect(tooEarly.state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute].status).toBe('Delayed')

    state = mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute,
      factsFor(bindings, { worldMinute: 115 }))
    expect(state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute].failureCount).toBe(1)
  })

  it('omits Petru when no durable prior relationship exists and includes him only with real repeat household authority', () => {
    const withoutHistory = bindingsFor('CLEAN', {
      petru: {
        actorId: 'actor:petru-runtime',
        locationId: 'location:old-town-petru',
        delivery: {
          deliveryMissionId: petruDelivery.missionId,
          orderId: petruDelivery.orderId,
          parcelIds: petruDelivery.parcels.map(parcel => parcel.parcelId),
        },
        recovery: { kind: 'Retry' },
      },
    })
    const omitted = buildBrailaAct1FamiliarRoutesMissionRegistry(withoutHistory)
    expect(omitted.some(definition => definition.missionId === BRAILA_FAMILIAR_ROUTES_MISSION_IDS.petruRepeatRoute)).toBe(false)

    const includedBindings = withPetru()
    const included = buildBrailaAct1FamiliarRoutesMissionRegistry(includedBindings)
    const petru = included.find(definition => definition.missionId === BRAILA_FAMILIAR_ROUTES_MISSION_IDS.petruRepeatRoute)
    expect(petru).toBeDefined()
    expect(petru?.stages.flatMap(stage => stage.objectives)
      .filter(objective => objective.kind === 'delivery')
      .map(objective => objective.kind === 'delivery' ? objective.delivery : undefined))
      .toEqual([includedBindings.petru?.delivery, includedBindings.petru?.delivery])
    expect(validateMissionGraph(included)).toEqual({ valid: true, errors: [] })
  })

  it('finishes Familiar Routes only after external multiple-outcome evidence and emits session facts exactly once', () => {
    const bindings = bindingsFor('CLEAN')
    const definitions = buildBrailaAct1FamiliarRoutesMissionRegistry(bindings)
    const facts = factsFor(bindings)
    let state = openMirelaRoute(definitions, bindings, facts)
    state = pickupMirela(definitions, state, facts)
    state = deliverMirela(definitions, state, facts).state

    expect(state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern].status).toBe('Locked')
    const evidenceFacts = factsFor(bindings, { reliability: true })
    state = mustStart(definitions, state, BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern, evidenceFacts)
    const completed = applyMissionEvent(
      definitions,
      state,
      BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern,
      {
        eventId: 'event:familiar:reliability-pattern',
        kind: 'Signal',
        signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.reliabilityPatternPresented,
        referenceId: bindings.dispatcherActorId,
      },
      evidenceFacts,
    )
    expect(completed.state.missions[BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern].status).toBe('Completed')
    expect(completed.emittedConsequences.map(intent => intent.consequence)).toEqual([
      { kind: 'WorldFlag', flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.reliabilityPatternRecognized, value: true },
      { kind: 'WorldFlag', flagId: BRAILA_FAMILIAR_ROUTES_FACT_IDS.sessionCompleted, value: true },
    ])
    expect(completed.state.completionReceipts.filter(receipt =>
      receipt.missionId === BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern)).toHaveLength(1)

    const replay = applyMissionEvent(
      definitions,
      completed.state,
      BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern,
      {
        eventId: 'event:familiar:reliability-pattern',
        kind: 'Signal',
        signalType: BRAILA_FAMILIAR_ROUTES_SIGNALS.reliabilityPatternPresented,
        referenceId: bindings.dispatcherActorId,
      },
      evidenceFacts,
    )
    expect(replay.emittedConsequences).toEqual([])
    expect(replay.state.completionReceipts.filter(receipt =>
      receipt.missionId === BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern)).toHaveLength(1)
  })
})
