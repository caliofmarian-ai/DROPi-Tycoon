import fs from 'node:fs'

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))

const appConfig = readJson('./app.json')
const packageConfig = readJson('./package.json')
const easConfig = readJson('./eas.json')

const appVersion = appConfig?.expo?.version
const packageVersion = packageConfig?.version
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

const errors = []

if (!semver.test(appVersion ?? '')) {
  errors.push(`app.json expo.version must be numeric MAJOR.MINOR.PATCH, found: ${appVersion ?? 'MISSING'}`)
}

if (!semver.test(packageVersion ?? '')) {
  errors.push(`package.json version must be numeric MAJOR.MINOR.PATCH, found: ${packageVersion ?? 'MISSING'}`)
}

if (appVersion !== packageVersion) {
  errors.push(`app.json version (${appVersion}) and package.json version (${packageVersion}) must match`)
}

if (easConfig?.cli?.appVersionSource !== 'remote') {
  errors.push('eas.json cli.appVersionSource must remain "remote" so Android versionCode is centrally controlled')
}

for (const profileName of ['development', 'preview', 'production']) {
  const profile = easConfig?.build?.[profileName]
  if (!profile) {
    errors.push(`Missing EAS build profile: ${profileName}`)
    continue
  }

  if (profile.autoIncrement !== true) {
    errors.push(`EAS profile ${profileName} must set autoIncrement: true`)
  }
}

if (appConfig?.expo?.android?.versionCode !== undefined) {
  errors.push('Do not set android.versionCode locally while EAS appVersionSource is remote')
}

if (errors.length > 0) {
  console.error('DROPi Tycoon release-version validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(`PASS: DROPi Tycoon semantic version ${appVersion} is synchronized.`)
console.log('PASS: EAS remote Android versionCode auto-increment is enabled for development, preview, and production.')
