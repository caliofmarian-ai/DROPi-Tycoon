import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import {
  acceptAndReceiveRecoveryMariaTest,
  completeRecoveryMariaReturn,
  ensureRecoveryOpeningRuntime,
} from '../missions/recoveryOpeningRuntime'
import {
  RECOVERY_AUTHORED_REFS,
  RECOVERY_LINE_COPY,
  buildMariaFirstReturnSequence,
} from '../narrative/recoveryOpeningV2'
import {
  ANALOG_JOYSTICK_HIT_DIAMETER,
  ANALOG_JOYSTICK_KNOB_RADIUS,
  ANALOG_JOYSTICK_TRAVEL_RADIUS,
  AnalogJoystickInput,
} from '../ui/AnalogJoystick'
import { CITY_COLORS, COLORS } from '../ui/theme'
import {
  INTERIOR_LOCATIONS,
  isInteriorWalkable,
  moveInteriorPlayer,
  nearestInteriorInteraction,
  type InteriorPoint,
} from '../world/interiorLocations'
import { movementFacing, type UrbanFacing } from '../world/urbanWorld'
import { createPlayerVisual, type PlayerVisual } from '../world/playerVisual'

const WALK_SPEED = 180

export class MariaShopInteriorScene extends Phaser.Scene {
  private readonly location = INTERIOR_LOCATIONS['maria-shop']
  private position: InteriorPoint = { ...this.location.spawn }
  private facing: UrbanFacing = 'up'
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {}
  private playerVisual!: PlayerVisual
  private readonly joystick = new AnalogJoystickInput()
  private padHit!: Phaser.GameObjects.Rectangle
  private padKnob!: Phaser.GameObjects.Arc
  private actionHit!: Phaser.GameObjects.Rectangle
  private prompt!: Phaser.GameObjects.Text
  private toast!: Phaser.GameObjects.Text
  private toastTimer?: Phaser.Time.TimerEvent
  private counterParcel!: Phaser.GameObjects.Container

  constructor() {
    super('MariaShopInterior')
  }

  create(): void {
    this.position = { ...this.location.spawn }
    this.facing = 'up'
    this.cameras.main
      .setBackgroundColor(COLORS.backgroundBottom)
      .setBounds(0, 0, this.location.width, this.location.height)
      .setZoom(1)

    this.drawInterior()
    const session = getOrCreateGameSession()
    this.playerVisual = createPlayerVisual(this, this.position.x, this.position.y)
    this.playerVisual.setState('Walking')
    this.playerVisual.setFacing(this.facing)
    this.playerVisual.setCarrying(session.world.player.carryingPackage)
    this.playerVisual.container.setDepth(30)
    this.cameras.main.startFollow(this.playerVisual.container, false, 0.16, 0.16)

    this.createControls()
    this.keys = (this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') ?? {}) as typeof this.keys
    this.input.keyboard?.on('keydown-ESC', this.exitShop)
    this.input.on('pointermove', this.movePad)
    this.input.on('pointerup', this.releasePad)
    this.input.on('pointerupoutside', this.releasePad)
    this.input.on('gameout', this.clearInput)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)

    const recovery = ensureRecoveryOpeningRuntime(session)
    this.counterParcel.setVisible(recovery.phase === 'maria-dialogue')
    if (recovery.phase === 'maria-dialogue') {
      this.notify(`Maria: ${RECOVERY_LINE_COPY.mariaFirstTest}`)
    } else if (recovery.phase === 'return-maria') {
      this.notify('Maria is waiting at the counter. Walk over and talk to her.')
    } else {
      this.notify('This shop is part of the Brăila recovery opening. Exit to continue outside.')
    }
    this.refreshPrompt()
  }

  update(_time: number, delta: number): void {
    const down = (key: string): number => this.keys[key]?.isDown ? 1 : 0
    const touch = this.joystick.value()
    const input = {
      x: touch.x + down('D') + down('RIGHT') - down('A') - down('LEFT'),
      y: touch.y + down('S') + down('DOWN') - down('W') - down('UP'),
    }
    const before = { ...this.position }
    this.position = moveInteriorPlayer(
      this.location,
      this.position,
      input,
      Math.min(delta / 1000, 0.05),
      WALK_SPEED,
    )
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
    this.add.rectangle(width / 2, height / 2, width, height, 0xf0e3c7).setDepth(0)
    this.add.rectangle(width / 2, 45, width - 34, 72, 0x234a36).setStrokeStyle(3, 0x80b16a).setDepth(1)
    this.add.text(48, 20, this.location.title, {
      fontFamily: 'Arial, sans-serif', fontSize: '27px', fontStyle: 'bold', color: '#ffffff',
    }).setDepth(3)
    this.add.text(48, 53, this.location.subtitle, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#d9ffd0',
    }).setDepth(3)

    this.add.rectangle(600, 325, 420, 54, 0x8b6846).setStrokeStyle(3, 0x5f432f).setDepth(6)
    this.add.text(600, 310, 'COUNTER', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#f7e7c6',
    }).setOrigin(0.5).setDepth(7)

    this.drawProduceStand(250, 260, ['APPLES', 'POTATOES', 'GREENS'])
    this.drawProduceStand(950, 260, ['TOMATOES', 'ONIONS', 'PEPPERS'])
    this.drawMaria(600, 225)
    this.counterParcel = this.drawParcel(485, 286)

    this.add.rectangle(600, 680, 130, 40, 0x28546d, 0.3).setStrokeStyle(2, COLORS.accent).setDepth(4)
    this.add.text(600, 680, 'EXIT', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#123f5d',
    }).setOrigin(0.5).setDepth(5)
  }

  private drawProduceStand(x: number, y: number, labels: readonly string[]): void {
    this.add.rectangle(x, y, 180, 120, 0x7f5c3e).setStrokeStyle(2, 0x5f432f).setDepth(3)
    labels.forEach((label, index) => {
      const yy = y - 36 + index * 36
      this.add.rectangle(x, yy, 150, 27, index === 0 ? 0xb9d06b : index === 1 ? 0xd6b36c : 0x7eb56d)
        .setStrokeStyle(1, 0x5f6f43).setDepth(4)
      this.add.text(x, yy, label, {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#25412a',
      }).setOrigin(0.5).setDepth(5)
    })
  }

  private drawMaria(x: number, y: number): void {
    const container = this.add.container(x, y).setDepth(9)
    const shadow = this.add.ellipse(0, 62, 54, 14, 0x4b3a31, 0.22)
    const legs = this.add.rectangle(0, 45, 28, 44, 0x403d43)
    const apron = this.add.rectangle(0, 13, 46, 58, 0x688e62).setStrokeStyle(2, 0x3f6542)
    const shirt = this.add.rectangle(0, -5, 50, 28, 0x9c445d)
    const head = this.add.circle(0, -48, 19, 0xe4b18a).setStrokeStyle(2, 0x875f4d)
    const hair = this.add.arc(0, -54, 21, 190, 350, false, 0x553b31)
    const badge = this.add.text(0, 12, 'MARIA', {
      fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5)
    container.add([shadow, legs, shirt, apron, head, hair, badge])
  }

  private drawParcel(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(10)
    const box = this.add.rectangle(0, 0, 32, 24, CITY_COLORS.parcel).setStrokeStyle(2, CITY_COLORS.trunk)
    const tape = this.add.rectangle(0, 0, 6, 24, CITY_COLORS.tape)
    container.add([box, tape])
    return container
  }

  private createControls(): void {
    const { width, height } = this.scale
    const padX = 86
    const padY = height - 86
    this.add.circle(padX, padY, 55, COLORS.surface, 0.12).setStrokeStyle(2, COLORS.accent, 0.35).setScrollFactor(0).setDepth(100)
    this.padKnob = this.add.circle(padX, padY, ANALOG_JOYSTICK_KNOB_RADIUS, COLORS.accentStrong, 0.96)
      .setScrollFactor(0).setDepth(102)
    this.padHit = this.add.rectangle(padX, padY, ANALOG_JOYSTICK_HIT_DIAMETER, ANALOG_JOYSTICK_HIT_DIAMETER, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(103).setInteractive({ useHandCursor: true })
      .on('pointerdown', this.pressPad)

    this.actionHit = this.add.rectangle(width - 88, height - 62, 140, 50, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(103).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.onAction())
    this.add.rectangle(width - 88, height - 62, 140, 50, COLORS.surfaceRaised, 0.96)
      .setStrokeStyle(2, COLORS.accent).setScrollFactor(0).setDepth(101)
    this.add.text(width - 88, height - 62, '• Action', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102)

    this.prompt = this.add.text(width / 2, height - 44, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#073354', padding: { x: 9, y: 5 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102)
    this.toast = this.add.text(width / 2, 92, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#ffffff', align: 'center',
      wordWrap: { width: Math.min(760, width - 40) }, backgroundColor: '#073354', padding: { x: 12, y: 8 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(110).setVisible(false)
  }

  private readonly pressPad = (pointer: Phaser.Input.Pointer): void => {
    this.joystick.begin(pointer.id, pointer.x - this.padHit.x, pointer.y - this.padHit.y, ANALOG_JOYSTICK_TRAVEL_RADIUS)
    this.paintPad()
  }

  private readonly movePad = (pointer: Phaser.Input.Pointer): void => {
    if (!pointer.isDown || !this.joystick.owns(pointer.id)) return
    this.joystick.move(pointer.id, pointer.x - this.padHit.x, pointer.y - this.padHit.y, ANALOG_JOYSTICK_TRAVEL_RADIUS)
    this.paintPad()
  }

  private readonly releasePad = (pointer: Phaser.Input.Pointer): void => {
    this.joystick.release(pointer.id)
    this.paintPad()
  }

  private paintPad(): void {
    const knob = this.joystick.knobOffset()
    this.padKnob.setPosition(this.padHit.x + knob.x, this.padHit.y + knob.y)
  }

  private refreshPrompt(): void {
    const interaction = nearestInteriorInteraction(this.location, this.position)
    this.prompt.setText(interaction ? `Action · ${interaction.label}` : 'Walk to Maria or the exit')
  }

  private onAction(): void {
    const interaction = nearestInteriorInteraction(this.location, this.position)
    if (!interaction) {
      this.notify('Move closer to Maria or the exit.')
      return
    }
    if (interaction.id === 'exit') {
      this.exitShop()
      return
    }
    if (interaction.id !== 'maria-counter') return

    const session = getOrCreateGameSession()
    const recovery = ensureRecoveryOpeningRuntime(session)
    if (recovery.phase === 'maria-dialogue') {
      const result = acceptAndReceiveRecoveryMariaTest(session)
      if (!result.changed || result.phase !== 'deliver-first') {
        this.notify(`Maria cannot hand over the parcel yet: ${result.reason ?? 'authority not ready'}.`)
        return
      }
      this.playerVisual.setCarrying(session.world.player.carryingPackage)
      this.counterParcel.setVisible(false)
      this.persist()
      this.notify('Maria hands you the parcel. It is now visibly in your custody. Deliver it intact, then come back.')
      return
    }
    if (recovery.phase === 'return-maria') {
      const result = completeRecoveryMariaReturn(session)
      if (!result.changed) {
        this.notify(`Maria return is not ready: ${result.reason ?? 'authority not ready'}.`)
        return
      }
      this.persist()
      const sequence = buildMariaFirstReturnSequence({
        shopLabel: "Maria's Greengrocer",
        mariaActorId: 'maria-ionescu',
        returnMission: {
          missionId: result.bindings ? 'mission:recovery:origin:maria-return' : 'mission:recovery:origin:maria-return',
          authoredRef: RECOVERY_AUTHORED_REFS.firstReturn,
        },
        foodRewardAuthorityConfirmed: false,
      })
      this.notify(`${sequence.beats[0].text} ${sequence.beats[1].text}`)
      return
    }
    this.notify('Maria: Finish what you have already taken responsibility for, then come back.')
  }

  private persist(): void {
    const session = getOrCreateGameSession()
    replaceGameSession(session.world, session.company)
    const storage = getBrowserSaveStorage()
    if (storage) autosaveIfApproved(storage, getOrCreateGameSession(), 'progression-changed')
  }

  private notify(message: string): void {
    this.toastTimer?.remove()
    this.toast.setText(message).setVisible(true)
    this.toastTimer = this.time.delayedCall(6200, () => this.toast.setVisible(false))
  }

  private readonly clearInput = (): void => {
    this.joystick.clear()
    this.paintPad()
    this.input.keyboard?.resetKeys()
  }

  private readonly exitShop = (): void => {
    this.clearInput()
    this.persist()
    if (this.scene.isSleeping('GameWorld')) this.scene.wake('GameWorld')
    else this.scene.start('GameWorld')
    this.scene.stop()
  }

  private shutdown(): void {
    this.toastTimer?.remove()
    this.input.off('pointermove', this.movePad)
    this.input.off('pointerup', this.releasePad)
    this.input.off('pointerupoutside', this.releasePad)
    this.input.off('gameout', this.clearInput)
    this.input.keyboard?.off('keydown-ESC', this.exitShop)
    this.playerVisual?.destroy()
  }
}
