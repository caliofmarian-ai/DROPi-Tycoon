import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'assets', 'environment', 'p4')
const SOURCE_REPO = 'AetherRadar/operation-steel-tide'
const SOURCE_COMMIT = 'd10cac09c8c9063250e81b89a21faffcf7bfefe7'
const BASE = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/assets/models/quaternius_downtown_city`

const sources = {
  streetGltf: { filename: 'Street_2Lane.gltf', url: `${BASE}/Street_2Lane.gltf`, gitBlobSha1: '66f621653d48c9b9f5289e15b3292681561cebcd' },
  streetBin: { filename: 'Street_2Lane.bin', url: `${BASE}/Street_2Lane.bin`, gitBlobSha1: '4aa0dab53d868faf12588a56776542148ddeb102' },
  intersectionGltf: { filename: 'Street_4WayIntersection.gltf', url: `${BASE}/Street_4WayIntersection.gltf`, gitBlobSha1: 'aa1fc83136794e2bc45ec45abc8267753ce76c2e' },
  intersectionBin: { filename: 'Street_4WayIntersection.bin', url: `${BASE}/Street_4WayIntersection.bin`, gitBlobSha1: 'b25e2ed05080c7c7ded1fbdf178a44991176f994' },
  planterGltf: { filename: 'Sidewalk_Planter.gltf', url: `${BASE}/Sidewalk_Planter.gltf`, gitBlobSha1: 'c87a8455061f1db03a59fe668e59f8470fcb866f' },
  planterBin: { filename: 'Sidewalk_Planter.bin', url: `${BASE}/Sidewalk_Planter.bin`, gitBlobSha1: '114150a7385fd45f57b9ea6e6b7fb5c03efd5003' },
  bollardGltf: { filename: 'Prop_Bollard.gltf', url: `${BASE}/Prop_Bollard.gltf`, gitBlobSha1: '03fc7c88d7791dca3610c47ab6040537b061530a' },
  bollardBin: { filename: 'Prop_Bollard.bin', url: `${BASE}/Prop_Bollard.bin`, gitBlobSha1: '2495b3c64da0f09a0b4e93f5ac8e1920b0c0a6f6' },
  manholeGltf: { filename: 'Prop_ManholeCover.gltf', url: `${BASE}/Prop_ManholeCover.gltf`, gitBlobSha1: '3d12c63ab4afbc0cdce2464d4f224e30af116f42' },
  manholeBin: { filename: 'Prop_ManholeCover.bin', url: `${BASE}/Prop_ManholeCover.bin`, gitBlobSha1: '0c6bc813a13398dc518232baf2de12ae7fd63929' },
  license: { filename: 'QUATERNIUS_LICENSE.txt', url: `${BASE}/QUATERNIUS_LICENSE.txt`, gitBlobSha1: '51b8867f23046c046e63d2cef7098080ac1f4fff' },
}

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const gitBlobSha1 = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')

const fetchVerified = async source => {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(source.url, { redirect: 'follow' })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      const actual = gitBlobSha1(bytes)
      if (actual !== source.gitBlobSha1) throw new Error(`blob mismatch for ${source.filename}: expected ${source.gitBlobSha1}, got ${actual}`)
      return bytes
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 700))
    }
  }
  throw lastError
}

const colourForMaterial = name => {
  const key = String(name ?? '').toLowerCase()
  if (key.includes('asphalt')) return [0.115, 0.125, 0.135, 1]
  if (key.includes('decal') || key.includes('line')) return [0.78, 0.76, 0.68, 1]
  if (key.includes('concrete')) return [0.50, 0.51, 0.49, 1]
  if (key.includes('metal')) return [0.24, 0.27, 0.28, 1]
  if (key.includes('dirt')) return [0.30, 0.25, 0.20, 1]
  if (key.includes('trim')) return [0.58, 0.55, 0.49, 1]
  if (key.includes('glass')) return [0.12, 0.18, 0.20, 0.62]
  return [0.43, 0.43, 0.40, 1]
}

const makeMobileDerivative = (sourceBytes, binFilename) => {
  const gltf = JSON.parse(sourceBytes.toString('utf8'))
  if (!Array.isArray(gltf.buffers) || gltf.buffers.length === 0) throw new Error('Expected glTF buffer metadata')
  gltf.buffers[0].uri = binFilename
  delete gltf.images
  delete gltf.textures
  delete gltf.samplers
  for (const material of gltf.materials ?? []) {
    delete material.normalTexture
    delete material.occlusionTexture
    delete material.emissiveTexture
    delete material.emissiveFactor
    const pbr = material.pbrMetallicRoughness ?? (material.pbrMetallicRoughness = {})
    delete pbr.baseColorTexture
    delete pbr.metallicRoughnessTexture
    pbr.baseColorFactor = colourForMaterial(material.name)
    pbr.metallicFactor = String(material.name ?? '').toLowerCase().includes('metal') ? 0.18 : 0
    pbr.roughnessFactor = String(material.name ?? '').toLowerCase().includes('asphalt') ? 0.94 : 0.72
    if (String(material.name ?? '').toLowerCase().includes('glass')) {
      material.alphaMode = 'BLEND'
      material.doubleSided = true
    }
  }
  return Buffer.from(`${JSON.stringify(gltf, null, 2)}\n`, 'utf8')
}

await mkdir(OUT, { recursive: true })
const fetched = {}
for (const [key, source] of Object.entries(sources)) fetched[key] = await fetchVerified(source)

const derivativePairs = [
  ['streetGltf', 'streetBin'],
  ['intersectionGltf', 'intersectionBin'],
  ['planterGltf', 'planterBin'],
  ['bollardGltf', 'bollardBin'],
  ['manholeGltf', 'manholeBin'],
]
const derivatives = {}
for (const [gltfKey, binKey] of derivativePairs) {
  const bytes = makeMobileDerivative(fetched[gltfKey], sources[binKey].filename)
  derivatives[sources[gltfKey].filename] = bytes
  await writeFile(path.join(OUT, sources[gltfKey].filename), bytes)
  await writeFile(path.join(OUT, sources[binKey].filename), fetched[binKey])
}
await writeFile(path.join(OUT, sources.license.filename), fetched.license)

const provenance = {
  status: 'P4_CANDIDATE_TECHNICAL_PROOF_NOT_RELEASE_CLEARED',
  purpose: 'Authored street-surface and street-furniture presentation layer for the Babylon Brăila visual evaluation. Existing procedural roads/sidewalks remain collision and navigation authority.',
  source: `${SOURCE_REPO}@${SOURCE_COMMIT}`,
  licenseEvidence: 'QUATERNIUS_LICENSE.txt — CC0 1.0 Universal / Public Domain Dedication',
  sources: Object.fromEntries(Object.entries(sources).map(([key, source]) => [key, {
    filename: source.filename,
    url: source.url,
    gitBlobSha1: source.gitBlobSha1,
    sourceSha256: sha256(fetched[key]),
  }])),
  derivatives: Object.fromEntries(Object.entries(derivatives).map(([filename, bytes]) => [filename, {
    sha256: sha256(bytes),
    transformation: 'Preserved authored geometry/material slots; removed external texture dependencies; applied mobile-safe PBR factors; original binary geometry retained unchanged.',
  }])),
}

await writeFile(path.join(OUT, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`)
console.log(`P4 authored street-layer candidate prepared at ${path.relative(ROOT, OUT)}`)
