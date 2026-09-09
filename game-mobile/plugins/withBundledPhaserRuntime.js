const fs = require('node:fs/promises')
const path = require('node:path')
const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins')

const BUNDLED_MODE = 'bundled'
const BUNDLED_ASSET_DIRECTORY = 'dropi-game'
const BUNDLED_MANIFEST_NAME = 'dropi-runtime-manifest.json'
const NETWORK_SECURITY_CONFIG_NAME = 'dropi_network_security_config'

const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">127.0.0.1</domain>
    </domain-config>
</network-security-config>
`

const withBundledPhaserRuntime = config => {
  if (process.env.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE !== BUNDLED_MODE) {
    return config
  }

  config = withAndroidManifest(config, config => {
    const application = config.modResults.manifest.application?.[0]
    if (!application) {
      throw new Error('Android application manifest node is unavailable.')
    }

    application.$ = application.$ || {}
    application.$['android:networkSecurityConfig'] = `@xml/${NETWORK_SECURITY_CONFIG_NAME}`
    return config
  })

  return withDangerousMod(config, [
    'android',
    async config => {
      const projectRoot = config.modRequest.projectRoot
      const androidRoot = config.modRequest.platformProjectRoot
      const sourceDirectory = path.resolve(projectRoot, '../game-web/dist')
      const sourceManifest = path.join(sourceDirectory, BUNDLED_MANIFEST_NAME)
      const targetDirectory = path.join(
        androidRoot,
        'app/src/main/assets',
        BUNDLED_ASSET_DIRECTORY,
      )
      const networkConfigPath = path.join(
        androidRoot,
        'app/src/main/res/xml',
        `${NETWORK_SECURITY_CONFIG_NAME}.xml`,
      )

      try {
        await fs.access(path.join(sourceDirectory, 'index.html'))
        await fs.access(sourceManifest)
      } catch {
        throw new Error(
          'Bundled Phaser dist is missing. Production setup must run scripts/prepare-bundled-runtime.mjs before Expo prebuild.',
        )
      }

      await fs.rm(targetDirectory, { recursive: true, force: true })
      await fs.mkdir(path.dirname(targetDirectory), { recursive: true })
      await fs.cp(sourceDirectory, targetDirectory, { recursive: true })

      await fs.mkdir(path.dirname(networkConfigPath), { recursive: true })
      await fs.writeFile(networkConfigPath, networkSecurityConfig, 'utf8')

      return config
    },
  ])
}

module.exports = withBundledPhaserRuntime
