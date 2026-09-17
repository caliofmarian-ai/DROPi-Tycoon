import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { NullEngine, Scene, SceneLoader, TransformNode, Vector3, MeshBuilder } from '@babylonjs/core'
import '@babylonjs/loaders/glTF/index.js'
const dir = path.resolve(`.idle-support-${process.pid}`)
await mkdir(dir, { recursive: true })
for (const name of ['authoredWalk', 'authoredPedestrians', 'contactKinematics', 'humanContactPose', 'stationaryStance']) {
  const code = ts.transpileModule(await readFile(`src/${name}.ts`, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
    .replace(/(['"])@babylonjs\/loaders\/glTF\1/g, '$1@babylonjs/loaders/glTF/index.js$1')
    .replace(/(['"])(@babylonjs\/core\/[A-Za-z0-9_/.-]+)\1/g, (_, quote, spec) => `${quote}${spec.endsWith('.js') ? spec : spec + '.js'}${quote}`)
    .replace(/(['"])\.\/([A-Za-z0-9]+)\1/g, '$1./$2.mjs$1')
  await writeFile(path.join(dir, `${name}.mjs`), code)
}
const load = name => import(pathToFileURL(path.join(dir, `${name}.mjs`)).href)
const { HumanContactPose } = await load('humanContactPose')
const { StationaryStance } = await load('stationaryStance')
const { createPedestrian } = await load('authoredPedestrians')
const engine = new NullEngine(), scene = new Scene(engine)
const geometryOnly = bytes => {
  const length = bytes.readUInt32LE(12), gltf = JSON.parse(bytes.subarray(20, 20 + length).toString().trim()), binLength = bytes.readUInt32LE(20 + length)
  const bin = bytes.subarray(28 + length, 28 + length + binLength)
  delete gltf.images; delete gltf.textures; delete gltf.samplers
  for (const material of gltf.materials ?? []) {
    delete material.normalTexture; delete material.occlusionTexture; delete material.emissiveTexture
    if (material.pbrMetallicRoughness) { delete material.pbrMetallicRoughness.baseColorTexture; delete material.pbrMetallicRoughness.metallicRoughnessTexture }
  }
  gltf.buffers[0].uri = `data:application/octet-stream;base64,${bin.toString('base64')}`
  return `data:${JSON.stringify(gltf)}`
}
let passed = 0, idlePoses = 0, walkingPoses = 0, measuredGrips = 0
const check = (name, test) => { test(); passed += 1; console.log(`PASS ${name}`) }
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < .00001, `${actual} != ${expected}`)
try {
  const manifest = JSON.parse(await readFile('public/assets/characters/human-motion/MANIFEST.json', 'utf8'))
  for (const [assetIndex, spec] of manifest.pedestrians.entries()) {
    const asset = await SceneLoader.LoadAssetContainerAsync('', geometryOnly(await readFile(`public/assets/characters/human-motion/${spec.file}`)), scene, undefined, '.gltf')
    const human = createPedestrian(scene, asset, spec, `idle-native-${assetIndex}`, 1.78)
    const authority = new TransformNode(`authority-${assetIndex}`, scene)
    human.root.parent = authority
    const parcel = MeshBuilder.CreateBox(`test-parcel-${assetIndex}`, { width: .36, height: .24, depth: .24 }, scene)
    parcel.setEnabled(false)
    const idle = human.entries.animationGroups.find(group => group.name.endsWith('/Idle_Loop'))
    const walk = human.entries.animationGroups.find(group => group.name.endsWith('/Walk_Loop'))
    let height = .184, yaw = 0
    const ground = (x, z) => x * Math.cos(yaw) - z * Math.sin(yaw) >= 0 ? height : 0
    const pose = new HumanContactPose(human.root, human.root, ground, parcel)
    let stance = new StationaryStance(pose)
    check(`${spec.file}: each stationary sole reaches its curb, preserving hand grip`, () => {
      let realCorrections = 0
      for (height of [.08, .164, .184]) for (yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (let frame = 0; frame < 8; frame += 1) {
        pose.restore(); pose.clearPlants(); authority.rotation.y = yaw; parcel.setEnabled(frame % 2 === 0)
        idle.goToFrame(idle.from + (idle.to - idle.from) * frame / 8)
        const report = stance.apply(1 / 30, 0, pose.apply(1 / 30, 0))
        assert.equal(report.status, 'PASS', JSON.stringify({ height, yaw, frame, report }))
        assert.equal(report.idleSupport, 'SUPPORTED')
        for (const clearance of [report.leftFootClearanceM, report.rightFootClearanceM]) assert.ok(clearance >= -.002 && clearance <= .025, JSON.stringify(report))
        if (report.pelvisLoweringM > .02) realCorrections += 1
        if (parcel.isEnabled()) for (const arm of pose.arms) {
          arm.palm.computeWorldMatrix(true)
          const socket = Vector3.TransformCoordinates(new Vector3(arm.side * .183, parcel.position.y, parcel.position.z), human.root.computeWorldMatrix(true))
          assert.ok(Vector3.Distance(arm.palm.getAbsolutePosition(), socket) <= .025, 'Pelvis adjustment broke the actual hand/box contact')
          measuredGrips += 1
        }
        assert.deepEqual(authority.position.asArray(), [0, 0, 0]); idlePoses += 1
      }
      assert.ok(realCorrections >= 24, 'Exercise actual split-height support, not only an already-flat pose')
    })
    check(`${spec.file}: walking swing feet are not forced into stationary support`, () => {
      height = 0; yaw = 0; authority.rotation.y = 0; parcel.setEnabled(false)
      for (let frame = 0; frame < 12; frame += 1) {
        pose.restore(); pose.clearPlants(); walk.goToFrame(walk.from + (walk.to - walk.from) * frame / 12)
        const native = pose.apply(1 / 30, 1.4), before = human.root.position.clone()
        const report = stance.apply(1 / 30, 1.4, native)
        assert.equal(report.idleSupport, 'MOVING')
        near(report.leftFootClearanceM, native.leftFootClearanceM); near(report.rightFootClearanceM, native.rightFootClearanceM)
        assert.ok(human.root.position.equalsWithEpsilon(before, .00001)); walkingPoses += 1
      }
    })
    check(`${spec.file}: stopping preserves the walk-to-idle transition`, () => {
      pose.restore(); idle.goToFrame(idle.from)
      assert.equal(stance.apply(1 / 30, 0, pose.apply(1 / 30, 0)).idleSupport, 'SETTLING')
    })
    check(`${spec.file}: impossible support height cannot fabricate PASS`, () => {
      pose.restore(); pose.clearPlants(); height = .6; stance = new StationaryStance(pose); idle.goToFrame(idle.from)
      const native = pose.apply(1 / 30, 0), before = human.root.position.clone()
      const report = stance.apply(1 / 30, 0, native)
      assert.equal(report.status, 'FAIL'); assert.equal(report.idleSupport, 'UNREACHABLE')
      assert.ok(human.root.position.equalsWithEpsilon(before, .00001), 'Rejected support must leave the previous safe pose intact')
    })
    pose.dispose(); human.dispose(); if (!parcel.isDisposed()) parcel.dispose(); asset.dispose(); authority.dispose()
  }
  console.log(`Stationary split-surface regression: ${passed} PASS; ${idlePoses} native idle poses, ${walkingPoses} unmodified swing poses, ${measuredGrips} actual palm/socket checks. NOT physical Android acceptance.`)
} finally { scene.dispose(); engine.dispose(); await rm(dir, { recursive: true, force: true }) }
