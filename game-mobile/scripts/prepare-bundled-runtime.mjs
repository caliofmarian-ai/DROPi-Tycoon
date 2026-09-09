import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BUNDLED_MODE = 'bundled'
const MANIFEST_NAME = 'dropi-runtime-manifest.json'
const force = process.argv.includes('--force')
const runtimeMode = process.env.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE?.trim()
const easProfile = process.env.EAS_BUILD_PROFILE?.trim()
const shouldPrepare = force || runtimeMode === BUNDLED_MODE || easProfile === 'production'

if (!shouldPrepare) {
  console.log('Skipping bundled Phaser preparation for non-production mobile install.')
  process.exit(0)
}

if (easProfile === 'production' && runtimeMode !== BUNDLED_MODE) {
  throw new Error(
    'Production EAS build must set EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE=bundled.',
  )
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const mobileRoot = path.resolve(scriptDirectory, '..')
const webRoot = path.resolve(mobileRoot, '../game-web')
const webDist = path.join(webRoot, 'dist')
const webPackage = JSON.parse(await readFile(path.join(webRoot, 'package.json'), 'utf8'))
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

if (!existsSync(path.join(webRoot, 'package-lock.json'))) {
  throw new Error('game-web/package-lock.json is required for bundled production preparation.')
}

const run = (args, cwd) => {
  const result = spawnSync(npmCommand, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`Command failed: npm ${args.join(' ')}`)
  }
}

run(['ci'], webRoot)
run(['run', 'build'], webRoot)

const requiredOutput = [
  'index.html',
  'assets/branding/dropi-tycoon-logo.png',
  'assets/production/icon-orders.webp',
  'data/playable-city-location-v1.json',
  'legal/third-party-notices.html',
  'legal/dependency-license-inventory.json',
  'legal/runtime-provenance.json',
  'legal/commercial-release-evidence.json',
]

for (const relativePath of requiredOutput) {
  if (!existsSync(path.join(webDist, relativePath))) {
    throw new Error(`Bundled Phaser build is missing required output: ${relativePath}`)
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

const files = (await collectFiles(webDist)).sort((left, right) => left.localeCompare(right))
const digest = createHash('sha256')

for (const absolutePath of files) {
  const relativePath = path.relative(webDist, absolutePath).split(path.sep).join('/')
  digest.update(relativePath)
  digest.update('\0')
  digest.update(await readFile(absolutePath))
  digest.update('\0')
}

const manifest = {
  schemaVersion: 1,
  runtime: 'phaser',
  runtimeVersion: webPackage.version,
  entrypoint: 'index.html',
  bundleSha256: digest.digest('hex'),
  fileCount: files.length,
}

await writeFile(
  path.join(webDist, MANIFEST_NAME),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
)

console.log(
  `Prepared bundled Phaser runtime ${manifest.runtimeVersion} (${manifest.fileCount} files, sha256 ${manifest.bundleSha256}).`,
)
