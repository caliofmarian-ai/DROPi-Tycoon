import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'assets', 'environment', 'p2')
const SOURCE_REPO = 'AetherRadar/operation-steel-tide'
const SOURCE_COMMIT = 'd10cac09c8c9063250e81b89a21faffcf7bfefe7'
const BASE = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/assets/models/quaternius_downtown_city`

const sources = {
  windowGltf: {
    filename: 'Brick_RedWhite_DoubleWindow.gltf',
    url: `${BASE}/Brick_RedWhite_DoubleWindow.gltf`,
    gitBlobSha1: 'ee2f8fba9b09a662d8b8fe3eddf0a367bd1cedf9',
  },
  windowBin: {
    filename: 'Brick_RedWhite_DoubleWindow.bin',
    url: `${BASE}/Brick_RedWhite_DoubleWindow.bin`,
    gitBlobSha1: '3b2139ccd0e0fc43deb06e7f9ce871d1ea5d8680',
  },
  doorGltf: {
    filename: 'DoorFrame_Trim.gltf',
    url: `${BASE}/DoorFrame_Trim.gltf`,
    gitBlobSha1: 'e45bfdcd71c3cdcefc9ee2fef37f229c839d9c17',
  },
  doorBin: {
    filename: 'DoorFrame_Trim.bin',
    url: `${BASE}/DoorFrame_Trim.bin`,
    gitBlobSha1: '7e4205bf952e2c2398a06485ef5bbac378e822fb',
  },
  redBrick: {
    filename: 'T_RedBrick_BaseColor.png',
    url: `${BASE}/T_RedBrick_BaseColor.png`,
    gitBlobSha1: 'f91d88f2c8b86b0e00a43ae5efc939692da07b2c',
  },
  trim: {
    filename: 'T_Trim_BaseColor.png',
    url: `${BASE}/T_Trim_BaseColor.png`,
    gitBlobSha1: '016fe4e90ebcecf2e4ba13f8e87d355b4dda912e',
  },
  metalConcrete: {
    filename: 'T_MetalConcrete_BaseColor.png',
    url: `${BASE}/T_MetalConcrete_BaseColor.png`,
    gitBlobSha1: 'de6296b66292476ac12c4ae46173cf6841660076',
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
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 600))
    }
  }
  throw lastError
}

const makeMobileFacadeDerivative = sourceBytes => {
  const gltf = JSON.parse(sourceBytes.toString('utf8'))

  gltf.images = [
    { mimeType: 'image/png', name: 'T_RedBrick_BaseColor', uri: sources.redBrick.filename },
    { mimeType: 'image/png', name: 'T_Trim_BaseColor', uri: sources.trim.filename },
    { mimeType: 'image/png', name: 'T_MetalConcrete_BaseColor', uri: sources.metalConcrete.filename },
  ]
  gltf.textures = [
    { sampler: 0, source: 0 },
    { sampler: 0, source: 1 },
    { sampler: 0, source: 2 },
  ]

  for (const material of gltf.materials ?? []) {
    delete material.normalTexture
    const pbr = material.pbrMetallicRoughness ?? (material.pbrMetallicRoughness = {})
    delete pbr.metallicRoughnessTexture
    pbr.metallicFactor = 0
    pbr.roughnessFactor = material.name === 'MI_Glass' ? 0.28 : 0.76

    if (material.name === 'MI_Glass') {
      delete pbr.baseColorTexture
      continue
    }
    if (material.name?.includes('MetalConcrete')) pbr.baseColorTexture = { index: 2 }
    else if (material.name?.includes('Trim')) pbr.baseColorTexture = { index: 1 }
    else pbr.baseColorTexture = { index: 0 }
  }

  return Buffer.from(`${JSON.stringify(gltf, null, 2)}\n`, 'utf8')
}

await mkdir(OUT, { recursive: true })
const fetched = {}
for (const [key, source] of Object.entries(sources)) fetched[key] = await fetchVerified(source)

const windowDerivative = makeMobileFacadeDerivative(fetched.windowGltf)
const doorDerivative = makeMobileFacadeDerivative(fetched.doorGltf)

await writeFile(path.join(OUT, sources.windowGltf.filename), windowDerivative)
await writeFile(path.join(OUT, sources.doorGltf.filename), doorDerivative)

for (const key of ['windowBin', 'doorBin', 'redBrick', 'trim', 'metalConcrete', 'license']) {
  await writeFile(path.join(OUT, sources[key].filename), fetched[key])
}

const provenance = {
  status: 'P2_CANDIDATE_TECHNICAL_PROOF_NOT_RELEASE_CLEARED',
  purpose: 'Authored modular facade geometry for the Babylon Brăila visual evaluation; procedural building masses remain collision/layout authority and fallback/LOD.',
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
    [sources.windowGltf.filename]: {
      sha256: sha256(windowDerivative),
      transformation: 'Retained authored geometry/material slots; removed normal/ORM map dependencies; retained three base-colour textures for Android evaluation.',
    },
    [sources.doorGltf.filename]: {
      sha256: sha256(doorDerivative),
      transformation: 'Retained authored geometry/material slots; removed normal/ORM map dependencies; retained three base-colour textures for Android evaluation.',
    },
  },
}

await writeFile(path.join(OUT, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`)
console.log(`P2 authored environment candidate prepared at ${path.relative(ROOT, OUT)}`)
