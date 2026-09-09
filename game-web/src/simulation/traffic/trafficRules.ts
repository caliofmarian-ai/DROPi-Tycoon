import type { CrossingControlState } from '../crossings/crossingControl'
import { footfallPolicy, type HighFootfallKind } from '../pedestrians/footfall'

export interface VehicleCrossingDecisionInput {
  crossingState: CrossingControlState
  footfallKind: HighFootfallKind
  alreadyClearedCrossing: boolean
}

export interface VehicleCrossingDecision {
  action: 'go' | 'yield'
  speedFactor: number
  cautionLevel: ReturnType<typeof footfallPolicy>['cautionLevel']
  reason: 'cleared' | 'crossing-priority' | 'caution'
}

export const resolveVehicleCrossingDecision = (
  input: VehicleCrossingDecisionInput,
): VehicleCrossingDecision => {
  const policy = footfallPolicy(input.footfallKind)
  if (input.alreadyClearedCrossing) {
    return { action: 'go', speedFactor: 1, cautionLevel: policy.cautionLevel, reason: 'cleared' }
  }
  if (!input.crossingState.vehicleMayProceed) {
    return { action: 'yield', speedFactor: 0, cautionLevel: policy.cautionLevel, reason: 'crossing-priority' }
  }
  return {
    action: 'go',
    speedFactor: policy.vehicleSpeedFactor,
    cautionLevel: policy.cautionLevel,
    reason: policy.cautionLevel === 'normal' ? 'cleared' : 'caution',
  }
}
