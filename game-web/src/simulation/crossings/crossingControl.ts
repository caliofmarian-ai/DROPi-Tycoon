export type CrossingSignalState = 'vehicle-go' | 'all-stop' | 'pedestrian-go'
export type TrafficOfficerOverride = 'none' | 'hold-vehicles' | 'hold-pedestrians'

export interface CrossingWindow {
  start: number
  end: number
}

export interface CrossingControlPlan {
  cycleSeconds: number
  pedestrianWindows: readonly CrossingWindow[]
  allStopBufferSeconds: number
}

export interface CrossingControlInput {
  seconds: number
  pedestrianRequested: boolean
  pedestrianPresent: boolean
  officerOverride?: TrafficOfficerOverride
}

export interface CrossingControlState {
  cycleTime: number
  signal: CrossingSignalState
  pedestrianMayEnter: boolean
  vehicleMayProceed: boolean
  pedestrianRequested: boolean
  pedestrianPresent: boolean
  reason: 'cycle' | 'pedestrian-clearing' | 'officer-hold-vehicles' | 'officer-hold-pedestrians'
}

export const DEFAULT_CROSSING_CONTROL_PLAN: CrossingControlPlan = {
  cycleSeconds: 12,
  pedestrianWindows: [
    { start: 0.75, end: 4.25 },
    { start: 6.75, end: 10.25 },
  ],
  allStopBufferSeconds: 0.25,
}

const finitePositive = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? value : fallback

const positiveModulo = (value: number, divisor: number): number => ((value % divisor) + divisor) % divisor

const normalizePlan = (plan: CrossingControlPlan): CrossingControlPlan => ({
  cycleSeconds: finitePositive(plan.cycleSeconds, DEFAULT_CROSSING_CONTROL_PLAN.cycleSeconds),
  allStopBufferSeconds: Math.max(0, Number.isFinite(plan.allStopBufferSeconds) ? plan.allStopBufferSeconds : 0),
  pedestrianWindows: plan.pedestrianWindows
    .filter(window => Number.isFinite(window.start) && Number.isFinite(window.end) && window.end > window.start)
    .map(window => ({ start: Math.max(0, window.start), end: Math.max(0, window.end) })),
})

export const crossingControlCycleTime = (plan: CrossingControlPlan, seconds: number): number => {
  const normalized = normalizePlan(plan)
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  return positiveModulo(safeSeconds, normalized.cycleSeconds)
}

const windowSignal = (
  plan: CrossingControlPlan,
  cycleTime: number,
  pedestrianRequested: boolean,
): CrossingSignalState => {
  if (!pedestrianRequested) return 'vehicle-go'
  for (const window of plan.pedestrianWindows) {
    if (cycleTime < window.start || cycleTime >= window.end) continue
    const walkStart = Math.min(window.end, window.start + plan.allStopBufferSeconds)
    const walkEnd = Math.max(window.start, window.end - plan.allStopBufferSeconds)
    return cycleTime >= walkStart && cycleTime < walkEnd ? 'pedestrian-go' : 'all-stop'
  }
  return 'vehicle-go'
}

export const resolveCrossingControlState = (
  rawPlan: CrossingControlPlan,
  input: CrossingControlInput,
): CrossingControlState => {
  const plan = normalizePlan(rawPlan)
  const cycleTime = crossingControlCycleTime(plan, input.seconds)
  const pedestrianRequested = Boolean(input.pedestrianRequested)
  const pedestrianPresent = Boolean(input.pedestrianPresent)
  const officerOverride = input.officerOverride ?? 'none'

  if (officerOverride === 'hold-vehicles') {
    return {
      cycleTime,
      signal: pedestrianRequested || pedestrianPresent ? 'pedestrian-go' : 'all-stop',
      pedestrianMayEnter: pedestrianRequested || pedestrianPresent,
      vehicleMayProceed: false,
      pedestrianRequested,
      pedestrianPresent,
      reason: 'officer-hold-vehicles',
    }
  }

  if (officerOverride === 'hold-pedestrians') {
    return {
      cycleTime,
      signal: pedestrianPresent ? 'all-stop' : 'vehicle-go',
      pedestrianMayEnter: false,
      vehicleMayProceed: !pedestrianPresent,
      pedestrianRequested,
      pedestrianPresent,
      reason: 'officer-hold-pedestrians',
    }
  }

  const signal = windowSignal(plan, cycleTime, pedestrianRequested)
  if (pedestrianPresent && signal === 'vehicle-go') {
    return {
      cycleTime,
      signal: 'all-stop',
      pedestrianMayEnter: false,
      vehicleMayProceed: false,
      pedestrianRequested,
      pedestrianPresent,
      reason: 'pedestrian-clearing',
    }
  }

  return {
    cycleTime,
    signal,
    pedestrianMayEnter: signal === 'pedestrian-go',
    vehicleMayProceed: signal === 'vehicle-go',
    pedestrianRequested,
    pedestrianPresent,
    reason: 'cycle',
  }
}
