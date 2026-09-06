import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import {
  ACTIVE_TRANSPORT_LABELS,
  availableActiveTransports,
  nextActiveTransport,
} from '../systems/activeTransportSystem'
import { performUrbanInteraction } from '../systems/urbanInteractions'
import { MARKETPLACE_LISTINGS } from '../systems/urbanMarketplace'
import type { CompanyState, EmployeeState, VehicleTypeId, WorldState } from '../types/game'
import {
  ANALOG_JOYSTICK_HIT_DIAMETER,
  ANALOG_JOYSTICK_KNOB_RADIUS,
  ANALOG_JOYSTICK_TRAVEL_RADIUS,
  ANALOG_JOYSTICK_VISUAL_DIAMETER,
  AnalogJoystickInput,
} from '../ui/AnalogJoystick'
import {
  HQ_MANAGEMENT_RETURN_REGISTRY_KEY,
  HQ_MANAGEMENT_RETURN_SCENE,
  type HQManagementScene,
} from '../ui/hqManagementNavigation'
import { CITY_COLORS, COLORS } from '../ui/theme'
import {
  INTERIOR_LOCATIONS,
  moveInteriorPlayer,
  nearestInteriorInteraction,
  transportBayLabel,
  type InteriorInteraction,
  type InteriorLocationDefinition,
  type InteriorLocationId,
  type InteriorPoint,
} from '../world/interiorLocations'
import { movementFacing, type UrbanFacing } from '../world/urbanWorld'
import { createPlayerVisual, type PlayerVisual } from '../world/playerVisual'

const WALK_SPEED = 185

const vehicleLabel = (typeId: VehicleTypeId): string => {
  switch (typeId) {
    case 'Bicycle': return 'Bicycle'
    case 'ElectricScooter': return 'Electric Scooter'
    case 'Motorcycle': return 'Motorcycle'
    case 'DeliveryVan': return 'Delivery Van'
  }
}

export abstract class BaseInteriorScene extends Phaser.Scene {
  private readonly locationId: InteriorLocationId
  private location!: InteriorLocationDefinition
  private worldState!: WorldState
  private companyState!: CompanyState
  private position!: InteriorPoint
  private playerVisual!: PlayerVisual
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {}
  private facing: UrbanFacing = 'up'
  private readonly joystick = new AnalogJoystickInput()
  private padHit!: Phaser.GameObjects.Rectangle
  private padChrome!: Phaser.GameObjects.Graphics
  private padKnob!: Phaser.GameObjects.Arc
  private actionHit!: Phaser.GameObjects.Rectangle
  private actionChrome!: Phaser.GameObjects.Graphics
  private actionLabel!: Phaser.GameObjects.Text
  private prompt!: Phaser.GameObjects.Text
  private toast!: Phaser.GameObjects.Text
  private activeText!: Phaser.GameObjects.Text
  private fleetText?: Phaser.GameObjects.Text
  private toastTimer?: Phaser.Time.TimerEvent

  protected constructor(sceneKey: string, locationId: InteriorLocationId) {
    super(sceneKey)
    this.locationId = locationId
  }

  create(): void {
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company
    this.location = INTERIOR_LOCATIONS[this.locationId]
    this.position = { ...this.location.spawn }
    this.cameras.main
      .setBackgroundColor(COLORS.backgroundBottom)
      .setBounds(0, 0, this.location.width, this.location.height)
      .setZoom(1)

    this.drawInterior()
    this.playerVisual = createPlayerVisual(this, this.position.x, this.position.y)
    this.playerVisual.setState('Walking')
    this.playerVisual.setFacing(this.facing)
    this.playerVisual.container.setDepth(20)
    this.cameras.main.startFollow(this.playerVisual.container, false, 0.16, 0.16)

    this.createControls()
    this.keys = (this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') ?? {}) as typeof this.keys
    this.input.keyboard?.on('keydown-ESC', this.exitInterior)
    this.input.on('pointermove', this.movePad)
    this.input.on('pointerup', this.releasePad)
    this.input.on('pointerupoutside', this.releasePad)
    this.input.on('gameout', this.clearInput)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutControls)
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearInput)
    this.events.on(Phaser.Scenes.Events.SLEEP, this.clearInput)
    this.events.on(Phaser.Scenes.Events.WAKE, this.handleWake, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
    this.refreshStateLabels()
    this.refreshPrompt()
    this.notify(this.locationId === 'hq'
      ? 'HQ is physical management: Hiring, Fleet, Management and Parcel terminals are inside this building.'
      : 'Use the joystick to walk · Action at a counter · Exit through the south door.')
  }

  update(_time: number, delta: number): void {
    const down = (key: string): number => this.keys[key]?.isDown ? 1 : 0
    const touch = this.joystick.value()
    const input = {
      x: touch.x + down('D') + down('RIGHT') - down('A') - down('LEFT'),
      y: touch.y + down('S') + down('DOWN') - down('W') - down('UP'),
    }
    const before = { ...this.position }
    this.position = moveInteriorPlayer(this.location, this.position, input, Math.min(delta / 1000, 0.05), WALK_SPEED)
    const displacement = { x: this.position.x - before.x, y: this.position.y - before.y }
    const moving = displacement.x !== 0 || displacement.y !== 0
    this.playerVisual.container.setPosition(this.position.x, this.position.y)
    if (moving) {
      this.facing = movementFacing(displacement, this.facing)
      this.playerVisual.setFacing(this.facing)
    }
    this.playerVisual.setMoving(moving)
    this.playerVisual.update(delta)
    this.refreshPrompt()
    if (this.keys.E && Phaser.Input.Keyboard.JustDown(this.keys.E)) this.onAction()
  }

  private drawInterior(): void {
    const { width, height } = this.location
    this.add.rectangle(width / 2, height / 2, width, height, CITY_COLORS.cream).setDepth(0)
    this.add.rectangle(width / 2, 46, width - 34, 72, COLORS.surface).setStrokeStyle(3, COLORS.accent).setDepth(1)
    this.add.text(52, 24, this.location.title, {
      fontFamily: 'Arial, sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
    }).setDepth(3)
    this.add.text(52, 54, this.location.subtitle, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#9feaff',
    }).setDepth(3)

    if (this.locationId === 'hq') this.drawHQInterior()
    else this.drawMarketplaceInterior()

    this.location.interactions.forEach(interaction => this.drawInteractionMarker(interaction))
  }

  private drawHQInterior(): void {
    this.zonePanel(65, 105, 335, 180, 'EMPLOYEE AREA', 'Hiring · onboarding · field-team status', COLORS.accentStrong)
    this.zonePanel(65, 310, 335, 305, 'FLEET BAY', 'Buy vehicles · owned fleet · active handoff', COLORS.accent)
    this.zonePanel(765, 105, 365, 195, 'OPERATIONS & DISPATCH', 'Company management · route control', COLORS.gold)
    this.zonePanel(765, 335, 365, 190, 'PARCEL STAGING', 'Accept work · sorting · parcel handoff', COLORS.accentStrong)
    this.zonePanel(445, 105, 270, 120, 'HQ EXPANSION', 'Future operational wings', 0x6d7d91)
    this.zonePanel(445, 270, 270, 145, 'MAINTENANCE WING', 'Construction required · issue #343', 0x7c8793)
    this.add.text(478, 178, 'FUTURE · NOT YET OPERATIONAL', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#6a7685',
    }).setDepth(4)
    this.drawConstructionZone(580, 355)

    this.drawDepartmentEquipment()
    this.drawOwnedFleet()
    this.drawEmployees()

    this.fleetText = this.add.text(88, 575, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#123f5d',
      wordWrap: { width: 285 },
    }).setDepth(8)
  }

  /** Department equipment begins below the reserved title/subtitle header strip. */
  private drawDepartmentEquipment(): void {
    // Hiring terminal: current employees are Couriers, so this is a recruitment/onboarding station,
    // not a fake office desk where field couriers are shown working.
    this.add.rectangle(145, 225, 92, 24, 0x8b6846, 0.94).setStrokeStyle(2, CITY_COLORS.trunk).setDepth(4)
    this.add.rectangle(145, 207, 38, 27, 0x1b4460, 0.95).setStrokeStyle(2, COLORS.accent).setDepth(5)
    this.add.rectangle(145, 206, 29, 17, CITY_COLORS.glass, 0.9).setDepth(6)
    this.add.text(145, 247, 'HIRING TERMINAL', {
      fontFamily: 'Arial, sans-serif', fontSize: '8px', fontStyle: 'bold', color: '#47687b',
    }).setOrigin(0.5).setDepth(6)

    // Operations control equipment exists as infrastructure. No Courier is seated here.
    this.add.rectangle(950, 249, 270, 28, 0x77553c, 0.96).setStrokeStyle(2, CITY_COLORS.trunk).setDepth(4)
    ;[870, 950, 1030].forEach((x, index) => {
      this.add.rectangle(x, 207, 64, 42, 0x153d59, 0.98).setStrokeStyle(2, COLORS.accent).setDepth(5)
      this.add.rectangle(x, 207, 54, 32, index === 1 ? CITY_COLORS.glass : 0x78d8e8, 0.82).setDepth(6)
      this.add.text(x, 207, index === 1 ? 'ROUTES' : index === 0 ? 'ORDERS' : 'FLEET', {
        fontFamily: 'Arial, sans-serif', fontSize: '8px', fontStyle: 'bold', color: '#073354',
      }).setOrigin(0.5).setDepth(7)
    })

    this.add.rectangle(950, 474, 270, 22, 0x6c7d89, 0.9).setStrokeStyle(2, 0x42525e).setDepth(4)
    for (let index = 0; index < 6; index += 1) {
      const x = 835 + index * 46
      this.add.rectangle(x, 443 - (index % 2) * 4, 32, 26, CITY_COLORS.parcel, 0.95)
        .setStrokeStyle(1, CITY_COLORS.trunk).setDepth(5)
      this.add.rectangle(x, 443 - (index % 2) * 4, 5, 26, CITY_COLORS.tape).setDepth(6)
    }
  }

  private drawConstructionZone(x: number, y: number): void {
    const g = this.add.graphics().setDepth(5)
    g.lineStyle(5, 0xf3b64b, 0.95)
    for (let offset = -90; offset <= 90; offset += 32) g.lineBetween(x + offset, y - 42, x + offset + 28, y + 42)
    g.lineStyle(3, 0x6f7882, 0.9).strokeRect(x - 105, y - 48, 210, 96)
    this.add.text(x, y + 52, 'LOCKED · BUILD THROUGH PROGRESSION', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#6a7685',
    }).setOrigin(0.5, 0).setDepth(6)
  }

  private drawOwnedFleet(): void {
    const vehicles = this.companyState.vehicles.slice(0, 4)
    if (vehicles.length === 0) {
      const legacy = availableActiveTransports(this.companyState).filter(transport => transport !== 'walking')
      if (legacy.length === 0) {
        this.add.text(235, 455, 'No owned vehicles yet · use Fleet Purchase Terminal', {
          fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#47687b',
          wordWrap: { width: 250 }, align: 'center',
        }).setOrigin(0.5).setDepth(5)
        return
      }
      legacy.slice(0, 4).forEach((transport, index) => {
        const typeId: VehicleTypeId = transport === 'bicycle' ? 'Bicycle'
          : transport === 'scooter' ? 'ElectricScooter'
            : transport === 'motorcycle' ? 'Motorcycle' : 'DeliveryVan'
        this.drawFleetVehicle(130 + (index % 2) * 180, 410 + Math.floor(index / 2) * 105, typeId, transportBayLabel(transport))
      })
      return
    }
    vehicles.forEach((vehicle, index) => {
      this.drawFleetVehicle(
        130 + (index % 2) * 180,
        410 + Math.floor(index / 2) * 105,
        vehicle.typeId,
        vehicleLabel(vehicle.typeId),
      )
    })
  }

  private drawFleetVehicle(x: number, y: number, typeId: VehicleTypeId, label: string): void {
    const g = this.add.graphics().setPosition(x, y).setDepth(6)
    const van = typeId === 'DeliveryVan'
    const bicycle = typeId === 'Bicycle'
    const scooter = typeId === 'ElectricScooter'
    const motorcycle = typeId === 'Motorcycle'
    if (van) {
      g.fillStyle(0x2c3c48).fillCircle(-34, 18, 10).fillCircle(34, 18, 10)
      g.fillStyle(COLORS.accentStrong).fillRoundedRect(-48, -22, 96, 43, 9)
      g.fillStyle(CITY_COLORS.cream).fillRoundedRect(-18, -34, 48, 25, 6)
      g.fillStyle(CITY_COLORS.glass).fillRoundedRect(7, -29, 19, 13, 3)
      g.fillStyle(COLORS.accent).fillRoundedRect(-40, -8, 28, 10, 3)
      g.fillStyle(CITY_COLORS.cream).fillCircle(-26, -3, 4)
    } else {
      const wheelRadius = motorcycle ? 13 : scooter ? 7 : 12
      const spacing = motorcycle ? 37 : scooter ? 32 : 36
      g.lineStyle(3, 0x304955).strokeCircle(-spacing, 12, wheelRadius).strokeCircle(spacing, 12, wheelRadius)
      if (bicycle) {
        g.lineStyle(4, COLORS.gold).strokeTriangle(-spacing, 12, 0, -10, -4, 12)
          .lineBetween(0, -10, spacing, 12).lineBetween(-4, 12, 18, 12)
        g.lineStyle(3, 0x526b78).lineBetween(18, 12, 22, -18).lineBetween(22, -18, 34, -18)
      } else if (scooter) {
        g.fillStyle(COLORS.accent).fillRoundedRect(-30, 7, 52, 7, 3)
        g.lineStyle(5, COLORS.accentStrong).lineBetween(22, 8, 31, -31).lineBetween(31, -31, 41, -31)
      } else {
        g.fillStyle(0x304955).fillRoundedRect(-24, -7, 53, 21, 8)
        g.fillStyle(COLORS.accentStrong).fillEllipse(7, -10, 36, 20)
        g.lineStyle(4, 0x526b78).lineBetween(24, -3, 34, -24).lineBetween(34, -24, 43, -24)
      }
    }
    this.add.text(x, y + 34, label, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#123f5d',
    }).setOrigin(0.5, 0).setDepth(7)
  }

  private drawEmployees(): void {
    const employees = this.companyState.employees.slice(0, 8)
    const onboarding = employees.filter(employee => employee.status === 'Onboarding').slice(0, 2)
    const fieldCouriers = employees.filter(employee => employee.status === 'Active' && employee.role === 'Courier')

    onboarding.forEach((employee, index) => this.drawOnboardingCourier(employee, index))

    const board = this.add.rectangle(290, 218, 180, 82, 0xe9f7fb, 0.94)
      .setStrokeStyle(2, COLORS.accent).setDepth(5)
    const fieldNames = fieldCouriers.slice(0, 2).map(employee => employee.name).join(' · ')
    this.add.text(290, 218,
      fieldCouriers.length
        ? `FIELD COURIERS: ${fieldCouriers.length}\n${fieldNames}\nOUTSIDE HQ · delivery role`
        : employees.length ? 'No active field courier yet' : 'No employees hired yet', {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#123f5d',
        align: 'center', wordWrap: { width: 164 },
      }).setOrigin(0.5).setDepth(6)
    board.setAlpha(0.94)
  }

  private drawOnboardingCourier(employee: EmployeeState, index: number): void {
    const baseX = 105 + index * 55
    const baseY = 255
    const actor = this.add.graphics().setPosition(baseX, baseY).setDepth(9)
    actor.fillStyle(CITY_COLORS.shadow, 0.18).fillEllipse(0, 16, 24, 7)
    actor.fillStyle(COLORS.accentStrong).fillRoundedRect(-7, -1, 14, 22, 5)
    actor.fillStyle(COLORS.accent).fillRoundedRect(-9, 2, 18, 7, 2) // courier vest band
    actor.fillStyle(CITY_COLORS.skin).fillCircle(0, -12, 7)
    actor.fillStyle(CITY_COLORS.hair).fillEllipse(0, -16, 13, 7)
    actor.fillStyle(COLORS.accent).fillRoundedRect(-8, -20, 16, 5, 2) // courier cap
    this.add.text(baseX, baseY + 23, `${employee.name}\nCourier · onboarding`, {
      fontFamily: 'Arial, sans-serif', fontSize: '7px', fontStyle: 'bold', color: '#123f5d', align: 'center',
    }).setOrigin(0.5, 0).setDepth(9)
  }

  private drawMarketplaceInterior(): void {
    this.zonePanel(125, 135, 390, 260, 'LOCAL MARKET STALLS', 'Merchant goods · local delivery economy', COLORS.gold)
    this.zonePanel(685, 135, 390, 260, 'PLAYER LISTINGS', 'Future player-to-player item economy', COLORS.accent)
    this.add.text(175, 218, `Local catalog foundation: ${MARKETPLACE_LISTINGS.length} listing templates`, {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#123f5d',
    }).setDepth(4)
    this.add.text(735, 218, 'ONLINE TRADING · FUTURE / NOT YET IMPLEMENTED', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#47687b',
      wordWrap: { width: 300 },
    }).setDepth(4)
    ;['FOOD', 'HOME', 'TOOLS', 'FASHION'].forEach((label, index) => {
      const x = 200 + index * 85
      this.add.rectangle(x, 325, 72, 64, 0xffffff, 0.76).setStrokeStyle(2, COLORS.gold).setDepth(3)
      this.add.text(x, 325, label, {
        fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#123f5d',
      }).setOrigin(0.5).setDepth(4)
    })
  }

  private zonePanel(x: number, y: number, width: number, height: number, title: string, subtitle: string, accent: number): void {
    this.add.rectangle(x + width / 2, y + height / 2, width, height, 0xffffff, 0.58)
      .setStrokeStyle(3, accent, 0.9).setDepth(2)
    // Reserved header band prevents department names/subtitles from colliding with equipment.
    this.add.rectangle(x + width / 2, y + 30, width - 6, 58, accent, 0.09).setDepth(3)
    this.add.text(x + 16, y + 9, title, {
      fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#123f5d',
    }).setDepth(4)
    this.add.text(x + 16, y + 36, subtitle, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#47687b',
      wordWrap: { width: width - 32 },
    }).setDepth(4)
    this.add.rectangle(x + width / 2, y + 61, width - 18, 1, accent, 0.34).setDepth(4)
  }

  private drawInteractionMarker(interaction: InteriorInteraction): void {
    const color = interaction.id === 'exit' ? 0x3e9e65 : interaction.id === 'operations' ? COLORS.gold : COLORS.accent
    const radius = interaction.id === 'exit' ? 21 : 18
    this.add.circle(interaction.x, interaction.y, radius, color, 0.18).setStrokeStyle(2, color, 0.88).setDepth(10)
    this.add.text(interaction.x, interaction.y, interaction.id === 'exit' ? 'EXIT' : 'A', {
      fontFamily: 'Arial, sans-serif', fontSize: interaction.id === 'exit' ? '8px' : '12px',
      fontStyle: 'bold', color: '#123f5d',
    }).setOrigin(0.5).setDepth(11)
  }

  private createControls(): void {
    this.padChrome = this.add.graphics().setScrollFactor(0).setDepth(100)
    this.padHit = this.add.rectangle(0, 0, ANALOG_JOYSTICK_HIT_DIAMETER, ANALOG_JOYSTICK_HIT_DIAMETER, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true })
    this.padHit.on('pointerdown', this.pressPad)
    this.padKnob = this.add.circle(0, 0, ANALOG_JOYSTICK_KNOB_RADIUS, COLORS.accentStrong, 0.98)
      .setStrokeStyle(2, COLORS.accent, 0.62).setScrollFactor(0).setDepth(102)

    this.actionChrome = this.add.graphics().setScrollFactor(0).setDepth(100)
    this.actionHit = this.add.rectangle(0, 0, 128, 48, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true })
    this.actionHit.on('pointerdown', () => this.onAction())
    this.actionLabel = this.add.text(0, 0, '• Action', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102)

    this.prompt = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#073354', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102)
    this.toast = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#ffffff', align: 'center',
      backgroundColor: '#073354', padding: { x: 10, y: 7 }, wordWrap: { width: 430 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setVisible(false)
    this.activeText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#0b4b70', padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(102)
    this.layoutControls()
  }

  private readonly layoutControls = (): void => {
    const width = this.scale.width
    const height = this.scale.height
    const padX = 14 + ANALOG_JOYSTICK_VISUAL_DIAMETER / 2
    const padY = height - 14 - ANALOG_JOYSTICK_VISUAL_DIAMETER / 2
    this.padHit?.setPosition(padX, padY)
    this.padChrome?.clear()
      .fillStyle(COLORS.surface, 0.06).fillCircle(padX, padY, ANALOG_JOYSTICK_VISUAL_DIAMETER / 2 - 4)
      .lineStyle(2, COLORS.accent, 0.18).strokeCircle(padX, padY, ANALOG_JOYSTICK_VISUAL_DIAMETER / 2 - 4)
    const knob = this.joystick.knobOffset()
    this.padKnob?.setPosition(padX + knob.x, padY + knob.y)

    const actionX = width - 78
    const actionY = height - 42
    this.actionHit?.setPosition(actionX, actionY)
    this.actionLabel?.setPosition(actionX, actionY)
    this.actionChrome?.clear()
      .fillStyle(COLORS.surfaceRaised, 0.95).fillRoundedRect(actionX - 64, actionY - 24, 128, 48, 12)
      .lineStyle(2, COLORS.accent).strokeRoundedRect(actionX - 64, actionY - 24, 128, 48, 12)
    this.prompt?.setPosition(width / 2, height - 28)
    this.toast?.setPosition(width / 2, 86)
    this.activeText?.setPosition(12, 10)
  }

  private readonly pressPad = (pointer: Phaser.Input.Pointer): void => {
    this.joystick.begin(pointer.id, pointer.x - this.padHit.x, pointer.y - this.padHit.y, ANALOG_JOYSTICK_TRAVEL_RADIUS)
    this.layoutControls()
  }

  private readonly movePad = (pointer: Phaser.Input.Pointer): void => {
    if (!pointer.isDown || !this.joystick.owns(pointer.id)) return
    this.joystick.move(pointer.id, pointer.x - this.padHit.x, pointer.y - this.padHit.y, ANALOG_JOYSTICK_TRAVEL_RADIUS)
    this.layoutControls()
  }

  private readonly releasePad = (pointer: Phaser.Input.Pointer): void => {
    this.joystick.release(pointer.id)
    this.layoutControls()
  }

  private readonly clearInput = (): void => {
    this.joystick.clear()
    this.input.keyboard?.resetKeys()
    if (this.padHit) this.layoutControls()
  }

  private refreshPrompt(): void {
    const nearby = nearestInteriorInteraction(this.location, this.position)
    this.prompt.setText(nearby ? `Action · ${nearby.label}` : 'Walk to a highlighted terminal/zone')
    this.actionChrome.clear()
      .fillStyle(nearby ? COLORS.accentStrong : COLORS.surfaceRaised, 0.95)
      .fillRoundedRect(this.actionHit.x - 64, this.actionHit.y - 24, 128, 48, 12)
      .lineStyle(2, nearby ? COLORS.gold : COLORS.accent)
      .strokeRoundedRect(this.actionHit.x - 64, this.actionHit.y - 24, 128, 48, 12)
  }

  private onAction(): void {
    const interaction = nearestInteriorInteraction(this.location, this.position)
    if (!interaction) {
      this.notify('Move closer to a highlighted interior terminal or zone.')
      return
    }
    switch (interaction.id) {
      case 'exit':
        this.exitInterior()
        return
      case 'fleet':
        this.openHQManagement('VehicleFleet')
        return
      case 'fleet-handoff':
        this.cycleOwnedFleet()
        return
      case 'employees':
        this.openHQManagement('EmployeeManagement')
        return
      case 'operations':
        this.openHQManagement('CompanyManagement')
        return
      case 'staging':
        this.useOperationsDesk()
        return
      case 'market-stalls':
        this.notify(`Local Marketplace: ${MARKETPLACE_LISTINGS.length} merchant listing templates are available to the Tycoon simulation.`)
        return
      case 'player-listings':
        this.notify('Player listings are reserved for the future online marketplace. No fake online trading is enabled yet.')
        return
    }
  }

  private openHQManagement(scene: HQManagementScene): void {
    if (this.locationId !== 'hq') return
    this.clearInput()
    this.persist('progression-changed')
    this.registry.set(HQ_MANAGEMENT_RETURN_REGISTRY_KEY, HQ_MANAGEMENT_RETURN_SCENE)
    this.scene.launch(scene)
    this.scene.sleep()
  }

  private cycleOwnedFleet(): void {
    const available = availableActiveTransports(this.companyState)
    if (available.length <= 1) {
      this.notify('Fleet Bay: no owned vehicle yet. Use the Fleet Purchase Terminal inside HQ.')
      return
    }
    const urban = this.worldState.urban ??= { merchantOnboarded: false, activeTransport: 'walking' }
    urban.activeTransport = nextActiveTransport(this.companyState, urban.activeTransport)
    this.persist('progression-changed')
    this.refreshStateLabels()
    this.notify(`${ACTIVE_TRANSPORT_LABELS[urban.activeTransport]} is now the active vehicle. The remaining fleet stays available for future employee assignment.`)
  }

  private useOperationsDesk(): void {
    const result = performUrbanInteraction(this.worldState, this.companyState)
    this.worldState = result.world
    this.companyState = result.company
    this.persist(result.settled ? 'delivery-completed' : 'progression-changed')
    this.refreshStateLabels()
    this.notify(result.message)
  }

  private refreshStateLabels(): void {
    const active = this.worldState.urban?.activeTransport ?? 'walking'
    this.activeText.setText(`${this.location.title}\nActive: ${ACTIVE_TRANSPORT_LABELS[active]}`)
    if (this.fleetText) {
      const owned = availableActiveTransports(this.companyState).filter(transport => transport !== 'walking')
      this.fleetText.setText(`ACTIVE: ${ACTIVE_TRANSPORT_LABELS[active]}\nOWNED: ${owned.length ? owned.map(transportBayLabel).join(' · ') : 'None'}`)
    }
  }

  private persist(event: 'delivery-completed' | 'progression-changed'): boolean {
    const session = replaceGameSession(this.worldState, this.companyState)
    const storage = getBrowserSaveStorage()
    return storage ? autosaveIfApproved(storage, session, event).saved : false
  }

  private notify(message: string): void {
    this.toastTimer?.remove()
    this.toast.setText(message).setVisible(true)
    this.toastTimer = this.time.delayedCall(4400, () => this.toast.setVisible(false))
  }

  private readonly handleWake = (): void => {
    this.clearInput()
    // Management may have changed fleet/employees; bounded interior restart redraws the authoritative state.
    this.scene.restart()
  }

  private readonly exitInterior = (): void => {
    this.clearInput()
    this.persist('progression-changed')
    if (this.locationId === 'hq') this.registry.set(HQ_MANAGEMENT_RETURN_REGISTRY_KEY, '')
    if (this.scene.isSleeping('GameWorld')) this.scene.wake('GameWorld')
    else this.scene.start('GameWorld')
    this.scene.stop()
  }

  private shutdown(): void {
    this.clearInput()
    this.toastTimer?.remove()
    this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutControls)
    this.game.events.off(Phaser.Core.Events.BLUR, this.clearInput)
    this.events.off(Phaser.Scenes.Events.SLEEP, this.clearInput)
    this.events.off(Phaser.Scenes.Events.WAKE, this.handleWake, this)
    this.input.off('pointermove', this.movePad)
    this.input.off('pointerup', this.releasePad)
    this.input.off('pointerupoutside', this.releasePad)
    this.input.off('gameout', this.clearInput)
    this.input.keyboard?.off('keydown-ESC', this.exitInterior)
    this.playerVisual?.destroy()
  }
}
