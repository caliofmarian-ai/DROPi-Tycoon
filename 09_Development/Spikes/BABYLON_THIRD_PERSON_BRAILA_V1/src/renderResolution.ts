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

/** main.ts delegates resize here. No second module patches engine sizing methods. */
export const createResolutionOwner = (engine: Engine, canvas: HTMLCanvasElement): { resize(): void } => {
  let state: ResolutionState = { density: 1.25, lastChange: performance.now() / 1000, overloaded: false }
  let plan: ResolutionPlan | null = null
  const samples: number[] = []
  let lastSampleTime = performance.now()
  const publish = (): void => {
    ;(window as unknown as { __DROPiRenderQuality?: unknown }).__DROPiRenderQuality = {
      mode: 'ADAPTIVE_PIXEL_BUDGET', ...state, ...plan,
      actualWidth: engine.getRenderWidth(), actualHeight: engine.getRenderHeight(),
      physicalDeviceAcceptance: 'UNKNOWN',
    }
  }
  const resize = (): void => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    plan = resolutionPlan(rect.width, rect.height, Math.max(1, window.devicePixelRatio || 1), state.density)
    // Babylon scales CSS canvas dimensions by 1/scalingLevel. The old dpr/limit
    // expression applied the device ratio twice and shrank the render buffer.
    engine.setHardwareScalingLevel(plan.scalingLevel)
    engine.resize(); publish()
  }
  const observer = engine.onEndFrameObservable.add(() => {
    if (document.hidden) { samples.length = 0; return }
    const ms = engine.getDeltaTime()
    if (ms > 0 && ms < 250) samples.push(ms)
    if (samples.length > 180) samples.shift()
    if (performance.now() - lastSampleTime < 2000 || samples.length < 60) return
    const mean = samples.reduce((sum, sample) => sum + sample, 0) / samples.length
    const sorted = [...samples].sort((a, b) => a - b)
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .95))]!
    const next = nextResolution(state, mean, p95, performance.now() / 1000)
    const changed = Math.abs(next.density - state.density) > .001
    state = next; lastSampleTime = performance.now()
    if (changed) resize()
    else publish()
  })
  engine.onDisposeObservable.addOnce(() => engine.onEndFrameObservable.remove(observer))
  return { resize }
}
