import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { release, validateRelease, prepareProbe, parseSignerSha256 } from './evaluationReleaseIdentity.mjs'
test('explicit evaluation release advances beyond the approved owner APK',()=>{
  assert.equal(release.versionCode,2026091801)
  assert.equal(release.referenceInstalledVersionCode,2026091502)
  assert.equal(release.upgradeProbeVersionCode,2026091502)
  assert.equal(release.referenceInstalledApkSha256,'aa021a6408b406576a4966597ee4ed9f1dcce7df8a6a4938ea274c323ef9969f')
  assert.equal(release.referenceSignerSha256,'fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c')
})
test('reject invalid, downgraded or misbound release identities',()=>{
  for (const change of [{versionCode:2026091501},{versionCode:16},{versionCode:2100000001},{versionCode:NaN},{packageId:'com.dropi.tycoon'},{referenceSignerSha256:'UNKNOWN'},{upgradeProbeVersionCode:16}]) assert.throws(()=>validateRelease({...release,...change}))
})
test('upgrade fixture changes only version and restores exact bytes',()=>{
  const root=mkdtempSync(path.join(tmpdir(),'dropi-upgrade-'))
  try {
    const dir=path.join(root,'game-mobile/android/app');mkdirSync(dir,{recursive:true});const file=path.join(dir,'build.gradle')
    const original=`android { defaultConfig {\n applicationId 'com.dropi.tycoon.babyloneval'\n versionCode ${release.versionCode}\n} }\n`
    writeFileSync(file,original);prepareProbe(file,'prepare')
    assert.equal(readFileSync(file,'utf8'),original.replace(String(release.versionCode),String(release.upgradeProbeVersionCode)))
    assert.throws(()=>prepareProbe(file,'prepare'))
    prepareProbe(file,'restore');assert.equal(readFileSync(file,'utf8'),original)
    assert.throws(()=>prepareProbe(file,'restore'))
    prepareProbe(file,'prepare');writeFileSync(file,readFileSync(file,'utf8')+'// unexpected edit\n');assert.throws(()=>prepareProbe(file,'restore'))
  } finally {rmSync(root,{recursive:true,force:true})}
})
test('refuse unrelated files and ambiguous Gradle declarations',()=>{
  assert.throws(()=>prepareProbe('/tmp/unrelated.gradle','prepare'))
  const root=mkdtempSync(path.join(tmpdir(),'dropi-upgrade-'))
  try {
    const dir=path.join(root,'game-mobile/android/app');mkdirSync(dir,{recursive:true});const file=path.join(dir,'build.gradle')
    for(const text of ['versionCode 1',`versionCode ${release.versionCode}\nversionCode ${release.versionCode}`]){writeFileSync(file,text);assert.throws(()=>prepareProbe(file,'prepare'))}
  }finally{rmSync(root,{recursive:true,force:true})}
})

const fingerprint = release.referenceSignerSha256
const signerOutput = (label = 'V2 Signer:', hash = fingerprint) =>
  `Verifies\nNumber of signers: 1\n${label} certificate SHA-256 digest: ${hash}\n`
const identityScript = fileURLToPath(new URL('./evaluationReleaseIdentity.mjs', import.meta.url))
test('parse the observed scheme-prefixed runner certificate and legacy output', () => {
  for (const label of ['V2 Signer:', 'Signer #1']) assert.equal(parseSignerSha256(signerOutput(label)), fingerprint)
})
test('accept consistent scheme certificates and normalize case and CRLF', () => {
  const output = signerOutput('V2 Signer:', fingerprint.toUpperCase()) + `V3 Signer: certificate SHA-256 digest: ${fingerprint}\n`
  assert.equal(parseSignerSha256(output.replaceAll('\n', '\r\n')), fingerprint)
})
test('reject empty, missing, duplicate and multiple signer counts', () => {
  for (const output of ['', null, signerOutput().replace('Number of signers: 1\n', ''), signerOutput().replace('signers: 1', 'signers: 2'), signerOutput() + 'Number of signers: 1\n']) {
    assert.throws(() => parseSignerSha256(output))
  }
})
test('reject unknown labels, extra signers, malformed hashes and conflicting certificates', () => {
  for (const output of [signerOutput('Signer #2'), signerOutput('Unknown Signer:'), signerOutput('V2 Signer:', 'bad'), signerOutput() + `Signer #2 certificate SHA-256 digest: ${fingerprint}\n`, signerOutput() + `V3 Signer: certificate SHA-256 digest: ${'0'.repeat(64)}\n`]) {
    assert.throws(() => parseSignerSha256(output))
  }
})
test('source stamp and public key digest cannot impersonate the APK certificate', () => {
  for (const label of ['Source Stamp Signer', 'V2 Signer: public key']) assert.throws(() => parseSignerSha256(signerOutput(label)))
  assert.equal(parseSignerSha256(signerOutput() + `Source Stamp Signer certificate SHA-256 digest: ${'0'.repeat(64)}\n`), fingerprint)
})
test('CLI prints only the extracted certificate and fails closed on missing evidence', () => {
  const ok = spawnSync(process.execPath, [identityScript, '--parse-signer'], { input: signerOutput(), encoding: 'utf8' })
  assert.equal(ok.status, 0); assert.equal(ok.stdout, fingerprint + '\n')
  const bad = spawnSync(process.execPath, [identityScript, '--parse-signer'], { input: '', encoding: 'utf8' })
  assert.notEqual(bad.status, 0); assert.equal(bad.stdout, '')
})
test('both APK identity checks use the shared parser without bypassing verifier failure or reference pin', () => {
  const workflow = readFileSync(new URL('../../../../.github/workflows/babylon-android-owner-verified.yml', import.meta.url), 'utf8')
  const commands = workflow.split('\n').filter(line => line.trim().startsWith('CERT='))
  assert.equal(commands.length, 2)
  for (const command of commands) {
    assert.ok(command.includes('apksigner" verify --verbose --print-certs'))
    assert.ok(command.includes('evaluationReleaseIdentity.mjs" --parse-signer'))
    assert.ok(!command.includes('|| true'))
  }
  assert.equal(workflow.split('test "$CERT" = "$DROPI_REFERENCE_SIGNER"').length - 1, 2)
  assert.ok(!workflow.includes("sed -n 's/^Signer #1 certificate SHA-256 digest:"))
})
test('workflow-style pipefail preserves verifier failure and rejects a different valid signer', () => {
  const run = (status, output, expected = fingerprint) => spawnSync('bash', ['-c',
    'set -euo pipefail\nCERT="$( (printf "%s" "$OUTPUT"; exit "$STATUS") | "$NODE" "$SCRIPT" --parse-signer)"\ntest "$CERT" = "$EXPECTED"',
  ], { encoding: 'utf8', env: { ...process.env, STATUS: String(status), OUTPUT: output, NODE: process.execPath, SCRIPT: identityScript, EXPECTED: expected } })
  assert.equal(run(0, signerOutput()).status, 0)
  assert.notEqual(run(7, signerOutput()).status, 0)
  assert.notEqual(run(0, signerOutput('V2 Signer:', '0'.repeat(64))).status, 0)
})
