import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'assets', 'environment', 'p3')
const SOURCE_REPO = 'AetherRadar/operation-steel-tide'
const SOURCE_COMMIT = 'd10cac09c8c9063250e81b89a21faffcf7bfefe7'
const BASE = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/assets/models/quaternius_downtown_city`

const sources = {
  smallGltf: {
    filename: 'Building_Small_1.gltf',
    url: `${BASE}/Building_Small_1.gltf`,
    gitBlobSha1: '37eaa76383487c3ea11ac52d38c24242b917d0c7',
  },
  smallBin: {
    filename: 'Building_Small_1.bin',
    url: `${BASE}/Building_Small_1.bin`,
    gitBlobSha1: 'c91185b4907e9e8df46beb792ac857488ffdde73',
  },
  mediumGltf: {
    filename: 'Building_Medium_2_001.gltf',
    url: `${BASE}/Building_Medium_2_001.gltf`,
    gitBlobSha1: '392268fe925825bd876bff7904d11ed81dfc671e',
  },
  mediumBin: {
    filename: 'Building_Medium_2_001.bin',
    url: `${BASE}/Building_Medium_2_001.bin`,
    gitBlobSha1: '28cb721ec67dfc01f4a32f92b740fb01e7ecdde5',
  },
  license: {
    filename: 'QUATERNIUS_LICENSE.txt',
    url: `${BASE}/QUATERNIUS_LICENSE.txt`,
    gitBlobSha1: '51b8867f23046c046e63d2cef7098080ac1f4fff',
  },
}

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const gitBlobSha1 = bytes =>
  createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest('hex')

const fetchVerified = async source => {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(source.url, { redirect: 'follow' })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      const actual = gitBlobSha1(bytes)
      if (actual !== source.gitBlobSha1) {
        throw new Error(`blob mismatch for ${source.filename}: expected ${source.gitBlobSha1}, got ${actual}`)
      }
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
  if (key.includes('glass')) return [0.08, 0.14, 0.18, 0.58]
  if (key.includes('redbrick')) return [0.42, 0.20, 0.15, 1]
  if (key.includes('brick')) return [0.50, 0.29, 0.22, 1]
  if (key.includes('metalconcrete')) return [0.36, 0.39, 0.40, 1]
  if (key.includes('trim')) return [0.66, 0.61, 0.52, 1]
  if (key.includes('concrete')) return [0.55, 0.56, 0.55, 1]
  if (key.includes('interior')) return [0.13, 0.14, 0.15, 1]
  if (key.includes('asphalt')) return [0.16, 0.18, 0.20, 1]
  return [0.52, 0.47, 0.40, 1]
}

const makeMobileBuildingDerivative = (sourceBytes, binFilename) => {
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
    pbr.metallicFactor = 0
    pbr.roughnessFactor = String(material.name ?? '').toLowerCase().includes('glass') ? 0.24 : 0.74
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

const smallDerivative = makeMobileBuildingDerivative(fetched.smallGltf, sources.smallBin.filename)
const mediumDerivative = makeMobileBuildingDerivative(fetched.mediumGltf, sources.mediumBin.filename)

await writeFile(path.join(OUT, sources.smallGltf.filename), smallDerivative)
await writeFile(path.join(OUT, sources.mediumGltf.filename), mediumDerivative)
await writeFile(path.join(OUT, sources.smallBin.filename), fetched.smallBin)
await writeFile(path.join(OUT, sources.mediumBin.filename), fetched.mediumBin)
await writeFile(path.join(OUT, sources.license.filename), fetched.license)

const provenance = {
  status: 'P3_CANDIDATE_TECHNICAL_PROOF_NOT_RELEASE_CLEARED',
  purpose: 'Full authored building-shell quality-family proof for normal gameplay distance. Procedural masses remain collision/layout authority and fallback/LOD.',
  source: `${SOURCE_REPO}@${SOURCE_COMMIT}`,
  licenseEvidence: 'QUATERNIUS_LICENSE.txt — CC0 1.0 Universal / Public Domain Dedication',
  sources: Object.fromEntries(
    Object.entries(sources).map(([key, source]) => [
      key,
      {
        filename: source.filename,
        url: source.url,
        gitBlobSha1: source.gitBlobSha1,
        sourceSha256: sha256(fetched[key]),
      },
    ]),
  ),
  derivatives: {
    [sources.smallGltf.filename]: {
      sha256: sha256(smallDerivative),
      transformation: 'Preserved authored mesh topology and material slots; removed external texture dependencies; replaced them with mobile-safe PBR base factors. Original binary geometry retained unchanged.',
    },
    [sources.mediumGltf.filename]: {
      sha256: sha256(mediumDerivative),
      transformation: 'Preserved authored mesh topology and material slots; removed external texture dependencies; replaced them with mobile-safe PBR base factors. Original binary geometry retained unchanged.',
    },
  },
}

await writeFile(path.join(OUT, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`)
console.log(`P3 authored building-shell candidate prepared at ${path.relative(ROOT, OUT)}`)
