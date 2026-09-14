import { describe, expect, it } from 'vitest'
import { inventoryQuantity } from '../src/inventory/inventory'
import {
  createProductiveNode,
  settleProductionCycle,
  TIMBER_TO_PULP_RECIPE,
} from '../src/production/production'
import { PRODUCT_CATALOG } from '../src/production/productCatalog'
import {
  createResourceExtractionProcess,
  createResourceSimulationState,
  settleResourceExtraction,
  type GovernedResourceEvidence,
} from '../src/production/resourceExtraction'
import {
  deliverProducerCargo,
  pickupProducerCargo,
} from '../src/trade/producerLogisticsContract'
import { materializeProducerSystemicMission } from '../src/trade/producerSystemicMission'
import {
  deriveInventoryDemand,
  deriveLogisticsOpportunities,
  deriveSupplyOffer,
} from '../src/trade/regionalSupplyDemand'
import type { WorldClockState } from '../src/world/globalWorld'

const worldInstanceId = 'world:resource-proof'
const countryId = 'country:test-alpha'
const administrativeRegionId = 'region:test-alpha'
const localityId = 'locality:test-alpha'

const location = {
  worldInstanceId,
  countryId,
  administrativeRegionId,
  localityId,
}

const clock = (hour: number): WorldClockState => ({
  worldInstanceId,
  year: 1,
  season: 'Spring',
  dayOfSeason: 1,
  hour,
  minute: 0,
})

const governedForestEvidence = (overrides: Partial<GovernedResourceEvidence> = {}): GovernedResourceEvidence => ({
  evidenceId: 'resource-evidence:test-alpha:forest:v1',
  resourceId: 'resource:forest-biomass:test-alpha',
  resourceCategory: 'forest-biomass',
  occurrence: 'Present',
  geography: {
    resolution: 'AdministrativeRegion',
    countryId,
    administrativeRegionId,
  },
  sourceAuthority: 'source-authority:test-fixture',
  sourceDatasetVersion: 'source-dataset:test-v1',
  sourceRecordRef: 'source-record:test-alpha:forest',
  provenanceRef: 'provenance:test-alpha:forest:v1',
  ...overrides,
})

const rawTimberExtraction = () => createResourceExtractionProcess({
  processId: 'extraction-process:test-forest-to-raw-timber:v1',
  resourceCategory: 'forest-biomass',
  resourceUnitsRequired: 4,
  outputProductId: PRODUCT_CATALOG.rawTimber.productId,
  outputUnits: 4,
  compatibleFacilityKinds: ['Forestry'],
  capacityUnitsRequired: 1,
  processingMinutes: 60,
})

describe('governed natural-resource extraction foundation', () => {
  it('keeps source measurement semantics separate from fictional World Instance allocation', () => {
    const resource = createResourceSimulationState({
      resourceStateId: 'resource-state:measurement-separation',
      worldInstanceId,
      worldBaselineVersion: 'world-baseline:test-v1',
      allocationPolicyId: 'allocation-policy:test-v1',
      sourceEvidence: governedForestEvidence({
        measurement: {
          semantic: 'AnnualExtractionOrProduction',
          value: 999,
          unit: 'source-unit:test-only',
        },
      }),
      initialSimulationUnits: 4,
    })

    expect(resource.sourceEvidence.measurement?.value).toBe(999)
    expect(resource.availableSimulationUnits).toBe(4)
  })

  it('fails closed when absent/unknown source evidence would otherwise seed positive stock', () => {
    expect(() => createResourceSimulationState({
      resourceStateId: 'resource-state:unknown',
      worldInstanceId,
      worldBaselineVersion: 'world-baseline:test-v1',
      allocationPolicyId: 'allocation-policy:test-v1',
      sourceEvidence: governedForestEvidence({ occurrence: 'Unknown' }),
      initialSimulationUnits: 4,
    })).toThrow('Positive resource allocation requires governed present-occurrence evidence')

    expect(() => createResourceSimulationState({
      resourceStateId: 'resource-state:absent',
      worldInstanceId,
      worldBaselineVersion: 'world-baseline:test-v1',
      allocationPolicyId: 'allocation-policy:test-v1',
      sourceEvidence: governedForestEvidence({ occurrence: 'Absent' }),
      initialSimulationUnits: 1,
    })).toThrow('Positive resource allocation requires governed present-occurrence evidence')
  })

  it('does not spread regional evidence into a different region', () => {
    const resource = createResourceSimulationState({
      resourceStateId: 'resource-state:regional-scope',
      worldInstanceId,
      worldBaselineVersion: 'world-baseline:test-v1',
      allocationPolicyId: 'allocation-policy:test-v1',
      sourceEvidence: governedForestEvidence(),
      initialSimulationUnits: 8,
    })
    const wrongRegionNode = createProductiveNode({
      nodeId: 'node:forestry:wrong-region',
      kind: 'Forestry',
      location: { ...location, administrativeRegionId: 'region:test-beta', localityId: 'locality:test-beta' },
      inventoryCapacityUnits: 20,
      productionCapacityUnits: 1,
    })

    const result = settleResourceExtraction({
      resource,
      node: wrongRegionNode,
      process: rawTimberExtraction(),
      extractionId: 'extraction:wrong-region',
      startedAt: clock(8),
      completedAt: clock(9),
    })

    expect(result).toMatchObject({ status: 'rejected', reason: 'resource-geography-mismatch' })
    expect(result.resource).toEqual(resource)
    expect(result.node).toEqual(wrongRegionNode)
  })

  it('requires an exact governed access ref for site-resolution evidence', () => {
    const siteResource = createResourceSimulationState({
      resourceStateId: 'resource-state:site',
      worldInstanceId,
      worldBaselineVersion: 'world-baseline:test-v1',
      allocationPolicyId: 'allocation-policy:test-v1',
      sourceEvidence: governedForestEvidence({
        geography: {
          resolution: 'Site',
          countryId,
          administrativeRegionId,
          localityId,
          siteRef: 'resource-site:test-alpha:forest-1',
        },
      }),
      initialSimulationUnits: 4,
    })
    const node = createProductiveNode({
      nodeId: 'node:forestry:site',
      kind: 'Forestry',
      location,
      inventoryCapacityUnits: 20,
      productionCapacityUnits: 1,
    })

    expect(settleResourceExtraction({
      resource: siteResource,
      node,
      process: rawTimberExtraction(),
      extractionId: 'extraction:site:wrong-access',
      startedAt: clock(8),
      completedAt: clock(9),
      resourceAccessRef: 'resource-site:test-alpha:other',
    })).toMatchObject({ status: 'rejected', reason: 'resource-site-access-mismatch' })
  })

  it('proves resource -> extraction -> inventory -> logistics job -> custody -> production -> locality-scoped completion evidence', () => {
    let resource = createResourceSimulationState({
      resourceStateId: 'resource-state:end-to-end',
      worldInstanceId,
      worldBaselineVersion: 'world-baseline:test-v1',
      allocationPolicyId: 'allocation-policy:test-v1',
      sourceEvidence: governedForestEvidence(),
      initialSimulationUnits: 8,
    })
    let forestry = createProductiveNode({
      nodeId: 'node:forestry:end-to-end',
      kind: 'Forestry',
      location,
      inventoryCapacityUnits: 20,
      productionCapacityUnits: 1,
    })
    let paperMill = createProductiveNode({
      nodeId: 'node:paper-mill:end-to-end',
      kind: 'PaperMill',
      location,
      inventoryCapacityUnits: 20,
      productionCapacityUnits: 1,
    })

    const extracted = settleResourceExtraction({
      resource,
      node: forestry,
      process: rawTimberExtraction(),
      extractionId: 'extraction:end-to-end:1',
      startedAt: clock(8),
      completedAt: clock(9),
    })
    expect(extracted.status).toBe('applied')
    if (extracted.status !== 'applied') return
    resource = extracted.resource
    forestry = extracted.node

    expect(resource.availableSimulationUnits).toBe(4)
    expect(inventoryQuantity(forestry.inventory, PRODUCT_CATALOG.rawTimber.productId)).toBe(4)
    expect(extracted.receipt.resourceEvidenceId).toBe(governedForestEvidence().evidenceId)

    const duplicateExtraction = settleResourceExtraction({
      resource,
      node: forestry,
      process: rawTimberExtraction(),
      extractionId: 'extraction:end-to-end:1',
      startedAt: clock(8),
      completedAt: clock(9),
    })
    expect(duplicateExtraction.status).toBe('duplicate')
    expect(duplicateExtraction.resource.availableSimulationUnits).toBe(4)
    expect(inventoryQuantity(duplicateExtraction.node.inventory, PRODUCT_CATALOG.rawTimber.productId)).toBe(4)

    const supply = deriveSupplyOffer({
      supplyId: 'supply:end-to-end:raw-timber',
      sourceNodeId: forestry.nodeId,
      location: forestry.location,
      inventory: forestry.inventory,
      productId: PRODUCT_CATALOG.rawTimber.productId,
    })
    const demand = deriveInventoryDemand({
      demandId: 'demand:end-to-end:paper-mill-timber',
      destinationNodeId: paperMill.nodeId,
      location: paperMill.location,
      inventory: paperMill.inventory,
      productId: PRODUCT_CATALOG.rawTimber.productId,
      targetStockUnits: 4,
    })
    const [opportunity] = deriveLogisticsOpportunities([supply], [demand], 4)
    expect(opportunity?.quantity).toBe(4)

    const materialized = materializeProducerSystemicMission({
      missionId: 'mission:end-to-end:raw-timber-transfer',
      contractId: 'contract:end-to-end:raw-timber-transfer',
      cargoId: 'cargo:end-to-end:raw-timber-transfer',
      opportunity,
      sourceInventory: forestry.inventory,
      destinationInventory: paperMill.inventory,
      producerActorId: 'actor:test-forestry-producer',
      recipientActorId: 'actor:test-paper-mill',
      logisticsPayerActorId: 'actor:test-paper-mill',
      logisticsProviderActorId: 'actor:test-carrier',
      transportCapacityUnits: 4,
    })
    expect(materialized.status).toBe('applied')
    if (materialized.status === 'rejected') return
    expect(materialized.missionDefinition.source).toEqual({ kind: 'Systemic', causeRef: opportunity.opportunityId })

    const picked = pickupProducerCargo(materialized.contract, materialized.sourceInventory)
    expect(picked.status).toBe('applied')
    if (picked.status !== 'applied' || !picked.sourceInventory) return
    forestry = { ...forestry, inventory: picked.sourceInventory }
    expect(inventoryQuantity(forestry.inventory, PRODUCT_CATALOG.rawTimber.productId)).toBe(0)

    const delivered = deliverProducerCargo(picked.contract, materialized.destinationInventory)
    expect(delivered.status).toBe('applied')
    if (delivered.status !== 'applied' || !delivered.destinationInventory) return
    paperMill = { ...paperMill, inventory: delivered.destinationInventory }
    expect(delivered.contract.settlementIntents).toEqual([
      expect.objectContaining({ monetarySettlement: 'ExternalLedgerRequired' }),
    ])
    expect(inventoryQuantity(paperMill.inventory, PRODUCT_CATALOG.rawTimber.productId)).toBe(4)

    const produced = settleProductionCycle(
      paperMill,
      TIMBER_TO_PULP_RECIPE,
      'cycle:end-to-end:pulp',
      clock(10),
      clock(11),
    )
    expect(produced.status).toBe('applied')
    if (produced.status !== 'applied') return
    paperMill = produced.node

    expect(inventoryQuantity(paperMill.inventory, PRODUCT_CATALOG.rawTimber.productId)).toBe(0)
    expect(inventoryQuantity(paperMill.inventory, PRODUCT_CATALOG.woodPulp.productId)).toBe(3)
    expect(paperMill.completedCycleIds).toContain('cycle:end-to-end:pulp')
    expect(paperMill.location.localityId).toBe(localityId)
  })
})
