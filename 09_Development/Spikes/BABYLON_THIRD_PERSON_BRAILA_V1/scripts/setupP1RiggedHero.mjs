import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'assets', 'characters', 'p1')
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const npmPackages = [
  {
    name: '@babylonjs/loaders',
    version: '9.26.0',
    expectedIntegrity: 'sha512-IgfmNNspPu7CxCG0C8vvN32M0fc3we2mlwRzYMdYrTgNFFQRO+CdP3HF68sSlaZ0P5hV9gS42HBX+3kUXAAfrQ==',
  },
  {
    name: 'babylonjs-gltf2interface',
    version: '9.26.0',
    expectedIntegrity: 'sha512-6fgnSAXKxAcWn8U2tY8mtTcqv8zrMIpUvek/mznUTmyT2Qdhnj3sUP8p8JcDUWf74C5/zLkpieKN6R47pcr7gw==',
  },
]

const sources = {
  characterGltf: {
    filename: 'Regular_Male_FullBody.gltf',
    url: 'https://raw.githubusercontent.com/dustinc555/mygame/6f12ffb2f924af86d910ade13e6e2ba3df8cd3df/assets/vendor/quaternius/universal_base_characters/base_characters/Regular_Male_FullBody.gltf',
    gitBlobSha1: '5526994d439be4af9b99d283e89003bf0aeb0684',
  },
  characterBin: {
    filename: 'Regular_Male_FullBody.bin',
    url: 'https://raw.githubusercontent.com/dustinc555/mygame/6f12ffb2f924af86d910ade13e6e2ba3df8cd3df/assets/vendor/quaternius/universal_base_characters/base_characters/Regular_Male_FullBody.bin',
    gitBlobSha1: 'a29b55fa45af6f1d53a25c51b01d918f99f42338',
  },
  hairBase: {
    filename: 'T_Hair_1_BaseColor.png',
    url: 'https://raw.githubusercontent.com/dustinc555/mygame/6f12ffb2f924af86d910ade13e6e2ba3df8cd3df/assets/vendor/quaternius/universal_base_characters/base_characters/T_Hair_1_BaseColor.png',
    gitBlobSha1: 'c398ca7d10a12d0a1c3fb19d459280bde868594b',
  },
  eyeBase: {
    filename: 'T_Eye_Brown.png',
    url: 'https://raw.githubusercontent.com/dustinc555/mygame/6f12ffb2f924af86d910ade13e6e2ba3df8cd3df/assets/vendor/quaternius/universal_base_characters/base_characters/T_Eye_Brown.png',
    gitBlobSha1: '0d037febc2789c86fdb40d7ccd4c0a1d0591cfbe',
  },
  bodyBase: {
    filename: 'T_Regular_Male_Dark_BaseColor_png.png',
    url: 'https://raw.githubusercontent.com/dustinc555/mygame/6f12ffb2f924af86d910ade13e6e2ba3df8cd3df/assets/vendor/quaternius/universal_base_characters/base_characters/T_Regular_Male_Dark_BaseColor_png.png',
    gitBlobSha1: '4520f4cc2bef13ff3cde709aa07d4aa6e18a7877',
  },
  animations: {
    filename: 'universal-animation-library.glb',
    url: 'https://raw.githubusercontent.com/Seyamalam/blood-league-kickoff/aa02a4e6d8337a0604d2da131bcbbeb1f01badf0/public/assets/vendor/quaternius/universal-animation-library.glb',
    gitBlobSha1: '4fccf561b9b2ef73f611efe21981ef8739080065',
  },
  characterLicense: {
    filename: 'LICENSE-BASE-CHARACTERS.txt',
    url: 'https://raw.githubusercontent.com/Seyamalam/blood-league-kickoff/aa02a4e6d8337a0604d2da131bcbbeb1f01badf0/public/assets/vendor/quaternius/LICENSE-BASE-CHARACTERS.txt',
    gitBlobSha1: '4b37c2d1fa14dfdc7033394635b31972fa091b77',
  },
  animationLicense: {
    filename: 'LICENSE-ANIMATIONS.txt',
    url: 'https://raw.githubusercontent.com/Seyamalam/blood-league-kickoff/aa02a4e6d8337a0604d2da131bcbbeb1f01badf0/public/assets/vendor/quaternius/LICENSE-ANIMATIONS.txt',
    gitBlobSha1: '82f86ca5040ab545e31a904133747336cbdd0576',
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
      const actualBlob = gitBlobSha1(bytes)
      if (actualBlob !== source.gitBlobSha1) {
        throw new Error(`blob mismatch for ${source.filename}: ${actualBlob}`)
      }
      return bytes
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 600))
    }
  }
  throw lastError
}

const installPinnedBabylonLoader = async () => {
  execFileSync(
    npmCommand,
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--no-save',
      '--package-lock=false',
      ...npmPackages.map(pkg => `${pkg.name}@${pkg.version}`),
    ],
    { cwd: ROOT, stdio: 'inherit' },
  )

  for (const pkg of npmPackages) {
    const packageJsonPath = path.join(ROOT, 'node_modules', ...pkg.name.split('/'), 'package.json')
    const installed = JSON.parse(await readFile(packageJsonPath, 'utf8'))
    if (installed.version !== pkg.version) {
      throw new Error(`Expected ${pkg.name}@${pkg.version}, installed ${installed.version}`)
    }
  }
}

const makeMobileCharacterDerivative = sourceBytes => {
  const gltf = JSON.parse(sourceBytes.toString('utf8'))

  // Keep only the three base-colour images needed to preserve a recognisable
  // human character. Large normal/roughness maps are deliberately excluded
  // from this first Android proof and can only return after measured budgets.
  gltf.images = [
    { mimeType: 'image/png', name: 'T_Hair_1_BaseColor', uri: sources.hairBase.filename },
    { mimeType: 'image/png', name: 'T_Eye_Brown', uri: sources.eyeBase.filename },
    { mimeType: 'image/png', name: 'T_Regular_Male_Dark_BaseColor', uri: sources.bodyBase.filename },
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
    if (material.name === 'MI_Hair_1') {
      pbr.baseColorTexture = { index: 0 }
      pbr.roughnessFactor = 0.78
    } else if (material.name === 'MI_Eyes') {
      pbr.baseColorTexture = { index: 1 }
      pbr.roughnessFactor = 0.34
    } else {
      pbr.baseColorTexture = { index: 2 }
      pbr.roughnessFactor = 0.72
    }
  }

  return Buffer.from(`${JSON.stringify(gltf, null, 2)}\n`, 'utf8')
}

await mkdir(OUT, { recursive: true })
await installPinnedBabylonLoader()

const fetched = {}
for (const [key, source] of Object.entries(sources)) fetched[key] = await fetchVerified(source)

const derivativeGltf = makeMobileCharacterDerivative(fetched.characterGltf)
await writeFile(path.join(OUT, sources.characterGltf.filename), derivativeGltf)

for (const key of [
  'characterBin',
  'hairBase',
  'eyeBase',
  'bodyBase',
  'animations',
  'characterLicense',
  'animationLicense',
]) {
  await writeFile(path.join(OUT, sources[key].filename), fetched[key])
}

const provenance = {
  status: 'P1_CANDIDATE_TECHNICAL_PROOF_NOT_RELEASE_CLEARED',
  purpose: 'Visible rigged hero replacement only; authoritative hero movement/collision remains in DROPi runtime.',
  sourceCommits: {
    universalBaseCharactersMirror: 'dustinc555/mygame@6f12ffb2f924af86d910ade13e6e2ba3df8cd3df',
    animationDerivativeMirror: 'Seyamalam/blood-league-kickoff@aa02a4e6d8337a0604d2da131bcbbeb1f01badf0',
  },
  npmRuntime: npmPackages,
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
    [sources.characterGltf.filename]: {
      sha256: sha256(derivativeGltf),
      transformation: 'Removed mobile-expensive normal/roughness image dependencies; retained hair/eye/body base-colour maps; preserved rig, skin, geometry and node identities.',
    },
  },
}
await writeFile(path.join(OUT, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`)

console.log(`P1 rigged hero candidate prepared at ${path.relative(ROOT, OUT)}`)
