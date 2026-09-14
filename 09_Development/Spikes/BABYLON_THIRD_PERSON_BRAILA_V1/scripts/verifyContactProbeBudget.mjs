import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Execute the production probe class with deterministic geometry/engine adapters.
// Existing native-asset contact, stance and rendered suites remain mandatory.
const source = await readFile(new URL('../src/humanContactPose.ts', import.meta.url), 'utf8')
const begin = source.indexOf('export class SkinFeetProbe')
const end = source.indexOf('/** A stale support lock', begin)
assert.ok(begin >= 0 && end > begin, 'Production probe class could not be located')
const compile = text => ts.transpileModule(text.replace('export class', 'class'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
class Vector {
  constructor() { this.x = 0; this.y = 0; this.z = 0 }
  static Zero() { return new Vector() }
  set(x, y, z) { this.x = x; this.y = y; this.z = z }
  static TransformCoordinatesToRef(v, matrix, out) {
    const m = matrix.m, w = 1 / (v.x * m[3] + v.y * m[7] + v.z * m[11] + m[15])
    out.set((v.x * m[0] + v.y * m[4] + v.z * m[8] + m[12]) * w,
      (v.x * m[1] + v.y * m[5] + v.z * m[9] + m[13]) * w,
      (v.x * m[2] + v.y * m[6] + v.z * m[10] + m[14]) * w)
  }
}
const Probe = new Function('Vector3', 'VertexBuffer', `${compile(source.slice(begin, end))}\nreturn SkinFeetProbe;`)(Vector, { PositionKind: 'position', MatricesIndicesKind: 'indices', MatricesWeightsKind: 'weights' })
let worldReads = 0, computes = 0, prepares = 0, surfaceCalls = 0
const world = { m: identity() }, bones = [...identity(), ...identity()]
const vertices = 4096, positions = [], indices = [], weights = []
for (let i = 0; i < vertices; i++) {
  positions.push(i % 2 ? .13 : -.13, (i % 23) * .002, (i % 37) * .008)
  indices.push(i % 2, 1 - i % 2, i % 2, 1 - i % 2)
  weights.push(.7, .15, .1, .05)
}
const mesh = {
  name: 'test/shoes', numBoneInfluencers: 4,
  skeleton: { bones: [{ name: 'Foot.L', getIndex: () => 0 }, { name: 'Foot.R', getIndex: () => 1 }], prepare() { prepares++ }, getTransformMatrices: () => bones },
  getVerticesData: kind => ({ position: positions, indices, weights })[kind],
  computeWorldMatrix() { computes++; return world },
  getWorldMatrix() { worldReads++; return world },
}
const probe = new Probe([mesh])
const surface = (x, z) => { surfaceCalls++; return x > .03 && z < 1 ? .16 : .06 }
// Independent reference computes all vertices using the original operation order.
const reference = () => {
  let left = Infinity, right = Infinity
  for (let i = 0; i < vertices; i++) {
    const [x, y, z] = positions.slice(i * 3, i * 3 + 3)
    const p = [0, 0, 0]
    for (let slot = 0; slot < 4; slot++) {
      const j = indices[i * 4 + slot] * 16, w = weights[i * 4 + slot]
      for (let axis = 0; axis < 3; axis++) p[axis] += w * (x * bones[j + axis] + y * bones[j + 4 + axis] + z * bones[j + 8 + axis] + bones[j + 12 + axis])
    }
    const v = new Vector(); v.set(...p); const out = new Vector(); Vector.TransformCoordinatesToRef(v, world, out)
    const height = out.y - (out.x > .03 && out.z < 1 ? .16 : .06)
    if (i % 2) right = Math.min(right, height); else left = Math.min(left, height)
  }
  return { left, right, vertices }
}
let passed = 0
const check = (name, test) => { test(); passed++; console.log(`PASS ${name}`) }
check('all 4096 shoe vertices are measured with one world-matrix lookup', () => {
  assert.deepEqual(probe.read(surface), reference())
  assert.equal(worldReads, 1); assert.equal(computes, 1); assert.equal(prepares, 1); assert.equal(surfaceCalls, vertices)
})
check('pose, reflection, translation and curb changes are never cached across scans', () => {
  for (let frame = 0; frame < 48; frame++) {
    const yaw = frame * .13, mirror = frame % 2 ? -1 : 1
    world.m = [Math.cos(yaw), 0, -Math.sin(yaw), 0, 0, 1, 0, 0, Math.sin(yaw) * mirror, 0, Math.cos(yaw) * mirror, 0, frame * .015, .02 + frame * .001, -.1, 1]
    bones[13] = Math.sin(frame) * .025; bones[16 + 13] = Math.cos(frame) * .035
    const actual = probe.read(surface), expected = reference()
    assert.deepEqual(actual, expected, `scan ${frame}`)
  }
  assert.equal(worldReads, 49); assert.equal(surfaceCalls, 49 * vertices)
})
check('fresh correction within the same frame is immediately remeasured', () => {
  const before = probe.read(surface)
  world.m[13] += .125
  const after = probe.read(surface)
  assert.ok(Math.abs(after.left - before.left - .125) < 1e-12)
  assert.ok(Math.abs(after.right - before.right - .125) < 1e-12)
  assert.equal(worldReads, 51)
})
check('unsupported skin and non-finite evidence still fail closed', () => {
  assert.throws(() => new Probe([{ ...mesh, numBoneInfluencers: 8 }]), /Unsupported shoe skin/)
  assert.throws(() => probe.read(() => NaN), /Non-finite skinned foot measurement/)
})
console.log(`Contact probe budget: ${passed} PASS. 4096 to 1 world lookups per scan; all vertices retained. Operation-count evidence, NOT phone FPS.`)
