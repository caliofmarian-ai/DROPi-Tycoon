import assert from 'node:assert/strict'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'
import { AssetContainer, Mesh, MeshBuilder, NullEngine, Quaternion, Scene, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core'

const generated = path.resolve(`.presentation-regression-${process.pid}.mjs`)
const source = await readFile('src/completeAssetPresentation.ts', 'utf8')
await writeFile(generated, ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText)
const engine = new NullEngine()
const scene = new Scene(engine)
let passed = 0
const check = (name, fn) => { fn(); passed += 1; console.log(`PASS ${name}`) }
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.0001, `${actual} != ${expected}`)
try {
  const { instantiateCompleteModel, fitCompleteModel, fitCompleteModelBox, modelBounds, canMergeReplacementSources, allPresentationStagesSettled, waitForPresentationStage, resizeParcelPresentation, PRESENTATION_STAGES } = await import(pathToFileURL(generated).href)
  // glTF-like fixture: conversion root + offset pivot + six sibling material
  // primitives. Picking only the first mesh loses the glazing and four wheels.
  const conversion = new Mesh('__root__', scene)
  conversion.scaling.set(1, 1, -1)
  conversion.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0)
  const pivot = new TransformNode('offset-pivot', scene)
  pivot.parent = conversion
  pivot.position.set(3, 0.3, -2)
  const materials = ['body', 'glass', 'rubber'].map(name => new StandardMaterial(name, scene))
  const add = (name, options, position, material) => {
    const mesh = MeshBuilder.CreateBox(name, options, scene)
    mesh.parent = pivot; mesh.position.copyFrom(position); mesh.material = material
    return mesh
  }
  add('body', { width: 2, height: 1, depth: 4 }, new Vector3(0, 0.8, 0), materials[0])
  add('glass', { width: 1.8, height: 0.5, depth: 1.8 }, new Vector3(0, 1.55, 0), materials[1])
  for (const side of [-1, 1]) for (const axle of [-1, 1]) add(`wheel-${side}-${axle}`, { size: 0.5 }, new Vector3(side, 0.25, axle * 1.3), materials[2])
  const assets = new AssetContainer(scene)
  assets.moveAllFromScene()
  const first = instantiateCompleteModel(assets, scene, 'vehicle-a')
  const second = instantiateCompleteModel(assets, scene, 'vehicle-b')
  check('all six body/glass/wheel primitives are retained', () => {
    assert.equal(first.meshes.length, 6); assert.equal(first.sourceMeshCount, 6)
    assert.equal(first.meshes.filter(mesh => mesh.name.includes('wheel-')).length, 4)
    assert.ok(first.meshes.some(mesh => mesh.material?.name === 'glass'))
  })
  check('disabled source roots cannot disable mounted copies', () => {
    conversion.setEnabled(false)
    assert.ok(first.meshes.every(mesh => mesh.isEnabled()))
    assert.ok(second.meshes.every(mesh => mesh.isEnabled()))
  })
  check('normalization accounts for offset pivots and conversion transforms', () => {
    fitCompleteModel(first, new Vector3(5, 0.065, 7), { length: 4.05 }, 0, true)
    const b = modelBounds(first)
    near(b.min.y, 0.065); near((b.min.x + b.max.x) / 2, 5); near((b.min.z + b.max.z) / 2, 7)
    near(Math.max(b.size.x, b.size.z), 4.05)
  })
  check('instances have independent transforms', () => {
    const before = modelBounds(second).min.clone()
    first.root.position.x += 20
    near(modelBounds(second).min.x, before.x)
  })
  check('quarter-turn box fit uses the complete world envelope', () => {
    fitCompleteModelBox(second, new Vector3(8, 0.02, 0), { width: 12, depth: 16, height: 3 }, Math.PI / 2)
    const b = modelBounds(second)
    near(b.size.x, 12); near(b.size.z, 16); near(b.size.y, 3); near(b.min.y, 0.02)
  })
  check('simulation root/collider remains enabled and unchanged', () => {
    const authority = MeshBuilder.CreateBox('authority', { size: 1 }, scene)
    authority.position.set(12, 0.3, 4); authority.checkCollisions = true
    first.root.parent = authority
    near(authority.position.x, 12); near(authority.position.y, 0.3)
    assert.ok(authority.isEnabled()); assert.ok(authority.checkCollisions)
    assert.ok(first.meshes.every(mesh => !mesh.checkCollisions && !mesh.isPickable))
  })
  check('parcel is 36 x 24 x 24 cm and resizing is idempotent', () => {
    const parcel = MeshBuilder.CreateBox('parcel', { width: 0.68, height: 0.48, depth: 0.46 }, scene)
    resizeParcelPresentation(parcel); const scale = parcel.scaling.clone(); resizeParcelPresentation(parcel)
    near(parcel.scaling.x, scale.x); near(parcel.scaling.y, scale.y); near(parcel.scaling.z, scale.z)
    parcel.computeWorldMatrix(true)
    const bounds = parcel.getBoundingInfo().boundingBox
    const size = bounds.maximumWorld.subtract(bounds.minimumWorld)
    near(size.x, 0.36); near(size.y, 0.24); near(size.z, 0.24)
  })
  check('replacement anchors cannot be merged while a stage is loading', () => {
    assert.equal(canMergeReplacementSources({}), false)
    for (const missing of PRESENTATION_STAGES) {
      const state = Object.fromEntries(PRESENTATION_STAGES.map(key => [key, key !== missing]))
      assert.equal(canMergeReplacementSources(state), false)
      assert.equal(allPresentationStagesSettled(state), false)
    }
    assert.equal(canMergeReplacementSources(Object.fromEntries(PRESENTATION_STAGES.map(key => [key, true]))), true)
    assert.equal(allPresentationStagesSettled(Object.fromEntries(PRESENTATION_STAGES.map(key => [`${key}Settled`, true]))), true)
  })
  scene.metadata = { brokenStage: false, brokenStageSettled: true }
  await assert.rejects(waitForPresentationStage(scene, 'brokenStage', 5), /unavailable/)
  passed += 1; console.log('PASS failed prerequisite is terminal, not infinite LOADING')
  first.dispose(); second.dispose(); assets.dispose()
  console.log(`Presentation regression suite: ${passed} PASS. NullEngine structural evidence only; no Android visual/performance acceptance.`)
} finally {
  scene.dispose(); engine.dispose(); await unlink(generated)
}
