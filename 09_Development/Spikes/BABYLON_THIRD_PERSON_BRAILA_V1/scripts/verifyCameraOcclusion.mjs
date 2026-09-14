import assert from 'node:assert/strict'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'

const file = path.resolve(`.camera-occlusion-${process.pid}.mjs`)
await writeFile(file, ts.transpileModule(await readFile('src/cameraOcclusion.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText)
let count = 0
const test = (label, run) => { run(); count += 1; console.log(`PASS ${label}`) }
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`)
try {
  const { cameraBoomDirection, cameraBoxEntry, insideCameraBox, resolveCameraBoom, recoverCameraRadius } = await import(pathToFileURL(file).href)
  const origin = { x: 0, y: 1.18, z: 0 }, direction = { x: 0, y: 0, z: 1 }
  const wall = { id: 'wall', min: { x: -2, y: 0, z: 3 }, max: { x: 2, y: 8, z: 4 } }
  test('clear space retains the exact user-selected zoom', () => {
    assert.deepEqual(resolveCameraBoom(origin, direction, 6.4, []), { radius: 6.4, blocker: null, status: 'CLEAR' })
  })
  test('full-segment sweep catches a wall even when the eye is beyond it', () => {
    const result = resolveCameraBoom(origin, direction, 6.4, [wall])
    near(result.radius, 2.765); assert.equal(result.blocker, 'wall'); assert.equal(result.status, 'SHORTENED')
    assert.equal(insideCameraBox({ x: 0, y: 1.18, z: 6.4 }, wall), false)
  })
  test('parallel ray outside a blocker remains clear', () => {
    assert.equal(cameraBoxEntry({ x: 4, y: 1.18, z: 0 }, direction, 6.4, wall), null)
  })
  test('negative-direction and near-parallel rays preserve symmetry', () => {
    const negative = { id: 'back-wall', min: { x: -2, y: 0, z: -4 }, max: { x: 2, y: 8, z: -3 } }
    near(resolveCameraBoom(origin, { x: 0, y: 0, z: -1 }, 6.4, [negative]).radius, 2.765)
    near(cameraBoxEntry(origin, { x: 1e-12, y: 0, z: 1 }, 6.4, wall), 2.8)
  })
  test('nearest blocker wins independently of iteration order', () => {
    const distant = { id: 'distant', min: { x: -2, y: 0, z: 5 }, max: { x: 2, y: 8, z: 6 } }
    assert.deepEqual(resolveCameraBoom(origin, direction, 8, [wall, distant]), resolveCameraBoom(origin, direction, 8, [distant, wall]))
  })
  test('a thin canopy can shorten the boom below the user zoom minimum', () => {
    const canopy = { id: 'realism-hq-canopy', min: { x: -4, y: 2.1, z: -3 }, max: { x: 4, y: 2.35, z: 3 } }
    const result = resolveCameraBoom(origin, cameraBoomDirection(Math.PI / 2, 1.17), 6.4, [canopy])
    assert.equal(result.status, 'SHORTENED'); assert.ok(result.radius < 3.1 && result.radius > .05)
  })
  test('blocked focus is explicit and cannot be labeled CLEAR', () => {
    assert.equal(resolveCameraBoom({ x: 0, y: 1, z: 3.5 }, direction, 6.4, [wall]).status, 'TARGET_BLOCKED')
  })
  test('inward safety is immediate and outward recovery is smooth', () => {
    near(recoverCameraRadius(6.4, 1.2, .016), 1.2)
    const out = recoverCameraRadius(1.2, 6.4, .016)
    assert.ok(out > 1.2 && out < 6.4); near(recoverCameraRadius(1.2, 6.4, 0), 1.2)
  })
  test('invalid geometry is rejected instead of producing NaNs', () => {
    assert.throws(() => resolveCameraBoom(origin, { x: 0, y: 0, z: 2 }, 6.4, []))
    assert.throws(() => resolveCameraBoom(origin, direction, NaN, []))
    assert.throws(() => cameraBoxEntry(origin, direction, 6.4, { ...wall, min: { x: 3, y: 0, z: 3 } }))
    assert.throws(() => cameraBoomDirection(NaN, 1.17))
  })
  test('spherical directions are unit vectors for the accepted angles', () => {
    for (const alpha of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const beta of [.42, 1.17, 1.52]) {
      const d = cameraBoomDirection(alpha, beta); near(Math.hypot(d.x, d.y, d.z), 1)
    }
  })
  const main = await readFile('src/main.ts', 'utf8')
  const buildings = [...main.matchAll(/createBuilding\('(dropi-hq|maras-market|customer-block)',\s*(-?[\d.]+),\s*(-?[\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/g)].map(match => {
    const [, id, px, pz, width, depth, height] = match
    const x = Number(px), z = Number(pz), w = Number(width), d = Number(depth), h = Number(height)
    return { id, min: { x: x - w / 2, y: 0, z: z - d / 2 }, max: { x: x + w / 2, y: h, z: z + d / 2 } }
  })
  test('actual HQ/market/customer approaches remain outside padded walls', () => {
    assert.equal(buildings.length, 3)
    let samples = 0
    for (const box of buildings) {
      const x = (box.min.x + box.max.x) / 2, z = (box.min.z + box.max.z) / 2
      const positions = [
        { x, y: 1.18, z: box.min.z - .45 }, { x, y: 1.18, z: box.max.z + .45 },
        { x: box.min.x - .45, y: 1.18, z }, { x: box.max.x + .45, y: 1.18, z },
      ]
      for (const p of positions) for (let angle = 0; angle < 32; angle += 1) for (const beta of [.42, 1.17, 1.52]) {
        const direction = cameraBoomDirection(angle * Math.PI / 16, beta)
        const result = resolveCameraBoom(p, direction, 11, [box])
        assert.notEqual(result.status, 'TARGET_BLOCKED')
        const eye = { x: p.x + direction.x * result.radius, y: p.y + direction.y * result.radius, z: p.z + direction.z * result.radius }
        assert.equal(insideCameraBox(eye, box, .20), false, `${box.id} angle ${angle} beta ${beta}`)
        assert.equal(cameraBoxEntry(p, direction, result.radius, box, .20), null)
        samples += 1
      }
    }
    assert.equal(samples, 1152)
  })
  const source = await readFile('src/cameraAuthorityV3.ts', 'utf8')
  test('integration retains engine colliders and separate requested zoom', () => {
    assert.match(source, /camera\.checkCollisions = true/)
    assert.doesNotMatch(source, /camera\.checkCollisions = false/)
    assert.match(source, /resolveCameraBoom\(/); assert.match(source, /requestedRadius/)
  })
  console.log(`Camera occlusion regression suite: ${count} PASS; 1152 real-layout boom samples. Geometric tests are NOT rendered Android acceptance.`)
} finally { await unlink(file) }
