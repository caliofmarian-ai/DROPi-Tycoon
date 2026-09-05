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
import { capabilityLevelFromLabel, COLORS, formatMoney, rectCenterX, rectCenterY } from '../ui/theme'
import {
  createStatusChip,
  createThemedButton,
  drawCapabilityBar,
  drawPanel,
  drawVehicleGlyph,
  paintBackdrop,
} from '../ui/themeControls'

interface VehicleRowControls {
  card: Phaser.GameObjects.Graphics
  glyph: Phaser.GameObjects.Graphics
  nameText: Phaser.GameObjects.Text
  metaText: Phaser.GameObjects.Text
  speedBar: Phaser.GameObjects.Graphics
  capacityBar: Phaser.GameObjects.Graphics
  ownershipChip: { background: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text }
  purchaseControl: ReturnType<typeof createThemedButton>
}

export class VehicleFleetScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private layout!: VehicleFleetLayout

  private summaryText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private rowControls: VehicleRowControls[] = []

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
    // Phaser Scene instances survive restart(). Android immersive/WebView viewport
    // changes can trigger RESIZE immediately after entry, so references from the
    // previous create cycle must never remain in these indexed collections.
    this.resetViewReferences()

    const { width, height } = this.scale
    this.layout = buildVehicleFleetLayout(width, height, VEHICLE_CATALOG.length)
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = reconcileLegacyBicycleOwnership(session.company)

    if (this.companyState !== session.company) {
      replaceGameSession(this.worldState, this.companyState)
    }

    this.cameras.main.setBackgroundColor('#050b16')
    paintBackdrop(this, width, height)

    this.add
      .text(this.layout.title.x, this.layout.title.y, 'Vehicle Fleet', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.title.fontSize}px`,
        color: COLORS.textPrimary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.summaryText = this.add
      .text(this.layout.summary.x, this.layout.summary.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.summary.fontSize}px`,
        color: COLORS.textSecondary,
        align: 'center',
      })
      .setOrigin(0.5)

    drawPanel(this, this.layout.panel, { tone: 'success', radius: 12 })

    this.layout.rows.forEach((rowLayout, index) => {
      const definition = VEHICLE_CATALOG[index]
      if (!definition) return

      const card = drawPanel(this, rowLayout.row, { tone: 'default', radius: 10, fillAlpha: 0.9 })

      const glyphX = rowLayout.row.left + Math.min(30, rowLayout.row.height * 0.55)
      const glyphY = rectCenterY(rowLayout.row)
      const glyphScale = Math.max(1, Math.min(2.1, rowLayout.row.height / 42))
      const glyph = drawVehicleGlyph(this, glyphX, glyphY, glyphScale, definition.typeId, COLORS.accent)

      const textLeft = glyphX + 26
      const nameText = this.add
        .text(textLeft, rowLayout.row.top + rowLayout.row.height * 0.3, definition.name, {
          fontFamily: 'Arial',
          fontSize: `${rowLayout.text.fontSize}px`,
          color: COLORS.textPrimary,
          fontStyle: 'bold',
        })
        .setOrigin(0, 0.5)

      const metaText = this.add
        .text(
          textLeft,
          rowLayout.row.top + rowLayout.row.height * 0.68,
          '',
          {
            fontFamily: 'Arial',
            fontSize: `${Math.max(11, rowLayout.text.fontSize - 3)}px`,
            color: COLORS.textMuted,
          },
        )
        .setOrigin(0, 0.5)

      const barWidth = 30
      const barY = rowLayout.row.top + rowLayout.row.height * 0.28
      const speedBar = drawCapabilityBar(
        this,
        textLeft,
        barY + 8,
        barWidth,
        5,
        capabilityLevelFromLabel(definition.speedLabel),
        'accent',
      )
      const capacityBar = drawCapabilityBar(
        this,
        textLeft + barWidth + 14,
        barY + 8,
        barWidth,
        5,
        capabilityLevelFromLabel(definition.capacityLabel),
        'gold',
      )

      const ownershipChip = createStatusChip(
        this,
        rowLayout.purchaseButton.left - 42,
        rectCenterY(rowLayout.row),
        '—',
        'neutral',
        Math.max(11, rowLayout.purchaseFontSize - 4),
      )

      const purchaseControl = createThemedButton(
        this,
        rowLayout.purchaseButton,
        '',
        'success',
        () => this.purchase(definition.typeId),
        { fontSize: rowLayout.purchaseFontSize },
      )

      this.rowControls.push({
        card,
        glyph,
        nameText,
        metaText,
        speedBar,
        capacityBar,
        ownershipChip,
        purchaseControl,
      })
    })

    this.feedbackText = this.add
      .text(this.layout.feedback.x, this.layout.feedback.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.feedback.fontSize}px`,
        color: COLORS.textGold,
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
      this.resetViewReferences()
    })
  }

  private resetViewReferences(): void {
    this.rowControls = []
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
        const autosave = autosaveIfApproved(storage, session, 'vehicle-purchased')
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
      `${this.companyState.companyName}   ${formatMoney(this.companyState.money)}   Fleet: ${ownedTypes}/${VEHICLE_CATALOG.length}`,
    )

    VEHICLE_CATALOG.forEach((definition, index) => {
      const controls = this.rowControls[index]
      if (!controls) return

      const owned = ownsVehicleType(this.companyState, definition.typeId)
      controls.metaText.setText(
        `Maintenance: ${formatMoney(definition.maintenanceCostPerDay)}/day`,
      )

      controls.ownershipChip.label.setText(owned ? 'Owned' : formatMoney(definition.purchaseCost))
      controls.ownershipChip.background.clear()
      const palette = owned
        ? { fill: 0x0f2e1c, border: COLORS.success, text: COLORS.textSuccess }
        : { fill: 0x2c210a, border: COLORS.gold, text: COLORS.textGold }
      const label = controls.ownershipChip.label
      label.setColor(palette.text)
      const paddingX = 10
      const chipWidth = label.width + paddingX * 2
      const chipHeight = Math.max(20, label.height + 6)
      controls.ownershipChip.background.fillStyle(palette.fill, 0.92)
      controls.ownershipChip.background.fillRoundedRect(
        label.x - chipWidth / 2,
        label.y - chipHeight / 2,
        chipWidth,
        chipHeight,
        chipHeight / 2,
      )
      controls.ownershipChip.background.lineStyle(1.5, palette.border, 0.85)
      controls.ownershipChip.background.strokeRoundedRect(
        label.x - chipWidth / 2,
        label.y - chipHeight / 2,
        chipWidth,
        chipHeight,
        chipHeight / 2,
      )

      controls.purchaseControl.setEnabled(!owned)
      controls.purchaseControl.setLabel(owned ? 'Owned' : `Buy`)
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
      .rectangle(x, y, bounds.width, bounds.height, COLORS.surfaceRaised, 1)
      .setStrokeStyle(2, COLORS.accent, 0.75)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: COLORS.textPrimary,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: Math.max(80, bounds.width - 12) },
      })
      .setOrigin(0.5)

    button.on('pointerdown', onTap)
  }
}
