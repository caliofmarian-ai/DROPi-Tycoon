import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { release, validateRelease, prepareProbe } from './evaluationReleaseIdentity.mjs'
test('explicit evaluation release supersedes both observed legacy counters',()=>{
  assert.ok(release.versionCode > 16)
  assert.equal(release.referenceInstalledVersionCode,15)
  assert.equal(release.referenceSignerSha256,'fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c')
})
test('reject invalid, downgraded or misbound release identities',()=>{
  for (const change of [{versionCode:15},{versionCode:16},{versionCode:2100000001},{versionCode:NaN},{packageId:'com.dropi.tycoon'},{referenceSignerSha256:'UNKNOWN'},{upgradeProbeVersionCode:14}]) assert.throws(()=>validateRelease({...release,...change}))
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
