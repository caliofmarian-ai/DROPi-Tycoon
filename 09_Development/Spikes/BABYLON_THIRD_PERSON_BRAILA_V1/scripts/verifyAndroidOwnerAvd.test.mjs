import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const helper = fileURLToPath(new URL('./prepareAndroidOwnerAvd.sh', import.meta.url));
const workflow = fileURLToPath(new URL('../../../../.github/workflows/babylon-android-owner-verified.yml', import.meta.url));

// These mocks verify path ownership and fail-closed control flow, not Android
// installation. The real workflow must still boot, install and launch its APK.
function runFixture(mode = 'ok', spaced = false) {
  const root = mkdtempSync(join(tmpdir(), 'dropi-avd-contract-'));
  try {
    const runnerTemp = join(root, spaced ? 'runner temp with spaces' : 'runner');
    const sdk = join(root, 'sdk');
    const home = join(root, 'unchanged-home');
    mkdirSync(runnerTemp, { recursive: true });
    mkdirSync(sdk);
    mkdirSync(home);
    const manager = join(sdk, 'avdmanager');
    const emulator = join(sdk, 'emulator');
    writeFileSync(manager, `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const env = process.env;
const args = process.argv.slice(2);
if (args[0] !== 'create' || args[1] !== 'avd') process.exit(91);
const value = key => args[args.indexOf(key) + 1];
if (value('--name') !== 'dropi_owner_ci' || value('--package') !== 'system-images;android-35;google_apis;x86_64') process.exit(92);
if (env.FIXTURE_MODE === 'create-error') process.exit(17);
if (env.ANDROID_USER_HOME !== path.join(env.ANDROID_SDK_HOME, '.android') || env.ANDROID_EMULATOR_HOME !== env.ANDROID_USER_HOME || env.ANDROID_AVD_HOME !== path.join(env.ANDROID_USER_HOME, 'avd')) process.exit(93);
const destination = value('--path');
if (destination !== path.join(env.ANDROID_AVD_HOME, 'dropi_owner_ci.avd')) process.exit(94);
fs.mkdirSync(destination, { recursive: true });
if (env.FIXTURE_MODE !== 'missing-config') fs.writeFileSync(path.join(destination, 'config.ini'), 'AvdId=dropi_owner_ci\\n');
if (env.FIXTURE_MODE !== 'missing-registry') fs.writeFileSync(path.join(env.ANDROID_AVD_HOME, 'dropi_owner_ci.ini'), 'path=' + (env.FIXTURE_MODE === 'wrong-path' ? '/wrong/path' : destination) + '\\n');
`, { mode: 0o755 });
    writeFileSync(emulator, `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
if (process.argv[2] !== '-list-avds') process.exit(95);
const env = process.env;
fs.writeFileSync(path.join(env.RUNNER_TEMP, 'list-called'), 'yes');
if (env.FIXTURE_MODE === 'list-error') process.exit(19);
if (!fs.existsSync(path.join(env.ANDROID_AVD_HOME, 'dropi_owner_ci.ini'))) process.exit(96);
console.log(env.FIXTURE_MODE === 'invisible' ? 'other_device' : 'dropi_owner_ci');
`, { mode: 0o755 });
    const env = {
      ...process.env,
      FIXTURE_MODE: mode,
      HOME: home,
      ANDROID_HOME: sdk,
      ANDROID_SDK_ROOT: sdk,
      // Deliberately conflict every inherited lookup root.
      ANDROID_USER_HOME: join(root, 'stale-user'),
      ANDROID_AVD_HOME: join(root, 'stale-avd'),
      ANDROID_EMULATOR_HOME: join(root, 'stale-emulator'),
      ANDROID_SDK_HOME: join(root, 'stale-legacy'),
      RUNNER_TEMP: runnerTemp,
      AVDMANAGER: mode === 'missing-tool' ? join(root, 'missing-manager') : manager,
      EMULATOR: emulator,
    };
    if (mode === 'missing-temp') delete env.RUNNER_TEMP;
    const result = spawnSync('bash', ['-euo', 'pipefail', '-c', 'source "$1"; test "$HOME" = "$2"; test "$ANDROID_HOME" = "$3"; test "$ANDROID_SDK_ROOT" = "$3"; test "$ANDROID_AVD_HOME" = "$ANDROID_EMULATOR_HOME/avd"; echo SHELL_EXPORTS_SURVIVED', 'fixture', helper, home, sdk], { env, encoding: 'utf8', timeout: 10_000 });
    assert.equal(result.error, undefined);
    return result;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

for (const spaced of [false, true]) {
  test(`creation and discovery share one fresh root; spaces=${spaced}`, () => {
    const result = runFixture('ok', spaced);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /AVD_DISCOVERY=PASS/);
    assert.match(result.stdout, /SHELL_EXPORTS_SURVIVED/);
  });
}
for (const mode of ['missing-temp', 'missing-tool', 'missing-registry', 'missing-config', 'wrong-path', 'invisible']) {
  test(`fail closed: ${mode}`, () => {
    const result = runFixture(mode);
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stdout, /AVD_DISCOVERY=PASS|SHELL_EXPORTS_SURVIVED/);
  });
}
for (const [mode, status] of [['create-error', 17], ['list-error', 19]]) {
  test(`preserves command failure: ${mode}`, () => {
    const result = runFixture(mode);
    assert.equal(result.status, status);
    assert.doesNotMatch(result.stdout, /AVD_DISCOVERY=PASS|SHELL_EXPORTS_SURVIVED/);
  });
}
test('workflow sources discovery guard before boot and runs regression before build', () => {
  const source = readFileSync(workflow, 'utf8');
  const guard = source.indexOf('source 09_Development/Spikes/BABYLON_THIRD_PERSON_BRAILA_V1/scripts/prepareAndroidOwnerAvd.sh');
  const boot = source.indexOf('-avd dropi_owner_ci');
  assert.ok(guard > 0 && boot > guard);
  assert.ok(source.indexOf('node --test scripts/verifyAndroidOwnerAvd.test.mjs') < source.indexOf('- name: Build exact tested static Babylon payload'));
  assert.match(source, /architecture_matched_emulator_preflight_install=\$DROPI_EMULATOR_INSTALL/);
  assert.match(source, /final_arm64_physical_install=UNKNOWN_UNTIL_OWNER_DEVICE_TEST/);
  assert.doesNotMatch(source, /continue-on-error:/);
});
test('stable-launch and crash evidence are preserved and never silently ignored', () => {
  const source = readFileSync(workflow, 'utf8');
  assert.match(source, /test "\$STABLE_PID" = "\$APP_PID"/);
  assert.match(source, /architecture_matched_emulator_stable_15s=\$DROPI_EMULATOR_STABLE_15S/);
  assert.match(source, /logcat --pid="\$APP_PID" -d -v threadtime > "\$RUNNER_TEMP\/dropi-app-logcat\.txt"\n/);
  assert.doesNotMatch(source, /\| head -n 5|\| grep -m1/);
  assert.match(source, /Preserve emulator failure diagnostics\n        if: failure\(\)/);
});
