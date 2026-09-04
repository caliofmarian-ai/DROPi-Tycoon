import Phaser from 'phaser'
import { appConfig } from './env'
import { CompanyManagementScene } from '../scenes/CompanyManagementScene'
import { CustomerReviewsScene } from '../scenes/CustomerReviewsScene'
import { EmployeeManagementScene } from '../scenes/EmployeeManagementScene'
import { FinancialReportScene } from '../scenes/FinancialReportScene'
import { GameWorldScene } from '../scenes/GameWorldScene'
import { MainMenuScene } from '../scenes/MainMenuScene'

export const createGameConfig = (parent: string): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#10151d',
  width: appConfig.width,
  height: appConfig.height,
  scale: {
    // RBATCH-015: keep game coordinates in actual canvas/CSS pixels so touch
    // targets do not shrink when a fixed logical canvas is fitted to a phone.
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  scene: [
    MainMenuScene,
    GameWorldScene,
    CompanyManagementScene,
    EmployeeManagementScene,
    FinancialReportScene,
    CustomerReviewsScene,
  ],
})
