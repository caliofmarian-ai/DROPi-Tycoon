import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const base = path.resolve('public/assets/environment')
const shared = path.join(base, 'restored')
const repo = 'AetherRadar/operation-steel-tide'
const commit = 'd10cac09c8c9063250e81b89a21faffcf7bfefe7'
const sourcePath = 'assets/models/quaternius_downtown_city'
const prefix = `https://raw.githubusercontent.com/${repo}/${commit}/${sourcePath}/`
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')
const manifest = { status: 'CANDIDATE_NOT_RELEASE_CLEARED', inheritedLicense: 'Quaternius Downtown City MegaKit / existing pinned QUATERNIUS_LICENSE.txt', sourceCommit: `${repo}@${commit}`, textures: [], derivatives: [], omitted: [], maxTextureSide: 1024, maxUniqueTextures: 10 }
const cached = new Map()
const fetchBytes = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) })
  if (!response.ok) throw new Error(`Material restoration HTTP ${response.status}: ${url}`)
  return Buffer.from(await response.arrayBuffer())
}
await mkdir(shared, { recursive: true })
const texture = async filename => {
  if (cached.has(filename)) return cached.get(filename)
  if (!/^T_[A-Za-z0-9_]+\.png$/.test(filename)) { manifest.omitted.push({ filename, reason: 'UNSUPPORTED_IMAGE_IDENTITY' }); cached.set(filename, null); return null }
  // Reuse P2 atlases under the same URL, so repeated facades share one GPU texture.
  const existing = ['T_RedBrick_BaseColor.png', 'T_Trim_BaseColor.png', 'T_MetalConcrete_BaseColor.png'].includes(filename)
  let bytes, sha
  if (existing) {
    bytes = await readFile(path.join(base, 'p2', filename)); sha = blob(bytes)
  } else {
    if (manifest.textures.length >= manifest.maxUniqueTextures) { manifest.omitted.push({ filename, reason: 'UNIQUE_TEXTURE_BUDGET' }); cached.set(filename, null); return null }
    const url = `https://api.github.com/repos/${repo}/contents/${sourcePath}/${filename}?ref=${commit}`
    const metadata = JSON.parse((await fetchBytes(url)).toString('utf8'))
    if (metadata.type !== 'file' || metadata.path !== `${sourcePath}/${filename}` || !/^[a-f0-9]{40}$/.test(metadata.sha) || metadata.size > 8 * 1024 * 1024) throw new Error(`Invalid immutable texture metadata: ${filename}`)
    sha = metadata.sha; bytes = await fetchBytes(`${prefix}${filename}`)
    if (blob(bytes) !== sha || bytes.length !== metadata.size) throw new Error(`Texture blob mismatch: ${filename}`)
  }
  if (bytes.readUInt32BE(0) !== 0x89504e47) throw new Error(`Not a PNG: ${filename}`)
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20)
  if (Math.max(width, height) > manifest.maxTextureSide) { manifest.omitted.push({ filename, width, height, reason: 'TEXTURE_DIMENSION_BUDGET' }); cached.set(filename, null); return null }
  const uri = existing ? `/assets/environment/p2/${filename}` : `/assets/environment/restored/${filename}`
  if (!existing) await writeFile(path.join(shared, filename), bytes)
  manifest.textures.push({ filename, uri, width, height, sourceBlobSha1: sha, sha256: hash(bytes), source: `${prefix}${filename}`, reusedP2: existing })
  cached.set(filename, uri); return uri
}
for (const stage of ['p3', 'p4']) {
  const dir = path.join(base, stage)
  const provenance = JSON.parse(await readFile(path.join(dir, 'PROVENANCE.json'), 'utf8'))
  for (const source of Object.values(provenance.sources)) {
    if (!source.filename?.endsWith('.gltf') || !source.url?.startsWith(prefix)) continue
    const originalBytes = await fetchBytes(source.url)
    if (blob(originalBytes) !== source.gitBlobSha1) throw new Error(`Original glTF mismatch: ${source.filename}`)
    const original = JSON.parse(originalBytes.toString('utf8'))
    const filename = path.join(dir, source.filename)
    const before = await readFile(filename), model = JSON.parse(before.toString('utf8'))
    const images = [], textures = [], oldMaterials = new Map(original.materials.map(material => [material.name, material]))
    let restored = 0
    for (const material of model.materials) {
      const sourceMaterial = oldMaterials.get(material.name)
      const info = sourceMaterial?.pbrMetallicRoughness?.baseColorTexture
      const sourceTexture = info && original.textures?.[info.index]
      const sourceImage = sourceTexture && original.images?.[sourceTexture.source]
      if (!sourceImage?.uri) continue
      const name = decodeURIComponent(sourceImage.uri).split('/').at(-1)
      const uri = await texture(name)
      if (!uri) continue
      let imageIndex = images.findIndex(image => image.uri === uri)
      if (imageIndex < 0) { imageIndex = images.length; images.push({ uri, mimeType: 'image/png', name }) }
      const textureIndex = textures.length
      textures.push({ source: imageIndex, sampler: 0 })
      const pbr = material.pbrMetallicRoughness ??= {}
      pbr.baseColorTexture = { ...structuredClone(info), index: textureIndex }
      pbr.baseColorFactor = sourceMaterial.pbrMetallicRoughness.baseColorFactor ?? [1, 1, 1, 1]
      if (sourceMaterial.alphaMode) material.alphaMode = sourceMaterial.alphaMode
      if (sourceMaterial.alphaCutoff !== undefined) material.alphaCutoff = sourceMaterial.alphaCutoff
      // Glass/interior cutouts must preserve original transparency semantics.
      if (sourceMaterial.doubleSided !== undefined) material.doubleSided = sourceMaterial.doubleSided
      restored += 1
    }
    if (restored) {
      model.images = images; model.textures = textures
      model.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }]
      const after = Buffer.from(`${JSON.stringify(model, null, 2)}\n`)
      await writeFile(filename, after)
      const transformation = 'Restored verified original base-colour atlas references and UV texture transforms with shared <=1024px textures. Geometry, buffer, node hierarchy and material slots unchanged.'
      const previous = provenance.derivatives?.[source.filename]
      ;(provenance.derivatives ??= {})[source.filename] = { ...previous, sha256: hash(after), previousDerivativeSha256: hash(before), transformation, restoredMaterials: restored, finalTextureManifest: '../restored/PROVENANCE.json' }
      manifest.derivatives.push({ stage, filename: source.filename, sha256: hash(after), restoredMaterials: restored, materialCount: model.materials.length })
    }
  }
  await writeFile(path.join(dir, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`)
}
if (!manifest.derivatives.some(item => item.stage === 'p3') || !manifest.derivatives.some(item => item.stage === 'p4')) throw new Error('No real texture restoration for one of P3/P4; do not claim a material pass')
await writeFile(path.join(shared, 'PROVENANCE.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Restored ${manifest.derivatives.length} authored models and ${manifest.textures.length} shared atlas textures; ${manifest.omitted.length} explicit budget omissions. No Runway target acceptance.`)
