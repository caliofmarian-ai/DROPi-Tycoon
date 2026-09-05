import Phaser from 'phaser'
import { createGameConfig } from './config/gameConfig'
import {
  DROPi_NATIVE_BACK_EVENT,
  resolveNativeBackTarget,
} from './platform/nativeBackNavigation'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Missing #app mount element')
}

void screen.orientation?.lock?.('landscape').catch(() => undefined)

const game = new Phaser.Game(createGameConfig('app'))

const handleNativeBack = (): void => {
  const activeScenes = game.scene.getScenes(true)
  const activeScene = activeScenes.at(-1)
  if (!activeScene) return

  const target = resolveNativeBackTarget(activeScene.scene.key)
  if (!target) return

  activeScene.scene.start(target)
}

window.addEventListener(DROPi_NATIVE_BACK_EVENT, handleNativeBack)
window.addEventListener(
  'beforeunload',
  () => window.removeEventListener(DROPi_NATIVE_BACK_EVENT, handleNativeBack),
  { once: true },
)
