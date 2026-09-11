import { describe, expect, it } from 'vitest'
import { createMissionRuntimeState } from '../src/missions/missionEngine'
import {
  materializeDeliveryWorkForPlayableLocality,
} from '../src/missions/playableLocalityDeliveryMaterialization'
import { createCitywideEconomicEndpointAuthority } from '../src/trade/citywideEconomicEndpoints'
import {
  materializePlayableLocalityInstance,
  type PlayableLocalityInstance,
} from '../src/world/playableLocalityInstance'

const WORLD_ID = 'world:dt09:playable-locality:test'
const LOCALITY_ID = 'dropi:locality:test:portable'
const CHECKPOINT = 'checkpoint:dt09:playable-locality:v1'

const playableLocality = (): PlayableLocalityInstance => {
  const materialized = materializePlayableLocalityInstance({
    worldInstanceId: WORLD_ID,
    locality: {
      localityId: LOCALITY_ID,
      countryId: 'country:test',
      regionSourceRef: 'region:test:portable',
      sourceRef: 'source:test:portable',
      sourceCatalog: 'catalog:test:portable',
      sourceCheckpoint: CHECKPOINT,
      latitude: 0,
      longitude: 0,
    },
    readiness: 'PLAYABLE_CONTRACT_READY',
    runtimeContract: {
      contractRef: 'runtime-contract:test:portable',
      contractVersion: '1',
    },
    settlementDevelopment: {
      authorityRef: 'settlement-development:test:portable',
      localityId: LOCALITY_ID,
    },
  })
  if (!materialized.ok) throw new Error(`fixture failed:${materialized.reason}`)
  return materialized.instance
}

const distributionAuthority = {
  hasOrder: (_orderId: string) => false,
  resolveDeliveryMission: (_deliveryMissionId: string) => undefined,
  classifyRoute: () => undefined,
  isWorkActivityEligible: () => false,
}

const missionFacts = { worldMinute: 0 }

describe('DT-09 canonical PlayableLocalityInstance boundary', () => {
  it('derives locality/world identity from canonical DT-11 authority without fabricating work', () => {
    const instance = playableLocality()
    const result = materializeDeliveryWorkForPlayableLocality({
      playableLocality: instance,
      endpointAuthority: createCitywideEconomicEndpointAuthority({
        localityId: instance.locality.localityId,
        sourceCheckpoint: instance.locality.sourceCheckpoint,
        endpoints: [],
      }),
      candidates: [],
      distributionAuthority,
      missionDefinitions: [],
      missionState: createMissionRuntimeState([], missionFacts),
      missionFacts,
    })

    expect(result).toEqual({
      status: 'unavailable',
      reason: 'no-local-opportunities',
      candidateEvaluations: [],
      citywideEvaluations: [],
    })
  })

  it('fails closed when endpoint checkpoint disagrees with the canonical locality snapshot', () => {
    const instance = playableLocality()
    const result = materializeDeliveryWorkForPlayableLocality({
      playableLocality: instance,
      endpointAuthority: createCitywideEconomicEndpointAuthority({
        localityId: instance.locality.localityId,
        sourceCheckpoint: 'checkpoint:foreign',
        endpoints: [],
      }),
      candidates: [],
      distributionAuthority,
      missionDefinitions: [],
      missionState: createMissionRuntimeState([], missionFacts),
      missionFacts,
    })

    expect(result.status).toBe('unavailable')
    if (result.status === 'unavailable') {
      expect(result.reason).toBe('locality-authority-mismatch')
    }
  })

  it('fails closed when a PlayableLocalityInstance identity is tampered', () => {
    const instance = playableLocality()
    const tampered = {
      ...instance,
      materializationKey: `${instance.materializationKey}:tampered`,
    } as PlayableLocalityInstance

    const result = materializeDeliveryWorkForPlayableLocality({
      playableLocality: tampered,
      endpointAuthority: createCitywideEconomicEndpointAuthority({
        localityId: instance.locality.localityId,
        sourceCheckpoint: instance.locality.sourceCheckpoint,
        endpoints: [],
      }),
      candidates: [],
      distributionAuthority,
      missionDefinitions: [],
      missionState: createMissionRuntimeState([], missionFacts),
      missionFacts,
    })

    expect(result.status).toBe('unavailable')
    if (result.status === 'unavailable') {
      expect(result.reason).toBe('invalid-runtime-context')
    }
  })
})
