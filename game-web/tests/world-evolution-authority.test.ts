import { describe, expect, it } from 'vitest'
import {
  createProductiveNode,
  settleProductionCycle,
  TIMBER_TO_PULP_RECIPE,
} from '../src/production/production'
import { PRODUCT_CATALOG } from '../src/production/productCatalog'
import {
  advanceWorldClock,
  createInitialWorldClockState,
} from '../src/systems/worldClockSystem'
import {
  applySettlementEvolutionEvidence,
  captureSettlementDevelopmentState,
  createSettlementDevelopmentState,
  deriveProductionSettlementEvidence,
  evaluateSettlementDevelopment,
  restoreSettlementDevelopmentState,
  summarizeWorldEvolutionTicks,
  type SettlementDevelopmentSnapshot,
} from '../src/systems/worldEvolutionSystem'

const WORLD_ID = 'world-evolution-test'
const LOCALITY_ID = 'locality:test:001'

const productiveNode = (specialistIndex = 1, infrastructureIndex = 1) => createProductiveNode({
  nodeId: 'node:test-paper-mill',
  kind: 'PaperMill',
  location: {
    worldInstanceId: WORLD_ID,
    countryId: 'country:test',
    administrativeRegionId: 'region:test',
    localityId: LOCALITY_ID,
  },
  inventoryCapacityUnits: 100,
  initialInventory: [{ productId: PRODUCT_CATALOG.rawTimber.productId, quantity: 12 }],
  productionCapacityUnits: 2,
  specialistIndex,
  infrastructureIndex,
})

const completedProduction = (specialistIndex = 1, infrastructureIndex = 1) => {
  const startedAt = createInitialWorldClockState(WORLD_ID)
  const completedAt = advanceWorldClock(startedAt, 60).clock
  const result = settleProductionCycle(
    productiveNode(specialistIndex, infrastructureIndex),
    TIMBER_TO_PULP_RECIPE,
    'cycle:test:001',
    startedAt,
    completedAt,
  )
  if (result.status !== 'applied') throw new Error(`Production proof failed: ${result.status}`)
  return { node: result.node, completedAt }
}

const structuralAdvanceFrom = (completedAt: ReturnType<typeof createInitialWorldClockState>) =>
  advanceWorldClock({
    ...completedAt,
    season: 'Winter',
    dayOfSeason: 28,
    hour: 23,
    minute: 0,
  }, 60)

const evolvedSnapshot = (): SettlementDevelopmentSnapshot => {
  const { node, completedAt } = completedProduction()
  const receipts = deriveProductionSettlementEvidence(node, 'cycle:test:001', completedAt)
  const initial = createSettlementDevelopmentState({ worldInstanceId: WORLD_ID, localityId: LOCALITY_ID })
  const withEvidence = applySettlementEvolutionEvidence(initial, receipts).state
  const evolved = evaluateSettlementDevelopment(withEvidence, structuralAdvanceFrom(completedAt)).state
  return captureSettlementDevelopmentState(evolved)
}

const corrupt = (snapshot: SettlementDevelopmentSnapshot): any =>
  JSON.parse(JSON.stringify(snapshot))

describe('DT-18 authoritative world time and settlement evolution', () => {
  it('maps the existing authoritative clock boundaries into deterministic tick classes', () => {
    const start = {
      ...createInitialWorldClockState(WORLD_ID),
      dayOfSeason: 7,
      hour: 23,
      minute: 0,
    }
    const once = advanceWorldClock(start, 120)
    let stepped = start
    for (let minute = 0; minute < 120; minute += 1) stepped = advanceWorldClock(stepped, 1).clock

    expect(stepped).toEqual(once.clock)
    expect(summarizeWorldEvolutionTicks(once)).toEqual({
      HOUR: 2,
      WORK_SHIFT: 0,
      OPERATING_DAY: 1,
      MARKET_CYCLE: 1,
      SEASON: 0,
      STRUCTURAL_YEAR: 0,
    })
  })

  it('derives settlement evidence only from an actually completed locality-scoped production cycle', () => {
    const { node, completedAt } = completedProduction()
    const receipts = deriveProductionSettlementEvidence(node, 'cycle:test:001', completedAt)

    expect(receipts.map(receipt => receipt.code)).toEqual([
      'LOCAL_PRODUCTION_CYCLE_COMPLETED',
      'PRODUCTION_MODEL_INFRASTRUCTURE_INDEX_POSITIVE',
      'PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE',
    ])
    expect(new Set(receipts.map(receipt => receipt.evidenceId)).size).toBe(3)
    expect(receipts.every(receipt => receipt.localityId === LOCALITY_ID)).toBe(true)
    expect(deriveProductionSettlementEvidence(node, 'cycle:not-completed', completedAt)).toEqual([])
  })

  it('keeps production tuning indexes explicitly separated from DT-06 and DT-20 capability authority', () => {
    const { node, completedAt } = completedProduction(5, 7)
    const receipts = deriveProductionSettlementEvidence(node, 'cycle:test:001', completedAt)

    expect(receipts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'LOCAL_PRODUCTION_CYCLE_COMPLETED',
        evidenceClass: 'AUTHORITATIVE_PRODUCTION_FACT',
        sourceDomain: 'DT-07_PRODUCTION',
      }),
      expect.objectContaining({
        code: 'PRODUCTION_MODEL_INFRASTRUCTURE_INDEX_POSITIVE',
        evidenceClass: 'PRODUCTION_MODEL_PROXY',
        sourceDomain: 'DT-07_PRODUCTION',
      }),
      expect.objectContaining({
        code: 'PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE',
        evidenceClass: 'PRODUCTION_MODEL_PROXY',
        sourceDomain: 'DT-07_PRODUCTION',
      }),
    ]))
    expect(receipts.map(receipt => receipt.code)).not.toContain('INFRASTRUCTURE_CAPACITY_PRESENT')
    expect(receipts.map(receipt => receipt.code)).not.toContain('SPECIALIST_CAPACITY_PRESENT')
  })

  it('records economic evidence exactly once and rejects inconsistent or cross-locality replay', () => {
    const { node, completedAt } = completedProduction()
    const receipts = deriveProductionSettlementEvidence(node, 'cycle:test:001', completedAt)
    const initial = createSettlementDevelopmentState({ worldInstanceId: WORLD_ID, localityId: LOCALITY_ID })

    const applied = applySettlementEvolutionEvidence(initial, receipts)
    expect(applied.status).toBe('applied')
    expect(applied.state.evidenceReceipts).toHaveLength(3)
    expect(applySettlementEvolutionEvidence(applied.state, receipts).status).toBe('duplicate')

    const inconsistent = [{ ...receipts[0], sourceRef: 'production-cycle:tampered' }]
    expect(applySettlementEvolutionEvidence(applied.state, inconsistent)).toMatchObject({
      status: 'rejected', reason: 'inconsistent-settlement-evidence',
    })

    const foreign = receipts.map(receipt => ({ ...receipt, localityId: 'locality:foreign' }))
    expect(applySettlementEvolutionEvidence(applied.state, foreign)).toMatchObject({
      status: 'rejected', reason: 'settlement-evidence-scope-mismatch',
    })
  })

  it('does not evolve a locality from FPS or ordinary clock passage without a structural tick', () => {
    const { node, completedAt } = completedProduction()
    const receipts = deriveProductionSettlementEvidence(node, 'cycle:test:001', completedAt)
    const initial = createSettlementDevelopmentState({ worldInstanceId: WORLD_ID, localityId: LOCALITY_ID })
    const withEvidence = applySettlementEvolutionEvidence(initial, receipts).state
    const ordinaryAdvance = advanceWorldClock(completedAt, 24 * 60)

    const evaluated = evaluateSettlementDevelopment(withEvidence, ordinaryAdvance)
    expect(evaluated).toMatchObject({ status: 'unchanged', reason: 'no-structural-tick' })
    expect(evaluated.state.tier).toBe('LATENT')
  })

  it('proves one completed production cycle plus explicit model proxies can establish the first baseline consequence', () => {
    const { node, completedAt } = completedProduction()
    const receipts = deriveProductionSettlementEvidence(node, 'cycle:test:001', completedAt)
    const initial = createSettlementDevelopmentState({ worldInstanceId: WORLD_ID, localityId: LOCALITY_ID })
    const withEvidence = applySettlementEvolutionEvidence(initial, receipts).state
    const structuralAdvance = structuralAdvanceFrom(completedAt)
    expect(summarizeWorldEvolutionTicks(structuralAdvance).STRUCTURAL_YEAR).toBe(1)

    const evaluated = evaluateSettlementDevelopment(withEvidence, structuralAdvance)
    expect(evaluated.status).toBe('advanced')
    expect(evaluated.state.tier).toBe('RURAL_POINT')
    if (evaluated.status !== 'advanced') throw new Error('Expected settlement transition')
    expect(evaluated.transition.reasonCode).toBe('PRODUCTION_MODEL_BASELINE_ESTABLISHED')
    expect(evaluated.transition.evidenceCodes).toEqual([
      'LOCAL_PRODUCTION_CYCLE_COMPLETED',
      'PRODUCTION_MODEL_INFRASTRUCTURE_INDEX_POSITIVE',
      'PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE',
    ])

    const replay = evaluateSettlementDevelopment(evaluated.state, structuralAdvance)
    expect(replay).toMatchObject({ status: 'duplicate', reason: 'structural-tick-already-processed' })
    expect(replay.state.transitionReceipts).toHaveLength(1)
  })

  it('does not treat a missing production-model specialist proxy as a real specialist fact', () => {
    const { node, completedAt } = completedProduction(0, 1)
    const receipts = deriveProductionSettlementEvidence(node, 'cycle:test:001', completedAt)
    expect(receipts.map(receipt => receipt.code)).not.toContain('PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE')

    const initial = createSettlementDevelopmentState({ worldInstanceId: WORLD_ID, localityId: LOCALITY_ID })
    const withEvidence = applySettlementEvolutionEvidence(initial, receipts).state
    const evaluated = evaluateSettlementDevelopment(withEvidence, structuralAdvanceFrom(completedAt))

    expect(evaluated).toMatchObject({ status: 'unchanged', reason: 'insufficient-causal-evidence' })
    expect(evaluated.state.tier).toBe('LATENT')
  })

  it('round-trips evolution state for the persistence owner without activating a Save writer', () => {
    const snapshot = evolvedSnapshot()

    expect(restoreSettlementDevelopmentState(snapshot, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'restored', state: snapshot })

    expect(restoreSettlementDevelopmentState(snapshot, {
      worldInstanceId: 'world:other',
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'settlement-state-scope-mismatch' })
  })

  it('fails closed when a transition references missing or code-inconsistent evidence', () => {
    const snapshot = evolvedSnapshot()

    const missingEvidence = corrupt(snapshot)
    missingEvidence.evidenceReceipts = missingEvidence.evidenceReceipts.slice(1)
    expect(restoreSettlementDevelopmentState(missingEvidence, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'missing-settlement-state-evidence-reference' })

    const inconsistentCodes = corrupt(snapshot)
    inconsistentCodes.transitionReceipts[0].evidenceIds = inconsistentCodes.transitionReceipts[0].evidenceIds.slice(0, 2)
    expect(restoreSettlementDevelopmentState(inconsistentCodes, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'inconsistent-settlement-state-evidence-code-reference' })
  })

  it('fails closed when structural tick references are absent, malformed, or duplicated', () => {
    const snapshot = evolvedSnapshot()

    const absentTick = corrupt(snapshot)
    absentTick.processedStructuralTickIds = []
    expect(restoreSettlementDevelopmentState(absentTick, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'invalid-settlement-state-structural-tick-reference' })

    const malformedTick = corrupt(snapshot)
    malformedTick.processedStructuralTickIds[0] = `world-structural-year:${WORLD_ID}:01`
    malformedTick.transitionReceipts[0].structuralTickId = malformedTick.processedStructuralTickIds[0]
    expect(restoreSettlementDevelopmentState(malformedTick, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'invalid-settlement-state-receipt' })

    const duplicateTickTransition = corrupt(snapshot)
    duplicateTickTransition.transitionReceipts.push({
      ...duplicateTickTransition.transitionReceipts[0],
      transitionId: `${duplicateTickTransition.transitionReceipts[0].transitionId}:duplicate`,
    })
    expect(restoreSettlementDevelopmentState(duplicateTickTransition, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'duplicate-settlement-state-transition-tick' })
  })

  it('fails closed on illegal v1 transition/reason semantics and inconsistent tier history', () => {
    const snapshot = evolvedSnapshot()

    const illegalTransition = corrupt(snapshot)
    illegalTransition.transitionReceipts[0].fromTier = 'RURAL_POINT'
    expect(restoreSettlementDevelopmentState(illegalTransition, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'illegal-settlement-state-transition' })

    const invalidReason = corrupt(snapshot)
    invalidReason.transitionReceipts[0].reasonCode = 'PLAYER_LEVEL_GREW_CITY'
    expect(restoreSettlementDevelopmentState(invalidReason, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'invalid-settlement-state-receipt' })

    const inconsistentTier = corrupt(snapshot)
    inconsistentTier.tier = 'LATENT'
    expect(restoreSettlementDevelopmentState(inconsistentTier, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'inconsistent-settlement-state-tier-history' })
  })

  it('fails closed on duplicate and semantically inconsistent evidence receipts', () => {
    const snapshot = evolvedSnapshot()

    const duplicateId = corrupt(snapshot)
    duplicateId.evidenceReceipts.push({ ...duplicateId.evidenceReceipts[0] })
    expect(restoreSettlementDevelopmentState(duplicateId, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'duplicate-settlement-state-receipt' })

    const duplicateSemanticFact = corrupt(snapshot)
    const original = duplicateSemanticFact.evidenceReceipts[0]
    duplicateSemanticFact.evidenceReceipts.push({
      ...original,
      evidenceId: `settlement-evidence:${WORLD_ID}:${LOCALITY_ID}:duplicate:cycle:${original.code}`,
    })
    expect(restoreSettlementDevelopmentState(duplicateSemanticFact, {
      worldInstanceId: WORLD_ID,
      localityId: LOCALITY_ID,
    })).toEqual({ status: 'rejected', reason: 'inconsistent-settlement-state-evidence' })
  })
})
