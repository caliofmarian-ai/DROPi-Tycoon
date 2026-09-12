import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CLASSIFICATION = 'NON-AUTHORITATIVE TECHNICAL SPIKE — NOT AUTHENTIC GAMEPLAY'
const EVALUATION_PACKAGE = 'com.dropi.tycoon.babyloneval'

const [apkArgument, stageRootArgument, outputArgument] = process.argv.slice(2)

if (!apkArgument || !stageRootArgument || !outputArgument) {
  throw new Error(
    'Usage: node attestAndroidEvaluationApk.mjs <apk> <stage-root> <new-output-directory>',
  )
}

const apkPath = path.resolve(apkArgument)
const stageRoot = path.resolve(stageRootArgument)
const outputDirectory = path.resolve(outputArgument)
const headSha = process.env.DROPI_HEAD_SHA?.trim()

if (!/^[0-9a-f]{40}$/.test(headSha ?? '')) {
  throw new Error('DROPI_HEAD_SHA must be a lowercase 40-character Git SHA.')
}
if (!path.basename(outputDirectory).startsWith('dropi-babylon-android-eval-')) {
  throw new Error('The output directory must use the dropi-babylon-android-eval-* prefix.')
}

const [apkBytes, stageEvidenceText, buildGradle, outputMetadataText] = await Promise.all([
  readFile(apkPath),
  readFile(path.join(stageRoot, 'evaluation-stage.json'), 'utf8'),
  readFile(path.join(stageRoot, 'game-mobile', 'android', 'app', 'build.gradle'), 'utf8'),
  readFile(
    path.join(
      stageRoot,
      'game-mobile',
      'android',
      'app',
      'build',
      'outputs',
      'apk',
      'release',
      'output-metadata.json',
    ),
    'utf8',
  ),
])

if (apkBytes.length < 1_000_000 || apkBytes[0] !== 0x50 || apkBytes[1] !== 0x4b) {
  throw new Error('The produced file is not a plausible Android APK ZIP payload.')
}

const stageEvidence = JSON.parse(stageEvidenceText)
if (stageEvidence.classification !== CLASSIFICATION) {
  throw new Error('The evaluation stage has an invalid truth classification.')
}
if (stageEvidence.sourceHeadSha !== headSha) {
  throw new Error('The evaluation stage does not match DROPI_HEAD_SHA.')
}
if (stageEvidence.app?.androidPackage !== EVALUATION_PACKAGE) {
  throw new Error('The evaluation stage has an unexpected Android package.')
}
if (!buildGradle.includes(`applicationId '${EVALUATION_PACKAGE}'`)) {
  throw new Error('Generated Gradle applicationId is not the isolated evaluation package.')
}
if (!/release\s*\{[\s\S]*?signingConfig signingConfigs\.debug/.test(buildGradle)) {
  throw new Error('Evaluation release APK is not explicitly using non-production debug signing.')
}
const outputMetadata = JSON.parse(outputMetadataText)
if (outputMetadata.applicationId !== EVALUATION_PACKAGE) {
  throw new Error('Android APK output metadata does not contain the isolated evaluation package.')
}
if (outputMetadata.elements?.[0]?.versionCode !== stageEvidence.app.versionCode) {
  throw new Error('Android APK output metadata has an unexpected versionCode.')
}

const apkSha256 = createHash('sha256').update(apkBytes).digest('hex')
const artifactFilename = `DROPi-Babylon-Eval-${headSha.slice(0, 8)}.apk`
const artifactPath = path.join(outputDirectory, artifactFilename)

await mkdir(outputDirectory)
await copyFile(apkPath, artifactPath)

const provenance = {
  schemaVersion: 1,
  artifactType: 'Android APK',
  distribution: 'INTERNAL OWNER EVALUATION ONLY',
  classification: CLASSIFICATION,
  productionEligible: false,
  authenticGameplay: false,
  signing: 'DEBUG KEYSTORE — NOT PRODUCTION SIGNING',
  app: stageEvidence.app,
  source: stageEvidence.runtimeManifest.source,
  renderer: stageEvidence.runtimeManifest.renderer,
  runtimeVersion: stageEvidence.runtimeManifest.runtimeVersion,
  bundleSha256: stageEvidence.runtimeManifest.bundleSha256,
  apk: {
    filename: artifactFilename,
    byteSize: (await stat(artifactPath)).size,
    sha256: apkSha256,
  },
}

await Promise.all([
  writeFile(
    path.join(outputDirectory, 'android-evaluation-provenance.json'),
    `${JSON.stringify(provenance, null, 2)}\n`,
    'utf8',
  ),
  writeFile(
    path.join(outputDirectory, 'SHA256SUMS.txt'),
    `${apkSha256}  ${artifactFilename}\n`,
    'utf8',
  ),
])

console.log(
  `Attested ${artifactFilename} (${provenance.apk.byteSize} bytes, sha256 ${apkSha256}).`,
)
