import type { AnimationGroup } from '@babylonjs/core/Animations/animationGroup'

export const HERO_WALK_SPEED_MPS = 1.65
export const WALK_REFERENCE_MPS = 1.4
export type WalkState = { moving: boolean; weight: number; ratio: number }
/** Bounded collision substeps; never catch up more than 250ms after a stall. */
export const movementSteps = (seconds: number, suspended = false): number[] => {
  if (suspended || !Number.isFinite(seconds) || seconds <= 0 || seconds > 2) return []
  const budget = Math.min(seconds, .25), count = Math.max(1, Math.ceil(budget / .05))
  return Array.from({ length: count }, () => budget / count)
}
export const nextWalkState = (state: WalkState, speed: number, dt: number): WalkState => {
  const s = Number.isFinite(speed) ? Math.max(0, speed) : 0
  const step = Number.isFinite(dt) ? Math.max(0, Math.min(dt, .1)) : 0
  // Preserve 82fbacaf's small actual-motion hysteresis. A slow visible frame is
  // overload, not an idle state; no requested-speed inflation is used.
  const moving = state.moving ? s >= .005 : s > .01
  const targetWeight = moving ? 1 : 0
  const weight = state.weight + (targetWeight - state.weight) * (1 - Math.exp(-18 * step))
  return { moving, weight: Math.abs(targetWeight - weight) < .001 ? targetWeight : weight, ratio: moving ? Math.min(1.5, s / WALK_REFERENCE_MPS) : 0 }
}
export const planarSpeed = (dx: number, dz: number, seconds: number): number => {
  if (![dx, dz, seconds].every(Number.isFinite) || seconds <= 0 || seconds > 2) return 0
  const distance = Math.hypot(dx, dz)
  // Preserve real distance/time through visible overloaded frames; suspension
  // and relocations remain separate from ordinary traversal.
  return distance > 2 ? 0 : distance / seconds
}
export const createWalkMixer = (idle: AnimationGroup, walk: AnimationGroup): {
  update(speed: number, dt: number): WalkState
  stop(): void
} => {
  if (idle === walk || !idle.targetedAnimations.length || !walk.targetedAnimations.length) throw new Error('Separate non-empty idle/walk groups required')
  let state: WalkState = { moving: false, weight: 0, ratio: 0 }
  idle.start(true, .92); idle.setWeightForAllAnimatables(1)
  walk.start(true, 0); walk.setWeightForAllAnimatables(0)
  return {
    update(speed, dt) {
      state = nextWalkState(state, speed, dt)
      walk.speedRatio = state.ratio
      idle.setWeightForAllAnimatables(1 - state.weight)
      walk.setWeightForAllAnimatables(state.weight)
      return { ...state }
    },
    stop() { idle.stop(); walk.stop() },
  }
}
