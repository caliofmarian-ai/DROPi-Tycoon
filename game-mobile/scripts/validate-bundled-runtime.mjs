import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const mobileRoot = path.resolve(scriptDirectory, '..')

const readJson = async relativePath => JSON.parse(
  await readFile(path.join(mobileRoot, relativePath), 'utf8'),
)
const readText = relativePath => readFile(path.join(mobileRoot, relativePath), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const [packageJson, easJson, appJson, runtimeConfig, bundledRuntime, appSource, pluginSource] = await Promise.all([
  readJson('package.json'),
  readJson('eas.json'),
  readJson('app.json'),
  readText('src/runtimeConfig.ts'),
  readText('src/bundledRuntime.ts'),
  readText('App.tsx'),
  readText('plugins/withBundledPhaserRuntime.js'),
])

for (const profile of ['development', 'preview']) {
  assert(
    easJson.build?.[profile]?.env?.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE === 'remote',
    `${profile} EAS profile must remain explicitly remote.`,
  )
}

assert(
  easJson.build?.production?.env?.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE === 'bundled',
  'Production EAS profile must be explicitly bundled.',
)
assert(
  !Object.prototype.hasOwnProperty.call(
    easJson.build?.production?.env ?? {},
    'EXPO_PUBLIC_DROPITYCOON_GAME_URL',
  ),
  'Production EAS profile must not define a remote game document URL.',
)
assert(
  easJson.build?.production?.android?.buildType === 'app-bundle',
  'Production Android profile must remain app-bundle.',
)

assert(
  packageJson.scripts?.postinstall === 'node scripts/prepare-bundled-runtime.mjs',
  'Mobile postinstall must prepare the bundled runtime before Expo prebuild.',
)
assert(
  packageJson.dependencies?.['@dr.pogodin/react-native-static-server'] === '0.27.1',
  'Bundled runtime server dependency must remain pinned.',
)
assert(
  packageJson.dependencies?.['@dr.pogodin/react-native-fs'] === '2.40.1',
  'Bundled runtime filesystem dependency must remain pinned.',
)

const plugins = appJson.expo?.plugins ?? []
assert(
  plugins.some(plugin =>
    plugin === './plugins/withBundledPhaserRuntime' ||
    (Array.isArray(plugin) && plugin[0] === './plugins/withBundledPhaserRuntime')
  ),
  'Expo app config must register the bundled Phaser config plugin.',
)

assert(runtimeConfig.includes("configuredRuntimeMode === 'bundled'"), 'Bundled runtime mode is missing.')
assert(runtimeConfig.includes("configuredRuntimeMode !== 'remote'"), 'Remote runtime mode validation is missing.')
assert(runtimeConfig.includes("parsed.protocol !== 'https:'"), 'Remote runtime must stay HTTPS-only.')

assert(bundledRuntime.includes('BUNDLED_RUNTIME_PORT = 17831'), 'Bundled runtime origin port must stay stable for localStorage continuity.')
assert(bundledRuntime.includes("hostname: '127.0.0.1'"), 'Bundled runtime server must bind to loopback only.')
assert(!bundledRuntime.includes('nonLocal: true'), 'Bundled runtime server must never be exposed off-device.')
assert(bundledRuntime.includes('copyFileAssets'), 'Packaged Android assets must be copied into the app-private runtime directory.')

assert(pluginSource.includes('dropi_network_security_config'), 'Production plugin must install a loopback network security config.')
assert(pluginSource.includes('<base-config cleartextTrafficPermitted="false" />'), 'Non-loopback cleartext must stay disabled.')
assert(pluginSource.includes('<domain includeSubdomains="false">127.0.0.1</domain>'), 'Only the loopback cleartext destination may be enabled.')
assert(pluginSource.includes("process.env.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE !== BUNDLED_MODE"), 'Native bundling plugin must be production-mode gated.')

assert(appSource.includes('startBundledPhaserRuntime'), 'App must start the bundled Phaser runtime in bundled mode.')
assert(appSource.includes('BUNDLED_RUNTIME_ORIGIN'), 'App must enforce the local runtime origin.')
assert(appSource.includes('onShouldStartLoadWithRequest={allowNavigation}'), 'WebView navigation allowlist must remain active.')
assert(!appSource.includes('source={{ uri: runtime.gameUrl }}'), 'Legacy direct remote-only WebView source must not return.')

console.log('Bundled Phaser runtime configuration validation passed.')
