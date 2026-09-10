import { describe, expect, it } from 'vitest'
import {
  PLAYABLE_LOCALITY_INSTANCE_CONTRACT_VERSION,
  assessPlayableLocalityReuse,
  derivePlayableLocalityInstanceId,
  materializePlayableLocalityInstance,
  type GovernedLocalityIdentity,
  type LocalityReadinessState,
  type LocalityReleaseVerification,
  type PlayableLocalityMaterializationRequest,
  type ReleaseVerifiedContentBasis,
} from '../src/world/playableLocalityInstance'

const SOURCE_CHECKPOINT = 'source-geonames-cities500-2026-09-08-f3cda4f9'

const braila: GovernedLocalityIdentity = {
  localityId: 'dropi:locality:geonames:683902',
  countryId: '642',
  regionSourceRef: 'geonames:683901',
  sourceRef: 'geonames:683902',
  sourceCatalog: 'game-web/public/data/europe-romania-regional-localities-v1.json',
  sourceCheckpoint: SOURCE_CHECKPOINT,
  latitude: 45.27152,
  longitude: 27.97429,
}

const reykjavik: GovernedLocalityIdentity = {
  localityId: 'dropi:locality:geonames:3413829',
  countryId: '352',
  regionSourceRef: 'geonames:3426182',
  sourceRef: 'geonames:3413829',
  sourceCatalog: 'game-web/public/data/europe-iceland-regional-localities-v1.json',
  sourceCheckpoint: SOURCE_CHECKPOINT,
  latitude: 64.13548,
  longitude: -21.89541,
}

// Explicitly synthetic: this fixture is not a real launch-locality readiness claim.
const syntheticReleaseFixture: GovernedLocalityIdentity = {
  localityId: 'dropi:locality:test:release-fixture',
  countryId: 'test-country',
  regionSourceRef: 'test:region:release-fixture',
  sourceRef: 'test:locality:release-fixture',
  sourceCatalog: 'test:synthetic-locality-catalog',
  sourceCheckpoint: 'test:synthetic-checkpoint-v1',
  latitude: 0,
  longitude: 0,
}

const releaseVerificationFor = (
  contentBasis: ReleaseVerifiedContentBasis,
  suffix = 'v1',
): LocalityReleaseVerification => ({
  contentBasis,
  evidenceRefs: [
    {
      authorityRef: 'test:owning-authority:release-artifact',
      evidenceRef: `test:evidence:artifact:${suffix}`,
      evidenceVersion: suffix,
    },
    {
      authorityRef: 'test:owning-authority:legal-clearance',
      evidenceRef: `test:evidence:legal:${suffix}`,
      evidenceVersion: suffix,
    },
  ],
})

const requestFor = (
  locality: GovernedLocalityIdentity,
  readiness: LocalityReadinessState = 'PLAYABLE_CONTRACT_READY',
  worldInstanceId = 'wi_dt11_contract',
): PlayableLocalityMaterializationRequest => ({
  worldInstanceId,
  locality,
  readiness,
  runtimeContract: {
    contractRef: `test:playable-runtime:${locality.localityId}`,
    contractVersion: 'test-runtime-v1',
  },
  settlementDevelopment: {
    authorityRef: `test:dt18-settlement:${locality.localityId}`,
    localityId: locality.localityId,
  },
})

const releaseRequestFor = (
  contentBasis: ReleaseVerifiedContentBasis,
  suffix = 'v1',
): PlayableLocalityMaterializationRequest => ({
  ...requestFor(syntheticReleaseFixture, 'RELEASE_VERIFIED', 'wi_release_fixture'),
  releaseVerification: releaseVerificationFor(contentBasis, suffix),
})

describe('DT-11 Catalog -> PlayableLocalityInstance contract #643', () => {
  it.each(['CATALOGED', 'SOURCE_READY'] as const)(
    'does not materialize a %s locality merely because catalog identity exists',
    readiness => {
      const result = materializePlayableLocalityInstance(requestFor(braila, readiness))
      expect(result).toEqual({ ok: false, reason: 'not-playable-contract-ready' })
    },
  )

  it.each(['PLAYABLE_CONTRACT_READY', 'STANDARD_PLAYABLE', 'PREMIUM_BESPOKE'] as const)(
    'materializes %s readiness without importing settlement maturity',
    readiness => {
      const result = materializePlayableLocalityInstance(requestFor(braila, readiness))
      expect(result.ok).toBe(true)
      if (result.ok === false) throw new Error(`Expected materialization: ${result.reason}`)
      expect(result.instance.readinessAtMaterialization).toBe(readiness)
      expect(result.instance).not.toHaveProperty('settlementTier')
      expect(result.instance).not.toHaveProperty('settlementState')
      expect(result.instance).not.toHaveProperty('citySize')
      expect(result.instance).not.toHaveProperty('releaseVerification')
    },
  )

  it.each(['STANDARD_PLAYABLE', 'PREMIUM_BESPOKE'] as const)(
    'allows RELEASE_VERIFIED from %s basis when opaque owning-authority evidence is supplied',
    contentBasis => {
      const result = materializePlayableLocalityInstance(releaseRequestFor(contentBasis))
      expect(result.ok).toBe(true)
      if (result.ok === false) throw new Error(`Expected release materialization: ${result.reason}`)
      expect(result.instance.readinessAtMaterialization).toBe('RELEASE_VERIFIED')
      expect(result.instance.releaseVerification?.contentBasis).toBe(contentBasis)
      expect(result.instance.releaseVerification?.evidenceRefs).toHaveLength(2)
      expect(result.instance).not.toHaveProperty('settlementTier')
      expect(JSON.stringify(result.instance)).not.toContain('ANDROID_VERIFIED')
      expect(JSON.stringify(result.instance)).not.toContain('commercialCleared')
    },
  )

  it('fails closed when RELEASE_VERIFIED has no owning-authority evidence references', () => {
    const request = requestFor(syntheticReleaseFixture, 'RELEASE_VERIFIED', 'wi_release_fixture')
    expect(materializePlayableLocalityInstance(request)).toEqual({
      ok: false,
      reason: 'missing-release-verification',
    })
  })

  it('rejects malformed or duplicate RELEASE_VERIFIED evidence', () => {
    const request = releaseRequestFor('STANDARD_PLAYABLE')
    const duplicate = request.releaseVerification?.evidenceRefs[0]
    if (!request.releaseVerification || !duplicate) throw new Error('Expected test release evidence')
    request.releaseVerification.evidenceRefs = [duplicate, { ...duplicate }]

    expect(materializePlayableLocalityInstance(request)).toEqual({
      ok: false,
      reason: 'invalid-release-verification',
    })
  })

  it('rejects release evidence attached to a non-release readiness state', () => {
    const request = requestFor(braila, 'STANDARD_PLAYABLE')
    request.releaseVerification = releaseVerificationFor('STANDARD_PLAYABLE')
    expect(materializePlayableLocalityInstance(request)).toEqual({
      ok: false,
      reason: 'unexpected-release-verification',
    })
  })

  it('materializes a ready locality deterministically without copying settlement maturity', () => {
    const first = materializePlayableLocalityInstance(requestFor(braila))
    const replay = materializePlayableLocalityInstance(requestFor(braila))

    expect(first.ok).toBe(true)
    expect(replay).toEqual(first)
    if (first.ok === false) throw new Error(`Expected materialization: ${first.reason}`)

    expect(first.instance.version).toBe(PLAYABLE_LOCALITY_INSTANCE_CONTRACT_VERSION)
    expect(first.instance.instanceId).toBe(
      derivePlayableLocalityInstanceId('wi_dt11_contract', braila.localityId),
    )
    expect(first.instance.locality).toEqual(braila)
    expect(first.instance.settlementDevelopment).toEqual({
      authorityRef: `test:dt18-settlement:${braila.localityId}`,
      localityId: braila.localityId,
    })
  })

  it('uses the same contract for a non-Brăila standard locality without any Brăila fallback', () => {
    const result = materializePlayableLocalityInstance(
      requestFor(reykjavik, 'STANDARD_PLAYABLE', 'wi_iceland_contract'),
    )

    expect(result.ok).toBe(true)
    if (result.ok === false) throw new Error(`Expected materialization: ${result.reason}`)
    expect(result.instance.locality.localityId).toBe(reykjavik.localityId)
    expect(result.instance.locality.countryId).toBe('352')
    expect(result.instance.readinessAtMaterialization).toBe('STANDARD_PLAYABLE')
    expect(result.instance.instanceId).not.toContain('683902')
    expect(JSON.stringify(result.instance)).not.toContain('braila')
    expect(JSON.stringify(result.instance)).not.toContain('Brăila')
  })

  it('keeps Brăila premium status as content quality rather than settlement authority', () => {
    const result = materializePlayableLocalityInstance(requestFor(braila, 'PREMIUM_BESPOKE'))
    expect(result.ok).toBe(true)
    if (result.ok === false) throw new Error(`Expected materialization: ${result.reason}`)
    expect(result.instance.readinessAtMaterialization).toBe('PREMIUM_BESPOKE')
    expect(result.instance.locality.localityId).toBe(braila.localityId)
    expect(result.instance).not.toHaveProperty('settlementTier')
  })

  it('requires the settlement-development authority to bind the exact stable locality', () => {
    const request = requestFor(reykjavik)
    request.settlementDevelopment = {
      ...request.settlementDevelopment,
      localityId: braila.localityId,
    }

    expect(materializePlayableLocalityInstance(request)).toEqual({
      ok: false,
      reason: 'settlement-locality-mismatch',
    })
  })

  it('fails closed when playable readiness has no runtime contract', () => {
    const request = requestFor(braila)
    delete request.runtimeContract

    expect(materializePlayableLocalityInstance(request)).toEqual({
      ok: false,
      reason: 'invalid-runtime-contract',
    })
  })

  it('rejects invalid or ungoverned locality identity instead of inventing geography', () => {
    const invalid = {
      ...braila,
      localityId: 'braila',
      latitude: 145,
      sourceRef: '',
    }

    expect(materializePlayableLocalityInstance(requestFor(invalid))).toEqual({
      ok: false,
      reason: 'invalid-locality-identity',
    })
  })

  it('keeps instance identity stable across source checkpoint update but requires reconciliation', () => {
    const first = materializePlayableLocalityInstance(requestFor(braila))
    expect(first.ok).toBe(true)
    if (first.ok === false) throw new Error(`Expected materialization: ${first.reason}`)

    const updatedLocality = {
      ...braila,
      sourceCheckpoint: 'test:reviewed-future-source-checkpoint',
    }
    const next = materializePlayableLocalityInstance(requestFor(updatedLocality))
    expect(next.ok).toBe(true)
    if (next.ok === false) throw new Error(`Expected materialization: ${next.reason}`)

    expect(next.instance.instanceId).toBe(first.instance.instanceId)
    expect(next.instance.materializationKey).not.toBe(first.instance.materializationKey)
    expect(assessPlayableLocalityReuse(first.instance, requestFor(updatedLocality))).toEqual({
      reusable: false,
      reason: 'stale-source-checkpoint',
    })
  })

  it('rejects source relabeling under an existing locality ID', () => {
    const first = materializePlayableLocalityInstance(requestFor(braila))
    expect(first.ok).toBe(true)
    if (first.ok === false) throw new Error(`Expected materialization: ${first.reason}`)

    const relabeled = {
      ...braila,
      countryId: '352',
      sourceRef: 'geonames:3413829',
      latitude: reykjavik.latitude,
      longitude: reykjavik.longitude,
    }
    expect(assessPlayableLocalityReuse(first.instance, requestFor(relabeled))).toEqual({
      reusable: false,
      reason: 'stale-source-identity',
    })
  })

  it('rejects stale runtime contract instead of silently changing playable semantics', () => {
    const firstRequest = requestFor(braila)
    const first = materializePlayableLocalityInstance(firstRequest)
    expect(first.ok).toBe(true)
    if (first.ok === false) throw new Error(`Expected materialization: ${first.reason}`)

    const changed = requestFor(braila)
    changed.runtimeContract = {
      contractRef: changed.runtimeContract?.contractRef ?? '',
      contractVersion: 'test-runtime-v2',
    }

    expect(assessPlayableLocalityReuse(first.instance, changed)).toEqual({
      reusable: false,
      reason: 'stale-runtime-contract',
    })
  })

  it('keeps instance identity stable but rejects reuse across readiness promotion', () => {
    const standardRequest = requestFor(syntheticReleaseFixture, 'STANDARD_PLAYABLE', 'wi_release_fixture')
    const standard = materializePlayableLocalityInstance(standardRequest)
    const verified = materializePlayableLocalityInstance(releaseRequestFor('STANDARD_PLAYABLE'))
    expect(standard.ok).toBe(true)
    expect(verified.ok).toBe(true)
    if (standard.ok === false || verified.ok === false) throw new Error('Expected materializations')

    expect(verified.instance.instanceId).toBe(standard.instance.instanceId)
    expect(verified.instance.materializationKey).not.toBe(standard.instance.materializationKey)
    expect(assessPlayableLocalityReuse(standard.instance, releaseRequestFor('STANDARD_PLAYABLE'))).toEqual({
      reusable: false,
      reason: 'stale-readiness',
    })
  })

  it('rejects changed owning-authority release evidence without changing locality identity', () => {
    const first = materializePlayableLocalityInstance(releaseRequestFor('PREMIUM_BESPOKE', 'v1'))
    const changedRequest = releaseRequestFor('PREMIUM_BESPOKE', 'v2')
    expect(first.ok).toBe(true)
    if (first.ok === false) throw new Error(`Expected materialization: ${first.reason}`)

    expect(assessPlayableLocalityReuse(first.instance, changedRequest)).toEqual({
      reusable: false,
      reason: 'stale-release-evidence',
    })
  })

  it('rejects cross-world reuse while preserving locality identity semantics', () => {
    const first = materializePlayableLocalityInstance(requestFor(braila, 'PREMIUM_BESPOKE'))
    expect(first.ok).toBe(true)
    if (first.ok === false) throw new Error(`Expected materialization: ${first.reason}`)

    expect(
      assessPlayableLocalityReuse(
        first.instance,
        requestFor(braila, 'PREMIUM_BESPOKE', 'wi_another_world'),
      ),
    ).toEqual({ reusable: false, reason: 'different-world-instance' })
  })

  it('returns same validated instance for exact release-verified replay', () => {
    const request = releaseRequestFor('STANDARD_PLAYABLE')
    const first = materializePlayableLocalityInstance(request)
    expect(first.ok).toBe(true)
    if (first.ok === false) throw new Error(`Expected materialization: ${first.reason}`)

    const reuse = assessPlayableLocalityReuse(first.instance, request)
    expect(reuse).toEqual({ reusable: true, instance: first.instance })
  })
})
