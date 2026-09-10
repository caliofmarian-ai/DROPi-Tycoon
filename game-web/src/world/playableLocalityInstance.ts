export const PLAYABLE_LOCALITY_INSTANCE_CONTRACT_VERSION = '1.0.0' as const

export const LOCALITY_READINESS_STATES = [
  'CATALOGED',
  'SOURCE_READY',
  'PLAYABLE_CONTRACT_READY',
  'STANDARD_PLAYABLE',
  'PREMIUM_BESPOKE',
  'RELEASE_VERIFIED',
] as const

export type LocalityReadinessState = (typeof LOCALITY_READINESS_STATES)[number]
export type ReleaseVerifiedContentBasis = 'STANDARD_PLAYABLE' | 'PREMIUM_BESPOKE'

/** Stable, source-governed geographic identity owned by DT-11. */
export interface GovernedLocalityIdentity {
  localityId: string
  countryId: string
  regionSourceRef: string
  sourceRef: string
  sourceCatalog: string
  sourceCheckpoint: string
  latitude: number
  longitude: number
}

/** Opaque handoff to the composed playable-runtime contract. */
export interface PlayableLocalityRuntimeContractRef {
  contractRef: string
  contractVersion: string
}

/** Read-only binding to DT-18 settlement-development authority. */
export interface SettlementDevelopmentAuthorityRef {
  authorityRef: string
  localityId: string
}

/** Opaque evidence owned by another authority; DT-11 stores only the reference. */
export interface LocalityReleaseEvidenceRef {
  authorityRef: string
  evidenceRef: string
  evidenceVersion: string
}

/**
 * RELEASE_VERIFIED is locality readiness, not release-artifact ownership.
 * Premium is optional: STANDARD_PLAYABLE or PREMIUM_BESPOKE may be the verified basis.
 */
export interface LocalityReleaseVerification {
  contentBasis: ReleaseVerifiedContentBasis
  evidenceRefs: LocalityReleaseEvidenceRef[]
}

export interface PlayableLocalityMaterializationRequest {
  worldInstanceId: string
  locality: GovernedLocalityIdentity
  readiness: LocalityReadinessState
  runtimeContract?: PlayableLocalityRuntimeContractRef
  settlementDevelopment: SettlementDevelopmentAuthorityRef
  releaseVerification?: LocalityReleaseVerification
}

export interface PlayableLocalityInstance {
  version: typeof PLAYABLE_LOCALITY_INSTANCE_CONTRACT_VERSION
  instanceId: string
  materializationKey: string
  worldInstanceId: string
  locality: GovernedLocalityIdentity
  readinessAtMaterialization:
    | 'PLAYABLE_CONTRACT_READY'
    | 'STANDARD_PLAYABLE'
    | 'PREMIUM_BESPOKE'
    | 'RELEASE_VERIFIED'
  runtimeContract: PlayableLocalityRuntimeContractRef
  settlementDevelopment: SettlementDevelopmentAuthorityRef
  releaseVerification?: LocalityReleaseVerification
}

export type PlayableLocalityMaterializationFailure =
  | 'invalid-world-instance-id'
  | 'invalid-locality-identity'
  | 'invalid-readiness'
  | 'not-playable-contract-ready'
  | 'invalid-runtime-contract'
  | 'invalid-settlement-development-authority'
  | 'settlement-locality-mismatch'
  | 'missing-release-verification'
  | 'invalid-release-verification'
  | 'unexpected-release-verification'

export type PlayableLocalityMaterializationResult =
  | { ok: true; instance: PlayableLocalityInstance }
  | { ok: false; reason: PlayableLocalityMaterializationFailure }

export type PlayableLocalityReuseResult =
  | { reusable: true; instance: PlayableLocalityInstance }
  | {
      reusable: false
      reason:
        | PlayableLocalityMaterializationFailure
        | 'invalid-existing-instance'
        | 'different-world-instance'
        | 'different-locality'
        | 'stale-source-identity'
        | 'stale-source-checkpoint'
        | 'stale-runtime-contract'
        | 'stale-settlement-authority'
        | 'stale-readiness'
        | 'stale-release-evidence'
    }

const MAX_TOKEN_LENGTH = 256
const MAX_RELEASE_EVIDENCE_REFS = 64

const cleanToken = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  if (cleaned.length === 0 || cleaned.length > MAX_TOKEN_LENGTH) return null
  return cleaned
}

const isReadiness = (value: unknown): value is LocalityReadinessState =>
  typeof value === 'string' && LOCALITY_READINESS_STATES.some(state => state === value)

const isPlayableReadiness = (
  value: LocalityReadinessState,
): value is PlayableLocalityInstance['readinessAtMaterialization'] =>
  value === 'PLAYABLE_CONTRACT_READY' ||
  value === 'STANDARD_PLAYABLE' ||
  value === 'PREMIUM_BESPOKE' ||
  value === 'RELEASE_VERIFIED'

const validCoordinates = (latitude: unknown, longitude: unknown): boolean =>
  typeof latitude === 'number' &&
  Number.isFinite(latitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  typeof longitude === 'number' &&
  Number.isFinite(longitude) &&
  longitude >= -180 &&
  longitude <= 180

const isGovernedLocalityIdentity = (value: unknown): value is GovernedLocalityIdentity => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const locality = value as Record<string, unknown>
  const localityId = cleanToken(locality.localityId)
  return Boolean(
    localityId?.startsWith('dropi:locality:') &&
      cleanToken(locality.countryId) &&
      cleanToken(locality.regionSourceRef) &&
      cleanToken(locality.sourceRef) &&
      cleanToken(locality.sourceCatalog) &&
      cleanToken(locality.sourceCheckpoint) &&
      validCoordinates(locality.latitude, locality.longitude),
  )
}

const isRuntimeContract = (value: unknown): value is PlayableLocalityRuntimeContractRef => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const contract = value as Record<string, unknown>
  return Boolean(cleanToken(contract.contractRef) && cleanToken(contract.contractVersion))
}

const isSettlementDevelopmentAuthority = (
  value: unknown,
): value is SettlementDevelopmentAuthorityRef => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const authority = value as Record<string, unknown>
  return Boolean(cleanToken(authority.authorityRef) && cleanToken(authority.localityId))
}

const isReleaseEvidenceRef = (value: unknown): value is LocalityReleaseEvidenceRef => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const evidence = value as Record<string, unknown>
  return Boolean(
    cleanToken(evidence.authorityRef) &&
      cleanToken(evidence.evidenceRef) &&
      cleanToken(evidence.evidenceVersion),
  )
}

const isReleaseVerification = (value: unknown): value is LocalityReleaseVerification => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const verification = value as Record<string, unknown>
  if (
    verification.contentBasis !== 'STANDARD_PLAYABLE' &&
    verification.contentBasis !== 'PREMIUM_BESPOKE'
  ) {
    return false
  }
  if (
    !Array.isArray(verification.evidenceRefs) ||
    verification.evidenceRefs.length === 0 ||
    verification.evidenceRefs.length > MAX_RELEASE_EVIDENCE_REFS
  ) {
    return false
  }

  const seen = new Set<string>()
  for (const evidence of verification.evidenceRefs) {
    if (!isReleaseEvidenceRef(evidence)) return false
    const key = `${evidence.authorityRef.trim()}::${evidence.evidenceRef.trim()}`
    if (seen.has(key)) return false
    seen.add(key)
  }
  return true
}

const copyLocality = (locality: GovernedLocalityIdentity): GovernedLocalityIdentity => ({
  localityId: locality.localityId.trim(),
  countryId: locality.countryId.trim(),
  regionSourceRef: locality.regionSourceRef.trim(),
  sourceRef: locality.sourceRef.trim(),
  sourceCatalog: locality.sourceCatalog.trim(),
  sourceCheckpoint: locality.sourceCheckpoint.trim(),
  latitude: locality.latitude,
  longitude: locality.longitude,
})

const copyRuntimeContract = (
  runtimeContract: PlayableLocalityRuntimeContractRef,
): PlayableLocalityRuntimeContractRef => ({
  contractRef: runtimeContract.contractRef.trim(),
  contractVersion: runtimeContract.contractVersion.trim(),
})

const copySettlementAuthority = (
  settlementDevelopment: SettlementDevelopmentAuthorityRef,
): SettlementDevelopmentAuthorityRef => ({
  authorityRef: settlementDevelopment.authorityRef.trim(),
  localityId: settlementDevelopment.localityId.trim(),
})

const copyReleaseVerification = (
  releaseVerification: LocalityReleaseVerification,
): LocalityReleaseVerification => ({
  contentBasis: releaseVerification.contentBasis,
  evidenceRefs: releaseVerification.evidenceRefs.map(evidence => ({
    authorityRef: evidence.authorityRef.trim(),
    evidenceRef: evidence.evidenceRef.trim(),
    evidenceVersion: evidence.evidenceVersion.trim(),
  })),
})

const encoded = (value: string): string => encodeURIComponent(value)

const releaseVerificationToken = (
  releaseVerification: LocalityReleaseVerification | undefined,
): string => {
  if (!releaseVerification) return 'not-release-verified'
  const evidence = releaseVerification.evidenceRefs
    .map(
      item =>
        `${encoded(item.authorityRef.trim())}~${encoded(item.evidenceRef.trim())}~${encoded(
          item.evidenceVersion.trim(),
        )}`,
    )
    .sort()
    .join(',')
  return `${releaseVerification.contentBasis}:${evidence}`
}

/** Stable across source/runtime/readiness upgrades; same world + locality remains same identity. */
export const derivePlayableLocalityInstanceId = (
  worldInstanceId: string,
  localityId: string,
): string => `dropi:playable-locality:${encoded(worldInstanceId.trim())}:${encoded(localityId.trim())}`

/** Revision-sensitive replay key; readiness/evidence changes require explicit reconciliation. */
export const derivePlayableLocalityMaterializationKey = (
  worldInstanceId: string,
  locality: Pick<GovernedLocalityIdentity, 'localityId' | 'sourceRef' | 'sourceCheckpoint'>,
  runtimeContract: PlayableLocalityRuntimeContractRef,
  readiness: PlayableLocalityInstance['readinessAtMaterialization'],
  releaseVerification?: LocalityReleaseVerification,
): string =>
  [
    'dropi:playable-locality-materialization',
    encoded(worldInstanceId.trim()),
    encoded(locality.localityId.trim()),
    encoded(locality.sourceRef.trim()),
    encoded(locality.sourceCheckpoint.trim()),
    encoded(runtimeContract.contractRef.trim()),
    encoded(runtimeContract.contractVersion.trim()),
    readiness,
    releaseVerificationToken(releaseVerification),
  ].join(':')

/** Pure fail-closed materialization. Catalog/source-ready identity cannot self-promote. */
export const materializePlayableLocalityInstance = (
  request: PlayableLocalityMaterializationRequest,
): PlayableLocalityMaterializationResult => {
  const worldInstanceId = cleanToken(request.worldInstanceId)
  if (!worldInstanceId) return { ok: false, reason: 'invalid-world-instance-id' }
  if (!isGovernedLocalityIdentity(request.locality)) {
    return { ok: false, reason: 'invalid-locality-identity' }
  }
  if (!isReadiness(request.readiness)) return { ok: false, reason: 'invalid-readiness' }
  if (!isPlayableReadiness(request.readiness)) {
    return { ok: false, reason: 'not-playable-contract-ready' }
  }
  if (!isRuntimeContract(request.runtimeContract)) {
    return { ok: false, reason: 'invalid-runtime-contract' }
  }
  if (!isSettlementDevelopmentAuthority(request.settlementDevelopment)) {
    return { ok: false, reason: 'invalid-settlement-development-authority' }
  }
  if (request.settlementDevelopment.localityId.trim() !== request.locality.localityId.trim()) {
    return { ok: false, reason: 'settlement-locality-mismatch' }
  }

  if (request.readiness === 'RELEASE_VERIFIED') {
    if (request.releaseVerification === undefined) {
      return { ok: false, reason: 'missing-release-verification' }
    }
    if (!isReleaseVerification(request.releaseVerification)) {
      return { ok: false, reason: 'invalid-release-verification' }
    }
  } else if (request.releaseVerification !== undefined) {
    return { ok: false, reason: 'unexpected-release-verification' }
  }

  const locality = copyLocality(request.locality)
  const runtimeContract = copyRuntimeContract(request.runtimeContract)
  const settlementDevelopment = copySettlementAuthority(request.settlementDevelopment)
  const releaseVerification =
    request.readiness === 'RELEASE_VERIFIED'
      ? copyReleaseVerification(request.releaseVerification as LocalityReleaseVerification)
      : undefined

  return {
    ok: true,
    instance: {
      version: PLAYABLE_LOCALITY_INSTANCE_CONTRACT_VERSION,
      instanceId: derivePlayableLocalityInstanceId(worldInstanceId, locality.localityId),
      materializationKey: derivePlayableLocalityMaterializationKey(
        worldInstanceId,
        locality,
        runtimeContract,
        request.readiness,
        releaseVerification,
      ),
      worldInstanceId,
      locality,
      readinessAtMaterialization: request.readiness,
      runtimeContract,
      settlementDevelopment,
      ...(releaseVerification ? { releaseVerification } : {}),
    },
  }
}

export const isPlayableLocalityInstanceValid = (
  value: unknown,
): value is PlayableLocalityInstance => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const instance = value as Record<string, unknown>
  if (instance.version !== PLAYABLE_LOCALITY_INSTANCE_CONTRACT_VERSION) return false
  const worldInstanceId = cleanToken(instance.worldInstanceId)
  if (!worldInstanceId || !isGovernedLocalityIdentity(instance.locality)) return false
  if (
    !isReadiness(instance.readinessAtMaterialization) ||
    !isPlayableReadiness(instance.readinessAtMaterialization)
  ) {
    return false
  }
  if (!isRuntimeContract(instance.runtimeContract)) return false
  if (!isSettlementDevelopmentAuthority(instance.settlementDevelopment)) return false

  if (instance.readinessAtMaterialization === 'RELEASE_VERIFIED') {
    if (!isReleaseVerification(instance.releaseVerification)) return false
  } else if (instance.releaseVerification !== undefined) {
    return false
  }

  const locality = instance.locality
  const runtimeContract = instance.runtimeContract
  const settlementDevelopment = instance.settlementDevelopment
  const releaseVerification =
    instance.readinessAtMaterialization === 'RELEASE_VERIFIED'
      ? (instance.releaseVerification as LocalityReleaseVerification)
      : undefined

  if (settlementDevelopment.localityId.trim() !== locality.localityId.trim()) return false

  return (
    instance.instanceId === derivePlayableLocalityInstanceId(worldInstanceId, locality.localityId) &&
    instance.materializationKey ===
      derivePlayableLocalityMaterializationKey(
        worldInstanceId,
        locality,
        runtimeContract,
        instance.readinessAtMaterialization,
        releaseVerification,
      )
  )
}

/** Restore/re-entry compatibility check for DT-02 and runtime consumers. */
export const assessPlayableLocalityReuse = (
  existing: unknown,
  request: PlayableLocalityMaterializationRequest,
): PlayableLocalityReuseResult => {
  if (!isPlayableLocalityInstanceValid(existing)) {
    return { reusable: false, reason: 'invalid-existing-instance' }
  }
  const materialized = materializePlayableLocalityInstance(request)
  if (materialized.ok === false) return { reusable: false, reason: materialized.reason }

  const next = materialized.instance
  if (existing.worldInstanceId !== next.worldInstanceId) {
    return { reusable: false, reason: 'different-world-instance' }
  }
  if (existing.locality.localityId !== next.locality.localityId) {
    return { reusable: false, reason: 'different-locality' }
  }
  if (
    existing.locality.countryId !== next.locality.countryId ||
    existing.locality.regionSourceRef !== next.locality.regionSourceRef ||
    existing.locality.sourceRef !== next.locality.sourceRef ||
    existing.locality.sourceCatalog !== next.locality.sourceCatalog ||
    existing.locality.latitude !== next.locality.latitude ||
    existing.locality.longitude !== next.locality.longitude
  ) {
    return { reusable: false, reason: 'stale-source-identity' }
  }
  if (existing.locality.sourceCheckpoint !== next.locality.sourceCheckpoint) {
    return { reusable: false, reason: 'stale-source-checkpoint' }
  }
  if (
    existing.runtimeContract.contractRef !== next.runtimeContract.contractRef ||
    existing.runtimeContract.contractVersion !== next.runtimeContract.contractVersion
  ) {
    return { reusable: false, reason: 'stale-runtime-contract' }
  }
  if (
    existing.settlementDevelopment.authorityRef !== next.settlementDevelopment.authorityRef ||
    existing.settlementDevelopment.localityId !== next.settlementDevelopment.localityId
  ) {
    return { reusable: false, reason: 'stale-settlement-authority' }
  }
  if (existing.readinessAtMaterialization !== next.readinessAtMaterialization) {
    return { reusable: false, reason: 'stale-readiness' }
  }
  if (existing.materializationKey !== next.materializationKey) {
    return { reusable: false, reason: 'stale-release-evidence' }
  }
  return { reusable: true, instance: existing }
}
