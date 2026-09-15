import type { Engine } from '@babylonjs/core/Engines/engine'

export const TARGET_FRAME_MS = 1000 / 60
export type ResolutionPlan = { width: number; height: number; density: number; scalingLevel: number }
export const resolutionPlan = (width: number, height: number, deviceDpr: number, density = 1.25): ResolutionPlan => {
  if (![width, height, deviceDpr, density].every(Number.isFinite) || Math.min(width, height, deviceDpr, density) <= 0) throw new Error('Invalid render resolution inputs')
  const actualDensity = Math.min(deviceDpr, density, Math.sqrt(1_050_000 / (width * height)))
  return { width: Math.max(1, Math.round(width * actualDensity)), height: Math.max(1, Math.round(height * actualDensity)), density: actualDensity, scalingLevel: 1 / actualDensity }
}
export const exceedsFrameBudget = (meanMs: number, p95Ms: number): boolean => meanMs > TARGET_FRAME_MS * 1.1 || p95Ms > TARGET_FRAME_MS * 1.25
export type ResolutionState = { density: number; lastChange: number; overloaded: boolean }
export const nextResolution = (state: ResolutionState, meanMs: number, p95Ms: number, nowSeconds: number): ResolutionState => {
  if (![meanMs, p95Ms, nowSeconds, state.density, state.lastChange].every(Number.isFinite) || meanMs <= 0 || p95Ms <= 0 || state.density <= 0) return state
  // Either a missed sustained budget OR uneven delivery matters. The old AND
  // condition tolerated 30-45 FPS and could even increase pixel cost at 45 FPS.
  const overloaded = exceedsFrameBudget(meanMs, p95Ms)
  const elapsed = nowSeconds - state.lastChange
  if (elapsed < 6) return state
  let density = state.density
  if (overloaded && elapsed >= 6) density = Math.max(.95, state.density - .1)
  // Require real cadence headroom, not merely "better than 30 FPS". A capped
  // 60-Hz display without measurable headroom holds quality instead of hunting.
  else if (!overloaded && elapsed >= 12 && meanMs < 15 && p95Ms <= TARGET_FRAME_MS) density = Math.min(1.35, state.density + .05)
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
/** main.ts owns sizing through this delegate, not competing method patches. */
export const createResolutionOwner = (engine: Engine, canvas: HTMLCanvasElement): { resize(): void } => {
  let state: ResolutionState = { density: 1.25, lastChange: performance.now() / 1000, overloaded: false }
  let plan: ResolutionPlan | null = null, budget: ReturnType<typeof frameBudget> = null
  const samples: number[] = []
  let lastSampleTime = performance.now(), skipAfterHidden = false, skipAfterResize = false
  let resizePending = false, disposed = false
  const publish = (): void => {
    ;(window as unknown as { __DROPiRenderQuality?: unknown }).__DROPiRenderQuality = {
      mode: 'ADAPTIVE_PIXEL_BUDGET', targetFps: 60, ...state, ...plan, ...budget,
      actualWidth: engine.getRenderWidth(), actualHeight: engine.getRenderHeight(), sampleCount: samples.length,
      resizePhase: 'BEGIN_FRAME_ONLY', resizePending, physicalDeviceAcceptance: 'UNKNOWN',
    }
  }
  const resetWindow = (): void => { samples.length = 0; lastSampleTime = performance.now() }
  const resize = (): void => { if (!disposed) resizePending = true }
  const beginObserver = engine.onBeginFrameObservable.add(() => {
    if (disposed || document.hidden || !resizePending) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    resizePending = false
    plan = resolutionPlan(rect.width, rect.height, Math.max(1, window.devicePixelRatio || 1), state.density)
    // Resizing clears the drawing buffer. Never do this after a completed frame:
    // the normal scene render must redraw the new buffer in this same frame.
    engine.setHardwareScalingLevel(plan.scalingLevel); engine.resize()
    // The first delta straddles the old workload and cannot govern the new size.
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
    // Keep slow visible frames: discarding them hides the actual failure.
    if (Number.isFinite(ms) && ms > 0) samples.push(ms)
    // 180 samples could never cover two seconds on a 120-Hz device.
    if (samples.length > 600) samples.shift()
    if (performance.now() - lastSampleTime < 2000) return
    budget = frameBudget(samples)
    if (!budget) return
    const next = nextResolution(state, budget.meanMs, budget.p95Ms, performance.now() / 1000)
    const changed = Math.abs(next.density - state.density) > .001
    state = { ...next, overloaded: exceedsFrameBudget(budget.meanMs, budget.p95Ms) }
    if (changed) { resize(); publish() } else { publish(); resetWindow() }
  })
  engine.onDisposeObservable.addOnce(() => {
    disposed = true; resizePending = false
    engine.onBeginFrameObservable.remove(beginObserver); engine.onEndFrameObservable.remove(observer)
    document.removeEventListener('visibilitychange', visibility)
  })
  return { resize }
}
