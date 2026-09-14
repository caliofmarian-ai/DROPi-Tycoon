import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/renderResolution.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const { nextResolution, frameBudget, resolutionPlan, createResolutionOwner } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
let passed = 0
const check = (name, test) => { test(); passed++; console.log(`PASS ${name}`) }
const initial = { density: 1.25, lastChange: 0, overloaded: false }
check('45 FPS cannot request more pixels', () => {
  const next = nextResolution(initial, 22, 28, 13)
  assert.equal(next.density, 1.15); assert.equal(next.overloaded, true)
})
check('tail stalls alone trigger protection; low mean cannot hide jank', () => {
  assert.equal(nextResolution(initial, 16, 25, 7).density, 1.15)
  assert.equal(nextResolution(initial, 21, 21, 7).overloaded, true)
})
check('cooldown never triggers a premature resize and preserves the state contract', () => {
  const next = nextResolution(initial, 100, 150, 2)
  assert.equal(next.density, 1.25); assert.equal(next, initial); assert.equal(next.lastChange, 0)
})
check('stable 60 Hz holds quality; upgrades require longer cooldown and headroom', () => {
  assert.equal(nextResolution(initial, 1000 / 60, 17, 20).density, 1.25)
  assert.equal(nextResolution(initial, 14, 16, 7).density, 1.25)
  assert.equal(nextResolution(initial, 14, 16, 13).density, 1.3)
})
check('clarity floor and quality ceiling do not schedule nonexistent changes', () => {
  const floor = { density: .95, lastChange: 0, overloaded: false }
  assert.deepEqual(nextResolution(floor, 1000, 1200, 100), { ...floor, overloaded: true })
  const ceiling = { density: 1.35, lastChange: 0, overloaded: false }
  assert.deepEqual(nextResolution(ceiling, 14, 16, 100), ceiling)
})
check('invalid samples cannot mutate the governor', () => {
  for (const bad of [NaN, Infinity, -1, 0]) assert.equal(nextResolution(initial, bad, 30, 20), initial)
})
check('long visible frames remain measured, including p99 and maximum', () => {
  assert.deepEqual(frameBudget([1000, 1100, 900, 1000]), { meanMs: 1000, p95Ms: 1100, p99Ms: 1100, maxMs: 1100 })
  assert.equal(frameBudget([16, 17]), null)
  assert.equal(frameBudget(Array(241).fill(1000 / 120))?.meanMs.toFixed(3), '8.333')
})
check('existing pixel ceiling, DPR and sizing validation remain intact', () => {
  assert.equal(resolutionPlan(800, 400, 1).density, 1)
  assert.ok(resolutionPlan(1920, 1080, 3).density < 1)
  assert.throws(() => resolutionPlan(0, 400, 2))
})

// Actual owner lifecycle with an explicit deterministic clock and Engine/DOM
// adapters. No fake FPS results are asserted as physical-device evidence.
const original = { performance: globalThis.performance, window: globalThis.window, document: globalThis.document }
let now = 0, delta = 0, resizes = 0
const observable = () => {
  const callbacks = new Set()
  return { callbacks, add(fn) { callbacks.add(fn); return fn }, addOnce(fn) { callbacks.add(fn); return fn }, remove(fn) { callbacks.delete(fn) }, notify() { for (const fn of callbacks) fn() } }
}
const end = observable(), dispose = observable(), listeners = new Map()
const engine = { onEndFrameObservable: end, onDisposeObservable: dispose, getDeltaTime: () => delta, getRenderWidth: () => 1000, getRenderHeight: () => 500, setHardwareScalingLevel() {}, resize() { resizes++ } }
const frame = ms => { delta = ms; now += ms; end.notify() }
try {
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => now } })
  globalThis.window = { devicePixelRatio: 2 }
  globalThis.document = { hidden: false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) }
  const owner = createResolutionOwner(engine, { getBoundingClientRect: () => ({ width: 800, height: 400 }) })
  owner.resize()
  check('120-Hz devices publish a real two-second budget', () => {
    for (let i = 0; i < 250; i++) frame(1000 / 120)
    assert.ok(window.__DROPiRenderQuality.sampleCount >= 240)
    assert.ok(window.__DROPiRenderQuality.meanMs < 9)
    assert.equal(window.__DROPiRenderQuality.physicalDeviceAcceptance, 'UNKNOWN')
  })
  check('visibility reset excludes suspension without discarding visible stalls', () => {
    document.hidden = true; listeners.get('visibilitychange')(); frame(10000)
    document.hidden = false; listeners.get('visibilitychange')(); frame(10000)
    for (let i = 0; i < 4; i++) frame(1000)
    assert.equal(window.__DROPiRenderQuality.meanMs, 1000)
    assert.equal(window.__DROPiRenderQuality.overloaded, true)
  })
  check('resizing discards old-workload samples and disposed owner removes listeners', () => {
    owner.resize()
    const before = resizes
    for (let i = 0; i < 121; i++) frame(1000 / 60)
    assert.ok(window.__DROPiRenderQuality.meanMs < 17)
    assert.equal(window.__DROPiRenderQuality.overloaded, false)
    assert.equal(resizes, before)
    dispose.notify(); assert.equal(end.callbacks.size, 0); assert.equal(listeners.size, 0)
  })
} finally {
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: original.performance })
  if (original.window === undefined) delete globalThis.window; else globalThis.window = original.window
  if (original.document === undefined) delete globalThis.document; else globalThis.document = original.document
}
console.log(`Resolution budget: ${passed} PASS. Policy/lifecycle evidence, NOT Android FPS acceptance.`)
