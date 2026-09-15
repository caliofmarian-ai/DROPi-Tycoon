import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { performance } from 'node:perf_hooks'
import ts from 'typescript'

const adapter = await readFile(new URL('../src/authoredPedestrians.ts', import.meta.url), 'utf8')
const startIndex = adapter.indexOf('/** Exact acceleration of the existing immutable'), endIndex = adapter.indexOf('export type FootRoles =', startIndex)
assert.ok(startIndex >= 0 && endIndex > startIndex, 'Production index could not be located')
const source = adapter.slice(startIndex, endIndex)
const compile = text => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const { createWalkableSurfaceIndex } = await import(`data:text/javascript;base64,${Buffer.from(compile(source)).toString('base64')}`)
const box = (x0, x1, z0, z1, top) => ({ min: { x: x0, z: z0 }, max: { x: x1, y: top, z: z1 } })
// Independent reference retains the original highest-inclusive-AABB operation.
const linear = bounds => (x, z) => {
  let top = -Infinity
  for (const b of bounds) if (x >= b.min.x && x <= b.max.x && z >= b.min.z && z <= b.max.z) top = Math.max(top, b.max.y)
  if (!Number.isFinite(top)) throw new Error('Humanoid left governed walkable surfaces')
  return top
}
const outcome = (sample, x, z) => {
  try { return sample(x, z) } catch (error) { return error.message }
}
const equalQueries = (bounds, points) => {
  const fast = createWalkableSurfaceIndex(bounds), old = linear(bounds)
  for (const [x, z] of points) assert.deepEqual(outcome(fast, x, z), outcome(old, x, z), `surface at ${x},${z}`)
}
let passed = 0
const check = (name, fn) => { fn(); passed++; console.log(`PASS ${name}`) }
const fixture = [box(-90, 90, -65, 65, -.02), box(-90, 90, -45.5, -38.5, .12), box(-75, 75, -6, 6, .06), box(2, 14, -40, 44, .065), box(-75, 75, -10, -6, .16), box(-75, 75, 6, 10, .16), box(-2, 2, -40, 44, .162), box(14, 18, -40, 44, .162)]
check('every authored-layout boundary and both adjacent sides retain exact highest support', () => {
  const xs = [...new Set(fixture.flatMap(b => [b.min.x, b.max.x]))].flatMap(x => [x - 1e-9, x, x + 1e-9])
  const zs = [...new Set(fixture.flatMap(b => [b.min.z, b.max.z]))].flatMap(z => [z - 1e-9, z, z + 1e-9])
  equalQueries(fixture, xs.flatMap(x => zs.map(z => [x, z])))
})
let seed = 748
const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32 }
check('50000 seeded queries match the old snapshot including outside coverage', () => {
  equalQueries(fixture, Array.from({ length: 50000 }, () => [random() * 200 - 100, random() * 150 - 75]))
})
check('arbitrary overlaps, gaps and input order do not alter heights', () => {
  const bounds = Array.from({ length: 20 }, () => {
    const x = random() * 30 - 15, z = random() * 30 - 15
    return box(x, x + random() * 8, z, z + random() * 8, random() * 2 - 1)
  })
  const points = Array.from({ length: 5000 }, () => [random() * 40 - 20, random() * 40 - 20])
  equalQueries(bounds, points); equalQueries([...bounds].reverse(), points)
})
check('zero-width and zero-depth surfaces still exist exactly on their boundaries', () => {
  equalQueries([box(-2, 2, -2, 2, -.1), box(0, 0, -2, 2, .7), box(-2, 2, 0, 0, .8), box(0, 0, 0, 0, 1)], [[0, 0], [0, .2], [.2, 0], [1e-12, 1e-12], [-1e-12, 0], [0, -1e-12]])
  equalQueries([box(3, 3, 4, 4, .9)], [[3, 4], [3 + 1e-12, 4], [3, 4 + 1e-12]])
})
check('coherent cache never crosses a curb, a gap or a higher overlapping surface', () => {
  const bounds = [box(-10, 10, -2, 2, .06), box(0, 2, -1, 1, .16), box(1, 1.1, -.1, .1, .3)]
  equalQueries(bounds, Array.from({ length: 1000 }, (_, i) => [[-1, 0], [0, 0], [1, 0], [1.1, 0], [1.1 + 1e-12, 0], [2, 0], [2 + 1e-12, 0], [11, 0]][i % 8]))
})
check('each index owns an immutable independent scene snapshot', () => {
  const bounds = [box(-1, 1, -1, 1, .1)], first = createWalkableSurfaceIndex(bounds)
  bounds[0].max.y = .6; bounds[0].min.x = 0
  const second = createWalkableSurfaceIndex(bounds)
  assert.equal(first(-.5, 0), .1); assert.equal(second(.5, 0), .6)
  assert.throws(() => second(-.5, 0), /governed walkable/)
})
check('empty coverage, non-finite queries and malformed bounds fail closed', () => {
  assert.throws(() => createWalkableSurfaceIndex([])(0, 0), /governed walkable/)
  const fast = createWalkableSurfaceIndex(fixture)
  for (const n of [NaN, Infinity, -Infinity]) {
    assert.throws(() => fast(n, 0), /governed walkable/); assert.throws(() => fast(0, n), /governed walkable/)
  }
  for (const b of [box(1, 0, 0, 1, 0), box(0, 1, 1, 0, 0), box(NaN, 1, 0, 1, 0), box(0, 1, 0, 1, Infinity)]) assert.throws(() => createWalkableSurfaceIndex([b]), /Invalid walkable/)
})
check('large inputs use bounded exact fallback rather than an unbounded grid', () => {
  const bounds = Array.from({ length: 300 }, (_, i) => box(i, i + 1, i, i + 1, i / 100))
  equalQueries(bounds, Array.from({ length: 601 }, (_, i) => [i / 2, i / 2]))
})
check('height precision and signed-zero maximum semantics are retained', () => {
  equalQueries([box(-1, 1, -1, 1, -0), box(-1, 1, -1, 1, +0)], [[0, 0], [1, 1]])
  equalQueries([box(-1, 1, -1, 1, .16000000000000003), box(0, 1, 0, 1, .16000000000000006)], [[0, 0], [-.1, -.1], [1, 1]])
})

// Mutation checks prove the numerical assertions reject common shortcut regressions.
const mutations = [
  ['boundary assigned to adjacent interval', text => text.replace('lo * 2 : lo * 2 - 1', 'lo * 2 - 1 : lo * 2 - 1')],
  ['open cell cache includes a curb boundary', text => text.replace('value > min && value < max', 'value >= min && value <= max')],
  ['last surface wins instead of highest', text => text.replace('Math.max(heights[cell]!, s.top)', 's.top')],
  ['uncovered cells fabricate zero ground', text => text.replace('.fill(-Infinity)', '.fill(0)')],
  ['highest boundary omitted', text => text.replace('iz <= z1', 'iz < z1')],
]
for (const [name, mutate] of mutations) {
  const changed = mutate(source)
  assert.notEqual(changed, source, `Mutation must exercise current source: ${name}`)
  const candidate = (await import(`data:text/javascript;base64,${Buffer.from(compile(changed)).toString('base64')}`)).createWalkableSurfaceIndex
  check(`rejects mutation: ${name}`, () => {
    assert.throws(() => {
      const bounds = [box(-2, 2, -2, 2, 0), box(0, 1, -1, 1, .16), box(.25, .75, -.5, .5, .3), box(-2, 2, -2, 2, .06), box(4, 5, 4, 5, .1)]
      const fast = candidate(bounds), old = linear(bounds)
      for (const [x, z] of [[-.1, 0], [0, 0], [.5, 0], [.75, 0], [1, 1], [2, 2], [3, 3], [5, 5]]) assert.deepEqual(outcome(fast, x, z), outcome(old, x, z))
    })
  })
}

// Verify the real scene adapter still owns selection and takes the same snapshot.
assert.match(adapter, /return createWalkableSurfaceIndex\(surfaces\)/)
const begin = adapter.indexOf('export const surfaceSampler ='), end = adapter.indexOf('\nlet started =', begin)
assert.ok(begin >= 0 && end > begin)
const sampler = new Function('Mesh', 'createWalkableSurfaceIndex', `${compile(adapter.slice(begin, end).replace('export const', 'const'))}\nreturn surfaceSampler;`)
check('runtime adapter preserves surface selection, world bounds and snapshot lifetime', () => {
  let computes = 0
  class Mesh {
    constructor(name, b) { this.name = name; this.bounds = b }
    computeWorldMatrix() { computes++ }
    getBoundingInfo() {
      const copy = value => ({ ...value, clone() { return { ...value } } })
      return { boundingBox: { minimumWorld: copy(this.bounds.min), maximumWorld: copy(this.bounds.max) } }
    }
  }
  const meshes = [new Mesh('ground', box(-2, 2, -2, 2, 0)), new Mesh('sidewalk-main', box(0, 1, -1, 1, .16)), new Mesh('quay', box(-2, -1, -1, 1, .12)), new Mesh('road-main', box(-1, 0, -1, 1, .06)), new Mesh('roof', box(-2, 2, -2, 2, 50)), { name: 'ground' }]
  const sample = sampler(Mesh, createWalkableSurfaceIndex)({ meshes })
  assert.equal(computes, 4)
  assert.equal(sample(.5, 0), .16); assert.equal(sample(-1.5, 0), .12); assert.equal(sample(-.5, 0), .06)
  meshes[1].bounds.max.y = 99
  assert.equal(sample(.5, 0), .16); assert.equal(computes, 4)
})

// Bounded CPU microbenchmark only: the eight-patch fixture is NOT a phone trace.
// Never use these timings as FPS acceptance or a renderer bottleneck diagnosis.
const points = []
for (let frame = 0; frame < 32; frame++) for (let actor = 0; actor < 9; actor++) for (let v = 0; v < 512; v++) points.push([-55 + actor * 12 + frame * .02 + (v % 16) * .001, (actor % 2 ? 8 : -8) + (v % 7) * .001])
const fast = createWalkableSurfaceIndex(fixture), old = linear(fixture)
const measure = fn => {
  let sum = 0; const start = performance.now()
  for (const [x, z] of points) sum += fn(x, z)
  return { ms: performance.now() - start, sum }
}
measure(old); measure(fast)
const oldRuns = [], fastRuns = []
for (let i = 0; i < 5; i++) {
  const a = measure(old), b = measure(fast)
  assert.equal(a.sum, b.sum); oldRuns.push(a.ms); fastRuns.push(b.ms)
}
const median = times => times.sort((a, b) => a - b)[2]
console.log(JSON.stringify({ classification: 'CPU_MICROBENCHMARK_NOT_ANDROID_FPS', queries: points.length, linearMedianMs: median(oldRuns), indexedMedianMs: median(fastRuns) }))
console.log(`Walkable surface index: ${passed} PASS. Exact numerical/adapter evidence; physical Android acceptance remains UNKNOWN.`)
