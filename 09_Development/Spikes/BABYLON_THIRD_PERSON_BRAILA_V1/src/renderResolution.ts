import type { Engine } from '@babylonjs/core/Engines/engine'

export type ResolutionPlan = { width: number; height: number; density: number; scalingLevel: number }
export const resolutionPlan = (width: number, height: number, deviceDpr: number, density = 1.25): ResolutionPlan => {
  if (![width, height, deviceDpr, density].every(Number.isFinite) || Math.min(width, height, deviceDpr, density) <= 0) throw new Error('Invalid render resolution inputs')
  const actualDensity = Math.min(deviceDpr, density, Math.sqrt(1_050_000 / (width * height)))
  return { width: Math.max(1, Math.round(width * actualDensity)), height: Math.max(1, Math.round(height * actualDensity)), density: actualDensity, scalingLevel: 1 / actualDensity }
}
export type ResolutionState = { density: number; lastChange: number; overloaded: boolean }
export const nextResolution = (state: ResolutionState, meanMs: number, p95Ms: number, nowSeconds: number): ResolutionState => {
  if (![meanMs, p95Ms, nowSeconds].every(Number.isFinite) || nowSeconds - state.lastChange < 6) return state
  if (meanMs > 38 && p95Ms > 48) return { density: Math.max(.95, state.density - .1), lastChange: nowSeconds, overloaded: true }
  if (meanMs < 24 && p95Ms < 32) return { density: Math.min(1.35, state.density + .05), lastChange: nowSeconds, overloaded: false }
  return { ...state, overloaded: meanMs > 38 }
}
export const frameBudget = (samples: number[]): { meanMs: number; p95Ms: number } | null => {
  const values = samples.filter(ms => Number.isFinite(ms) && ms > 0)
  if (values.length < 4 || values.reduce((sum, ms) => sum + ms, 0) < 2000) return null
  const sorted = [...values].sort((a, b) => a - b)
  return { meanMs: values.reduce((sum, ms) => sum + ms, 0) / values.length, p95Ms: sorted[Math.min(sorted.length-1, Math.floor(sorted.length*.95))]! }
}
/** main.ts owns sizing through this delegate, not competing method patches. */
export const createResolutionOwner = (engine: Engine, canvas: HTMLCanvasElement): { resize(): void } => {
  let state: ResolutionState = { density: 1.25, lastChange: performance.now() / 1000, overloaded: false }
  let plan: ResolutionPlan | null = null, budget: ReturnType<typeof frameBudget> = null
  const samples: number[] = []
  let lastSampleTime = performance.now(), skipAfterHidden = false
  const publish = (): void => {
    ;(window as unknown as { __DROPiRenderQuality?: unknown }).__DROPiRenderQuality = {
      mode: 'ADAPTIVE_PIXEL_BUDGET', ...state, ...plan, ...budget,
      actualWidth: engine.getRenderWidth(), actualHeight: engine.getRenderHeight(), sampleCount: samples.length,
      physicalDeviceAcceptance: 'UNKNOWN',
    }
  }
  const resize = (): void => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    plan = resolutionPlan(rect.width, rect.height, Math.max(1, window.devicePixelRatio || 1), state.density)
    engine.setHardwareScalingLevel(plan.scalingLevel); engine.resize(); publish()
  }
  const visibility = (): void => { if (document.hidden) { samples.length = 0; skipAfterHidden = true } }
  document.addEventListener('visibilitychange', visibility)
  const observer = engine.onEndFrameObservable.add(() => {
    if (document.hidden) { samples.length = 0; skipAfterHidden = true; return }
    if (skipAfterHidden) { skipAfterHidden = false; return }
    const ms = engine.getDeltaTime()
    // Slow visible frames are evidence of overload. Filtering out >=250ms made
    // a one-FPS scene falsely report no overload and prevented any adaptation.
    if (Number.isFinite(ms) && ms > 0) samples.push(ms)
    if (samples.length > 180) samples.shift()
    if (performance.now() - lastSampleTime < 2000) return
    budget = frameBudget(samples)
    if (!budget) return
    const next = nextResolution(state, budget.meanMs, budget.p95Ms, performance.now() / 1000)
    const changed = Math.abs(next.density - state.density) > .001
    state = { ...next, overloaded: budget.meanMs > 38 }; lastSampleTime = performance.now()
    if (changed) resize(); else publish()
  })
  engine.onDisposeObservable.addOnce(() => { engine.onEndFrameObservable.remove(observer); document.removeEventListener('visibilitychange', visibility) })
  return { resize }
}
