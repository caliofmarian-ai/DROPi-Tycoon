import type { AnimationGroup } from '@babylonjs/core/Animations/animationGroup'

// Metres/seconds: gameplay traversal is not accelerated to match a jog asset.
// This is a spike tuning value, not a claim about production balance.
export const HERO_WALK_SPEED_MPS = 1.65
export const WALK_REFERENCE_MPS = 1.4
export type WalkState = { moving: boolean; weight: number; ratio: number }
export const nextWalkState = (state: WalkState, speed: number, dt: number): WalkState => {
  const s = Number.isFinite(speed) ? Math.max(0, speed) : 0
  const step = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.1)) : 0
  const moving = state.moving ? s >= 0.06 : s > 0.13
  const targetWeight = moving ? 1 : 0
  const weight = state.weight + (targetWeight - state.weight) * (1 - Math.exp(-18 * step))
  return { moving, weight: Math.abs(targetWeight - weight) < 0.001 ? targetWeight : weight, ratio: moving ? Math.min(1.5, s / WALK_REFERENCE_MPS) : 0 }
}
export const planarSpeed = (dx: number, dz: number, seconds: number): number => {
  if (![dx, dz, seconds].every(Number.isFinite) || seconds <= 0 || seconds > 0.25) return 0
  const distance = Math.hypot(dx, dz)
  // Relocation/teleport must not be interpreted as a running gait.
  return distance > 2 ? 0 : distance / seconds
}

/** Exactly one writer for the two authored groups, with normalized weights. */
export const createWalkMixer = (idle: AnimationGroup, walk: AnimationGroup): {
  update(speed: number, dt: number): WalkState
  stop(): void
} => {
  if (idle === walk || !idle.targetedAnimations.length || !walk.targetedAnimations.length) throw new Error('Separate non-empty idle/walk groups required')
  let state: WalkState = { moving: false, weight: 0, ratio: 0 }
  idle.start(true, 0.92); idle.setWeightForAllAnimatables(1)
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
