import {
  isPlayableLocalityInstanceValid,
  type PlayableLocalityInstance,
} from '../world/playableLocalityInstance'
import {
  materializeDeliveryWorkForCurrentLocality,
  requestCanonicalDt03DeliverySettlement,
  type LocalityDeliveryMaterializationResult,
  type LocalityDeliverySettlementRequestResult,
} from './localityDeliveryMaterialization'

export const PLAYABLE_LOCALITY_DELIVERY_MATERIALIZATION_VERSION = 1 as const

type CurrentLocalityMaterializationInput = Parameters<
  typeof materializeDeliveryWorkForCurrentLocality
>[0]
type CurrentLocalitySettlementInput = Parameters<
  typeof requestCanonicalDt03DeliverySettlement
>[0]

export type PlayableLocalityDeliveryMaterializationInput = Omit<
  CurrentLocalityMaterializationInput,
  'currentLocalityId' | 'worldInstanceId'
> & {
  /** Canonical DT-11 identity/runtime binding. DT-09 never fabricates this instance. */
  playableLocality: PlayableLocalityInstance
}

export type PlayableLocalityDeliverySettlementInput = Omit<
  CurrentLocalitySettlementInput,
  'currentLocalityId' | 'worldInstanceId'
> & {
  /** The same canonical DT-11 instance that governed work materialization. */
  playableLocality: PlayableLocalityInstance
}

const unavailable = (
  reason: 'invalid-runtime-context' | 'locality-authority-mismatch',
): LocalityDeliveryMaterializationResult => ({
  status: 'unavailable',
  reason,
  candidateEvaluations: [],
  citywideEvaluations: [],
})

/**
 * Canonical DT-11 -> DT-09 composition boundary.
 *
 * Locality/world/source identity comes only from PlayableLocalityInstance. DT-09 consumes
 * that authority read-only and then delegates to the existing locality materializer.
 */
export const materializeDeliveryWorkForPlayableLocality = (
  input: PlayableLocalityDeliveryMaterializationInput,
): LocalityDeliveryMaterializationResult => {
  const { playableLocality, endpointAuthority, ...missionInput } = input
  if (!isPlayableLocalityInstanceValid(playableLocality)) {
    return unavailable('invalid-runtime-context')
  }

  const currentLocalityId = playableLocality.locality.localityId
  if (
    endpointAuthority.localityId !== currentLocalityId ||
    endpointAuthority.sourceCheckpoint !== playableLocality.locality.sourceCheckpoint
  ) {
    return unavailable('locality-authority-mismatch')
  }

  return materializeDeliveryWorkForCurrentLocality({
    ...missionInput,
    currentLocalityId,
    worldInstanceId: playableLocality.worldInstanceId,
    endpointAuthority,
  })
}

/**
 * Canonical DT-11-aware final DT-09 boundary.
 *
 * This verifies that the settlement boundary still belongs to the same governed locality
 * snapshot, then delegates to the existing direct #673 handoff. It never executes DT-03
 * settlement and never grants money, XP, loyalty, specialist fragments or capability.
 */
export const requestCanonicalDt03DeliverySettlementForPlayableLocality = (
  input: PlayableLocalityDeliverySettlementInput,
): LocalityDeliverySettlementRequestResult => {
  const { playableLocality, ...settlementInput } = input
  if (!isPlayableLocalityInstanceValid(playableLocality)) {
    return { status: 'rejected', reason: 'invalid-boundary' }
  }

  if (
    settlementInput.boundary.localityId !== playableLocality.locality.localityId ||
    settlementInput.boundary.worldInstanceId !== playableLocality.worldInstanceId ||
    settlementInput.boundary.sourceCheckpoint !== playableLocality.locality.sourceCheckpoint
  ) {
    return { status: 'rejected', reason: 'locality-mismatch' }
  }

  return requestCanonicalDt03DeliverySettlement({
    ...settlementInput,
    currentLocalityId: playableLocality.locality.localityId,
    worldInstanceId: playableLocality.worldInstanceId,
  })
}
