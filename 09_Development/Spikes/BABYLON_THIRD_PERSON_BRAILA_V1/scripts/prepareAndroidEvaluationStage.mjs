import { createHash } from 'node:crypto'
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CLASSIFICATION = 'NON-AUTHORITATIVE TECHNICAL SPIKE — NOT AUTHENTIC GAMEPLAY'
const EVALUATION_NAME = 'DROPi Babylon Eval'
const EVALUATION_PACKAGE = 'com.dropi.tycoon.babyloneval'
const EVALUATION_SCHEME = 'dropitycoon-babyloneval'
const EVALUATION_PORT = 17832

const [mobileSourceArgument, spikeDistArgument, stageRootArgument] = process.argv.slice(2)

if (!mobileSourceArgument || !spikeDistArgument || !stageRootArgument) {
  throw new Error(
    'Usage: node prepareAndroidEvaluationStage.mjs <game-mobile> <spike-dist> <new-stage-root>',
  )
}

const mobileSource = path.resolve(mobileSourceArgument)
const spikeDist = path.resolve(spikeDistArgument)
const stageRoot = path.resolve(stageRootArgument)
const stageMobile = path.join(stageRoot, 'game-mobile')
const stageWebDist = path.join(stageRoot, 'game-web', 'dist')

if (!path.basename(stageRoot).startsWith('dropi-babylon-android-evaluation-')) {
  throw new Error('The new stage directory must use the dropi-babylon-android-evaluation-* prefix.')
}

const headSha = process.env.DROPI_HEAD_SHA?.trim()
const androidVersionCode = Number.parseInt(
  process.env.DROPI_ANDROID_VERSION_CODE?.trim() ?? '',
  10,
)

if (!/^[0-9a-f]{40}$/.test(headSha ?? '')) {
  throw new Error('DROPI_HEAD_SHA must be a lowercase 40-character Git SHA.')
}
if (!Number.isSafeInteger(androidVersionCode) || androidVersionCode < 1) {
  throw new Error('DROPI_ANDROID_VERSION_CODE must be a positive integer.')
}

const runtimeManifest = JSON.parse(
  await readFile(path.join(spikeDist, 'dropi-runtime-manifest.json'), 'utf8'),
)

if (
  runtimeManifest.classification !== CLASSIFICATION ||
  runtimeManifest.runtime !== 'babylon-third-person-braila-evaluation' ||
  runtimeManifest.renderer !== 'Babylon.js 9.26.0' ||
  runtimeManifest.productionEligible !== false ||
  runtimeManifest.authenticGameplay !== false
) {
  throw new Error('The spike runtime manifest has an invalid truth classification.')
}
if (runtimeManifest.source?.headSha !== headSha) {
  throw new Error('The spike runtime manifest does not match DROPI_HEAD_SHA.')
}
if (runtimeManifest.source?.checkoutSha !== headSha) {
  throw new Error('The spike runtime was not built from the exact PR head checkout.')
}

const collectRuntimeFiles = async directory => {
  const output = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      output.push(...await collectRuntimeFiles(absolutePath))
    } else if (entry.name !== 'dropi-runtime-manifest.json') {
      output.push(absolutePath)
    }
  }

  return output
}

const runtimeFiles = (await collectRuntimeFiles(spikeDist))
  .sort((left, right) => left.localeCompare(right))
const runtimeDigest = createHash('sha256')

for (const absolutePath of runtimeFiles) {
  const relativePath = path.relative(spikeDist, absolutePath).split(path.sep).join('/')
  runtimeDigest.update(relativePath)
  runtimeDigest.update('\0')
  runtimeDigest.update(await readFile(absolutePath))
  runtimeDigest.update('\0')
}

if (
  runtimeFiles.length !== runtimeManifest.fileCount ||
  runtimeDigest.digest('hex') !== runtimeManifest.bundleSha256
) {
  throw new Error('The downloaded static spike does not match its bundle manifest.')
}

await mkdir(stageRoot)
await cp(mobileSource, stageMobile, {
  recursive: true,
  filter: source => !['node_modules', '.expo', 'android', 'ios'].includes(path.basename(source)),
})
await mkdir(stageWebDist, { recursive: true })
await cp(spikeDist, stageWebDist, { recursive: true })

const appJsonPath = path.join(stageMobile, 'app.json')
const appJson = JSON.parse(await readFile(appJsonPath, 'utf8'))
const expo = appJson.expo

if (!expo || expo.android?.package !== 'com.dropi.tycoon') {
  throw new Error('Unexpected production mobile app configuration; refusing evaluation overlay.')
}

expo.name = EVALUATION_NAME
expo.scheme = EVALUATION_SCHEME
expo.android = {
  ...expo.android,
  package: EVALUATION_PACKAGE,
  versionCode: androidVersionCode,
}

if (expo.extra?.eas) {
  delete expo.extra.eas
  if (Object.keys(expo.extra).length === 0) delete expo.extra
}

await writeFile(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`, 'utf8')

const replaceExactly = async (relativePath, replacements) => {
  const absolutePath = path.join(stageMobile, relativePath)
  let source = await readFile(absolutePath, 'utf8')

  for (const [before, after] of replacements) {
    const occurrences = source.split(before).length - 1
    if (occurrences !== 1) {
      throw new Error(`${relativePath}: expected one occurrence of ${JSON.stringify(before)}, found ${occurrences}.`)
    }
    source = source.replace(before, after)
  }

  await writeFile(absolutePath, source, 'utf8')
}

await replaceExactly('src/bundledRuntime.ts', [
  ['BUNDLED_RUNTIME_PORT = 17831', `BUNDLED_RUNTIME_PORT = ${EVALUATION_PORT}`],
  ['dropi-tycoon-phaser-runtime', 'dropi-tycoon-babylon-evaluation-runtime'],
  ['Bundled Phaser assets failed integrity preparation.', 'Bundled evaluation assets failed integrity preparation.'],
  ['Bundled Phaser server started at an unexpected origin:', 'Bundled evaluation server started at an unexpected origin:'],
  ['startBundledPhaserRuntime', 'startBundledEvaluationRuntime'],
])

await replaceExactly('App.tsx', [
  ['  startBundledPhaserRuntime,', '  startBundledEvaluationRuntime,'],
  ['await startBundledPhaserRuntime()', 'await startBundledEvaluationRuntime()'],
  [
    'The installed Phaser runtime could not start. This is a local app-asset failure, not a Railway/network outage.',
    'The installed Babylon evaluation runtime could not start. This APK has no remote gameplay fallback.',
  ],
  ['The installed Phaser runtime could not be loaded from local app assets.', 'The installed Babylon evaluation runtime could not be loaded from local app assets.'],
])

await replaceExactly('plugins/withBundledPhaserRuntime.js', [
  ['Bundled Phaser dist is missing.', 'Bundled evaluation dist is missing.'],
])

const stageEvidence = {
  schemaVersion: 1,
  classification: CLASSIFICATION,
  productionEligible: false,
  authenticGameplay: false,
  sourceHeadSha: headSha,
  app: {
    name: EVALUATION_NAME,
    androidPackage: EVALUATION_PACKAGE,
    scheme: EVALUATION_SCHEME,
    loopbackPort: EVALUATION_PORT,
    versionCode: androidVersionCode,
  },
  runtimeManifest,
}

await writeFile(
  path.join(stageRoot, 'evaluation-stage.json'),
  `${JSON.stringify(stageEvidence, null, 2)}\n`,
  'utf8',
)

console.log(`Prepared ${EVALUATION_NAME} stage at ${stageRoot}.`)
