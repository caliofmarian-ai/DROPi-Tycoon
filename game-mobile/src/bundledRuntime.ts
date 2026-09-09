import { Platform } from 'react-native'
import Server, { getActiveServer } from '@dr.pogodin/react-native-static-server'
import {
  copyFileAssets,
  DocumentDirectoryPath,
  exists,
  readFile,
  readFileAssets,
  unlink,
} from '@dr.pogodin/react-native-fs'

const BUNDLED_ASSET_ROOT = 'dropi-game'
const BUNDLED_MANIFEST_NAME = 'dropi-runtime-manifest.json'
const BUNDLED_ENTRYPOINT_NAME = 'index.html'
const BUNDLED_RUNTIME_PORT = 17831
const BUNDLED_RUNTIME_DIRECTORY = `${DocumentDirectoryPath}/dropi-tycoon-phaser-runtime`
const BUNDLED_MANIFEST_PATH = `${BUNDLED_RUNTIME_DIRECTORY}/${BUNDLED_MANIFEST_NAME}`
const BUNDLED_ENTRYPOINT_PATH = `${BUNDLED_RUNTIME_DIRECTORY}/${BUNDLED_ENTRYPOINT_NAME}`

export const BUNDLED_RUNTIME_ORIGIN = `http://127.0.0.1:${BUNDLED_RUNTIME_PORT}`

let bundledServer: Server | null = null
let preparationPromise: Promise<void> | null = null

const readInstalledManifest = async (): Promise<string | null> => {
  try {
    return await readFile(BUNDLED_MANIFEST_PATH, 'utf8')
  } catch {
    return null
  }
}

const prepareBundledAssets = async (): Promise<void> => {
  const packagedManifest = await readFileAssets(
    `${BUNDLED_ASSET_ROOT}/${BUNDLED_MANIFEST_NAME}`,
    'utf8',
  )
  const installedManifest = await readInstalledManifest()

  if (
    installedManifest === packagedManifest &&
    await exists(BUNDLED_ENTRYPOINT_PATH)
  ) {
    return
  }

  if (await exists(BUNDLED_RUNTIME_DIRECTORY)) {
    await unlink(BUNDLED_RUNTIME_DIRECTORY)
  }

  await copyFileAssets(BUNDLED_ASSET_ROOT, BUNDLED_RUNTIME_DIRECTORY)

  const copiedManifest = await readInstalledManifest()
  if (
    copiedManifest !== packagedManifest ||
    !(await exists(BUNDLED_ENTRYPOINT_PATH))
  ) {
    throw new Error('Bundled Phaser assets failed integrity preparation.')
  }
}

const ensurePrepared = async (): Promise<void> => {
  if (!preparationPromise) {
    preparationPromise = prepareBundledAssets().catch(error => {
      preparationPromise = null
      throw error
    })
  }

  await preparationPromise
}

const assertExpectedOrigin = (origin: string): string => {
  if (origin !== BUNDLED_RUNTIME_ORIGIN) {
    throw new Error(
      `Bundled Phaser server started at an unexpected origin: ${origin}`,
    )
  }

  return `${origin}/${BUNDLED_ENTRYPOINT_NAME}`
}

export const startBundledPhaserRuntime = async (): Promise<string> => {
  if (Platform.OS !== 'android') {
    throw new Error('The bundled Phaser runtime is currently supported on Android only.')
  }

  const activeServer = getActiveServer()
  if (activeServer) {
    if (activeServer.fileDir !== BUNDLED_RUNTIME_DIRECTORY) {
      throw new Error('Another local static server is already active for this app process.')
    }

    bundledServer = activeServer
    return assertExpectedOrigin(await activeServer.start())
  }

  await ensurePrepared()

  if (!bundledServer) {
    bundledServer = new Server({
      fileDir: BUNDLED_RUNTIME_DIRECTORY,
      hostname: '127.0.0.1',
      port: BUNDLED_RUNTIME_PORT,
      stopInBackground: false,
    })
  }

  return assertExpectedOrigin(await bundledServer.start())
}
