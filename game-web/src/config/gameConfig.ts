import Phaser from 'phaser'
import { appConfig } from './env'
import { CompanyManagementScene } from '../scenes/CompanyManagementScene'
import { GameWorldScene } from '../scenes/GameWorldScene'
import { MainMenuScene } from '../scenes/MainMenuScene'

export const createGameConfig = (parent: string): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#10151d',
  width: appConfig.width,
  height: appConfig.height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  scene: [MainMenuScene, GameWorldScene, CompanyManagementScene],
})
