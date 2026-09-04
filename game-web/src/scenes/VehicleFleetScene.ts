import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { synchronizePlayerMovementSpeed } from '../systems/bicycleSystem'
import {
  ownsVehicleType,
  purchaseVehicle,
  reconcileLegacyBicycleOwnership,
  VEHICLE_CATALOG,
} from '../systems/vehicleSystem'
import type { CompanyState, VehicleTypeId, WorldState } from '../types/game'
import {
  buildVehicleFleetLayout,
  type VehicleFleetLayout,
} from '../ui/vehicleFleetLayout'
import type { LayoutRect } from '../ui/mobileViewport'

const rectCenterX = (rect: LayoutRect): number => rect.left + rect.width / 2
const rectCenterY = (rect: LayoutRect): number => rect.top + rect.height / 2

export class VehicleFleetScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private layout!: VehicleFleetLayout

  private summaryText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private rowTexts: Phaser.GameObjects.Text[] = []
  private purchaseButtons: Phaser.GameObjects.Rectangle[] = []
  private purchaseLabels: Phaser.GameObjects.Text[] = []

  private readonly handleResize = (): void => {
    if (this.worldState && this.companyState) {
      replaceGameSession(this.worldState, this.companyState)
    }
    this.scene.restart()
  }

  constructor() {
    super('VehicleFleet')
  }

  create(): void {
    const { width, height } = this.scale
    this.layout = buildVehicleFleetLayout(width, height, VEHICLE_CATALOG.length)
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = reconcileLegacyBicycleOwnership(session.company)

    if (this.companyState !== session.company) {
      replaceGameSession(this.worldState, this.companyState)
    }

    this.cameras.main.setBackgroundColor('#111827')

    this.add
      .text(this.layout.title.x, this.layout.title.y, 'Vehicle Fleet', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.title.fontSize}px`,
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.summaryText = this.add
      .text(this.layout.summary.x, this.layout.summary.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.summary.fontSize}px`,
        color: '#dbeafe',
        align: 'center',
      })
      .setOrigin(0.5)

    this.add
      .rectangle(
        rectCenterX(this.layout.panel),
        rectCenterY(this.layout.panel),
        this.layout.panel.width,
        this.layout.panel.height,
        0x0f172a,
        0.97,
      )
      .setStrokeStyle(3, 0x22c55e, 0.75)

    this.layout.rows.forEach((rowLayout, index) => {
      const definition = VEHICLE_CATALOG[index]
      if (!definition) return

      this.add
        .rectangle(
          rectCenterX(rowLayout.row),
          rectCenterY(rowLayout.row),
          rowLayout.row.width,
          rowLayout.row.height,
          0x1e293b,
          0.97,
        )
        .setStrokeStyle(1, 0x475569, 0.9)

      const rowText = this.add
        .text(rowLayout.text.x, rowLayout.text.y, '', {
          fontFamily: 'Arial',
          fontSize: `${rowLayout.text.fontSize}px`,
          color: '#e2e8f0',
          align: 'left',
          lineSpacing: 2,
          wordWrap: { width: rowLayout.text.wrapWidth },
        })
        .setOrigin(0, 0.5)
      this.rowTexts.push(rowText)

      const purchaseButton = this.add
        .rectangle(
          rectCenterX(rowLayout.purchaseButton),
          rectCenterY(rowLayout.purchaseButton),
          rowLayout.purchaseButton.width,
          rowLayout.purchaseButton.height,
          0x15803d,
          1,
        )
        .setStrokeStyle(2, 0x86efac)
      const purchaseLabel = this.add
        .text(
          rectCenterX(rowLayout.purchaseButton),
          rectCenterY(rowLayout.purchaseButton),
          '',
          {
            fontFamily: 'Arial',
            fontSize: `${rowLayout.purchaseFontSize}px`,
            color: '#f0fdf4',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: Math.max(70, rowLayout.purchaseButton.width - 8) },
          },
        )
        .setOrigin(0.5)

      this.purchaseButtons.push(purchaseButton)
      this.purchaseLabels.push(purchaseLabel)
    })

    this.feedbackText = this.add
      .text(this.layout.feedback.x, this.layout.feedback.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.feedback.fontSize}px`,
        color: '#fef3c7',
        align: 'center',
        wordWrap: { width: this.layout.feedback.wrapWidth },
      })
      .setOrigin(0.5)

    this.createButton(
      this.layout.returnButton,
      'Company',
      () => this.returnToCompany(),
      this.layout.navFontSize,
    )
    this.createButton(
      this.layout.menuButton,
      'Main Menu',
      () => this.returnToMainMenu(),
      this.layout.navFontSize,
    )

    this.refreshView()

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private purchase(typeId: VehicleTypeId): void {
    const result = purchaseVehicle(this.companyState, typeId)
    this.feedbackText.setText(result.message)

    if (result.purchased) {
      this.companyState = result.company
      this.worldState = synchronizePlayerMovementSpeed(this.worldState, this.companyState)
      const session = replaceGameSession(this.worldState, this.companyState)
      const storage = getBrowserSaveStorage()
      if (storage) {
        const autosave = autosaveIfApproved(storage, session, 'progression-changed')
        if (!autosave.saved && autosave.reason === 'write-failed') {
          this.feedbackText.setText(
            `${result.message}\nLocal autosave failed: ${autosave.message ?? 'unknown error'}`,
          )
        }
      }
    }

    this.refreshView()
  }

  private refreshView(): void {
    const ownedTypes = VEHICLE_CATALOG.filter((definition) =>
      ownsVehicleType(this.companyState, definition.typeId),
    ).length
    this.summaryText.setText(
      `${this.companyState.companyName}   Money: ${this.companyState.money}   Fleet: ${ownedTypes}/${VEHICLE_CATALOG.length}`,
    )

    VEHICLE_CATALOG.forEach((definition, index) => {
      const rowText = this.rowTexts[index]
      const button = this.purchaseButtons[index]
      const label = this.purchaseLabels[index]
      if (!rowText || !button || !label) return

      const owned = ownsVehicleType(this.companyState, definition.typeId)
      rowText.setText([
        `${definition.name} — ${definition.category}`,
        `Speed: ${definition.speedLabel}   Capacity: ${definition.capacityLabel}   Cost: ${definition.purchaseCost}`,
      ])

      button.removeAllListeners('pointerdown')
      if (owned) {
        button.disableInteractive().setAlpha(0.5)
        label.setText('Owned').setAlpha(0.75)
      } else {
        button
          .setInteractive({ useHandCursor: true })
          .setAlpha(1)
          .on('pointerdown', () => this.purchase(definition.typeId))
        label.setText(`Buy ${definition.purchaseCost}`).setAlpha(1)
      }
    })
  }

  private returnToCompany(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('CompanyManagement')
  }

  private returnToMainMenu(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('MainMenu')
  }

  private createButton(
    bounds: LayoutRect,
    label: string,
    onTap: () => void,
    fontSize: number,
  ): void {
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const button = this.add
      .rectangle(x, y, bounds.width, bounds.height, 0x0f766e, 1)
      .setStrokeStyle(2, 0x99f6e4)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: '#ecfeff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: Math.max(80, bounds.width - 12) },
      })
      .setOrigin(0.5)

    button.on('pointerdown', onTap)
  }
}
