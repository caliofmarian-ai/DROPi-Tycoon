import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Downtown City MegaKit documents vertex-color-controlled wear in its custom
// engine shaders. glTF COLOR_0 is instead a base-color multiplier. Applying the
// source red wear channels as generic PBR tint made roads/curbs red or black.
// This bounded derivative uses neutral base-color/atlas presentation until the
// original custom wear shader has a separately validated portable implementation.
const root = path.resolve('public/assets/environment')
const files = [
  'p2/Brick_RedWhite_DoubleWindow.gltf', 'p2/DoorFrame_Trim.gltf',
  'p3/Building_Medium_2_001.gltf', 'p3/Building_Small_1.gltf',
  'p4/Prop_Bollard.gltf', 'p4/Prop_ManholeCover.gltf', 'p4/Sidewalk_Planter.gltf',
  'p4/Street_2Lane.gltf', 'p4/Street_4WayIntersection.gltf',
]
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const geometry = gltf => JSON.stringify({
  buffers: gltf.buffers, bufferViews: gltf.bufferViews, accessors: gltf.accessors,
  nodes: gltf.nodes, skins: gltf.skins, animations: gltf.animations,
  meshes: gltf.meshes.map(mesh => ({ ...mesh, primitives: mesh.primitives.map(primitive => {
    const attributes = { ...primitive.attributes }; delete attributes.COLOR_0
    const { extras, ...rest } = primitive
    return { ...rest, attributes }
  }) })),
})
const neutralizeWear = source => {
  const gltf = structuredClone(source), removed = []
  for (const [meshIndex, mesh] of (gltf.meshes ?? []).entries()) for (const [primitiveIndex, primitive] of mesh.primitives.entries()) {
    const accessor = primitive.attributes?.COLOR_0
    const material = gltf.materials?.[primitive.material]
    if (accessor === undefined || !material?.name?.startsWith('MI_')) continue
    if (primitive.attributes.JOINTS_0 !== undefined || gltf.skins?.length) throw new Error('City wear adapter must not modify skinned characters')
    if (!gltf.accessors?.[accessor]) throw new Error('Missing source wear accessor')
    removed.push({ meshIndex, primitiveIndex, material: material.name, sourceColorAccessor: accessor })
    delete primitive.attributes.COLOR_0
    primitive.extras = { ...(primitive.extras ?? {}), dropiSourceWearAccessor: accessor, dropiWearMode: 'NEUTRAL_BASE_UNTIL_CUSTOM_SHADER_VALIDATED' }
  }
  assert.equal(geometry(gltf), geometry(source), 'Wear conversion changed geometry, UVs, buffers, nodes or animation')
  assert.deepEqual(gltf.materials, source.materials, 'Wear conversion must retain restored materials and texture bindings')
  return { gltf, removed }
}

// Negative and idempotence checks protect unrelated vertex-colored assets.
const fixture = {
  accessors: [{}], materials: [{ name: 'MI_Asphalt', pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }, { name: 'CharacterJacket' }],
  meshes: [{ primitives: [
    { attributes: { POSITION: 1, NORMAL: 2, TEXCOORD_0: 3, COLOR_0: 0 }, material: 0 },
    { attributes: { POSITION: 4, COLOR_0: 0 }, material: 1 },
  ] }],
}
const adapted = neutralizeWear(fixture)
assert.equal(adapted.removed.length, 1)
assert.equal(adapted.gltf.meshes[0].primitives[0].attributes.COLOR_0, undefined)
assert.equal(adapted.gltf.meshes[0].primitives[1].attributes.COLOR_0, 0)
assert.equal(fixture.meshes[0].primitives[0].attributes.COLOR_0, 0, 'Input must remain unchanged')
assert.equal(neutralizeWear(adapted.gltf).removed.length, 0)
const skinned = structuredClone(fixture); skinned.meshes[0].primitives[0].attributes.JOINTS_0 = 5
assert.throws(() => neutralizeWear(skinned), /skinned/)
console.log('City wear adapter: neutral tint, unrelated-color preservation, non-mutation, idempotence and skin exclusion checks PASS')

const lineage = []
let removedTotal = 0
for (const filename of files) {
  const output = path.join(root, filename), before = await readFile(output)
  const source = JSON.parse(before.toString('utf8'))
  const result = neutralizeWear(source)
  const bytes = Buffer.from(`${JSON.stringify(result.gltf, null, 2)}\n`)
  await writeFile(output, bytes)
  const verified = JSON.parse(await readFile(output, 'utf8'))
  assert.equal(neutralizeWear(verified).removed.length, 0, `${filename}: generic tint still consumes custom wear channels`)
  assert.equal(geometry(verified), geometry(source), `${filename}: geometry regression`)
  lineage.push({ file: filename, previousStageSha256: sha256(before), finalSha256: sha256(bytes), removedGenericColorBindings: result.removed })
  removedTotal += result.removed.length
  console.log(`${filename}: ${result.removed.length} custom-wear COLOR_0 bindings removed from generic PBR tint; geometry/UV/materials preserved`)
}
assert.ok(lineage.filter(item => item.file.startsWith('p4/Street_')).every(item => item.removedGenericColorBindings.length >= 1), 'Expected immutable street wear channels were not found')
const out = path.join(root, 'wear-adapter')
await mkdir(out, { recursive: true })
await writeFile(path.join(out, 'PROVENANCE.json'), `${JSON.stringify({
  status: 'CANDIDATE_NOT_RELEASE_CLEARED', stage: 'FINAL_CITY_WEAR_ADAPTER_AFTER_RESTORED_TEXTURES',
  sourcePack: 'Quaternius Downtown City MegaKit',
  sourceShaderEvidence: 'https://quaternius.com/packs/downtowncitymegakit.html',
  gltfColorSemantics: 'https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html',
  transformation: 'Remove COLOR_0 binding only from MI_* static city primitives in the explicit nine-file allowlist. Preserve source binary/accessors as provenance and all geometry, UVs and restored materials. Generic vertex tint is neutral; original custom wear shader is not claimed implemented.',
  exclusions: 'No GLB vehicle/tree or character changes. No simulation geometry, navigation or collision changes.',
  files: lineage,
}, null, 2)}\n`)
console.log(`Final city wear derivative verified: ${files.length} files, ${removedTotal} generic tint bindings neutralized. Rendered quality and Android performance remain separate gates.`)
