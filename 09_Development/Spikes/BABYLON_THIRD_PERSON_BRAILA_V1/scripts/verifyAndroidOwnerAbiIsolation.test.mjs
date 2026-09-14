import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const workflow = readFileSync(new URL('../../../../.github/workflows/babylon-android-owner-verified.yml', import.meta.url), 'utf8')
const step = (source, name) => {
  const prefix = `      - name: ${name}\n`
  assert.equal(source.split(prefix).length, 2, `Expected one step: ${name}`)
  return source.split(prefix)[1].split('\n      - name: ')[0]
}

// Contract tests for run 34905429689: Gradle clean removed dependency JNI
// codegen before externalNativeBuildCleanRelease consumed its autolinking file.
// These tests verify workflow isolation, not execution on a physical ARM64 phone.
const validate = source => {
  assert.match(source, /DROPI_ARM64_STAGE_ROOT=\$RUNNER_TEMP\/dropi-babylon-android-evaluation-arm64-\$DROPI_RUN_ID-\$DROPI_RUN_ATTEMPT/)
  const prepare = step(source, 'Prepare independent ARM64 evaluation stage')
  const build = step(source, 'Build ARM64 owner test APK')
  const attest = step(source, 'Attest owner APK and record installability evidence')
  const emulator = step(source, 'Install and launch x86_64 preflight on clean Android emulator')
  const upload = step(source, 'Upload owner-ready ARM64 APK and evidence')
  assert.ok(source.indexOf('      - name: Install and launch x86_64') < source.indexOf('      - name: Prepare independent ARM64'))
  assert.ok(source.indexOf('      - name: Prepare independent ARM64') < source.indexOf('      - name: Build ARM64'))
  assert.match(prepare, /test "\$DROPI_ARM64_STAGE_ROOT" != "\$DROPI_STAGE_ROOT"/)
  assert.match(prepare, /test ! -e "\$DROPI_ARM64_STAGE_ROOT"/)
  assert.match(prepare, /prepareAndroidEvaluationStage\.mjs/)
  assert.match(prepare, /"\$GITHUB_WORKSPACE\/game-mobile"/)
  assert.match(prepare, /cd "\$DROPI_ARM64_STAGE_ROOT\/game-mobile"\n\s+npm ci --no-audit --no-fund/)
  assert.match(prepare, /expo prebuild --platform android --clean --no-install/)
  assert.match(prepare, /cmp "\$DROPI_STAGE_ROOT\/evaluation-stage\.json" "\$DROPI_ARM64_STAGE_ROOT\/evaluation-stage\.json"/)
  assert.match(build, /cd "\$DROPI_ARM64_STAGE_ROOT\/game-mobile\/android"/)
  assert.match(build, /\.\/gradlew --no-daemon --stacktrace :app:assembleRelease -PreactNativeArchitectures=arm64-v8a/)
  assert.doesNotMatch(build, /\bclean\b|\|\| true/)
  assert.match(build, /APK_PATH="\$DROPI_ARM64_STAGE_ROOT\/game-mobile\/android\/app\/build\/outputs\/apk\/release\/app-release\.apk"/)
  for (const guard of ["test \"$ABI_LIST\" = 'arm64-v8a'", 'apksigner" verify', 'zipalign" -c -P 16', 'unzip -t "$APK_PATH"']) assert.ok(build.includes(guard), guard)
  assert.match(attest, /"\$DROPI_ARM64_APK" \\\n\s+"\$DROPI_ARM64_STAGE_ROOT"/)
  assert.match(attest, /final_arm64_physical_install=UNKNOWN_UNTIL_OWNER_DEVICE_TEST/)
  assert.match(emulator, /test "\$STABLE_PID" = "\$APP_PID"/)
  assert.match(emulator, /FATAL EXCEPTION/)
  assert.doesNotMatch(upload, /if:.*(?:always|failure)/)
}

test('owner build uses an independent project while preserving all delivery gates', () => validate(workflow))
const mutations = [
  ['shared build root', s => s.replace('evaluation-arm64-$DROPI_RUN_ID', 'evaluation-$DROPI_RUN_ID')],
  ['reusing an existing stage', s => s.replace('test ! -e "$DROPI_ARM64_STAGE_ROOT"', 'true')],
  ['missing distinct-root guard', s => s.replace('test "$DROPI_ARM64_STAGE_ROOT" != "$DROPI_STAGE_ROOT"', 'true')],
  ['missing independent dependency install', s => s.replace('cd "$DROPI_ARM64_STAGE_ROOT/game-mobile"\n          npm ci --no-audit --no-fund', 'cd "$DROPI_ARM64_STAGE_ROOT/game-mobile"')],
  ['unverified payload parity', s => s.replace('cmp "$DROPI_STAGE_ROOT/evaluation-stage.json" "$DROPI_ARM64_STAGE_ROOT/evaluation-stage.json"', 'true')],
  ['native clean regression', s => s.replace(':app:assembleRelease -PreactNativeArchitectures=arm64-v8a', 'clean :app:assembleRelease -PreactNativeArchitectures=arm64-v8a')],
  ['ABI validation removed', s => s.replace('test "$ABI_LIST" = \'arm64-v8a\'', 'true')],
  ['stale x86 APK selection', s => s.replace('APK_PATH="$DROPI_ARM64_STAGE_ROOT/', 'APK_PATH="$DROPI_STAGE_ROOT/')],
  ['wrong attestation stage', s => s.replace('"$DROPI_ARM64_APK" \\\n            "$DROPI_ARM64_STAGE_ROOT"', '"$DROPI_ARM64_APK" \\\n            "$DROPI_STAGE_ROOT"')],
  ['physical acceptance invented', s => s.replace('final_arm64_physical_install=UNKNOWN_UNTIL_OWNER_DEVICE_TEST', 'final_arm64_physical_install=PASS')],
  ['liveness protection removed', s => s.replace('test "$STABLE_PID" = "$APP_PID"', 'true')],
]
for (const [name, mutate] of mutations) {
  test(`rejects ${name}`, () => {
    const changed = mutate(workflow)
    assert.notEqual(changed, workflow, 'Mutation must exercise a real workflow change')
    assert.throws(() => validate(changed))
  })
}
