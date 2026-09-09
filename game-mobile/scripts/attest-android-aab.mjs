import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const REQUIRED_TARGET_SDK = 36
const RELEASE_PACKAGE = 'com.dropi.tycoon'
const SIXTY_FOUR_BIT_ABIS = new Set(['arm64-v8a', 'x86_64'])

const usage = () => {
  console.error('Usage: npm run release:attest:aab -- --aab <file.aab> --eas-build-id <uuid> --source-sha <40hex> [--bundletool <bundletool.jar>] [--out <evidence.json>]')
  process.exit(2)
}

const args = process.argv.slice(2)
const options = {}
for (let index = 0; index < args.length; index += 1) {
  const token = args[index]
  if (!token.startsWith('--')) usage()
  const key = token.slice(2)
  const value = args[index + 1]
  if (!value || value.startsWith('--')) usage()
  options[key] = value
  index += 1
}

const bundletoolInput = options.bundletool ?? process.env.BUNDLETOOL_JAR
const aabPath = options.aab ? path.resolve(options.aab) : null
const easBuildId = options['eas-build-id']
const expectedSourceSha = options['source-sha']
const bundletoolPath = bundletoolInput ? path.resolve(bundletoolInput) : null
if (!aabPath || !easBuildId || !expectedSourceSha || !bundletoolPath) usage()
if (!/^[0-9a-f]{40}$/i.test(expectedSourceSha)) throw new Error('--source-sha must be a full 40-character Git commit SHA.')
if (!/^[0-9a-f-]{20,}$/i.test(easBuildId)) throw new Error('--eas-build-id does not look like an EAS build identifier.')
if (!fs.existsSync(aabPath) || !fs.statSync(aabPath).isFile()) throw new Error(`AAB not found: ${aabPath}`)
if (!fs.existsSync(bundletoolPath) || !fs.statSync(bundletoolPath).isFile()) throw new Error(`bundletool jar not found: ${bundletoolPath}`)

const run = (command, commandArgs, { encoding = 'utf8', maxBuffer = 256 * 1024 * 1024 } = {}) => {
  const result = spawnSync(command, commandArgs, { encoding, maxBuffer })
  if (result.error) throw result.error
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8') : result.stderr
    throw new Error(`${command} ${commandArgs.join(' ')} failed (${result.status ?? 'NO_STATUS'}): ${stderr?.trim() ?? ''}`)
  }
  return result.stdout
}

const sha256File = (file) => {
  const hash = crypto.createHash('sha256')
  hash.update(fs.readFileSync(file))
  return hash.digest('hex')
}

const gitHead = String(run('git', ['rev-parse', 'HEAD'])).trim()
if (gitHead.toLowerCase() !== expectedSourceSha.toLowerCase()) {
  throw new Error(`Checked-out source ${gitHead} does not match --source-sha ${expectedSourceSha}. Check out the exact EAS source commit before attesting.`)
}
const dirtyTracked = String(run('git', ['status', '--porcelain', '--untracked-files=no'])).trim()
if (dirtyTracked) throw new Error('Tracked working tree changes exist. A release attestation requires the exact clean source commit.')

const manifest = String(run('java', ['-jar', bundletoolPath, 'dump', 'manifest', '--bundle', aabPath, '--module', 'base']))
const bundleConfig = String(run('java', ['-jar', bundletoolPath, 'dump', 'config', '--bundle', aabPath]))
const entries = String(run('unzip', ['-Z1', aabPath])).split(/\r?\n/).filter(Boolean)
const keytoolOutput = String(run('keytool', ['-printcert', '-jarfile', aabPath]))

const attribute = (name) => manifest.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? null
const packageName = attribute('package')
const versionName = attribute('android:versionName')
const versionCode = attribute('android:versionCode')
const minSdk = Number(attribute('android:minSdkVersion'))
const targetSdk = Number(attribute('android:targetSdkVersion'))
const compileSdkRaw = attribute('android:compileSdkVersion') ?? attribute('platformBuildVersionCode')
const compileSdk = Number(compileSdkRaw)
const debuggableValue = attribute('android:debuggable')
const debuggable = debuggableValue === 'true'
const permissions = [...manifest.matchAll(/<uses-permission[^>]+android:name="([^"]+)"/g)].map(match => match[1]).sort()
const devLauncherRefs = [...new Set(manifest.match(/expo\.modules\.(?:devlauncher|devmenu)[A-Za-z0-9_.$]*/gi) ?? [])].sort()
const signerSha256 = keytoolOutput.match(/SHA256:\s*([0-9A-F:]{32,})/i)?.[1]?.replaceAll(':', '').toLowerCase() ?? null
const pageAlignment = bundleConfig.includes('PAGE_ALIGNMENT_16K')
  ? 'PAGE_ALIGNMENT_16K'
  : bundleConfig.includes('PAGE_ALIGNMENT_4K')
    ? 'PAGE_ALIGNMENT_4K'
    : 'UNKNOWN'

const nativeEntries = entries.filter(entry => /^base\/lib\/[^/]+\/[^/]+\.so$/.test(entry))
const abis = [...new Set(nativeEntries.map(entry => entry.split('/')[2]))].sort()
const nativeByAbi = Object.fromEntries(abis.map(abi => [abi, nativeEntries.filter(entry => entry.split('/')[2] === abi).map(entry => path.basename(entry)).sort()]))
const counterpartGaps = []
for (const [fromAbi, toAbi] of [['armeabi-v7a', 'arm64-v8a'], ['x86', 'x86_64']]) {
  if (!nativeByAbi[fromAbi]) continue
  const targetNames = new Set(nativeByAbi[toAbi] ?? [])
  for (const library of nativeByAbi[fromAbi]) {
    if (!targetNames.has(library)) counterpartGaps.push({ abi: fromAbi, library, missing64BitAbi: toAbi })
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dropi-aab-attest-'))
const elfChecks = []
try {
  for (const entry of nativeEntries) {
    const binary = run('unzip', ['-p', aabPath, entry], { encoding: null })
    const file = path.join(tempRoot, `${elfChecks.length}-${path.basename(entry)}`)
    fs.writeFileSync(file, binary)
    const programHeaders = String(run('readelf', ['-lW', file]))
    const alignments = programHeaders
      .split(/\r?\n/)
      .filter(line => /^\s*LOAD\s/.test(line))
      .map(line => line.trim().split(/\s+/).at(-1))
      .filter(token => /^0x[0-9a-f]+$/i.test(token))
      .map(token => Number.parseInt(token, 16))
    const minimumLoadAlignment = alignments.length ? Math.min(...alignments) : 0
    elfChecks.push({ entry, minimumLoadAlignment, supports16Kb: minimumLoadAlignment >= 16384 })
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}

const has64BitAbi = abis.some(abi => SIXTY_FOUR_BIT_ABIS.has(abi))
const allElf16Kb = elfChecks.every(check => check.supports16Kb)
const checks = {
  packageName: packageName === RELEASE_PACKAGE,
  versionName: typeof versionName === 'string' && /^\d+\.\d+\.\d+$/.test(versionName),
  versionCode: Number.isInteger(Number(versionCode)) && Number(versionCode) > 0,
  minSdk: Number.isInteger(minSdk) && minSdk > 0,
  targetSdk: Number.isInteger(targetSdk) && targetSdk >= REQUIRED_TARGET_SDK,
  compileSdk: Number.isInteger(compileSdk) && compileSdk >= targetSdk,
  notDebuggable: !debuggable,
  noDevLauncherManifestComponents: devLauncherRefs.length === 0,
  signerFingerprintPresent: /^[0-9a-f]{64}$/.test(signerSha256 ?? ''),
  has64BitAbi,
  noMissing64BitCounterparts: counterpartGaps.length === 0,
  bundleRequests16KbAlignment: nativeEntries.length === 0 || pageAlignment === 'PAGE_ALIGNMENT_16K',
  nativeElfSupports16Kb: nativeEntries.length === 0 || allElf16Kb,
}

const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: failures.length === 0 ? 'PASS_AAB_TECHNICAL_ATTESTATION' : 'FAIL_AAB_TECHNICAL_ATTESTATION',
  source: { commitSha: gitHead },
  eas: { buildId: easBuildId },
  artifact: {
    fileName: path.basename(aabPath),
    sizeBytes: fs.statSync(aabPath).size,
    sha256: sha256File(aabPath),
  },
  application: {
    packageName,
    versionName,
    versionCode: versionCode ? Number(versionCode) : null,
    minSdk: Number.isInteger(minSdk) ? minSdk : null,
    targetSdk: Number.isInteger(targetSdk) ? targetSdk : null,
    compileSdk: Number.isInteger(compileSdk) ? compileSdk : null,
    permissions,
    debuggable,
    devLauncherManifestReferences: devLauncherRefs,
  },
  signing: { uploadCertificateSha256: signerSha256 },
  native: {
    abis,
    nativeLibraryCount: nativeEntries.length,
    missing64BitCounterparts: counterpartGaps,
    bundlePageAlignment: pageAlignment,
    elf16Kb: elfChecks,
  },
  tooling: {
    bundletoolFile: path.basename(bundletoolPath),
    bundletoolSha256: sha256File(bundletoolPath),
  },
  checks,
  failures,
  externalGatesStillRequired: [
    'Google Play Internal testing upload accepted',
    'Play App Bundle Explorer confirms device compatibility and Play signing state',
    'Play pre-launch report reviewed',
    'Physical Android landscape cold-launch/offline/save/resume/Back/touch acceptance completed',
  ],
}

const defaultName = `android-aab-${versionName ?? 'unknown'}-${versionCode ?? 'unknown'}.json`
const outPath = path.resolve(options.out ?? path.join('release-evidence', defaultName))
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`)

console.log(`AAB SHA-256: ${evidence.artifact.sha256}`)
console.log(`Application: ${packageName} ${versionName} (${versionCode}) SDK min/target/compile ${minSdk}/${targetSdk}/${compileSdk}`)
console.log(`Native ABIs: ${abis.join(', ') || 'none'}; bundle alignment: ${pageAlignment}; ELF 16 KB: ${allElf16Kb ? 'PASS' : 'FAIL'}`)
console.log(`Upload certificate SHA-256: ${signerSha256 ?? 'MISSING'}`)
console.log(`Evidence: ${outPath}`)
if (failures.length) {
  console.error(`FAILED checks: ${failures.join(', ')}`)
  process.exit(1)
}
console.log('PASS: AAB technical attestation completed. Play Console and physical-device gates remain external and are not claimed here.')
