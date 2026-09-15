import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
export const validateRelease = value => {
  if (value?.schemaVersion !== 1 || value.packageId !== 'com.dropi.tycoon.babyloneval') throw new Error('Wrong evaluation release identity')
  for (const key of ['versionCode','referenceInstalledVersionCode','upgradeProbeVersionCode']) {
    if (!Number.isSafeInteger(value[key]) || value[key] < 1 || value[key] > 2100000000) throw new Error(`Invalid ${key}`)
  }
  if (value.versionCode <= value.upgradeProbeVersionCode || value.upgradeProbeVersionCode < value.referenceInstalledVersionCode) throw new Error('Evaluation upgrade must never downgrade a verified baseline')
  for (const key of ['referenceInstalledApkSha256','referenceSignerSha256']) if (!/^[a-f0-9]{64}$/.test(value[key])) throw new Error(`Invalid ${key}`)
  return Object.freeze({ ...value })
}
export const release = validateRelease(JSON.parse(readFileSync(new URL('../android-evaluation-version.json', import.meta.url), 'utf8')))
export const prepareProbe = (file, action) => {
  if (!file.endsWith('/game-mobile/android/app/build.gradle')) throw new Error('Only the isolated evaluation Gradle file may be used')
  const backup = `${file}.dropi-upgrade-backup`
  const text = readFileSync(file,'utf8')
  const replace = (source, from, to) => {
    const pattern = new RegExp(`\\bversionCode\\s+${from}\\b`, 'g')
    if ([...source.matchAll(pattern)].length !== 1) throw new Error('Expected exactly one matching version declaration')
    return source.replace(pattern,`versionCode ${to}`)
  }
  if (action === 'prepare') {
    const probe = replace(text, release.versionCode, release.upgradeProbeVersionCode)
    writeFileSync(backup,text,{flag:'wx'})
    writeFileSync(file,probe)
  } else if (action === 'restore') {
    const original = readFileSync(backup,'utf8')
    if (replace(original,release.versionCode,release.upgradeProbeVersionCode) !== text) throw new Error('Probe Gradle changed unexpectedly; refuse unsafe restoration')
    writeFileSync(file,original);unlinkSync(backup)
  } else throw new Error('Unknown probe action')
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [mode, file] = process.argv.slice(2)
  if (mode === 'prepare' || mode === 'restore') prepareProbe(file ?? '',mode)
  else if (mode === '--signer') console.log(release.referenceSignerSha256)
  else if (mode === '--probe') console.log(release.upgradeProbeVersionCode)
  else if (mode === undefined) console.log(release.versionCode)
  else throw new Error('Unknown release identity operation')
}
