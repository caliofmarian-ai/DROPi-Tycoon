import type { Engine } from '@babylonjs/core/Engines/engine'

export const TARGET_FPS = 60
const FRAME_MS = 1000 / TARGET_FPS
const MIN_DENSITY = .95, MAX_DENSITY = 1.35
const DOWN_COOLDOWN_S = 6, UP_COOLDOWN_S = 12
const isOverBudget = (meanMs: number, p95Ms: number): boolean => meanMs > FRAME_MS * 1.1 || p95Ms > FRAME_MS * 1.5

export type ResolutionPlan = { width: number; height: number; density: number; scalingLevel: number }
export const resolutionPlan = (width: number, height: number, deviceDpr: number, density = 1.25): ResolutionPlan => {
  if (![width, height, deviceDpr, density].every(Number.isFinite) || Math.min(width, height, deviceDpr, density) <= 0) throw new Error('Invalid render resolution inputs')
  const actualDensity = Math.min(deviceDpr, density, Math.sqrt(1_050_000 / (width * height)))
  return { width: Math.max(1, Math.round(width * actualDensity)), height: Math.max(1, Math.round(height * actualDensity)), density: actualDensity, scalingLevel: 1 / actualDensity }
}
export type ResolutionState = { density: number; lastChange: number; overloaded: boolean }
export const nextResolution = (state: ResolutionState, meanMs: number, p95Ms: number, nowSeconds: number): ResolutionState => {
  if (![state.density, state.lastChange, meanMs, p95Ms, nowSeconds].every(Number.isFinite) || Math.min(state.density, meanMs, p95Ms) <= 0 || nowSeconds - state.lastChange < DOWN_COOLDOWN_S) return state
  const overloaded = isOverBudget(meanMs, p95Ms)
  let density = state.density
  if (overloaded) density = Math.max(MIN_DENSITY, state.density - .1)
  // A 60 Hz display normally reports ~16.7 ms. Allow bounded scheduling jitter,
  // but NEVER increase pixel load at 45/30 FPS as the old 24/32 ms gate did.
  else if (nowSeconds - state.lastChange >= UP_COOLDOWN_S && meanMs <= FRAME_MS + .25 && p95Ms <= FRAME_MS + 1.5) density = Math.min(MAX_DENSITY, state.density + .05)
  return { density, lastChange: Math.abs(density - state.density) > .001 ? nowSeconds : state.lastChange, overloaded }
}
export type FrameBudget = { meanMs: number; p95Ms: number; p99Ms: number; worstMs: number; overBudgetPercent: number }
export const frameBudget = (samples: number[]): FrameBudget | null => {
  const values = samples.filter(ms => Number.isFinite(ms) && ms > 0)
  const total = values.reduce((sum, ms) => sum + ms, 0)
  if (values.length < 4 || total < 2000) return null
  const sorted = [...values].sort((a, b) => a - b)
  const percentile = (p: number): number => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]!
  return { meanMs: total / values.length, p95Ms: percentile(.95), p99Ms: percentile(.99), worstMs: sorted[sorted.length - 1]!, overBudgetPercent: values.filter(ms => ms > FRAME_MS * 1.1).length / values.length * 100 }
}
/** main.ts owns sizing through this delegate, not competing method patches. */
export const createResolutionOwner = (engine: Engine, canvas: HTMLCanvasElement): { resize(): void } => {
  let state: ResolutionState = { density: 1.25, lastChange: performance.now() / 1000, overloaded: false }
  let plan: ResolutionPlan | null = null, budget: FrameBudget | null = null
  const samples: number[] = []
  let lastSampleTime = performance.now(), skipAfterHidden = false, sampleCount = 0
  const publish = (): void => {
    ;(window as unknown as { __DROPiRenderQuality?: unknown }).__DROPiRenderQuality = {
      mode: 'ADAPTIVE_PIXEL_BUDGET', targetFps: TARGET_FPS, ...state, ...plan, ...budget,
      actualWidth: engine.getRenderWidth(), actualHeight: engine.getRenderHeight(), sampleCount,
      physicalDeviceAcceptance: 'UNKNOWN',
    }
  }
  const resize = (): void => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const next = resolutionPlan(rect.width, rect.height, Math.max(1, window.devicePixelRatio || 1), state.density)
    const changed = !plan || next.width !== plan.width || next.height !== plan.height || Math.abs(next.scalingLevel - plan.scalingLevel) > .0001
    plan = next
    if (changed) {
      // setHardwareScalingLevel already resizes Babylon's drawing buffer.
      // Avoid two resizes, and avoid rebuilding it for duplicate viewport events.
      if (Math.abs(engine.getHardwareScalingLevel() - plan.scalingLevel) > .0001) engine.setHardwareScalingLevel(plan.scalingLevel)
      else engine.resize()
    }
    publish()
  }
  const visibility = (): void => {
    samples.length = 0; budget = null; sampleCount = 0
    skipAfterHidden = true; lastSampleTime = performance.now()
    publish()
  }
  document.addEventListener('visibilitychange', visibility)
  const observer = engine.onEndFrameObservable.add(() => {
    if (document.hidden) { samples.length = 0; skipAfterHidden = true; return }
    if (skipAfterHidden) { skipAfterHidden = false; lastSampleTime = performance.now(); return }
    const ms = engine.getDeltaTime()
    // Keep slow VISIBLE frames, including >=250 ms; suspension is excluded above.
    if (Number.isFinite(ms) && ms > 0) samples.push(ms)
    if (samples.length > 180) samples.shift()
    const now = performance.now()
    if (now - lastSampleTime < 2000) return
    budget = frameBudget(samples)
    if (!budget) return
    sampleCount = samples.length
    const next = nextResolution(state, budget.meanMs, budget.p95Ms, now / 1000)
    const changed = Math.abs(next.density - state.density) > .001
    state = { ...next, overloaded: isOverBudget(budget.meanMs, budget.p95Ms) }; lastSampleTime = now
    // Independent windows: old slow frames must not trigger repeated downscales
    // after recovery, nor old fast frames an upscale after a scene becomes slow.
    samples.length = 0
    if (changed) resize(); else publish()
  })
  engine.onDisposeObservable.addOnce(() => { engine.onEndFrameObservable.remove(observer); document.removeEventListener('visibilitychange', visibility) })
  return { resize }
}
