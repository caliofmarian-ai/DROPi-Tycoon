import Phaser from 'phaser'
import { appConfig } from './env'
import { CompanyManagementScene } from '../scenes/CompanyManagementScene'
import { CustomerReviewsScene } from '../scenes/CustomerReviewsScene'
import { EmployeeManagementScene } from '../scenes/EmployeeManagementScene'
import { FinancialReportScene } from '../scenes/FinancialReportScene'
import { GameWorldScene } from '../scenes/GameWorldScene'
import { GlobalMapScene } from '../scenes/GlobalMapScene'
import { HQInteriorScene } from '../scenes/HQInteriorScene'
import { ApprovedAssetMainMenuScene } from '../scenes/ApprovedAssetMainMenuScene'
import { MarketplaceInteriorScene } from '../scenes/MarketplaceInteriorScene'
import { VehicleFleetScene } from '../scenes/VehicleFleetScene'
import { COLORS } from '../ui/theme'

export const createGameConfig = (parent: string): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: COLORS.backgroundBottom,
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
    ApprovedAssetMainMenuScene,
    GameWorldScene,
    GlobalMapScene,
    HQInteriorScene,
    MarketplaceInteriorScene,
    CompanyManagementScene,
    EmployeeManagementScene,
    FinancialReportScene,
    CustomerReviewsScene,
    VehicleFleetScene,
  ],
})
