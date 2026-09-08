import { isDeliveryMission, type DeliveryMission } from '../systems/urbanLogistics'
import {
  MISSION_RUNTIME_VERSION,
  type MissionChoiceRecord,
  type MissionConsequenceIntent,
  type MissionDefinition,
  type MissionDeliveryReference,
  type MissionEvent,
  type MissionGraphValidation,
  type MissionInstanceState,
  type MissionPrerequisite,
  type MissionPrerequisiteEvaluation,
  type MissionRuntimeState,
  type MissionStageDefinition,
  type MissionStageLink,
  type MissionTransitionResult,
  type MissionUnlockRule,
  type MissionWorldFacts,
} from './missionModel'

export type MissionDeliveryResolver = (deliveryMissionId: string) => DeliveryMission | undefined

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const validMinute = (value: number): boolean => Number.isSafeInteger(value) && value >= 0
const includes = (values: readonly string[] | undefined, value: string): boolean => values?.includes(value) ?? false

const cloneInstance = (instance: MissionInstanceState): MissionInstanceState => ({
  ...instance,
  completedObjectiveIds: [...instance.completedObjectiveIds],
  choices: instance.choices.map(choice => ({ ...choice })),
  processedEventIds: [...instance.processedEventIds],
  emittedConsequenceIntentIds: [...instance.emittedConsequenceIntentIds],
})

export const cloneMissionRuntimeState = (state: MissionRuntimeState): MissionRuntimeState => ({
  version: MISSION_RUNTIME_VERSION,
  missions: Object.fromEntries(Object.entries(state.missions).map(([id, instance]) => [id, cloneInstance(instance)])),
  completionReceipts: state.completionReceipts.map(receipt => ({ ...receipt })),
})

const semanticallyEqual = (left: MissionRuntimeState, right: MissionRuntimeState): boolean =>
  JSON.stringify(left) === JSON.stringify(right)

const definitionById = (definitions: readonly MissionDefinition[], missionId: string): MissionDefinition | undefined =>
  definitions.find(definition => definition.missionId === missionId)

const stageById = (definition: MissionDefinition, stageId: string | undefined): MissionStageDefinition | undefined =>
  definition.stages.find(stage => stage.stageId === stageId)

const completedMission = (state: MissionRuntimeState, missionId: string): boolean =>
  state.missions[missionId]?.status === 'Completed'

const prerequisiteSatisfied = (
  prerequisite: MissionPrerequisite,
  state: MissionRuntimeState,
  facts: MissionWorldFacts,
): boolean => {
  switch (prerequisite.kind) {
    case 'missionCompleted': return completedMission(state, prerequisite.missionId)
    case 'capability': return facts.capabilityIds?.includes(prerequisite.capabilityId) ?? false
    case 'equipment': return includes(facts.equipmentIds, prerequisite.equipmentId)
    case 'actorAvailable': return includes(facts.actorIds, prerequisite.actorId)
    case 'locationAvailable': return includes(facts.locationIds, prerequisite.locationId)
    case 'worldFlag': return includes(facts.worldFlags, prerequisite.flagId)
    case 'orderStatus': return facts.orderStatuses?.[prerequisite.orderId] === prerequisite.status
    case 'contractStatus': return facts.contractStatuses?.[prerequisite.contractId] === prerequisite.status
    case 'worldMinuteAtLeast': return facts.worldMinute >= prerequisite.worldMinute
  }
}

const prerequisiteBlocker = (prerequisite: MissionPrerequisite): string => {
  switch (prerequisite.kind) {
    case 'missionCompleted': return `mission:${prerequisite.missionId}:not-completed`
    case 'capability': return `capability:${prerequisite.capabilityId}:missing`
    case 'equipment': return `equipment:${prerequisite.equipmentId}:missing`
    case 'actorAvailable': return `actor:${prerequisite.actorId}:unavailable`
    case 'locationAvailable': return `location:${prerequisite.locationId}:unavailable`
    case 'worldFlag': return `world-flag:${prerequisite.flagId}:missing`
    case 'orderStatus': return `order:${prerequisite.orderId}:status:${prerequisite.status}:required`
    case 'contractStatus': return `contract:${prerequisite.contractId}:status:${prerequisite.status}:required`
    case 'worldMinuteAtLeast': return `world-minute:${prerequisite.worldMinute}:required`
  }
}

export const evaluateMissionPrerequisites = (
  definition: MissionDefinition,
  state: MissionRuntimeState,
  facts: MissionWorldFacts,
): MissionPrerequisiteEvaluation => {
  const blockers = definition.prerequisites
    .filter(prerequisite => !prerequisiteSatisfied(prerequisite, state, facts))
    .map(prerequisiteBlocker)
  return { eligible: blockers.length === 0, blockers }
}

const createInitialInstance = (definition: MissionDefinition): MissionInstanceState => ({
  missionId: definition.missionId,
  status: 'Locked',
  completedObjectiveIds: [],
  choices: [],
  processedEventIds: [],
  failureCount: 0,
  emittedConsequenceIntentIds: [],
})

export const refreshMissionAvailability = (
  definitions: readonly MissionDefinition[],
  source: MissionRuntimeState,
  facts: MissionWorldFacts,
): MissionRuntimeState => {
  const state = cloneMissionRuntimeState(source)
  for (const definition of definitions) {
    const instance = state.missions[definition.missionId]
    if (!instance || ['Active', 'Completed', 'Failed'].includes(instance.status)) continue

    const explicitlyUnlocked = instance.availableAtWorldMinute !== undefined
    if (definition.availability === 'ExplicitUnlock' && !explicitlyUnlocked) {
      instance.status = 'Locked'
      continue
    }
    if (instance.availableAtWorldMinute !== undefined && facts.worldMinute < instance.availableAtWorldMinute) {
      instance.status = 'Delayed'
      continue
    }
    instance.status = evaluateMissionPrerequisites(definition, state, facts).eligible ? 'Available' : 'Locked'
  }
  return state
}

export const createMissionRuntimeState = (
  definitions: readonly MissionDefinition[],
  facts: MissionWorldFacts,
): MissionRuntimeState => {
  const validation = validateMissionGraph(definitions)
  if (!validation.valid) throw new Error(`Invalid mission graph: ${validation.errors.join('; ')}`)
  const state: MissionRuntimeState = {
    version: MISSION_RUNTIME_VERSION,
    missions: Object.fromEntries(definitions.map(definition => [definition.missionId, createInitialInstance(definition)])),
    completionReceipts: [],
  }
  return refreshMissionAvailability(definitions, state, facts)
}

export const startMission = (
  definitions: readonly MissionDefinition[],
  source: MissionRuntimeState,
  missionId: string,
  facts: MissionWorldFacts,
): MissionTransitionResult => {
  const state = refreshMissionAvailability(definitions, source, facts)
  const definition = definitionById(definitions, missionId)
  const instance = state.missions[missionId]
  if (!definition || !instance) return { state: source, changed: false, reason: 'mission-not-found', emittedConsequences: [] }
  if (instance.status !== 'Available') {
    return {
      state,
      changed: !semanticallyEqual(state, source),
      reason: `mission-not-available:${instance.status}`,
      emittedConsequences: [],
    }
  }
  instance.status = 'Active'
  instance.stageId = instance.stageId ?? definition.startStageId
  return { state, changed: true, emittedConsequences: [] }
}

const sorted = (values: readonly string[]): string[] => [...values].sort()
const sameParcels = (left: readonly string[], right: readonly string[]): boolean => {
  const a = sorted(left)
  const b = sorted(right)
  return a.length === b.length && a.every((parcelId, index) => parcelId === b[index])
}

export const deliveryReferenceMatches = (
  reference: MissionDeliveryReference,
  resolver: MissionDeliveryResolver | undefined,
): boolean => {
  const mission = resolver?.(reference.deliveryMissionId)
  if (!mission || !isDeliveryMission(mission)) return false
  return mission.missionId === reference.deliveryMissionId &&
    mission.orderId === reference.orderId &&
    sameParcels(reference.parcelIds, mission.parcels.map(parcel => parcel.parcelId))
}

const objectiveMatchesEvent = (
  objective: MissionStageDefinition['objectives'][number],
  event: MissionEvent,
  facts: MissionWorldFacts,
  resolver: MissionDeliveryResolver | undefined,
): boolean => {
  if (objective.kind === 'time') return facts.worldMinute >= objective.atOrAfterWorldMinute
  if (objective.kind === 'signal' && event.kind === 'Signal') {
    return objective.signalType === event.signalType &&
      (objective.referenceId === undefined || objective.referenceId === event.referenceId)
  }
  if (objective.kind === 'orderStatus' && event.kind === 'OrderStatus') {
    return objective.orderId === event.orderId && objective.status === event.status
  }
  if (objective.kind === 'choice' && event.kind === 'Choice') {
    return objective.choiceId === event.choiceId && objective.options.includes(event.optionId)
  }
  if (objective.kind === 'delivery' && event.kind === 'DeliveryStatus') {
    return objective.status === event.status &&
      objective.delivery.deliveryMissionId === event.deliveryMissionId &&
      objective.delivery.orderId === event.orderId &&
      sameParcels(objective.delivery.parcelIds, event.parcelIds) &&
      deliveryReferenceMatches(objective.delivery, resolver)
  }
  return false
}

const upsertChoice = (
  choices: readonly MissionChoiceRecord[],
  choiceId: string,
  optionId: string,
): MissionChoiceRecord[] => {
  const index = choices.findIndex(choice => choice.choiceId === choiceId)
  if (index < 0) return [...choices, { choiceId, optionId }]
  return choices.map((choice, current) => current === index ? { choiceId, optionId } : { ...choice })
}

const clearStageObjectives = (
  instance: MissionInstanceState,
  stage: MissionStageDefinition | undefined,
): MissionInstanceState => {
  if (!stage) return instance
  const stageObjectiveIds = new Set(stage.objectives.map(objective => objective.objectiveId))
  return {
    ...instance,
    completedObjectiveIds: instance.completedObjectiveIds.filter(objectiveId => !stageObjectiveIds.has(objectiveId)),
  }
}

const unlockSelected = (rule: MissionUnlockRule, choices: readonly MissionChoiceRecord[]): boolean => {
  if (rule.choiceId === undefined && rule.optionId === undefined) return true
  if (!rule.choiceId || !rule.optionId) return false
  return choices.some(choice => choice.choiceId === rule.choiceId && choice.optionId === rule.optionId)
}

const applyUnlockRules = (
  definitions: readonly MissionDefinition[],
  source: MissionRuntimeState,
  rules: readonly MissionUnlockRule[],
  choices: readonly MissionChoiceRecord[],
  facts: MissionWorldFacts,
): MissionRuntimeState => {
  const state = cloneMissionRuntimeState(source)
  for (const rule of rules) {
    if (!unlockSelected(rule, choices)) continue
    const targetDefinition = definitionById(definitions, rule.missionId)
    const target = state.missions[rule.missionId]
    if (!targetDefinition || !target || ['Active', 'Completed', 'Failed'].includes(target.status)) continue

    const delayMinutes = rule.delayMinutes ?? 0
    target.availableAtWorldMinute = facts.worldMinute + delayMinutes
    if (delayMinutes > 0) {
      target.status = 'Delayed'
    } else {
      target.status = evaluateMissionPrerequisites(targetDefinition, state, facts).eligible ? 'Available' : 'Locked'
    }
  }
  return state
}

const completionReceiptId = (missionId: string): string => `mission-completion:${missionId}`
const consequenceIntentId = (missionId: string, index: number): string => `mission-consequence:${missionId}:${index}`

const completeMission = (
  definitions: readonly MissionDefinition[],
  source: MissionRuntimeState,
  definition: MissionDefinition,
  facts: MissionWorldFacts,
): { state: MissionRuntimeState; emittedConsequences: MissionConsequenceIntent[] } => {
  let state = cloneMissionRuntimeState(source)
  const instance = state.missions[definition.missionId]
  if (!instance || instance.status === 'Completed') return { state: source, emittedConsequences: [] }

  const receiptId = completionReceiptId(definition.missionId)
  instance.status = 'Completed'
  instance.stageId = undefined
  instance.completionReceiptId = receiptId
  if (!state.completionReceipts.some(receipt => receipt.receiptId === receiptId)) {
    state.completionReceipts.push({
      receiptId,
      missionId: definition.missionId,
      completedAtWorldMinute: facts.worldMinute,
    })
  }

  const emittedConsequences: MissionConsequenceIntent[] = []
  definition.completionConsequences.forEach((consequence, index) => {
    const intentId = consequenceIntentId(definition.missionId, index)
    if (instance.emittedConsequenceIntentIds.includes(intentId)) return
    instance.emittedConsequenceIntentIds.push(intentId)
    emittedConsequences.push({ intentId, missionId: definition.missionId, receiptId, consequence })
  })

  state = applyUnlockRules(definitions, state, definition.unlocks ?? [], instance.choices, facts)
  state = refreshMissionAvailability(definitions, state, facts)
  return { state, emittedConsequences }
}

const branchTarget = (
  stage: MissionStageDefinition,
  choices: readonly MissionChoiceRecord[],
): MissionStageLink | null | undefined => {
  if (!stage.branches || stage.branches.length === 0) return stage.next
  for (const branch of stage.branches) {
    if (choices.some(choice => choice.choiceId === branch.choiceId && choice.optionId === branch.optionId)) {
      return branch.target ?? null
    }
  }
  return undefined
}

const requiredObjectivesComplete = (stage: MissionStageDefinition, instance: MissionInstanceState): boolean =>
  stage.objectives
    .filter(objective => !objective.optional)
    .every(objective => instance.completedObjectiveIds.includes(objective.objectiveId))

const applyFailure = (
  definitions: readonly MissionDefinition[],
  source: MissionRuntimeState,
  definition: MissionDefinition,
  facts: MissionWorldFacts,
): MissionTransitionResult => {
  let state = cloneMissionRuntimeState(source)
  let instance = state.missions[definition.missionId]
  if (!instance || instance.status !== 'Active') {
    return { state: source, changed: false, reason: 'mission-not-active', emittedConsequences: [] }
  }

  const currentStageId = instance.stageId
  const policy = definition.failurePolicy ?? { kind: 'Retry' as const }
  instance.failureCount += 1

  if (policy.kind === 'Retry') {
    const retryStage = stageById(definition, policy.stageId ?? currentStageId)
    instance = clearStageObjectives(instance, retryStage)
    instance.stageId = retryStage?.stageId ?? definition.startStageId
    state.missions[definition.missionId] = instance
    return { state, changed: true, reason: 'retry-ready', emittedConsequences: [] }
  }

  if (policy.kind === 'AlternateOutcome') {
    instance.stageId = policy.target.stageId
    state.missions[definition.missionId] = instance
    return { state, changed: true, reason: 'alternate-outcome', emittedConsequences: [] }
  }

  if (policy.kind === 'DelayedSecondChance') {
    const retryStage = stageById(definition, policy.stageId ?? currentStageId)
    instance = clearStageObjectives(instance, retryStage)
    instance.stageId = retryStage?.stageId ?? definition.startStageId
    instance.status = 'Delayed'
    instance.availableAtWorldMinute = facts.worldMinute + policy.delayMinutes
    state.missions[definition.missionId] = instance
    return { state, changed: true, reason: 'second-chance-delayed', emittedConsequences: [] }
  }

  instance.status = 'Failed'
  instance.stageId = undefined
  state.missions[definition.missionId] = instance
  state = applyUnlockRules(definitions, state, policy.unlocks, instance.choices, facts)
  state = refreshMissionAvailability(definitions, state, facts)
  return { state, changed: true, reason: 'failed-branch-opened', emittedConsequences: [] }
}

export const applyMissionEvent = (
  definitions: readonly MissionDefinition[],
  source: MissionRuntimeState,
  missionId: string,
  event: MissionEvent,
  facts: MissionWorldFacts,
  resolveDelivery?: MissionDeliveryResolver,
): MissionTransitionResult => {
  const refreshed = refreshMissionAvailability(definitions, source, facts)
  const definition = definitionById(definitions, missionId)
  const current = refreshed.missions[missionId]
  if (!definition || !current) return { state: source, changed: false, reason: 'mission-not-found', emittedConsequences: [] }
  if (current.status !== 'Active') {
    return {
      state: refreshed,
      changed: !semanticallyEqual(refreshed, source),
      reason: `mission-not-active:${current.status}`,
      emittedConsequences: [],
    }
  }
  if (!validId(event.eventId)) return { state: source, changed: false, reason: 'invalid-event-id', emittedConsequences: [] }
  if (current.processedEventIds.includes(event.eventId)) {
    return { state: source, changed: false, reason: 'duplicate-event', emittedConsequences: [] }
  }

  const state = cloneMissionRuntimeState(refreshed)
  const active = state.missions[missionId]
  active.processedEventIds.push(event.eventId)

  if (event.kind === 'Fail') return applyFailure(definitions, state, definition, facts)

  const stage = stageById(definition, active.stageId)
  if (!stage) return { state: source, changed: false, reason: 'invalid-active-stage', emittedConsequences: [] }

  for (const objective of stage.objectives) {
    if (active.completedObjectiveIds.includes(objective.objectiveId)) continue
    if (!objectiveMatchesEvent(objective, event, facts, resolveDelivery)) continue
    active.completedObjectiveIds.push(objective.objectiveId)
    if (objective.kind === 'choice' && event.kind === 'Choice') {
      active.choices = upsertChoice(active.choices, event.choiceId, event.optionId)
    }
  }

  if (!requiredObjectivesComplete(stage, active)) return { state, changed: true, emittedConsequences: [] }

  const target = branchTarget(stage, active.choices)
  if (target === undefined && stage.branches && stage.branches.length > 0) {
    return { state, changed: true, reason: 'branch-choice-required', emittedConsequences: [] }
  }
  if (target) {
    const nextStage = stageById(definition, target.stageId)
    if (!nextStage) return { state: source, changed: false, reason: 'invalid-stage-target', emittedConsequences: [] }
    active.stageId = nextStage.stageId
    return { state, changed: true, emittedConsequences: [] }
  }

  const completed = completeMission(definitions, state, definition, facts)
  return { state: completed.state, changed: true, emittedConsequences: completed.emittedConsequences }
}

interface DirectedEdge {
  to: string
  allowCycle: boolean
}

const findCycle = (
  nodes: readonly string[],
  edges: ReadonlyMap<string, readonly DirectedEdge[]>,
): string[] | null => {
  const visited = new Set<string>()
  const active = new Set<string>()
  const stack: string[] = []

  const visit = (node: string): string[] | null => {
    if (active.has(node)) {
      const start = stack.indexOf(node)
      return [...stack.slice(start), node]
    }
    if (visited.has(node)) return null
    visited.add(node)
    active.add(node)
    stack.push(node)
    for (const edge of edges.get(node) ?? []) {
      if (edge.allowCycle) continue
      const cycle = visit(edge.to)
      if (cycle) return cycle
    }
    stack.pop()
    active.delete(node)
    return null
  }

  for (const node of nodes) {
    const cycle = visit(node)
    if (cycle) return cycle
  }
  return null
}

const validateStageGraph = (definition: MissionDefinition): string[] => {
  const errors: string[] = []
  const stageIds = definition.stages.map(stage => stage.stageId)
  const knownStages = new Set(stageIds)
  if (stageIds.length === 0) errors.push(`Mission ${definition.missionId} requires at least one stage`)
  if (knownStages.size !== stageIds.length) errors.push(`Mission ${definition.missionId} has duplicate stage IDs`)
  if (!knownStages.has(definition.startStageId)) errors.push(`Mission ${definition.missionId} has unknown start stage ${definition.startStageId}`)

  const objectiveIds: string[] = []
  const edges = new Map<string, DirectedEdge[]>()
  for (const stage of definition.stages) {
    if (!validId(stage.stageId) || !validId(stage.label)) errors.push(`Mission ${definition.missionId} has invalid stage identity`)
    if (stage.objectives.length === 0) errors.push(`Mission ${definition.missionId} stage ${stage.stageId} requires objectives`)

    for (const objective of stage.objectives) {
      objectiveIds.push(objective.objectiveId)
      if (!validId(objective.objectiveId) || !validId(objective.label)) errors.push(`Mission ${definition.missionId} has invalid objective identity`)
      if (objective.kind === 'choice' && (objective.options.length < 2 || new Set(objective.options).size !== objective.options.length)) {
        errors.push(`Mission ${definition.missionId} choice ${objective.choiceId} requires unique options`)
      }
      if (objective.kind === 'time' && !validMinute(objective.atOrAfterWorldMinute)) {
        errors.push(`Mission ${definition.missionId} has invalid time objective ${objective.objectiveId}`)
      }
      if (objective.kind === 'delivery') {
        const delivery = objective.delivery
        if (!validId(delivery.deliveryMissionId) || !validId(delivery.orderId) || delivery.parcelIds.length === 0 ||
          new Set(delivery.parcelIds).size !== delivery.parcelIds.length || delivery.parcelIds.some(parcelId => !validId(parcelId))) {
          errors.push(`Mission ${definition.missionId} has invalid delivery reference ${objective.objectiveId}`)
        }
      }
    }

    const stageEdges: DirectedEdge[] = []
    if (stage.next) {
      if (!knownStages.has(stage.next.stageId)) {
        errors.push(`Mission ${definition.missionId} stage ${stage.stageId} points to unknown stage ${stage.next.stageId}`)
      } else {
        stageEdges.push({ to: stage.next.stageId, allowCycle: stage.next.allowCycle === true })
      }
    }
    for (const branch of stage.branches ?? []) {
      const choice = stage.objectives.find(objective => objective.kind === 'choice' && objective.choiceId === branch.choiceId)
      if (!choice || choice.kind !== 'choice' || choice.optional || !choice.options.includes(branch.optionId)) {
        errors.push(`Mission ${definition.missionId} stage ${stage.stageId} has invalid branch ${branch.choiceId}:${branch.optionId}`)
      }
      if (branch.target) {
        if (!knownStages.has(branch.target.stageId)) {
          errors.push(`Mission ${definition.missionId} branch points to unknown stage ${branch.target.stageId}`)
        } else {
          stageEdges.push({ to: branch.target.stageId, allowCycle: branch.target.allowCycle === true })
        }
      }
    }
    edges.set(stage.stageId, stageEdges)
  }

  if (new Set(objectiveIds).size !== objectiveIds.length) errors.push(`Mission ${definition.missionId} has duplicate objective IDs`)
  const cycle = findCycle(stageIds, edges)
  if (cycle) errors.push(`Mission ${definition.missionId} stage cycle detected: ${cycle.join(' -> ')}`)
  return errors
}

const pushMissionEdge = (
  edges: Map<string, DirectedEdge[]>,
  from: string,
  to: string,
  allowCycle: boolean,
): void => {
  const outgoing = edges.get(from)
  if (outgoing) outgoing.push({ to, allowCycle })
}

const validateUnlockRule = (
  ownerMissionId: string,
  rule: MissionUnlockRule,
  knownMissionIds: ReadonlySet<string>,
): string[] => {
  const errors: string[] = []
  if (!knownMissionIds.has(rule.missionId)) errors.push(`Mission ${ownerMissionId} unlocks unknown mission ${rule.missionId}`)
  if (rule.delayMinutes !== undefined && (!Number.isSafeInteger(rule.delayMinutes) || rule.delayMinutes < 0)) {
    errors.push(`Mission ${ownerMissionId} has invalid unlock delay`)
  }
  if ((rule.choiceId === undefined) !== (rule.optionId === undefined)) {
    errors.push(`Mission ${ownerMissionId} has incomplete choice unlock rule`)
  }
  return errors
}

export const validateMissionGraph = (definitions: readonly MissionDefinition[]): MissionGraphValidation => {
  const errors: string[] = []
  const missionIds = definitions.map(definition => definition.missionId)
  const knownMissionIds = new Set(missionIds)
  if (knownMissionIds.size !== missionIds.length) errors.push('Mission graph contains duplicate mission IDs')

  const missionEdges = new Map<string, DirectedEdge[]>(missionIds.map(missionId => [missionId, []]))

  for (const definition of definitions) {
    if (!validId(definition.missionId) || !validId(definition.label)) errors.push('Mission requires stable ID and label')
    if (definition.source.kind === 'Systemic' && !validId(definition.source.causeRef)) {
      errors.push(`Systemic mission ${definition.missionId} requires a causeRef`)
    }
    errors.push(...validateStageGraph(definition))

    for (const prerequisite of definition.prerequisites) {
      if (prerequisite.kind === 'missionCompleted') {
        if (!knownMissionIds.has(prerequisite.missionId)) {
          errors.push(`Mission ${definition.missionId} references unknown prerequisite ${prerequisite.missionId}`)
        } else {
          // Dependency direction is causal: prerequisite mission -> dependent mission.
          pushMissionEdge(missionEdges, prerequisite.missionId, definition.missionId, false)
        }
      }
      if (prerequisite.kind === 'worldMinuteAtLeast' && !validMinute(prerequisite.worldMinute)) {
        errors.push(`Mission ${definition.missionId} has invalid world-minute prerequisite`)
      }
    }

    for (const unlock of definition.unlocks ?? []) {
      errors.push(...validateUnlockRule(definition.missionId, unlock, knownMissionIds))
      if (knownMissionIds.has(unlock.missionId)) {
        pushMissionEdge(missionEdges, definition.missionId, unlock.missionId, unlock.allowCycle === true)
      }
    }

    const failurePolicy = definition.failurePolicy
    if (failurePolicy?.kind === 'Retry' && failurePolicy.stageId !== undefined &&
      !definition.stages.some(stage => stage.stageId === failurePolicy.stageId)) {
      errors.push(`Mission ${definition.missionId} retry policy points to unknown stage`)
    }
    if (failurePolicy?.kind === 'AlternateOutcome' &&
      !definition.stages.some(stage => stage.stageId === failurePolicy.target.stageId)) {
      errors.push(`Mission ${definition.missionId} failure policy points to unknown stage`)
    }
    if (failurePolicy?.kind === 'DelayedSecondChance') {
      if (!Number.isSafeInteger(failurePolicy.delayMinutes) || failurePolicy.delayMinutes <= 0) {
        errors.push(`Mission ${definition.missionId} has invalid second-chance delay`)
      }
      if (failurePolicy.stageId !== undefined && !definition.stages.some(stage => stage.stageId === failurePolicy.stageId)) {
        errors.push(`Mission ${definition.missionId} second-chance policy points to unknown stage`)
      }
    }
    if (failurePolicy?.kind === 'FailedBranch') {
      for (const unlock of failurePolicy.unlocks) {
        errors.push(...validateUnlockRule(definition.missionId, unlock, knownMissionIds))
        if (knownMissionIds.has(unlock.missionId)) {
          pushMissionEdge(missionEdges, definition.missionId, unlock.missionId, unlock.allowCycle === true)
        }
      }
    }
  }

  const missionCycle = findCycle(missionIds, missionEdges)
  if (missionCycle) errors.push(`Mission dependency cycle detected: ${missionCycle.join(' -> ')}`)
  return { valid: errors.length === 0, errors }
}
