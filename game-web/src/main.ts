import Phaser from 'phaser'
import { createGameConfig } from './config/gameConfig'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Missing #app mount element')
}

void screen.orientation?.lock?.('landscape').catch(() => undefined)

new Phaser.Game(createGameConfig('app'))
