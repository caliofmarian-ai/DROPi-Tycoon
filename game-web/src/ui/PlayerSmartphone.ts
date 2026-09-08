import type Phaser from 'phaser'
import { getOrCreateGameSession } from '../state/gameSession'
import { ACTIVE_TRANSPORT_LABELS } from '../systems/activeTransportSystem'
import { sanitizeOwnershipEconomyState } from '../systems/ownershipEconomySystem'
import type { UrbanObjective } from '../systems/urbanInteractions'
import type { CompanyState, WorldState } from '../types/game'
import type { OwnershipEconomyState } from '../types/ownershipEconomy'
import { WORLD_ZONES, WORLD_CITY_NAME } from '../world/worldLayout'
import { COLORS, formatMoney, RADII, TOUCH_TARGET_MIN_PX, TYPOGRAPHY } from './theme'

export const SMARTPHONE_LIVE_APPS = [
  { id: 'delivery', label: 'Delivery' },
  { id: 'map', label: 'Map' },
  { id: 'assets', label: 'Money & Assets' },
] as const

export type SmartphoneAppId = (typeof SMARTPHONE_LIVE_APPS)[number]['id']

export const SMARTPHONE_FUTURE_APPS = [
  'Communications',
  'Training',
  'Marketplace',
  'Weather / News',
  'Investments',
  'Drone Ops',
] as const

export interface SmartphoneAppSnapshot {
  heading: string
  lines: string[]
}

export interface SmartphoneSnapshot {
  delivery: SmartphoneAppSnapshot
  map: SmartphoneAppSnapshot
  assets: SmartphoneAppSnapshot
}

const districtForPoint = (point: { x: number; y: number }): string =>
  WORLD_ZONES.find(zone =>
    point.x >= zone.x && point.x <= zone.x + zone.width &&
    point.y >= zone.y && point.y <= zone.y + zone.height,
  )?.label ?? WORLD_CITY_NAME

const parcelStatus = (world: WorldState): string => {
  if (world.player.carryingPackage) return 'Parcel in hand'
  if (world.activeOrder.status === 'Accepted') return 'Awaiting pickup'
  if (world.activeOrder.status === 'PickedUp') return 'Parcel in hand'
  if (world.activeOrder.status === 'Completed') return 'Delivered'
  if (world.activeOrder.status === 'Failed') return 'Delivery failed'
  return 'No parcel collected'
}

const heldUnits = (ownership: OwnershipEconomyState, poolId: 'InternalMember' | 'ExternalMarket'): number =>
  ownership.equity.holdings
    .filter(holding => holding.actorId === ownership.playerActorId && holding.poolId === poolId)
    .reduce((sum, holding) => sum + holding.units, 0)

const treasuryUnits = (ownership: OwnershipEconomyState, poolId: 'InternalMember' | 'ExternalMarket'): number =>
  ownership.equity.pools.find(pool => pool.poolId === poolId)?.treasuryUnits ?? 0

const dividendIncome = (ownership: OwnershipEconomyState): number => {
  const account = ownership.personalAccounts.find(candidate => candidate.actorId === ownership.playerActorId)
  return account?.entries
    .filter(entry => entry.reason === 'DividendIncome' && entry.companyId === ownership.companyId && entry.delta > 0)
    .reduce((sum, entry) => sum + entry.delta, 0) ?? 0
}

/**
 * Pure player-facing projection of already-authoritative runtime state.
 * The phone owns no economy, mission, fleet or progression truth of its own.
 */
export const buildSmartphoneSnapshot = (
  world: WorldState,
  company: CompanyState,
  ownership: OwnershipEconomyState,
  objective: UrbanObjective,
): SmartphoneSnapshot => {
  const transport = ACTIVE_TRANSPORT_LABELS[world.urban?.activeTransport ?? 'walking']
  const distance = Math.round(Math.hypot(objective.point.x - world.player.x, objective.point.y - world.player.y))
  const activeEmployees = company.employees.filter(employee => employee.status === 'Active').length
  const assignedVehicles = company.vehicles.filter(vehicle => vehicle.assignedEmployeeId).length
  const personalAccount = ownership.personalAccounts.find(account => account.actorId === ownership.playerActorId)
  const internalHeld = heldUnits(ownership, 'InternalMember')
  const externalHeld = heldUnits(ownership, 'ExternalMarket')
  const internalTreasury = treasuryUnits(ownership, 'InternalMember')
  const externalTreasury = treasuryUnits(ownership, 'ExternalMarket')
  const founder = ownership.equity.founderActorId === ownership.playerActorId ? 'You' : 'Historical founder'
  const executive = ownership.equity.executiveActorId === ownership.playerActorId ? 'You' : 'Company member'
  const departmentCount = company.hq.constructedDepartments.length

  return {
    delivery: {
      heading: 'CURRENT DELIVERY',
      lines: [
        `Status: ${world.activeOrder.status}`,
        `Objective: ${objective.title}`,
        `Route: ${world.activeOrder.pickupLocation} -> ${world.activeOrder.destination}`,
        `Cargo: ${parcelStatus(world)}`,
        `Reward: ${formatMoney(world.activeOrder.reward)}`,
      ],
    },
    map: {
      heading: 'LOCAL GPS',
      lines: [
        `Area: ${districtForPoint(world.player)}`,
        `Transport: ${transport}`,
        `Target: ${objective.title}`,
        `Distance: ${distance}u`,
        'Detailed routing remains in the world map.',
      ],
    },
    assets: {
      heading: 'MONEY & OWNERSHIP',
      lines: [
        `${company.companyName}`,
        `Company Money: ${formatMoney(company.money)}`,
        `Personal Money: ${formatMoney(personalAccount?.balance ?? 0)}`,
        `Your shares: ${internalHeld} internal · ${externalHeld} external`,
        `Treasury shares: ${internalTreasury} internal · ${externalTreasury} external`,
        `Dividends received: ${formatMoney(dividendIncome(ownership))}`,
        `Founder: ${founder} · Executive: ${executive}`,
        `Rep ${company.reputation} · Team ${activeEmployees}/${company.employees.length} active`,
        `Fleet ${company.vehicles.length} owned/${assignedVehicles} assigned · HQ ${departmentCount} dept${departmentCount === 1 ? '' : 's'}`,
      ],
    },
  }
}

/**
 * Responsive fixed-screen phone geometry for the canonical Android viewport matrix.
 * Portrait uses a stacked flow (live apps -> locked apps -> content); landscape keeps
 * the compact two-pane presentation. No orientation is blocked or treated as secondary.
 */
export const smartphoneLayout = (width: number, height: number) => {
  const portrait = width < height
  const edge = 8
  const headerHeight = 48
  const liveButtonHeight = TOUCH_TARGET_MIN_PX
  const futureTileHeight = TOUCH_TARGET_MIN_PX
  const tileGap = 6

  if (portrait) {
    const shellWidth = Math.max(1, width - edge * 2)
    const shellHeight = Math.max(1, Math.min(700, height - edge * 2))
    const left = (width - shellWidth) / 2
    const top = (height - shellHeight) / 2
    const innerGap = 10
    const paneWidth = shellWidth - innerGap * 2
    const liveTop = top + headerHeight + innerGap
    const futureTop = liveTop + liveButtonHeight + 28
    const futureRows = Math.ceil(SMARTPHONE_FUTURE_APPS.length / 2)
    const futureHeight = futureRows * futureTileHeight + (futureRows - 1) * tileGap
    const contentTop = futureTop + futureHeight + 12
    const shellBottom = top + shellHeight

    return {
      portrait,
      shell: { left, top, width: shellWidth, height: shellHeight },
      headerHeight,
      close: {
        x: left + shellWidth - 38,
        y: top + headerHeight / 2,
        width: 60,
        height: TOUCH_TARGET_MIN_PX,
      },
      live: {
        left: left + innerGap,
        top: liveTop,
        width: paneWidth,
        buttonHeight: liveButtonHeight,
        gap: tileGap,
      },
      future: {
        left: left + innerGap,
        top: futureTop,
        width: paneWidth,
        tileHeight: futureTileHeight,
        gap: tileGap,
        columns: 2,
      },
      content: {
        left: left + innerGap,
        top: contentTop,
        width: paneWidth,
        height: Math.max(120, shellBottom - innerGap - contentTop),
      },
    }
  }

  const shellWidth = Math.min(620, Math.max(500, width * 0.74))
  const shellHeight = Math.min(350, Math.max(304, height - 24))
  const left = (width - shellWidth) / 2
  const top = (height - shellHeight) / 2
  const innerGap = 12
  const appPaneWidth = Math.min(270, shellWidth * 0.44)
  const contentLeft = left + appPaneWidth + innerGap * 2
  const contentWidth = shellWidth - appPaneWidth - innerGap * 3

  return {
    portrait,
    shell: { left, top, width: shellWidth, height: shellHeight },
    headerHeight,
    close: {
      x: left + shellWidth - 38,
      y: top + headerHeight / 2,
      width: 60,
      height: TOUCH_TARGET_MIN_PX,
    },
    live: {
      left: left + innerGap,
      top: top + headerHeight + innerGap,
      width: appPaneWidth,
      buttonHeight: liveButtonHeight,
      gap: tileGap,
    },
    future: {
      left: left + innerGap,
      top: top + headerHeight + innerGap + liveButtonHeight + 34,
      width: appPaneWidth,
      tileHeight: futureTileHeight,
      gap: tileGap,
      columns: 2,
    },
    content: {
      left: contentLeft,
      top: top + headerHeight + innerGap,
      width: contentWidth,
      height: shellHeight - headerHeight - innerGap * 2,
    },
  }
}

interface PhoneButton {
  hit: Phaser.GameObjects.Rectangle
  chrome: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  paint: (active: boolean) => void
}

/**
 * Fixed-screen in-world smartphone shell. It is deliberately an overlay, not a Phaser scene,
 * so opening and closing it cannot restart or replace the player's world context.
 */
export class PlayerSmartphoneOverlay {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly controls: PhoneButton[] = []
  private readonly liveButtons = new Map<SmartphoneAppId, PhoneButton>()
  private readonly contentHeading: Phaser.GameObjects.Text
  private readonly contentBody: Phaser.GameObjects.Text
  private selected: SmartphoneAppId = 'delivery'
  private snapshot?: SmartphoneSnapshot

  constructor(scene: Phaser.Scene, layer: Phaser.GameObjects.Layer) {
    this.scene = scene
    const { width, height } = scene.scale
    const layout = smartphoneLayout(width, height)
    this.root = scene.add.container(0, 0).setVisible(false)
    layer.add(this.root)

    const backdrop = scene.add.rectangle(width / 2, height / 2, width, height, 0x021526, 0.58)
      .setInteractive({ useHandCursor: false })
    this.root.add(backdrop)

    const shell = scene.add.graphics()
    shell.fillStyle(0x020b16, 0.98)
      .fillRoundedRect(layout.shell.left - 5, layout.shell.top - 5, layout.shell.width + 10, layout.shell.height + 10, 24)
    shell.lineStyle(2, COLORS.accent, 0.7)
      .strokeRoundedRect(layout.shell.left - 5, layout.shell.top - 5, layout.shell.width + 10, layout.shell.height + 10, 24)
    shell.fillStyle(COLORS.surface, 0.98)
      .fillRoundedRect(layout.shell.left, layout.shell.top, layout.shell.width, layout.shell.height, 20)
    shell.fillStyle(COLORS.surfaceRaised, 0.92)
      .fillRoundedRect(layout.shell.left, layout.shell.top, layout.shell.width, layout.headerHeight, {
        tl: 20, tr: 20, bl: 0, br: 0,
      })
    this.root.add(shell)

    this.root.add(scene.add.text(layout.shell.left + 18, layout.shell.top + 11, 'PLAYER PHONE', {
      fontFamily: TYPOGRAPHY.family, fontSize: '18px', color: COLORS.textPrimary, fontStyle: 'bold',
    }))
    this.root.add(scene.add.text(layout.shell.left + 147, layout.shell.top + 15, 'LOCAL / OFFLINE', {
      fontFamily: TYPOGRAPHY.family, fontSize: '10px', color: COLORS.textMuted,
    }))

    this.createButton(layout.close.x, layout.close.y, layout.close.width, layout.close.height, 'Close', () => this.close())

    const live = layout.live
    const liveWidth = (live.width - (SMARTPHONE_LIVE_APPS.length - 1) * live.gap) / SMARTPHONE_LIVE_APPS.length
    SMARTPHONE_LIVE_APPS.forEach((app, index) => {
      const button = this.createButton(
        live.left + liveWidth / 2 + index * (liveWidth + live.gap),
        live.top + live.buttonHeight / 2,
        liveWidth,
        live.buttonHeight,
        app.label,
        () => this.select(app.id),
      )
      button.label.setFontSize(10).setWordWrapWidth(liveWidth - 8)
      this.liveButtons.set(app.id, button)
    })

    const futureLabel = scene.add.text(live.left, live.top + live.buttonHeight + 10, 'LOCKED APPS', {
      fontFamily: TYPOGRAPHY.family, fontSize: '10px', color: COLORS.textMuted, fontStyle: 'bold',
    })
    this.root.add(futureLabel)

    const future = layout.future
    const tileWidth = (future.width - future.gap) / future.columns
    SMARTPHONE_FUTURE_APPS.forEach((label, index) => {
      const column = index % future.columns
      const row = Math.floor(index / future.columns)
      const left = future.left + column * (tileWidth + future.gap)
      const top = future.top + row * (future.tileHeight + future.gap)
      const chrome = scene.add.graphics()
      chrome.fillStyle(0x172334, 0.9).fillRoundedRect(left, top, tileWidth, future.tileHeight, RADII.small)
      chrome.lineStyle(1, 0x64748b, 0.55).strokeRoundedRect(left, top, tileWidth, future.tileHeight, RADII.small)
      this.root.add(chrome)
      this.root.add(scene.add.text(left + 8, top + 7, label, {
        fontFamily: TYPOGRAPHY.family,
        fontSize: '10px',
        color: COLORS.textSecondary,
        fontStyle: 'bold',
        wordWrap: { width: tileWidth - 16 },
      }))
      this.root.add(scene.add.text(left + 8, top + future.tileHeight - 16, 'FUTURE', {
        fontFamily: TYPOGRAPHY.family, fontSize: '9px', color: COLORS.textMuted,
      }))
    })

    const content = layout.content
    const contentChrome = scene.add.graphics()
    contentChrome.fillStyle(0x061f35, 0.92)
      .fillRoundedRect(content.left, content.top, content.width, content.height, RADII.panel)
    contentChrome.lineStyle(1, COLORS.surfaceBorder, 0.9)
      .strokeRoundedRect(content.left, content.top, content.width, content.height, RADII.panel)
    this.root.add(contentChrome)

    this.contentHeading = scene.add.text(content.left + 16, content.top + 16, '', {
      fontFamily: TYPOGRAPHY.family, fontSize: '14px', color: COLORS.textGold, fontStyle: 'bold',
    })
    this.contentBody = scene.add.text(content.left + 16, content.top + 46, '', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '12px',
      color: COLORS.textPrimary,
      lineSpacing: 7,
      wordWrap: { width: content.width - 32 },
    })
    this.root.add([this.contentHeading, this.contentBody])

    this.root.add(scene.add.text(content.left + 16, content.top + content.height - 27,
      'Physical HQ actions stay at HQ.', {
        fontFamily: TYPOGRAPHY.family, fontSize: '10px', color: COLORS.textMuted,
      }))

    this.paintTabs()
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onTap: () => void,
  ): PhoneButton {
    const safeWidth = Math.max(TOUCH_TARGET_MIN_PX, width)
    const safeHeight = Math.max(TOUCH_TARGET_MIN_PX, height)
    const chrome = this.scene.add.graphics().setPosition(x, y)
    const paint = (active: boolean): void => {
      chrome.clear()
      chrome.fillStyle(active ? COLORS.accentStrong : COLORS.surfaceRaised, 0.97)
        .fillRoundedRect(-width / 2, -height / 2, width, height, RADII.small)
      chrome.lineStyle(2, active ? COLORS.gold : COLORS.accent, active ? 1 : 0.7)
        .strokeRoundedRect(-width / 2, -height / 2, width, height, RADII.small)
    }
    paint(false)
    const hit = this.scene.add.rectangle(x, y, safeWidth, safeHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
    hit.on('pointerdown', onTap)
    const text = this.scene.add.text(x, y, label, {
      fontFamily: TYPOGRAPHY.family, fontSize: '11px', color: COLORS.textPrimary, fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5)
    this.root.add([chrome, hit, text])
    const button = { hit, chrome, label: text, paint }
    this.controls.push(button)
    return button
  }

  private select(app: SmartphoneAppId): void {
    this.selected = app
    this.paintTabs()
    this.renderSnapshot()
  }

  private paintTabs(): void {
    for (const [id, button] of this.liveButtons) button.paint(id === this.selected)
  }

  private renderSnapshot(): void {
    if (!this.snapshot) return
    const current = this.snapshot[this.selected]
    this.contentHeading.setText(current.heading)
    this.contentBody.setText(current.lines.join('\n'))
  }

  update(world: WorldState, company: CompanyState, objective: UrbanObjective): void {
    const ownership = sanitizeOwnershipEconomyState(getOrCreateGameSession().ownershipEconomy).state
    this.snapshot = buildSmartphoneSnapshot(world, company, ownership, objective)
    if (this.isOpen()) this.renderSnapshot()
  }

  open(): void {
    this.root.setVisible(true)
    this.renderSnapshot()
  }

  close(): void { this.root.setVisible(false) }

  toggle(): void { this.isOpen() ? this.close() : this.open() }

  isOpen(): boolean { return this.root.visible }

  destroy(): void {
    this.controls.forEach(control => control.hit.removeAllListeners())
    this.root.destroy(true)
  }
}