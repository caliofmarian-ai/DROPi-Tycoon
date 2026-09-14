import assert from 'node:assert/strict'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'
import { NullEngine, Scene, SceneLoader, MeshBuilder, Vector3 } from '@babylonjs/core'
import '@babylonjs/loaders/glTF/index.js'

const tempWalk = path.resolve(`.walk-check-${process.pid}.mjs`)
const tempPeople = path.resolve(`.people-check-${process.pid}.mjs`)
const compile = text => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
await writeFile(tempWalk, compile(await readFile('src/authoredWalk.ts', 'utf8')))
await writeFile(tempPeople, compile(await readFile('src/authoredPedestrians.ts', 'utf8')).replace("'./authoredWalk'", `'./${path.basename(tempWalk)}'`))
const { HERO_WALK_SPEED_MPS, nextWalkState, planarSpeed } = await import(pathToFileURL(tempWalk).href)
const { createPedestrian, surfaceSampler } = await import(pathToFileURL(tempPeople).href)
let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`PASS ${name}`) }
const near = (actual, expected, tolerance = 0.003) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`)
const engine = new NullEngine(), scene = new Scene(engine)
const parseGlb = bytes => {
  const length = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + length).toString('utf8').trim())
  const binLength = bytes.readUInt32LE(20 + length)
  return { json, bin: bytes.subarray(28 + length, 28 + length + binLength) }
}
const geometryOnlyData = ({ json, bin }) => {
  // NullEngine tests geometry/rigging, not texture decode or visual appearance.
  const copy = structuredClone(json)
  delete copy.images; delete copy.textures; delete copy.samplers
  for (const material of copy.materials ?? []) {
    delete material.normalTexture; delete material.occlusionTexture; delete material.emissiveTexture
    if (material.pbrMetallicRoughness) { delete material.pbrMetallicRoughness.baseColorTexture; delete material.pbrMetallicRoughness.metallicRoughnessTexture }
  }
  copy.buffers[0].uri = `data:application/octet-stream;base64,${bin.toString('base64')}`
  return `data:${JSON.stringify(copy)}`
}
try {
  check('normal traversal uses a walking speed cap, not 4.6m/s', () => near(HERO_WALK_SPEED_MPS, 1.65))
  check('blocked and teleport movement cannot drive a running animation', () => {
    near(planarSpeed(0, 0, 0.016), 0); near(planarSpeed(15, 0, 0.016), 0); near(planarSpeed(1, 0, 5), 0)
    near(planarSpeed(0.014, 0, 0.01), 1.4)
  })
  check('idle/walk transition is continuous, hysteretic and weight-normalized', () => {
    let state = { moving: false, weight: 0, ratio: 0 }
    state = nextWalkState(state, 1.4, 1 / 60)
    assert.ok(state.weight > 0 && state.weight < 1); near(state.ratio, 1)
    const first = state.weight
    state = nextWalkState(state, 1.4, 1 / 60); assert.ok(state.weight > first && state.weight < 1)
    for (let frame = 0; frame < 120; frame += 1) state = nextWalkState(state, 0, 1 / 60)
    near(state.weight, 0); near(state.ratio, 0); assert.equal(state.moving, false)
    for (const speed of [NaN, Infinity, -5, 0, 0.08, 0.14, 1.65]) {
      const next = nextWalkState(state, speed, 0.02)
      assert.ok(next.weight >= 0 && next.weight <= 1); near(next.weight + (1 - next.weight), 1)
    }
  })
  const manifest = JSON.parse(await readFile('public/assets/characters/human-motion/MANIFEST.json', 'utf8'))
  check('hero walk is an authored walk, not a renamed jog/sprint', () => {
    assert.match(manifest.hero.originalWalk, /^walk/i); assert.doesNotMatch(manifest.hero.originalWalk, /jog|sprint/i)
    assert.equal(manifest.hero.walk, 'Walk_Loop'); assert.ok(manifest.hero.targetCount >= 20); assert.ok(manifest.hero.maxRestAngle <= 0.035)
  })
  const heroWalk = parseGlb(await readFile(`public/assets/characters/human-motion/${manifest.hero.file}`))
  check('walk carrier has a single verified walking clip', () => {
    assert.deepEqual(heroWalk.json.animations.map(animation => animation.name), ['Walk_Loop'])
  })
  for (const spec of manifest.pedestrians) {
    const payload = parseGlb(await readFile(`public/assets/characters/human-motion/${spec.file}`))
    const container = await SceneLoader.LoadAssetContainerAsync('', geometryOnlyData(payload), scene, undefined, '.gltf')
    const a = createPedestrian(scene, container, spec, `test-a-${spec.file}`, 1.76)
    const b = createPedestrian(scene, container, spec, `test-b-${spec.file}`, 1.68)
    check(`${spec.file}: complete skinned body with independent skeleton`, () => {
      assert.ok(a.entries.skeletons.length > 0); assert.ok(a.meshes.some(mesh => mesh.skeleton))
      assert.notEqual(a.entries.skeletons[0], b.entries.skeletons[0])
      assert.notEqual(a.entries.skeletons[0], container.skeletons[0])
      assert.equal(a.meshes.length, container.meshes.filter(mesh => mesh.getTotalVertices() > 0).length)
      assert.ok(a.meshes.every(mesh => !mesh.checkCollisions && !mesh.isPickable))
    })
    check(`${spec.file}: four sole markers normalized at ground level`, () => {
      assert.equal(a.soles.length, 4)
      for (const sole of a.soles) { sole.computeWorldMatrix(true); near(sole.getAbsolutePosition().y, 0, 0.02) }
    })
    check(`${spec.file}: source disposal cannot hide mounted clones`, () => {
      for (const root of container.rootNodes) root.setEnabled(false)
      assert.ok(a.meshes.every(mesh => mesh.isEnabled()))
      assert.ok(b.meshes.every(mesh => mesh.isEnabled()))
    })
    check(`${spec.file}: native walk pose cannot animate another person`, () => {
      const clip = a.entries.animationGroups.find(group => group.name.endsWith('/Walk_Loop'))
      const track = clip.targetedAnimations.find(track => track.animation.targetProperty === 'rotationQuaternion')
      assert.ok(track)
      const sourceName = track.target.name.slice(`test-a-${spec.file}/`.length)
      const other = b.root.getDescendants(false).find(node => node.name === `test-b-${spec.file}/${sourceName}`)
      assert.ok(other)
      const before = other.rotationQuaternion.clone()
      clip.goToFrame(clip.from + (clip.to - clip.from) * 0.4)
      assert.ok(other.rotationQuaternion.equalsWithEpsilon(before, 0.00001))
      a.mixer.update(1.4, 0.016); b.mixer.update(0, 0.016)
    })
    a.dispose(); b.dispose(); container.dispose()
  }
  const ground = MeshBuilder.CreateBox('ground', { width: 180, depth: 130, height: 0.2 }, scene); ground.position.y = -0.1
  const sidewalk = MeshBuilder.CreateBox('sidewalk-test', { width: 4, depth: 4, height: 0.16 }, scene); sidewalk.position.y = 0.08
  const sample = surfaceSampler(scene)
  check('pedestrian grounding uses governed ground/trottoir heights, not capsule center', () => {
    near(sample(0, 0), 0.16); near(sample(10, 10), 0); assert.throws(() => sample(1000, 1000))
  })
  console.log(`Authored human-motion regression suite: ${passed} PASS. Actual asset rig structure plus NullEngine geometry; NOT Android appearance or FPS acceptance.`)
} finally {
  scene.dispose(); engine.dispose(); await Promise.all([unlink(tempWalk), unlink(tempPeople)])
}
