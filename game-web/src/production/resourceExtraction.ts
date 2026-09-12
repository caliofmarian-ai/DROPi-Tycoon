import {
  addInventory,
  type InventoryState,
} from '../inventory/inventory'
import {
  type EconomicNodeLocation,
  type ProductiveNodeState,
} from './production'
import {
  productDefinition,
  type ProductId,
} from './productCatalog'
import { worldClockMinuteOrdinal } from '../systems/worldClockSystem'
import type {
  ExternalEconomicNodeKind,
  WorldClockState,
} from '../world/globalWorld'

export const RESOURCE_EVIDENCE_RESOLUTIONS = [
  'Country',
  'AdministrativeRegion',
  'Locality',
  'Site',
] as const
export type ResourceEvidenceResolution = (typeof RESOURCE_EVIDENCE_RESOLUTIONS)[number]

export const RESOURCE_OCCURRENCE_STATES = ['Present', 'Absent', 'Unknown'] as const
export type ResourceOccurrenceState = (typeof RESOURCE_OCCURRENCE_STATES)[number]

export const RESOURCE_MEASUREMENT_SEMANTICS = [
  'ReserveOrRecoverableQuantity',
  'AnnualExtractionOrProduction',
  'TheoreticalPotential',
  'InstalledProductiveCapacity',
] as const
export type ResourceMeasurementSemantic = (typeof RESOURCE_MEASUREMENT_SEMANTICS)[number]

export interface GovernedResourceMeasurement {
  semantic: ResourceMeasurementSemantic
  value: number
  unit: string
}

export interface GovernedResourceGeography {
  resolution: ResourceEvidenceResolution
  countryId: string
  administrativeRegionId?: string
  localityId?: string
  siteRef?: string
}

/**
 * Source-backed evidence supplied by a governed dataset/provenance owner.
 * This record is evidence only: it never becomes gameplay stock by itself.
 */
export interface GovernedResourceEvidence {
  evidenceId: string
  resourceId: string
  resourceCategory: string
  occurrence: ResourceOccurrenceState
  geography: GovernedResourceGeography
  sourceAuthority: string
  sourceDatasetVersion: string
  sourceRecordRef: string
  provenanceRef: string
  measurement?: GovernedResourceMeasurement
}

export interface ResourceExtractionReceipt {
  extractionId: string
  resourceEvidenceId: string
  resourceId: string
  allocationPolicyId: string
  worldInstanceId: string
  nodeId: string
  productId: ProductId
  resourceUnitsConsumed: number
  outputUnitsCreated: number
  completedMinuteOrdinal: number
}

/**
 * Fictional World Instance stock seeded from governed evidence through an explicit gameplay allocation policy.
 * `availableSimulationUnits` are simulation units and are never interpreted as the source measurement's unit.
 */
export interface ResourceSimulationState {
  resourceStateId: string
  worldInstanceId: string
  worldBaselineVersion: string
  allocationPolicyId: string
  sourceEvidence: GovernedResourceEvidence
  availableSimulationUnits: number
  extractionReceipts: readonly ResourceExtractionReceipt[]
}

export interface ResourceExtractionProcess {
  processId: string
  resourceCategory: string
  resourceUnitsRequired: number
  outputProductId: ProductId
  outputUnits: number
  compatibleFacilityKinds: readonly ExternalEconomicNodeKind[]
  capacityUnitsRequired: number
  processingMinutes: number
}

export type ResourceExtractionResult =
  | {
      status: 'applied'
      resource: ResourceSimulationState
      node: ProductiveNodeState
      receipt: ResourceExtractionReceipt
    }
  | {
      status: 'duplicate'
      resource: ResourceSimulationState
      node: ProductiveNodeState
      receipt: ResourceExtractionReceipt
    }
  | {
      status: 'rejected'
      resource: ResourceSimulationState
      node: ProductiveNodeState
      reason: string
    }

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 220
const validPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const validNonNegativeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0

const cloneMeasurement = (
  measurement: GovernedResourceMeasurement | undefined,
): GovernedResourceMeasurement | undefined => measurement ? { ...measurement } : undefined

const cloneEvidence = (evidence: GovernedResourceEvidence): GovernedResourceEvidence => ({
  ...evidence,
  geography: { ...evidence.geography },
  ...(evidence.measurement ? { measurement: cloneMeasurement(evidence.measurement) } : {}),
})

const validateGeography = (geography: GovernedResourceGeography): void => {
  if (!RESOURCE_EVIDENCE_RESOLUTIONS.includes(geography.resolution) || !validId(geography.countryId)) {
    throw new Error('Invalid resource geography')
  }

  switch (geography.resolution) {
    case 'Country':
      if (geography.administrativeRegionId || geography.localityId || geography.siteRef) {
        throw new Error('Country resource evidence claims unsupported finer precision')
      }
      return
    case 'AdministrativeRegion':
      if (!geography.administrativeRegionId || !validId(geography.administrativeRegionId) || geography.localityId || geography.siteRef) {
        throw new Error('Invalid administrative-region resource geography')
      }
      return
    case 'Locality':
      if (!geography.localityId || !validId(geography.localityId) || geography.siteRef) {
        throw new Error('Invalid locality resource geography')
      }
      if (geography.administrativeRegionId && !validId(geography.administrativeRegionId)) {
        throw new Error('Invalid locality administrative region')
      }
      return
    case 'Site':
      if (!geography.siteRef || !validId(geography.siteRef)) {
        throw new Error('Invalid site resource geography')
      }
      if (geography.administrativeRegionId && !validId(geography.administrativeRegionId)) {
        throw new Error('Invalid site administrative region')
      }
      if (geography.localityId && !validId(geography.localityId)) {
        throw new Error('Invalid site locality')
      }
  }
}

export const validateGovernedResourceEvidence = (evidence: GovernedResourceEvidence): void => {
  if (![evidence.evidenceId, evidence.resourceId, evidence.resourceCategory, evidence.sourceAuthority,
    evidence.sourceDatasetVersion, evidence.sourceRecordRef, evidence.provenanceRef].every(validId)) {
    throw new Error('Invalid governed resource evidence identity')
  }
  if (!RESOURCE_OCCURRENCE_STATES.includes(evidence.occurrence)) {
    throw new Error('Invalid resource occurrence state')
  }
  validateGeography(evidence.geography)
  if (evidence.measurement) {
    if (!RESOURCE_MEASUREMENT_SEMANTICS.includes(evidence.measurement.semantic)
      || !Number.isFinite(evidence.measurement.value)
      || evidence.measurement.value < 0
      || !validId(evidence.measurement.unit)) {
      throw new Error('Invalid governed resource measurement')
    }
  }
}

export const createResourceSimulationState = (input: {
  resourceStateId: string
  worldInstanceId: string
  worldBaselineVersion: string
  allocationPolicyId: string
  sourceEvidence: GovernedResourceEvidence
  initialSimulationUnits: number
}): ResourceSimulationState => {
  if (![input.resourceStateId, input.worldInstanceId, input.worldBaselineVersion, input.allocationPolicyId].every(validId)) {
    throw new Error('Invalid resource simulation identity')
  }
  if (!validNonNegativeInteger(input.initialSimulationUnits)) throw new Error('Invalid resource simulation allocation')
  validateGovernedResourceEvidence(input.sourceEvidence)
  if (input.initialSimulationUnits > 0 && input.sourceEvidence.occurrence !== 'Present') {
    throw new Error('Positive resource allocation requires governed present-occurrence evidence')
  }
  return {
    resourceStateId: input.resourceStateId,
    worldInstanceId: input.worldInstanceId,
    worldBaselineVersion: input.worldBaselineVersion,
    allocationPolicyId: input.allocationPolicyId,
    sourceEvidence: cloneEvidence(input.sourceEvidence),
    availableSimulationUnits: input.initialSimulationUnits,
    extractionReceipts: [],
  }
}

export const createResourceExtractionProcess = (input: {
  processId: string
  resourceCategory: string
  resourceUnitsRequired: number
  outputProductId: ProductId
  outputUnits: number
  compatibleFacilityKinds: readonly ExternalEconomicNodeKind[]
  capacityUnitsRequired: number
  processingMinutes: number
}): ResourceExtractionProcess => {
  if (!validId(input.processId) || !validId(input.resourceCategory) || !productDefinition(input.outputProductId)) {
    throw new Error('Invalid resource extraction process identity')
  }
  if (!validPositiveInteger(input.resourceUnitsRequired)
    || !validPositiveInteger(input.outputUnits)
    || !validPositiveInteger(input.capacityUnitsRequired)
    || !validPositiveInteger(input.processingMinutes)
    || input.compatibleFacilityKinds.length === 0) {
    throw new Error('Invalid resource extraction process quantity/capacity/time')
  }
  return {
    ...input,
    compatibleFacilityKinds: [...input.compatibleFacilityKinds],
  }
}

const locationMatchesEvidence = (
  location: EconomicNodeLocation,
  geography: GovernedResourceGeography,
): boolean => {
  if (location.countryId !== geography.countryId) return false
  if (geography.administrativeRegionId && location.administrativeRegionId !== geography.administrativeRegionId) return false
  if (geography.localityId && location.localityId !== geography.localityId) return false
  return true
}

const receiptFor = (
  resource: ResourceSimulationState,
  node: ProductiveNodeState,
  process: ResourceExtractionProcess,
  extractionId: string,
  completedMinuteOrdinal: number,
): ResourceExtractionReceipt => ({
  extractionId,
  resourceEvidenceId: resource.sourceEvidence.evidenceId,
  resourceId: resource.sourceEvidence.resourceId,
  allocationPolicyId: resource.allocationPolicyId,
  worldInstanceId: resource.worldInstanceId,
  nodeId: node.nodeId,
  productId: process.outputProductId,
  resourceUnitsConsumed: process.resourceUnitsRequired,
  outputUnitsCreated: process.outputUnits,
  completedMinuteOrdinal,
})

export const settleResourceExtraction = (input: {
  resource: ResourceSimulationState
  node: ProductiveNodeState
  process: ResourceExtractionProcess
  extractionId: string
  startedAt: WorldClockState
  completedAt: WorldClockState
  resourceAccessRef?: string
}): ResourceExtractionResult => {
  const { resource, node, process } = input
  if (!validId(input.extractionId)) return { status: 'rejected', resource, node, reason: 'invalid-extraction-id' }

  const previousReceipt = resource.extractionReceipts.find(receipt => receipt.extractionId === input.extractionId)
  if (previousReceipt) return { status: 'duplicate', resource, node, receipt: previousReceipt }

  if (resource.sourceEvidence.occurrence !== 'Present') {
    return { status: 'rejected', resource, node, reason: 'resource-occurrence-not-present' }
  }
  if (resource.worldInstanceId !== node.location.worldInstanceId
    || input.startedAt.worldInstanceId !== resource.worldInstanceId
    || input.completedAt.worldInstanceId !== resource.worldInstanceId) {
    return { status: 'rejected', resource, node, reason: 'world-instance-mismatch' }
  }
  if (!locationMatchesEvidence(node.location, resource.sourceEvidence.geography)) {
    return { status: 'rejected', resource, node, reason: 'resource-geography-mismatch' }
  }
  if (resource.sourceEvidence.geography.resolution === 'Site'
    && input.resourceAccessRef !== resource.sourceEvidence.geography.siteRef) {
    return { status: 'rejected', resource, node, reason: 'resource-site-access-mismatch' }
  }
  if (process.resourceCategory !== resource.sourceEvidence.resourceCategory) {
    return { status: 'rejected', resource, node, reason: 'resource-category-mismatch' }
  }
  if (!process.compatibleFacilityKinds.includes(node.kind)) {
    return { status: 'rejected', resource, node, reason: 'extraction-facility-incompatible' }
  }
  if (node.productionCapacityUnits < process.capacityUnitsRequired) {
    return { status: 'rejected', resource, node, reason: 'extraction-capacity-insufficient' }
  }
  if (resource.availableSimulationUnits < process.resourceUnitsRequired) {
    return { status: 'rejected', resource, node, reason: 'resource-depleted-or-insufficient' }
  }

  const startMinute = worldClockMinuteOrdinal(input.startedAt)
  const completionMinute = worldClockMinuteOrdinal(input.completedAt)
  if (completionMinute - startMinute < process.processingMinutes) {
    return { status: 'rejected', resource, node, reason: 'extraction-time-incomplete' }
  }

  const inventoryResult = addInventory(
    node.inventory,
    `resource-extraction:${input.extractionId}:output:${process.outputProductId}`,
    process.outputProductId,
    process.outputUnits,
  )
  if (inventoryResult.status === 'rejected') {
    return { status: 'rejected', resource, node, reason: `output-inventory:${inventoryResult.reason}` }
  }
  if (inventoryResult.status === 'duplicate') {
    return { status: 'rejected', resource, node, reason: 'output-mutation-without-extraction-receipt' }
  }

  const receipt = receiptFor(resource, node, process, input.extractionId, completionMinute)
  return {
    status: 'applied',
    resource: {
      ...resource,
      availableSimulationUnits: resource.availableSimulationUnits - process.resourceUnitsRequired,
      extractionReceipts: [...resource.extractionReceipts, receipt],
    },
    node: { ...node, inventory: inventoryResult.inventory },
    receipt,
  }
}

/** Read-only helper for persistence/observability owners; does not clone or mutate inventory authority. */
export const resourceExtractionInventory = (node: ProductiveNodeState): InventoryState => node.inventory
