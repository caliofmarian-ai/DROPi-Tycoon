import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CLASSIFICATION = 'NON-AUTHORITATIVE TECHNICAL SPIKE — NOT AUTHENTIC GAMEPLAY'
const MANIFEST_NAME = 'dropi-runtime-manifest.json'
const SHA_PATTERN = /^[0-9a-f]{40}$/

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const spikeRoot = path.resolve(scriptDirectory, '..')
const distRoot = path.join(spikeRoot, 'dist')

const requireEnvironment = name => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const assertSha = (name, value) => {
  if (!SHA_PATTERN.test(value)) {
    throw new Error(`${name} must be a lowercase 40-character Git SHA.`)
  }
}

const collectFiles = async directory => {
  const output = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      output.push(...await collectFiles(absolutePath))
    } else if (entry.name !== MANIFEST_NAME) {
      output.push(absolutePath)
    }
  }

  return output
}

const eventName = requireEnvironment('DROPI_TRIGGER_EVENT')
const triggerSha = requireEnvironment('DROPI_TRIGGER_SHA')
const triggerRef = requireEnvironment('DROPI_TRIGGER_REF')
const pullRequestNumber = requireEnvironment('DROPI_PR_NUMBER')
const baseSha = requireEnvironment('DROPI_BASE_SHA')
const headSha = requireEnvironment('DROPI_HEAD_SHA')
const checkoutSha = requireEnvironment('DROPI_CHECKOUT_SHA')
const runId = requireEnvironment('DROPI_RUN_ID')
const runAttempt = requireEnvironment('DROPI_RUN_ATTEMPT')

for (const [name, value] of [
  ['DROPI_TRIGGER_SHA', triggerSha],
  ['DROPI_HEAD_SHA', headSha],
  ['DROPI_CHECKOUT_SHA', checkoutSha],
]) {
  assertSha(name, value)
}

if (baseSha !== 'NOT_APPLICABLE') assertSha('DROPI_BASE_SHA', baseSha)

if (eventName === 'pull_request') {
  if (!/^\d+$/.test(pullRequestNumber)) {
    throw new Error('DROPI_PR_NUMBER must be numeric for a pull_request build.')
  }
  if (baseSha === 'NOT_APPLICABLE') {
    throw new Error('DROPI_BASE_SHA is required for a pull_request build.')
  }
  if (checkoutSha !== headSha) {
    throw new Error(`Checkout ${checkoutSha} does not equal PR head ${headSha}.`)
  }
}

const packageJson = JSON.parse(await readFile(path.join(spikeRoot, 'package.json'), 'utf8'))
if (packageJson.dependencies?.['@babylonjs/core'] !== '9.26.0') {
  throw new Error('The Android evaluation manifest requires pinned @babylonjs/core 9.26.0.')
}
await readFile(path.join(distRoot, 'index.html'))

const buildEvidence = [
  `classification=${CLASSIFICATION}`,
  'renderer=Babylon.js 9.26.0',
  'issue=710',
  `trigger_event=${eventName}`,
  `trigger_ref=${triggerRef}`,
  `trigger_sha=${triggerSha}`,
  `pull_request_number=${pullRequestNumber}`,
  `base_sha=${baseSha}`,
  `head_sha=${headSha}`,
  `checkout_sha=${checkoutSha}`,
  `github_run_id=${runId}`,
  `github_run_attempt=${runAttempt}`,
  '',
].join('\n')

await writeFile(path.join(distRoot, 'build-evidence.txt'), buildEvidence, 'utf8')

const files = (await collectFiles(distRoot))
  .sort((left, right) => left.localeCompare(right))
const digest = createHash('sha256')

for (const absolutePath of files) {
  const relativePath = path.relative(distRoot, absolutePath).split(path.sep).join('/')
  digest.update(relativePath)
  digest.update('\0')
  digest.update(await readFile(absolutePath))
  digest.update('\0')
}

const manifest = {
  schemaVersion: 1,
  runtime: 'babylon-third-person-braila-evaluation',
  runtimeVersion: packageJson.version,
  renderer: 'Babylon.js 9.26.0',
  classification: CLASSIFICATION,
  issue: 710,
  productionEligible: false,
  authenticGameplay: false,
  entrypoint: 'index.html',
  fileCount: files.length,
  bundleSha256: digest.digest('hex'),
  source: {
    triggerEvent: eventName,
    triggerRef,
    triggerSha,
    pullRequestNumber,
    baseSha,
    headSha,
    checkoutSha,
    githubRunId: runId,
    githubRunAttempt: runAttempt,
  },
}

await writeFile(
  path.join(distRoot, MANIFEST_NAME),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
)

console.log(
  `Prepared ${manifest.runtime} (${manifest.fileCount} files, sha256 ${manifest.bundleSha256}).`,
)
