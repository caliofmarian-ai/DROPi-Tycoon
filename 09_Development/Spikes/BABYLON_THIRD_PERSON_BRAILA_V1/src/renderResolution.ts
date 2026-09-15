import type { Engine } from '@babylonjs/core/Engines/engine'

export const TARGET_FRAME_MS = 1000 / 60
export type ResolutionPlan = { width: number; height: number; density: number; scalingLevel: number }
export const resolutionPlan = (width: number, height: number, deviceDpr: number, density = 1.25, pixelBudget = 1_050_000): ResolutionPlan => {
  if (![width, height, deviceDpr, density, pixelBudget].every(Number.isFinite) || Math.min(width, height, deviceDpr, density, pixelBudget) <= 0 || pixelBudget > 2_073_600) throw new Error('Invalid render resolution inputs')
  const actualDensity = Math.min(deviceDpr, density, Math.sqrt(pixelBudget / (width * height)))
  return { width: Math.max(1, Math.floor(width * actualDensity)), height: Math.max(1, Math.floor(height * actualDensity)), density: actualDensity, scalingLevel: 1 / actualDensity }
}
export const exceedsFrameBudget = (meanMs: number, p95Ms: number): boolean => meanMs > TARGET_FRAME_MS * 1.1 || p95Ms > TARGET_FRAME_MS * 1.25
export type ResolutionState = { density: number; lastChange: number; overloaded: boolean }
export type DensityRange = { min: number; max: number }
export const nextResolution = (state: ResolutionState, meanMs: number, p95Ms: number, nowSeconds: number, range: DensityRange = { min: .95, max: 1.35 }): ResolutionState => {
  if (![meanMs, p95Ms, nowSeconds, state.density, state.lastChange, range.min, range.max].every(Number.isFinite) || meanMs <= 0 || p95Ms <= 0 || state.density <= 0 || range.min <= 0 || range.max < range.min || range.max > 2) return state
  // Slow visible frames remain evidence even when the owner explicitly prioritizes clarity.
  const overloaded = exceedsFrameBudget(meanMs, p95Ms)
  const elapsed = nowSeconds - state.lastChange
  if (elapsed < 6) return state
  let density = state.density
  if (overloaded && elapsed >= 6) density = Math.max(range.min, state.density - .1)
  else if (!overloaded && elapsed >= 12 && meanMs < 15 && p95Ms <= TARGET_FRAME_MS) density = Math.min(range.max, state.density + .05)
  density = Math.round(density * 100) / 100
  return { density, lastChange: density === state.density ? state.lastChange : nowSeconds, overloaded }
}
export const frameBudget = (samples: number[]): { meanMs: number; p95Ms: number; p99Ms: number; maxMs: number } | null => {
  const values = samples.filter(ms => Number.isFinite(ms) && ms > 0)
  const total = values.reduce((sum, ms) => sum + ms, 0)
  if (values.length < 4 || total < 2000) return null
  const sorted = [...values].sort((a, b) => a - b)
  const percentile = (fraction: number): number => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))]!
  return { meanMs: total / values.length, p95Ms: percentile(.95), p99Ms: percentile(.99), maxMs: sorted[sorted.length - 1]! }
}
/** One resize owner. Quality requests change its policy; they never resize after drawing. */
export const createResolutionOwner = (engine: Engine, canvas: HTMLCanvasElement): { resize(): void } => {
  let state: ResolutionState = { density: 1.25, lastChange: performance.now() / 1000, overloaded: false }
  let plan: ResolutionPlan | null = null, budget: ReturnType<typeof frameBudget> = null
  let profile: 'BALANCED' | 'HIGH_CLARITY' = 'BALANCED'
  let pixelBudget = 1_050_000, range: DensityRange = { min: .95, max: 1.35 }
  const samples: number[] = []
  let lastSampleTime = performance.now(), skipAfterHidden = false, skipAfterResize = false
  let resizePending = false, disposed = false
  const publish = (): void => {
    ;(window as unknown as { __DROPiRenderQuality?: unknown }).__DROPiRenderQuality = {
      mode: 'ADAPTIVE_PIXEL_BUDGET', profile, pixelBudget, densityFloor: range.min, targetFps: 60, ...state, ...plan, ...budget,
      actualWidth: engine.getRenderWidth(), actualHeight: engine.getRenderHeight(), sampleCount: samples.length,
      resizePhase: 'BEGIN_FRAME_ONLY', resizePending, physicalDeviceAcceptance: 'UNKNOWN',
    }
  }
  const resetWindow = (): void => { samples.length = 0; lastSampleTime = performance.now() }
  const resize = (): void => { if (!disposed) resizePending = true }
  const requestQuality = (event: Event): void => {
    if (disposed) return
    const detail = (event as CustomEvent<unknown>).detail
    if (detail !== 'high' && detail !== 'balanced') return
    profile = detail === 'high' ? 'HIGH_CLARITY' : 'BALANCED'
    pixelBudget = detail === 'high' ? 2_073_600 : 1_050_000
    range = detail === 'high' ? { min: 1.5, max: 2 } : { min: .95, max: 1.35 }
    state = { density: detail === 'high' ? 2 : 1.25, lastChange: performance.now() / 1000, overloaded: state.overloaded }
    resetWindow(); budget = null; resize(); publish()
  }
  document.addEventListener('dropi:render-clarity', requestQuality)
  const beginObserver = engine.onBeginFrameObservable.add(() => {
    if (disposed || document.hidden || !resizePending) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    resizePending = false
    plan = resolutionPlan(rect.width, rect.height, Math.max(1, window.devicePixelRatio || 1), state.density, pixelBudget)
    // Resizing clears the drawing buffer. Redraw in the same frame, never onEndFrame.
    engine.setHardwareScalingLevel(plan.scalingLevel); engine.resize()
    resetWindow(); skipAfterResize = true; publish()
  })
  const visibility = (): void => {
    resetWindow(); budget = null; skipAfterHidden = true
    if (!document.hidden) resize()
    publish()
  }
  document.addEventListener('visibilitychange', visibility)
  const observer = engine.onEndFrameObservable.add(() => {
    if (document.hidden) { resetWindow(); skipAfterHidden = true; return }
    if (skipAfterHidden || skipAfterResize) { skipAfterHidden = false; skipAfterResize = false; resetWindow(); return }
    const ms = engine.getDeltaTime()
    if (Number.isFinite(ms) && ms > 0) samples.push(ms)
    if (samples.length > 600) samples.shift()
    if (performance.now() - lastSampleTime < 2000) return
    budget = frameBudget(samples)
    if (!budget) return
    const next = nextResolution(state, budget.meanMs, budget.p95Ms, performance.now() / 1000, range)
    const changed = Math.abs(next.density - state.density) > .001
    state = { ...next, overloaded: exceedsFrameBudget(budget.meanMs, budget.p95Ms) }
    if (changed) { resize(); publish() } else { publish(); resetWindow() }
  })
  engine.onDisposeObservable.addOnce(() => {
    disposed = true; resizePending = false
    engine.onBeginFrameObservable.remove(beginObserver); engine.onEndFrameObservable.remove(observer)
    document.removeEventListener('visibilitychange', visibility)
    document.removeEventListener('dropi:render-clarity', requestQuality)
  })
  return { resize }
}
