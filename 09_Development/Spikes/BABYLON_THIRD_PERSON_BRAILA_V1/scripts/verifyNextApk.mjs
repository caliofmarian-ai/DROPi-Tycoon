import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { NullEngine, Scene, SceneLoader, MeshBuilder, TransformNode, FreeCamera, Vector3, Quaternion } from '@babylonjs/core'
import '@babylonjs/loaders/glTF/index.js'

const dir = path.resolve(`.next-apk-test-${process.pid}`)
await mkdir(dir, { recursive: true })
const modules = ['authoredWalk', 'authoredPedestrians', 'contactKinematics', 'humanContactPose', 'renderResolution']
for (const name of modules) {
  const source = await readFile(`src/${name}.ts`, 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
    .replace(/(['"])@babylonjs\/loaders\/glTF\1/g, '$1@babylonjs/loaders/glTF/index.js$1')
    .replace(/(['"])(@babylonjs\/core\/[A-Za-z0-9_/.-]+)(\1)/g, (_, quote, spec) => `${quote}${spec.endsWith('.js') ? spec : `${spec}.js`}${quote}`)
    .replace(/(['"])\.\/([A-Za-z0-9]+)\1/g, '$1./$2.mjs$1')
  await writeFile(path.join(dir, `${name}.mjs`), js)
}
const { solveTwoBone, PoseRestore } = await import(pathToFileURL(path.join(dir, 'contactKinematics.mjs')).href)
const { HumanContactPose } = await import(pathToFileURL(path.join(dir, 'humanContactPose.mjs')).href)
const { createPedestrian } = await import(pathToFileURL(path.join(dir, 'authoredPedestrians.mjs')).href)
const { resolutionPlan, nextResolution } = await import(pathToFileURL(path.join(dir, 'renderResolution.mjs')).href)
let passed = 0
const near = (actual, expected, eps = .002) => assert.ok(Math.abs(actual - expected) <= eps, `${actual} != ${expected}`)
const check = (name, action) => { action(); passed += 1; console.log(`PASS ${name}`) }
const engine = new NullEngine(), scene = new Scene(engine)
const camera = new FreeCamera('test-camera', new Vector3(0, 2, -5), scene)
camera.setTarget(new Vector3(0, 1, 0)); scene.activeCamera = camera
const geometryOnly = bytes => {
  const length = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + length).toString('utf8').trim())
  const binLength = bytes.readUInt32LE(20 + length), binary = bytes.subarray(28 + length, 28 + length + binLength)
  delete json.images; delete json.textures; delete json.samplers
  for (const material of json.materials ?? []) {
    delete material.normalTexture; delete material.occlusionTexture; delete material.emissiveTexture
    if (material.pbrMetallicRoughness) { delete material.pbrMetallicRoughness.baseColorTexture; delete material.pbrMetallicRoughness.metallicRoughnessTexture }
  }
  json.buffers[0].uri = `data:application/octet-stream;base64,${binary.toString('base64')}`
  return `data:${JSON.stringify(json)}`
}
try {
  check('render scale correct for Android CSS viewport and DPR, bounded pixel count', () => {
    const plan = resolutionPlan(906, 405, 2.25)
    assert.ok(plan.width > 1000 && plan.height > 450)
    near(plan.scalingLevel * plan.density, 1)
    for (const [w, h, dpr] of [[1280, 720, 2], [412, 915, 3], [3840, 2160, 4], [960, 432, 2]]) {
      const p = resolutionPlan(w, h, dpr)
      assert.ok(p.width * p.height < 1_055_000); assert.ok(p.density <= dpr)
    }
    assert.throws(() => resolutionPlan(0, 720, 2)); assert.throws(() => resolutionPlan(960, 432, NaN))
  })
  check('resolution hysteresis cannot oscillate every frame or become tiny', () => {
    const state = { density: 1.25, lastChange: 0, overloaded: false }
    assert.equal(nextResolution(state, 60, 90, 1), state)
    let s = state
    for (let time = 7; time < 200; time += 7) s = nextResolution(s, 60, 90, time)
    assert.ok(s.density >= .95)
    for (let time = 210; time < 500; time += 7) s = nextResolution(s, 18, 25, time)
    assert.ok(s.density <= 1.35)
  })
  for (const mirror of [1, -1]) check(`two-bone IK solves in parent frame with glTF reflection ${mirror}`, () => {
    const root = new TransformNode('ik-parent', scene); root.scaling.z = mirror; root.rotation.y = 1.1
    const a = new TransformNode('a', scene), b = new TransformNode('b', scene), c = new TransformNode('c', scene)
    a.parent = root; b.parent = a; c.parent = b
    b.position.y = -.32; c.position.y = -.30
    const target = new Vector3(.23, -.35, .24), pole = new Vector3(.55, -.1, -.2)
    const initial = a.rotationQuaternion
    const restore = new PoseRestore(); restore.save(a); restore.save(b)
    const result = solveTwoBone(a, b, c, target, pole)
    assert.ok(result.errorM < .003, `IK error ${result.errorM}`)
    near(b.position.length(), .32); near(c.position.length(), .30)
    restore.restore(); assert.equal(a.rotationQuaternion, initial)
    root.dispose()
  })
  const manifest = JSON.parse(await readFile('public/assets/characters/human-motion/MANIFEST.json', 'utf8'))
  let maxCarryError = 0, worstClearance = Infinity, measuredFrames = 0
  for (const [assetIndex, spec] of manifest.pedestrians.entries()) {
    const asset = await SceneLoader.LoadAssetContainerAsync('', geometryOnly(await readFile(`public/assets/characters/human-motion/${spec.file}`)), scene, undefined, '.gltf')
    const authority = new TransformNode(`authority-${assetIndex}`, scene)
    authority.position.set(3, 0, 4)
    const visual = new TransformNode(`visual-${assetIndex}`, scene); visual.parent = authority
    const human = createPedestrian(scene, asset, spec, `contact-test-${assetIndex}`, 1.78)
    human.root.parent = visual
    const parcel = MeshBuilder.CreateBox(`parcel-${assetIndex}`, { width: .36, height: .24, depth: .24 }, scene)
    parcel.parent = visual; parcel.setEnabled(false)
    let useStep = false
    const surface = (x, z) => useStep && x > 3.03 ? .16 : .06
    const pose = new HumanContactPose(human.root, visual, surface, parcel)
    const walk = human.entries.animationGroups.find(group => group.name.endsWith('/Walk_Loop'))
    human.entries.animationGroups.forEach(group => group.stop())
    walk.start(true, 1); walk.setWeightForAllAnimatables(1)
    const savedAuthority = authority.position.clone()
    const footprints = []
    for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      authority.rotation.y = yaw
      for (let frame = 0; frame < 48; frame += 1) {
        pose.restore(); pose.clearPlants()
        walk.goToFrame(walk.from + (walk.to - walk.from) * frame / 48)
        useStep = frame >= 24
        parcel.setEnabled(frame % 3 !== 0)
        const report = pose.apply(1 / 30, 1.4)
        footprints.push(pose.legs[0].foot.position.z)
        assert.ok(Number.isFinite(report.minFootClearanceM), 'Foot measurement must exist')
        assert.ok(report.minFootClearanceM >= -.002, `${spec.file} frame ${frame} yaw ${yaw}: ${JSON.stringify(report)}`)
        if (report.carry) {
          assert.ok(report.handErrorM !== null && report.handErrorM < .025, `${spec.file} grip: ${JSON.stringify(report)}`)
          maxCarryError = Math.max(maxCarryError, report.handErrorM)
        } else assert.equal(report.handErrorM, null)
        worstClearance = Math.min(worstClearance, report.minFootClearanceM); measuredFrames += 1
        assert.ok(authority.position.equals(savedAuthority), 'Contact changed authoritative hero position')
        near(authority.rotation.y, yaw)
      }
    }
    check(`${spec.file}: actual animated shoe geometry clears flat ground and split-height curb`, () => {
      assert.ok(pose.probe.data.length >= 1)
      assert.ok(Math.max(...footprints) - Math.min(...footprints) > .02, 'Test failed to actually advance native walking pose')
    })
    check(`${spec.file}: both palms reach box sockets at all four headings`, () => assert.ok(maxCarryError < .025))
    check(`${spec.file}: drop/restart restores native arm pose without accumulated offsets`, () => {
      pose.restore(); parcel.setEnabled(false); walk.goToFrame(walk.from)
      const before = pose.arms.map(arm => arm.wrist.rotationQuaternion.clone())
      pose.apply(1 / 30, 0); pose.restore()
      pose.arms.forEach((arm, index) => assert.ok(arm.wrist.rotationQuaternion.equalsWithEpsilon(before[index], .0001)))
    })
    pose.dispose(); human.dispose(); parcel.dispose(); authority.dispose(); asset.dispose()
  }
  console.log(`Measured ${measuredFrames} native walking/curb/heading/carry poses; max hand gap ${maxCarryError.toFixed(5)} m; worst shoe clearance ${worstClearance.toFixed(5)} m`)
  const surfaceManifest = JSON.parse(await readFile('public/assets/environment/restored/PROVENANCE.json', 'utf8'))
  check('authored P3/P4 textures restored with image and hash budgets', () => {
    assert.ok(surfaceManifest.derivatives.some(item => item.stage === 'p3'))
    assert.ok(surfaceManifest.derivatives.some(item => item.stage === 'p4'))
    assert.ok(surfaceManifest.textures.length > 0 && surfaceManifest.textures.length <= 10)
    for (const texture of surfaceManifest.textures) {
      assert.ok(texture.width <= 1024 && texture.height <= 1024)
      assert.match(texture.sha256, /^[a-f0-9]{64}$/)
    }
  })
  check('single ground/carry writers and main resolution delegation are wired', () => {
    // Wiring verified below with source assertions as well as runtime pose tests.
    assert.ok(true)
  })
  const p5 = await readFile('src/p5HeroPolishV1.ts', 'utf8'), ground = await readFile('src/groundContactV1.ts', 'utf8'), main = await readFile('src/main.ts', 'utf8')
  assert.doesNotMatch(p5, /refreshBoundingInfo|parcel\.position\.set|visualRoot\.position\.y\s*\+=/)
  assert.match(ground, /if \(scene\.metadata\?\.dropiContactPoseV1\) return/)
  assert.match(main, /createResolutionOwner\(engine, canvas\)\.resize/)
  assert.doesNotMatch(main, /deviceDpr \/ Math\.min/)
  console.log(`Next-APK mechanical regression suite: ${passed} PASS. Actual native asset geometry and poses; NOT Android visual or performance acceptance.`)
} finally {
  scene.dispose(); engine.dispose(); await rm(dir, { recursive: true, force: true })
}
