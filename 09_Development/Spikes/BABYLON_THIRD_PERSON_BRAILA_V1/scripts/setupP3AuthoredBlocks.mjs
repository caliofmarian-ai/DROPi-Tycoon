import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'assets', 'environment', 'p3')

const CITY_SOURCE_REPO = 'AetherRadar/operation-steel-tide'
const CITY_SOURCE_COMMIT = 'd10cac09c8c9063250e81b89a21faffcf7bfefe7'
const CITY_BASE = `https://raw.githubusercontent.com/${CITY_SOURCE_REPO}/${CITY_SOURCE_COMMIT}/assets/models/quaternius_downtown_city`

const LIFE_SOURCE_REPO = 'RRG314/WorldExplorer3D'
const LIFE_SOURCE_COMMIT = 'b5a6a32448fcaa7c5e079ccb78d9d6030de29a00'
const LIFE_BASE = `https://raw.githubusercontent.com/${LIFE_SOURCE_REPO}/${LIFE_SOURCE_COMMIT}/app/assets/models`

const sources = {
  smallGltf: {
    filename: 'Building_Small_1.gltf',
    url: `${CITY_BASE}/Building_Small_1.gltf`,
    gitBlobSha1: '37eaa76383487c3ea11ac52d38c24242b917d0c7',
  },
  smallBin: {
    filename: 'Building_Small_1.bin',
    url: `${CITY_BASE}/Building_Small_1.bin`,
    gitBlobSha1: 'c91185b4907e9e8df46beb792ac857488ffdde73',
  },
  mediumGltf: {
    filename: 'Building_Medium_2_001.gltf',
    url: `${CITY_BASE}/Building_Medium_2_001.gltf`,
    gitBlobSha1: '392268fe925825bd876bff7904d11ed81dfc671e',
  },
  mediumBin: {
    filename: 'Building_Medium_2_001.bin',
    url: `${CITY_BASE}/Building_Medium_2_001.bin`,
    gitBlobSha1: '28cb721ec67dfc01f4a32f92b740fb01e7ecdde5',
  },
  cityLicense: {
    filename: 'QUATERNIUS_LICENSE.txt',
    url: `${CITY_BASE}/QUATERNIUS_LICENSE.txt`,
    gitBlobSha1: '51b8867f23046c046e63d2cef7098080ac1f4fff',
  },
  compactCar: {
    filename: 'compact-hatchback-v1.glb',
    url: `${LIFE_BASE}/vehicles/traffic/compact-hatchback-v1.glb`,
    gitBlobSha1: 'e9fae95ff3eced9fc7f8d961f504bbedbbfdc636',
  },
  sedanCar: {
    filename: 'four-door-sedan-v1.glb',
    url: `${LIFE_BASE}/vehicles/traffic/four-door-sedan-v1.glb`,
    gitBlobSha1: '8a7cace914f93663e773a1e5ff0717f0e0aa737e',
  },
  broadleafTree: {
    filename: 'broadleaf-lod.glb',
    url: `${LIFE_BASE}/nature/broadleaf-lod.glb`,
    gitBlobSha1: 'd123d5676664002e789cd9d553c03c3bcd644384',
  },
  vehicleAttribution: {
    filename: 'VEHICLE_ATTRIBUTION.md',
    url: `${LIFE_BASE}/ATTRIBUTION.md`,
    gitBlobSha1: 'bdbe30a0bc943c8b7f5162620fafb5f8fc712023',
  },
  natureManifest: {
    filename: 'NATURE_ASSET_MANIFEST.json',
    url: `${LIFE_BASE}/nature/asset-manifest.json`,
    gitBlobSha1: 'f3ac4a439abed18347b7f2a6bd346f0635bd851e',
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

for (const key of [
  'smallBin',
  'mediumBin',
  'cityLicense',
  'compactCar',
  'sedanCar',
  'broadleafTree',
  'vehicleAttribution',
  'natureManifest',
]) {
  await writeFile(path.join(OUT, sources[key].filename), fetched[key])
}

const provenance = {
  status: 'P3_CANDIDATE_TECHNICAL_PROOF_NOT_RELEASE_CLEARED',
  purpose: 'Authored building shells plus a bounded authored street-life family (vehicles and vegetation) for normal gameplay-distance quality proof. Procedural simulation/collision roots remain authoritative.',
  sourceCommits: {
    cityKitMirror: `${CITY_SOURCE_REPO}@${CITY_SOURCE_COMMIT}`,
    streetLifeMirror: `${LIFE_SOURCE_REPO}@${LIFE_SOURCE_COMMIT}`,
  },
  licenseEvidence: {
    cityKit: 'QUATERNIUS_LICENSE.txt — CC0 1.0 Universal / Public Domain Dedication',
    vehicles: 'VEHICLE_ATTRIBUTION.md — Quaternius Cars Pack compact hatchback and four-door sedan are CC0 1.0',
    nature: 'NATURE_ASSET_MANIFEST.json — Quaternius Stylized Nature MegaKit, CC0-1.0',
  },
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
    [sources.compactCar.filename]: {
      sha256: sha256(fetched.compactCar),
      transformation: 'Copied byte-for-byte from immutable pinned mirror; presentation-only vehicle mesh.',
    },
    [sources.sedanCar.filename]: {
      sha256: sha256(fetched.sedanCar),
      transformation: 'Copied byte-for-byte from immutable pinned mirror; presentation-only vehicle mesh.',
    },
    [sources.broadleafTree.filename]: {
      sha256: sha256(fetched.broadleafTree),
      transformation: 'Copied byte-for-byte from immutable pinned mirror; bounded mobile LOD vegetation mesh.',
    },
  },
}

await writeFile(path.join(OUT, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`)
console.log(`P3 authored city/street-life candidate prepared at ${path.relative(ROOT, OUT)}`)
