import {
  MISSION_RUNTIME_VERSION,
  MISSION_STATUSES,
  type MissionChoiceRecord,
  type MissionCompletionReceipt,
  type MissionDefinition,
  type MissionInstanceState,
  type MissionRuntimeState,
  type MissionWorldFacts,
} from './missionModel'
import { cloneMissionRuntimeState, createMissionRuntimeState, validateMissionGraph } from './missionEngine'

export interface MissionRuntimeSanitizeResult {
  state: MissionRuntimeState
  repaired: boolean
  reasons: string[]
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const validId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 180

const uniqueIds = (value: unknown): string[] | null => {
  if (!Array.isArray(value) || !value.every(validId)) return null
  const ids = value.map(item => item.trim())
  return new Set(ids).size === ids.length ? ids : null
}

const choices = (value: unknown): MissionChoiceRecord[] | null => {
  if (!Array.isArray(value)) return null
  const result: MissionChoiceRecord[] = []
  const seen = new Set<string>()
  for (const item of value) {
    if (!record(item) || !validId(item.choiceId) || !validId(item.optionId) || seen.has(item.choiceId)) return null
    seen.add(item.choiceId)
    result.push({ choiceId: item.choiceId.trim(), optionId: item.optionId.trim() })
  }
  return result
}

const receipt = (value: unknown, knownMissionIds: ReadonlySet<string>): MissionCompletionReceipt | null => {
  if (!record(value) || !validId(value.receiptId) || !validId(value.missionId) || !knownMissionIds.has(value.missionId)) return null
  if (!Number.isSafeInteger(value.completedAtWorldMinute) || (value.completedAtWorldMinute as number) < 0) return null
  return {
    receiptId: value.receiptId.trim(),
    missionId: value.missionId.trim(),
    completedAtWorldMinute: value.completedAtWorldMinute as number,
  }
}

const sanitizeInstance = (
  value: unknown,
  definition: MissionDefinition,
): MissionInstanceState | null => {
  if (!record(value) || value.missionId !== definition.missionId) return null
  if (typeof value.status !== 'string' || !MISSION_STATUSES.some(status => status === value.status)) return null
  const completedObjectiveIds = uniqueIds(value.completedObjectiveIds)
  const processedEventIds = uniqueIds(value.processedEventIds)
  const emittedConsequenceIntentIds = uniqueIds(value.emittedConsequenceIntentIds)
  const selectedChoices = choices(value.choices)
  if (!completedObjectiveIds || !processedEventIds || !emittedConsequenceIntentIds || !selectedChoices) return null
  if (!Number.isSafeInteger(value.failureCount) || (value.failureCount as number) < 0) return null
  if (value.availableAtWorldMinute !== undefined &&
    (!Number.isSafeInteger(value.availableAtWorldMinute) || (value.availableAtWorldMinute as number) < 0)) return null
  if (value.completionReceiptId !== undefined && !validId(value.completionReceiptId)) return null

  const knownStageIds = new Set(definition.stages.map(stage => stage.stageId))
  const knownObjectiveIds = new Set(definition.stages.flatMap(stage => stage.objectives.map(objective => objective.objectiveId)))
  if (completedObjectiveIds.some(id => !knownObjectiveIds.has(id))) return null
  if (value.stageId !== undefined && (!validId(value.stageId) || !knownStageIds.has(value.stageId))) return null
  if (value.status === 'Active' && value.stageId === undefined) return null
  if (value.status === 'Completed' && !validId(value.completionReceiptId)) return null

  return {
    missionId: definition.missionId,
    status: value.status as MissionInstanceState['status'],
    ...(value.stageId !== undefined ? { stageId: value.stageId as string } : {}),
    completedObjectiveIds,
    choices: selectedChoices,
    processedEventIds,
    failureCount: value.failureCount as number,
    ...(value.availableAtWorldMinute !== undefined ? { availableAtWorldMinute: value.availableAtWorldMinute as number } : {}),
    ...(value.completionReceiptId !== undefined ? { completionReceiptId: value.completionReceiptId as string } : {}),
    emittedConsequenceIntentIds,
  }
}

/**
 * Mission state is a self-contained JSON-safe payload. Existing order, parcel, custody,
 * economy and capability aggregates are referenced by stable IDs and are never copied here.
 */
export const sanitizeMissionRuntimeState = (
  value: unknown,
  definitions: readonly MissionDefinition[],
  facts: MissionWorldFacts,
): MissionRuntimeSanitizeResult => {
  const graph = validateMissionGraph(definitions)
  if (!graph.valid) throw new Error(`Invalid mission graph: ${graph.errors.join('; ')}`)
  const fallback = createMissionRuntimeState(definitions, facts)
  if (value === undefined) return { state: fallback, repaired: false, reasons: [] }
  if (!record(value) || value.version !== MISSION_RUNTIME_VERSION || !record(value.missions) || !Array.isArray(value.completionReceipts)) {
    return { state: fallback, repaired: true, reasons: ['mission-runtime-structure-invalid'] }
  }

  const reasons: string[] = []
  const knownMissionIds = new Set(definitions.map(definition => definition.missionId))
  const missions: Record<string, MissionInstanceState> = {}
  for (const definition of definitions) {
    const parsed = sanitizeInstance(value.missions[definition.missionId], definition)
    if (!parsed) {
      missions[definition.missionId] = cloneMissionRuntimeState(fallback).missions[definition.missionId]
      reasons.push(`mission-instance-repaired:${definition.missionId}`)
    } else {
      missions[definition.missionId] = parsed
    }
  }

  const completionReceipts: MissionCompletionReceipt[] = []
  const seenReceipts = new Set<string>()
  for (const raw of value.completionReceipts) {
    const parsed = receipt(raw, knownMissionIds)
    if (!parsed || seenReceipts.has(parsed.receiptId)) {
      reasons.push('mission-completion-receipt-repaired')
      continue
    }
    seenReceipts.add(parsed.receiptId)
    completionReceipts.push(parsed)
  }

  for (const instance of Object.values(missions)) {
    if (instance.status !== 'Completed') continue
    const receiptId = instance.completionReceiptId
    const matching = completionReceipts.find(item => item.receiptId === receiptId && item.missionId === instance.missionId)
    if (!matching) {
      missions[instance.missionId] = cloneMissionRuntimeState(fallback).missions[instance.missionId]
      reasons.push(`completed-mission-without-receipt:${instance.missionId}`)
    }
  }

  return {
    state: { version: MISSION_RUNTIME_VERSION, missions, completionReceipts },
    repaired: reasons.length > 0,
    reasons,
  }
}

export const serializeMissionRuntimeState = (state: MissionRuntimeState): string =>
  JSON.stringify(cloneMissionRuntimeState(state))

export const restoreMissionRuntimeState = (
  raw: string,
  definitions: readonly MissionDefinition[],
  facts: MissionWorldFacts,
): MissionRuntimeSanitizeResult => {
  try {
    return sanitizeMissionRuntimeState(JSON.parse(raw), definitions, facts)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        state: createMissionRuntimeState(definitions, facts),
        repaired: true,
        reasons: ['mission-runtime-json-invalid'],
      }
    }
    throw error
  }
}
