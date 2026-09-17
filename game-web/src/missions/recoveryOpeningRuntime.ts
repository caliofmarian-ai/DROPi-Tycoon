import {
  applyMissionEvent,
  startMission,
  type MissionDeliveryResolver,
} from './missionEngine'
import type {
  MissionDefinition,
  MissionDeliveryReference,
  MissionRuntimeState,
  MissionWorldFacts,
} from './missionModel'
import {
  createMissionResumePayload,
  restoreMissionResumePayload,
} from './missionResumeContract'
import {
  RECOVERY_OPENING_CHOICE_IDS,
  RECOVERY_OPENING_MISSION_IDS,
  RECOVERY_OPENING_SIGNALS,
  buildRecoveryOpeningMissionBundle,
  type RecoveryOpeningAuthoredBindings,
} from './recoveryOpeningAuthoredRegistry'
import {
  BRAILA_RECOVERY_CHARACTER_BINDINGS,
  type HeroPresentationSex,
} from '../narrative/recoveryOpeningV2'
import { applyOrderAcceptanceRequest } from '../systems/orderAcceptance'
import { attemptDelivery, attemptPickup } from '../systems/orderSystem'
import { createOrderForSequence, orderRoutesForTransport } from '../systems/orderGeneration'
import { missionForOrder } from '../systems/urbanMarketplace'
import type { GameSessionState, OrderState, WorldState } from '../types/game'
import { findWorldRoutePoint } from '../world/worldLayout'
import type { UrbanObjective } from '../systems/urbanInteractions'

export const BRAILA_RECOVERY_RUNTIME_IDS = Object.freeze({
  freshOpeningFlag: 'world:recovery-opening:fresh',
  mariaActor: BRAILA_RECOVERY_CHARACTER_BINDINGS.openingMerchant,
  mariaShop: 'location:braila:canal-grocers:maria-shop',
  mariaPickup: 'CanalPickup',
  supplierActor: 'actor:braila:local-farm-supplier:001',
  supplierLocation: 'location:braila:local-farm-supplier:001',
})

export type RecoveryOpeningRuntimePhase =
  | 'inactive'
  | 'choose-presentation'
  | 'prologue'
  | 'search-work'
  | 'maria-dialogue'
  | 'deliver-first'
  | 'return-maria'
  | 'trial-ready'

export interface RecoveryOpeningRuntimeSnapshot {
  active: boolean
  phase: RecoveryOpeningRuntimePhase
  selectedSex: HeroPresentationSex | null
  state?: MissionRuntimeState
  definitions: readonly MissionDefinition[]
  facts: MissionWorldFacts
  bindings: RecoveryOpeningAuthoredBindings
  firstOrder: OrderState
}

export interface RecoveryOpeningMutationResult extends RecoveryOpeningRuntimeSnapshot {
  changed: boolean
  reason?: string
}

const cloneOrder = (order: OrderState): OrderState => ({ ...order })

const deliveryReferenceForOrder = (order: OrderState): MissionDeliveryReference => {
  const delivery = missionForOrder(order, 'walking')
  return {
    deliveryMissionId: delivery.missionId,
    orderId: order.orderId,
    parcelIds: delivery.parcels.map(parcel => parcel.parcelId),
  }
}

const mariaOrders = (): OrderState[] => {
  const routeCount = orderRoutesForTransport('walking').length
  const results: OrderState[] = []
  for (let sequence = 1; sequence <= Math.max(24, routeCount * 4) && results.length < 6; sequence += 1) {
    const order = createOrderForSequence(sequence, 'walking')
    if (order.pickupLocation === BRAILA_RECOVERY_RUNTIME_IDS.mariaPickup) results.push(order)
  }
  if (results.length < 6) throw new Error('Brăila recovery runtime requires six walking deliveries from Maria shop')
  return results
}

const governedMariaOrders = mariaOrders()
export const BRAILA_MARIA_FIRST_ORDER: OrderState = Object.freeze(cloneOrder(governedMariaOrders[0]))

export const BRAILA_RECOVERY_AUTHORED_BINDINGS: RecoveryOpeningAuthoredBindings = Object.freeze({
  freshRecoveryOpeningFlagId: BRAILA_RECOVERY_RUNTIME_IDS.freshOpeningFlag,
  mariaActorId: BRAILA_RECOVERY_RUNTIME_IDS.mariaActor,
  mariaShopLocationId: BRAILA_RECOVERY_RUNTIME_IDS.mariaShop,
  firstDelivery: deliveryReferenceForOrder(governedMariaOrders[0]),
  firstDeliverySettlementRef: governedMariaOrders[0].orderId,
  mariaTrialDeliveries: governedMariaOrders.slice(1).map(deliveryReferenceForOrder),
  mariaTrialSettlementRefs: governedMariaOrders.slice(1).map(order => order.orderId),
  supplierActorId: BRAILA_RECOVERY_RUNTIME_IDS.supplierActor,
  supplierLocationId: BRAILA_RECOVERY_RUNTIME_IDS.supplierLocation,
})

export const BRAILA_RECOVERY_MISSION_DEFINITIONS = Object.freeze(
  [...buildRecoveryOpeningMissionBundle(BRAILA_RECOVERY_AUTHORED_BINDINGS)],
)

export const BRAILA_RECOVERY_MISSION_FACTS: MissionWorldFacts = Object.freeze({
  worldMinute: 0,
  worldFlags: [BRAILA_RECOVERY_RUNTIME_IDS.freshOpeningFlag],
  actorIds: [BRAILA_RECOVERY_RUNTIME_IDS.mariaActor, BRAILA_RECOVERY_RUNTIME_IDS.supplierActor],
  locationIds: [BRAILA_RECOVERY_RUNTIME_IDS.mariaShop, BRAILA_RECOVERY_RUNTIME_IDS.supplierLocation],
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const containsRecoveryRuntime = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.runtime) || !isRecord(value.runtime.missions)) return false
  return RECOVERY_OPENING_MISSION_IDS.riseAndSearch in value.runtime.missions
}

const freshRecoveryCandidate = (session: GameSessionState): boolean =>
  session.missionResume === undefined &&
  session.settings.tutorialCompleted === false &&
  session.company.employees.length === 0 &&
  session.company.vehicles.length === 0 &&
  session.world.player.carryingPackage === false &&
  session.world.activeOrder.status === 'Available' &&
  session.world.urban?.merchantOnboarded !== true

const selectedSexFromState = (state: MissionRuntimeState): HeroPresentationSex | null => {
  const choice = state.missions[RECOVERY_OPENING_MISSION_IDS.riseAndSearch]?.choices.find(
    candidate => candidate.choiceId === RECOVERY_OPENING_CHOICE_IDS.heroPresentationSex,
  )
  return choice?.optionId === 'Male' || choice?.optionId === 'Female' ? choice.optionId : null
}

const phaseFromState = (state: MissionRuntimeState): RecoveryOpeningRuntimePhase => {
  const rise = state.missions[RECOVERY_OPENING_MISSION_IDS.riseAndSearch]
  const test = state.missions[RECOVERY_OPENING_MISSION_IDS.mariaTest]
  const returned = state.missions[RECOVERY_OPENING_MISSION_IDS.mariaReturn]
  const trial = state.missions[RECOVERY_OPENING_MISSION_IDS.mariaTrialChain]

  if (rise?.status === 'Active' && rise.stageId === 'choose-presentation') return 'choose-presentation'
  if (rise?.status === 'Active' && rise.stageId === 'rise') return 'prologue'
  if (test?.status === 'Available' || (test?.status === 'Active' && test.stageId === 'enter-shop')) return 'search-work'
  if (test?.status === 'Active' && ['accept-test', 'pickup'].includes(test.stageId ?? '')) return 'maria-dialogue'
  if (test?.status === 'Active' && test.stageId === 'deliver') return 'deliver-first'
  if (returned?.status === 'Available' || returned?.status === 'Active') return 'return-maria'
  if (trial?.status === 'Available' || trial?.status === 'Active') return 'trial-ready'
  return 'inactive'
}

const snapshot = (
  active: boolean,
  state?: MissionRuntimeState,
): RecoveryOpeningRuntimeSnapshot => ({
  active,
  phase: active && state ? phaseFromState(state) : 'inactive',
  selectedSex: active && state ? selectedSexFromState(state) : null,
  ...(state ? { state } : {}),
  definitions: BRAILA_RECOVERY_MISSION_DEFINITIONS,
  facts: BRAILA_RECOVERY_MISSION_FACTS,
  bindings: BRAILA_RECOVERY_AUTHORED_BINDINGS,
  firstOrder: cloneOrder(BRAILA_MARIA_FIRST_ORDER),
})

const persistState = (session: GameSessionState, state: MissionRuntimeState): void => {
  session.missionResume = createMissionResumePayload(state)
}

/**
 * Activates the recovery campaign only for a fresh compatible session or an already-started
 * recovery save. Existing unrelated mission resumes are never rewritten into recovery state.
 */
export const ensureRecoveryOpeningRuntime = (session: GameSessionState): RecoveryOpeningRuntimeSnapshot => {
  const hasRecovery = containsRecoveryRuntime(session.missionResume)
  if (!hasRecovery && !freshRecoveryCandidate(session)) return snapshot(false)

  const restored = restoreMissionResumePayload(
    hasRecovery ? session.missionResume : undefined,
    BRAILA_RECOVERY_MISSION_DEFINITIONS,
    BRAILA_RECOVERY_MISSION_FACTS,
  )
  let state = restored.state
  const rise = state.missions[RECOVERY_OPENING_MISSION_IDS.riseAndSearch]
  if (rise?.status === 'Available') {
    state = startMission(
      BRAILA_RECOVERY_MISSION_DEFINITIONS,
      state,
      RECOVERY_OPENING_MISSION_IDS.riseAndSearch,
      BRAILA_RECOVERY_MISSION_FACTS,
    ).state
  }
  persistState(session, state)
  return snapshot(true, state)
}

const mutation = (
  session: GameSessionState,
  state: MissionRuntimeState,
  changed: boolean,
  reason?: string,
): RecoveryOpeningMutationResult => {
  persistState(session, state)
  return { ...snapshot(true, state), changed, ...(reason ? { reason } : {}) }
}

export const chooseRecoveryHeroPresentation = (
  session: GameSessionState,
  sex: HeroPresentationSex,
): RecoveryOpeningMutationResult => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active || !current.state || current.phase !== 'choose-presentation') {
    return { ...current, changed: false, reason: 'presentation-choice-not-active' }
  }
  const result = applyMissionEvent(
    current.definitions,
    current.state,
    RECOVERY_OPENING_MISSION_IDS.riseAndSearch,
    {
      eventId: `recovery-opening:presentation:${sex}`,
      kind: 'Choice',
      choiceId: RECOVERY_OPENING_CHOICE_IDS.heroPresentationSex,
      optionId: sex,
    },
    current.facts,
  )
  return mutation(session, result.state, result.changed, result.reason)
}

export const startRecoveryWorkSearch = (
  session: GameSessionState,
): RecoveryOpeningMutationResult => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active || !current.state || current.phase !== 'prologue' || !current.selectedSex) {
    return { ...current, changed: false, reason: 'recovery-prologue-not-ready' }
  }
  const result = applyMissionEvent(
    current.definitions,
    current.state,
    RECOVERY_OPENING_MISSION_IDS.riseAndSearch,
    { eventId: 'recovery-opening:search-started:v1', kind: 'Signal', signalType: RECOVERY_OPENING_SIGNALS.searchStarted },
    current.facts,
  )
  return mutation(session, result.state, result.changed, result.reason)
}

export const enterRecoveryMariaShop = (
  session: GameSessionState,
): RecoveryOpeningMutationResult => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active || !current.state || current.phase !== 'search-work') {
    return { ...current, changed: false, reason: 'maria-shop-not-current-objective' }
  }

  let state = current.state
  const instance = state.missions[RECOVERY_OPENING_MISSION_IDS.mariaTest]
  if (instance?.status === 'Available') {
    state = startMission(
      current.definitions,
      state,
      RECOVERY_OPENING_MISSION_IDS.mariaTest,
      current.facts,
    ).state
  }
  const result = applyMissionEvent(
    current.definitions,
    state,
    RECOVERY_OPENING_MISSION_IDS.mariaTest,
    {
      eventId: 'recovery-opening:entered-maria-shop:v1',
      kind: 'Signal',
      signalType: RECOVERY_OPENING_SIGNALS.enteredMariaShop,
      referenceId: BRAILA_RECOVERY_RUNTIME_IDS.mariaShop,
    },
    current.facts,
  )
  return mutation(session, result.state, result.changed, result.reason)
}

const resolverForOrder = (order: OrderState): MissionDeliveryResolver => {
  const delivery = missionForOrder(order, 'walking')
  return missionId => missionId === delivery.missionId ? delivery : undefined
}

/**
 * Maria's counter establishes legitimate order acceptance and physical custody through the
 * existing order system. It does not credit Company Money or Personal Money.
 */
export const acceptAndReceiveRecoveryMariaTest = (
  session: GameSessionState,
): RecoveryOpeningMutationResult => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active || !current.state || current.phase !== 'maria-dialogue') {
    return { ...current, changed: false, reason: 'maria-test-not-ready' }
  }

  const sourceOrder = cloneOrder(current.firstOrder)
  session.world.activeOrder = sourceOrder
  session.world.player.currentOrder = ''
  session.world.player.carryingPackage = false

  const accepted = applyOrderAcceptanceRequest(session.world, sourceOrder.orderId)
  if (!accepted.accepted) return { ...current, changed: false, reason: 'authoritative-order-acceptance-failed' }
  session.world = accepted.worldState

  let state = applyMissionEvent(
    current.definitions,
    current.state,
    RECOVERY_OPENING_MISSION_IDS.mariaTest,
    {
      eventId: 'recovery-opening:maria-test-accepted:v1',
      kind: 'Signal',
      signalType: RECOVERY_OPENING_SIGNALS.mariaTestAccepted,
      referenceId: BRAILA_RECOVERY_RUNTIME_IDS.mariaActor,
    },
    current.facts,
  ).state

  const picked = attemptPickup(session.world.activeOrder, session.world.player, {
    expectedPickupLocation: session.world.activeOrder.pickupLocation,
    distanceToPackage: 0,
    pickupRadius: 48.001,
  })
  if (picked.order.status !== 'PickedUp' || !picked.player.carryingPackage) {
    return mutation(session, state, true, 'authoritative-cargo-handoff-failed')
  }
  session.world = { ...session.world, activeOrder: picked.order, player: picked.player }

  const delivery = missionForOrder(picked.order, 'walking')
  const transitioned = applyMissionEvent(
    current.definitions,
    state,
    RECOVERY_OPENING_MISSION_IDS.mariaTest,
    {
      eventId: `recovery-opening:${picked.order.orderId}:picked-up`,
      kind: 'DeliveryStatus',
      deliveryMissionId: delivery.missionId,
      orderId: picked.order.orderId,
      parcelIds: delivery.parcels.map(parcel => parcel.parcelId),
      status: 'PickedUp',
    },
    current.facts,
    resolverForOrder(picked.order),
  )
  state = transitioned.state
  return mutation(session, state, true, transitioned.reason)
}

/**
 * Completes cargo custody only. Economic settlement is deliberately not fabricated here;
 * the order remains `economySettled=false` until a compatible Personal Economy authority
 * explicitly settles this independent recovery work.
 */
export const deliverRecoveryMariaTest = (
  session: GameSessionState,
  distanceToDestination: number,
): RecoveryOpeningMutationResult => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active || !current.state || current.phase !== 'deliver-first') {
    return { ...current, changed: false, reason: 'recovery-delivery-not-active' }
  }
  const order = session.world.activeOrder
  if (order.orderId !== current.firstOrder.orderId || order.status !== 'PickedUp') {
    return { ...current, changed: false, reason: 'recovery-delivery-order-mismatch' }
  }

  const delivered = attemptDelivery(order, session.world.player, {
    selectedDestination: order.destination,
    distanceToDestination,
    deliveryRadius: 48,
    orderConditionsMet: Boolean(findWorldRoutePoint(order.destination)),
  })
  if (delivered.order.status !== 'Completed') {
    return { ...current, changed: false, reason: 'recovery-delivery-not-in-range' }
  }
  session.world = { ...session.world, activeOrder: delivered.order, player: delivered.player }

  const delivery = missionForOrder(delivered.order, 'walking')
  const transitioned = applyMissionEvent(
    current.definitions,
    current.state,
    RECOVERY_OPENING_MISSION_IDS.mariaTest,
    {
      eventId: `recovery-opening:${order.orderId}:delivered`,
      kind: 'DeliveryStatus',
      deliveryMissionId: delivery.missionId,
      orderId: delivered.order.orderId,
      parcelIds: delivery.parcels.map(parcel => parcel.parcelId),
      status: 'Delivered',
    },
    current.facts,
    resolverForOrder(delivered.order),
  )
  return mutation(session, transitioned.state, true, transitioned.reason)
}

export const completeRecoveryMariaReturn = (
  session: GameSessionState,
): RecoveryOpeningMutationResult => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active || !current.state || current.phase !== 'return-maria') {
    return { ...current, changed: false, reason: 'maria-return-not-ready' }
  }
  let state = current.state
  if (state.missions[RECOVERY_OPENING_MISSION_IDS.mariaReturn]?.status === 'Available') {
    state = startMission(
      current.definitions,
      state,
      RECOVERY_OPENING_MISSION_IDS.mariaReturn,
      current.facts,
    ).state
  }
  const result = applyMissionEvent(
    current.definitions,
    state,
    RECOVERY_OPENING_MISSION_IDS.mariaReturn,
    {
      eventId: 'recovery-opening:returned-to-maria:v1',
      kind: 'Signal',
      signalType: RECOVERY_OPENING_SIGNALS.returnedToMaria,
      referenceId: BRAILA_RECOVERY_RUNTIME_IDS.mariaActor,
    },
    current.facts,
  )
  return mutation(session, result.state, result.changed, result.reason)
}

export const recoveryOpeningObjective = (
  session: GameSessionState,
): UrbanObjective | null => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active) return null
  const mariaPoint = findWorldRoutePoint(BRAILA_RECOVERY_RUNTIME_IDS.mariaPickup)
  if (!mariaPoint) return null
  if (current.phase === 'search-work') {
    return { point: { x: mariaPoint.x, y: mariaPoint.y }, title: "Look for work at Maria's greengrocer", action: 'Enter shop' }
  }
  if (current.phase === 'return-maria') {
    return { point: { x: mariaPoint.x, y: mariaPoint.y }, title: 'Return to Maria', action: 'Enter shop' }
  }
  return null
}

export const recoveryOpeningStatusText = (session: GameSessionState): string | null => {
  const current = ensureRecoveryOpeningRuntime(session)
  if (!current.active) return null
  const cargo = session.world.player.carryingPackage ? 'Cargo 1/1' : 'Cargo 0/1'
  return `RECOVERY · On foot · No phone · ${cargo}`
}

export const recoveryMariaWorldPoint = (): { x: number; y: number } | null => {
  const point = findWorldRoutePoint(BRAILA_RECOVERY_RUNTIME_IDS.mariaPickup)
  return point ? { x: point.x, y: point.y } : null
}

export const recoveryWorldWithSession = (session: GameSessionState, world: WorldState): GameSessionState => ({
  ...session,
  world,
})
