import fs from 'node:fs'

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))
const sameRecord = (left = {}, right = {}) => {
  const normalize = (record) => Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
}

const packageJson = readJson('./package.json')
const lockfile = readJson('./package-lock.json')
const appJson = readJson('./app.json')
const easJson = readJson('./eas.json')
const gitignore = fs.readFileSync('./.gitignore', 'utf8')
const envExample = fs.readFileSync('./.env.example', 'utf8')
const errors = []

const rootLock = lockfile?.packages?.['']
if (lockfile?.lockfileVersion !== 3) {
  errors.push(`package-lock.json must use lockfileVersion 3, found: ${lockfile?.lockfileVersion ?? 'MISSING'}`)
}
if (!rootLock) {
  errors.push('package-lock.json is missing the root package record')
} else {
  if (rootLock.name !== packageJson.name) {
    errors.push(`package-lock root name (${rootLock.name}) does not match package.json (${packageJson.name})`)
  }
  if (rootLock.version !== packageJson.version) {
    errors.push(`package-lock root version (${rootLock.version}) does not match package.json (${packageJson.version})`)
  }
  if (!sameRecord(rootLock.dependencies, packageJson.dependencies)) {
    errors.push('package-lock root dependencies do not exactly match package.json dependencies')
  }
  if (!sameRecord(rootLock.devDependencies, packageJson.devDependencies)) {
    errors.push('package-lock root devDependencies do not exactly match package.json devDependencies')
  }
}

if (lockfile?.name !== packageJson.name || lockfile?.version !== packageJson.version) {
  errors.push('package-lock top-level name/version must match package.json')
}

if (packageJson.packageManager !== 'npm@10.9.2') {
  errors.push(`package.json packageManager must pin npm@10.9.2, found: ${packageJson.packageManager ?? 'MISSING'}`)
}

const expo = appJson?.expo
if (expo?.android?.package !== 'com.dropi.tycoon') {
  errors.push(`Android package must remain com.dropi.tycoon, found: ${expo?.android?.package ?? 'MISSING'}`)
}
if (!Array.isArray(expo?.platforms) || expo.platforms.length !== 1 || expo.platforms[0] !== 'android') {
  errors.push('Expo platforms must remain Android-only for the current release lane')
}

const production = easJson?.build?.production
if (easJson?.cli?.appVersionSource !== 'remote') {
  errors.push('EAS appVersionSource must remain remote')
}
if (production?.node !== '22.13.0') {
  errors.push(`production Node must be 22.13.0, found: ${production?.node ?? 'MISSING'}`)
}
if (production?.environment !== 'production') {
  errors.push('production profile must select the production EAS environment')
}
if (production?.env?.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE !== 'bundled') {
  errors.push('production profile must use bundled Phaser runtime mode')
}
if ('EXPO_PUBLIC_DROPITYCOON_GAME_URL' in (production?.env ?? {})) {
  errors.push('production profile must not define the public Railway page as the game document')
}
if (production?.android?.buildType !== 'app-bundle') {
  errors.push(`production Android buildType must be app-bundle, found: ${production?.android?.buildType ?? 'MISSING'}`)
}
if (production?.developmentClient === true) {
  errors.push('production profile must not enable the Expo development client')
}
if (production?.autoIncrement !== true) {
  errors.push('production profile must keep remote Android versionCode auto-increment enabled')
}

for (const profileName of ['development', 'preview']) {
  const profile = easJson?.build?.[profileName]
  if (profile?.env?.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE !== 'remote') {
    errors.push(`${profileName} must remain explicitly remote; only production is bundled`)
  }
}
if (!/EXPO_PUBLIC_DROPITYCOON_GAME_URL=https:\/\//.test(envExample)) {
  errors.push('.env.example must retain an HTTPS remote-runtime example for development/preview use')
}

for (const requiredIgnore of [
  '*.aab', '*.apk', '*.jks', '*.keystore', '*.p12', '*.pfx',
  'eas-credentials.json', 'play-service-account*.json', 'google-play-service-account*.json',
]) {
  if (!gitignore.split(/\r?\n/).includes(requiredIgnore)) {
    errors.push(`.gitignore must protect release artifact/credential pattern: ${requiredIgnore}`)
  }
}

const serializedReleaseConfig = JSON.stringify({ packageJson, easJson, envExample })
if (serializedReleaseConfig.includes('EAS_BUILD_SKIP_LOCKFILE_CHECK')) {
  errors.push('EAS_BUILD_SKIP_LOCKFILE_CHECK must not be part of the canonical release path')
}

if (errors.length > 0) {
  console.error('DROPi Tycoon Android release-input validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const packageCount = Object.keys(lockfile.packages ?? {}).length
console.log(`PASS: canonical mobile lockfile is synchronized (${packageCount} package records, lockfile v3).`)
console.log('PASS: production profile is Android AAB + bundled Phaser with no remote game-document fallback.')
console.log('PASS: Android package identity and release artifact/credential exclusions are intact.')
