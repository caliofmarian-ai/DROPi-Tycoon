import type Phaser from 'phaser'
import {
  BRAILA_FAMILIAR_ROUTES_MISSION_IDS,
} from '../missions/brailaAct1FamiliarRoutesRegistry'
import {
  BRAILA_FIRST_HOUR_MISSION_IDS,
} from '../missions/brailaFirstHourAuthoredRegistry'
import {
  MISSION_RESUME_CONTRACT_KIND,
  MISSION_RESUME_CONTRACT_VERSION,
} from '../missions/missionResumeContract'
import { MISSION_RUNTIME_VERSION, type MissionStatus } from '../missions/missionModel'
import { getOrCreateGameSession } from '../state/gameSession'
import { ACTIVE_TRANSPORT_LABELS } from '../systems/activeTransportSystem'
import type { CompanyState, WorldState } from '../types/game'
import type { OwnershipEconomyState } from '../types/ownershipEconomy'
import type { WorldIdentityState } from '../types/worldIdentity'
import { WORLD_CITY_NAME } from '../world/worldLayout'
import { COLORS, formatMoney, RADII, TOUCH_TARGET_MIN_PX, TYPOGRAPHY } from './theme'

export type StoryProfileMode = 'story' | 'profile'
export type StoryAuthorityStatus = 'connected' | 'missing' | 'incompatible'
export type OneSmallThingHistory = 'PENDING' | 'CLEAN' | 'RECOVERED' | 'FAILED'

export interface StoryRuntimeProjection {
  status: StoryAuthorityStatus
  heading: string
  lines: readonly string[]
  oneSmallThingHistory: OneSmallThingHistory
  activeMissionId?: string
}

export interface SafeProfileProjection {
  heading: string
  lines: readonly string[]
  localOnly: true
}

interface RuntimeMissionProjection {
  missionId: string
  status: MissionStatus
  stageId?: string
  failureCount: number
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const MISSION_STATUS_SET = new Set<MissionStatus>([
  'Locked', 'Delayed', 'Available', 'Active', 'Completed', 'Failed',
])

const FIRST_HOUR_LABELS: Readonly<Record<string, string>> = {
  [BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart]: 'A Place to Start',
  [BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard]: 'The First Standard',
  [BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing]: 'One Small Thing',
  [BRAILA_FIRST_HOUR_MISSION_IDS.personNotAddress]: 'A Person, Not an Address',
  [BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice]: 'Capacity Has a Cost',
  [BRAILA_FIRST_HOUR_MISSION_IDS.capacityProtectOutcome]: 'Protect the Commitment',
  [BRAILA_FIRST_HOUR_MISSION_IDS.capacityAssistOutcome]: 'Assist Through Dispatch',
  [BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence]: 'First Consequence',
  [BRAILA_FIRST_HOUR_MISSION_IDS.firstPay]: 'First Pay Means Something',
  [BRAILA_FIRST_HOUR_MISSION_IDS.tomorrow]: 'Tomorrow Has More Than One Direction',
}

const FAMILIAR_ROUTES_LABELS: Readonly<Record<string, string>> = {
  [BRAILA_FAMILIAR_ROUTES_MISSION_IDS.lessSupervision]: 'Familiar Routes — Less Supervision',
  [BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRemembers]: 'Familiar Routes — Mirela Remembers',
  [BRAILA_FAMILIAR_ROUTES_MISSION_IDS.mirelaRepeatRoute]: 'Familiar Routes — Repeat Merchant Service',
  [BRAILA_FAMILIAR_ROUTES_MISSION_IDS.petruRepeatRoute]: 'Familiar Routes — Petru Recognizes the Route',
  [BRAILA_FAMILIAR_ROUTES_MISSION_IDS.reliabilityPattern]: 'Familiar Routes — Reliability Pattern',
}

const STORY_LABELS: Readonly<Record<string, string>> = {
  ...FIRST_HOUR_LABELS,
  ...FAMILIAR_ROUTES_LABELS,
}

const parseRuntimeMission = (missionId: string, value: unknown): RuntimeMissionProjection | null => {
  if (!record(value) || value.missionId !== missionId || typeof value.status !== 'string' ||
      !MISSION_STATUS_SET.has(value.status as MissionStatus) ||
      !Number.isSafeInteger(value.failureCount) || (value.failureCount as number) < 0) return null
  const stageId = typeof value.stageId === 'string' && value.stageId.trim().length > 0
    ? value.stageId.trim()
    : undefined
  return {
    missionId,
    status: value.status as MissionStatus,
    ...(stageId ? { stageId } : {}),
    failureCount: value.failureCount as number,
  }
}

const oneSmallThingHistory = (missions: Readonly<Record<string, unknown>>): OneSmallThingHistory => {
  const mission = parseRuntimeMission(
    BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
    missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing],
  )
  if (!mission) return 'PENDING'
  if (mission.status === 'Completed') return mission.failureCount > 0 ? 'RECOVERED' : 'CLEAN'
  if (mission.status === 'Failed') return 'FAILED'
  return 'PENDING'
}

/**
 * Read-only story projection. It never restores, starts, advances or repairs Mission Runtime.
 * Missing/incompatible authority fails closed instead of fabricating a chapter from screen-open,
 * timers, money or order heuristics.
 */
export const projectStoryRuntime = (missionResume: unknown): StoryRuntimeProjection => {
  if (missionResume === undefined) {
    return {
      status: 'missing',
      heading: 'STORY · AUTHORITY NOT CONNECTED',
      oneSmallThingHistory: 'PENDING',
      lines: [
        'Mission/story authority is not connected to this save yet.',
        'No chapter, dialogue, consequence or relationship fact is fabricated.',
        'The merged DT-08 / DT-09 authored story remains available for the runtime authority bridge.',
      ],
    }
  }
  if (!record(missionResume) || missionResume.kind !== MISSION_RESUME_CONTRACT_KIND ||
      missionResume.version !== MISSION_RESUME_CONTRACT_VERSION || !record(missionResume.runtime) ||
      missionResume.runtime.version !== MISSION_RUNTIME_VERSION || !record(missionResume.runtime.missions)) {
    return {
      status: 'incompatible',
      heading: 'STORY · AUTHORITY INCOMPATIBLE',
      oneSmallThingHistory: 'PENDING',
      lines: [
        'The saved mission envelope is not compatible with the current story projection.',
        'Presentation is blocked rather than repairing or replacing mission authority from UI.',
      ],
    }
  }

  const missions = missionResume.runtime.missions as Readonly<Record<string, unknown>>
  const known = Object.keys(STORY_LABELS)
    .map(missionId => parseRuntimeMission(missionId, missions[missionId]))
    .filter((mission): mission is RuntimeMissionProjection => mission !== null)
  const active = known.find(mission => mission.status === 'Active') ??
    known.find(mission => mission.status === 'Available') ??
    known.find(mission => mission.status === 'Delayed')
  const completed = known.filter(mission => mission.status === 'Completed').length
  const history = oneSmallThingHistory(missions)

  return {
    status: 'connected',
    heading: 'STORY · AUTHORITATIVE MISSION STATE',
    oneSmallThingHistory: history,
    ...(active ? { activeMissionId: active.missionId } : {}),
    lines: [
      'Authority: DT-09 Mission Runtime · read-only projection',
      active
        ? `Current: ${STORY_LABELS[active.missionId]} · ${active.status}${active.stageId ? ` · ${active.stageId}` : ''}`
        : 'Current: no active first-hour / Familiar Routes mission',
      `Authored missions completed: ${completed}/${known.length}`,
      `One Small Thing history: ${history}`,
      'Dialogue can present only when its owning mission/signal authority proves eligibility.',
    ],
  }
}

export interface SafeProfileProjectionInput {
  worldIdentity?: WorldIdentityState
  ownershipEconomy?: OwnershipEconomyState
  company: CompanyState
  world: WorldState
  renderedWorldName?: string
}

/**
 * Read-only local profile projection. The current prototype has no authenticated account port
 * and no DT-02 origin/current-locality fields yet, so those facts are explicitly unavailable.
 */
export const projectSafeProfile = (input: SafeProfileProjectionInput): SafeProfileProjection => {
  const identity = input.worldIdentity
  const ownership = input.ownershipEconomy
  const personalAccount = ownership?.personalAccounts.find(account => account.actorId === ownership.playerActorId)
  const transport = ACTIVE_TRANSPORT_LABELS[input.world.urban?.activeTransport ?? 'walking']
  const renderedWorld = input.renderedWorldName ?? WORLD_CITY_NAME

  return {
    heading: 'ACCOUNT / PROFILE · LOCAL ONLY',
    localOnly: true,
    lines: [
      'Status: Local / offline prototype',
      'Authentication: Not configured',
      'Cloud account / sync: Not configured',
      `Local account ref: ${identity?.accountId ?? 'Unavailable'}`,
      `Hero ref: ${identity?.heroActorId ?? 'Unavailable'}`,
      `World instance: ${identity?.worldInstanceId ?? 'Unavailable'}`,
      `Identity mode: ${identity?.mode ?? 'Unavailable'}`,
      'Origin / home locality: Not configured by identity authority',
      'Current locality: Not configured by identity authority',
      `Rendered world: ${renderedWorld} · scene context only`,
      `Personal Money: ${formatMoney(personalAccount?.balance ?? 0)}`,
      `Company funds: ${formatMoney(input.company.money)} · ${input.company.companyName}`,
      `Mobility: ${transport}`,
    ],
  }
}

export const storyProfileShellLayout = (width: number, height: number) => {
  const edge = Math.max(8, Math.min(18, Math.round(Math.min(width, height) * 0.025)))
  const shellWidth = Math.min(760, Math.max(1, width - edge * 2))
  const shellHeight = Math.min(560, Math.max(1, height - edge * 2))
  const left = (width - shellWidth) / 2
  const top = (height - shellHeight) / 2
  const headerHeight = 54
  const tabTop = top + headerHeight + 8
  const tabGap = 8
  const tabWidth = Math.max(TOUCH_TARGET_MIN_PX, Math.min(170, (shellWidth - 32 - tabGap) / 2))
  const bodyTop = tabTop + TOUCH_TARGET_MIN_PX + 10
  return {
    shell: { left, top, width: shellWidth, height: shellHeight },
    headerHeight,
    close: {
      x: left + shellWidth - 39,
      y: top + headerHeight / 2,
      width: 62,
      height: TOUCH_TARGET_MIN_PX,
    },
    storyTab: {
      x: left + 16 + tabWidth / 2,
      y: tabTop + TOUCH_TARGET_MIN_PX / 2,
      width: tabWidth,
      height: TOUCH_TARGET_MIN_PX,
    },
    profileTab: {
      x: left + 16 + tabWidth + tabGap + tabWidth / 2,
      y: tabTop + TOUCH_TARGET_MIN_PX / 2,
      width: tabWidth,
      height: TOUCH_TARGET_MIN_PX,
    },
    body: {
      left: left + 16,
      top: bodyTop,
      width: shellWidth - 32,
      height: Math.max(80, top + shellHeight - 16 - bodyTop),
    },
  }
}

interface ShellButton {
  hit: Phaser.GameObjects.Rectangle
  chrome: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  paint: (active: boolean) => void
}

const APPROVED_ORDERS_ICON_KEY = 'dropi-approved-orders-icon-v1'

/**
 * Fixed-screen story/profile shell. It owns presentation only: no authentication, identity,
 * mission, economy, cargo, capability or locality mutation is performed here.
 */
export class StoryProfileShell {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly storyButton: ShellButton
  private readonly profileButton: ShellButton
  private readonly heading: Phaser.GameObjects.Text
  private readonly body: Phaser.GameObjects.Text
  private mode: StoryProfileMode = 'story'
  private world?: WorldState
  private company?: CompanyState

  constructor(scene: Phaser.Scene, layer: Phaser.GameObjects.Layer) {
    this.scene = scene
    const { width, height } = scene.scale
    const layout = storyProfileShellLayout(width, height)
    this.root = scene.add.container(0, 0).setVisible(false)
    layer.add(this.root)

    this.root.add(scene.add.rectangle(width / 2, height / 2, width, height, 0x020914, 0.64)
      .setInteractive({ useHandCursor: false }))

    const shell = scene.add.graphics()
    shell.fillStyle(0x020b16, 0.98)
      .fillRoundedRect(layout.shell.left - 5, layout.shell.top - 5, layout.shell.width + 10, layout.shell.height + 10, 22)
    shell.lineStyle(2, COLORS.accent, 0.82)
      .strokeRoundedRect(layout.shell.left - 5, layout.shell.top - 5, layout.shell.width + 10, layout.shell.height + 10, 22)
    shell.fillStyle(COLORS.surface, 0.99)
      .fillRoundedRect(layout.shell.left, layout.shell.top, layout.shell.width, layout.shell.height, RADII.panel)
    shell.fillStyle(COLORS.surfaceRaised, 0.96)
      .fillRoundedRect(layout.shell.left, layout.shell.top, layout.shell.width, layout.headerHeight, {
        tl: RADII.panel, tr: RADII.panel, bl: 0, br: 0,
      })
    this.root.add(shell)

    let titleLeft = layout.shell.left + 18
    if (scene.textures.exists(APPROVED_ORDERS_ICON_KEY)) {
      const icon = scene.add.image(titleLeft + 17, layout.shell.top + layout.headerHeight / 2, APPROVED_ORDERS_ICON_KEY)
        .setDisplaySize(34, 34)
      this.root.add(icon)
      titleLeft += 46
    }
    this.root.add(scene.add.text(titleLeft, layout.shell.top + 10, 'DROPi · PLAYER', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '17px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
    }))
    this.root.add(scene.add.text(titleLeft, layout.shell.top + 31, 'READ-ONLY PLAYER SHELL', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '9px',
      color: COLORS.textMuted,
    }))

    this.createButton(layout.close.x, layout.close.y, layout.close.width, layout.close.height, 'Close', () => this.close())
    this.storyButton = this.createButton(
      layout.storyTab.x, layout.storyTab.y, layout.storyTab.width, layout.storyTab.height,
      'Story', () => this.select('story'),
    )
    this.profileButton = this.createButton(
      layout.profileTab.x, layout.profileTab.y, layout.profileTab.width, layout.profileTab.height,
      'Account / Profile', () => this.select('profile'),
    )

    const bodyChrome = scene.add.graphics()
    bodyChrome.fillStyle(0x061f35, 0.94)
      .fillRoundedRect(layout.body.left, layout.body.top, layout.body.width, layout.body.height, RADII.panel)
    bodyChrome.lineStyle(1, COLORS.surfaceBorder, 0.9)
      .strokeRoundedRect(layout.body.left, layout.body.top, layout.body.width, layout.body.height, RADII.panel)
    this.root.add(bodyChrome)

    this.heading = scene.add.text(layout.body.left + 16, layout.body.top + 15, '', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '14px',
      color: COLORS.textGold,
      fontStyle: 'bold',
      wordWrap: { width: layout.body.width - 32 },
    })
    this.body = scene.add.text(layout.body.left + 16, layout.body.top + 48, '', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: height <= 440 ? '11px' : '12px',
      color: COLORS.textPrimary,
      lineSpacing: height <= 440 ? 4 : 7,
      wordWrap: { width: layout.body.width - 32 },
    })
    this.root.add([this.heading, this.body])
  }

  private createButton(
    x: number, y: number, width: number, height: number, label: string, onTap: () => void,
  ): ShellButton {
    const chrome = this.scene.add.graphics().setPosition(x, y)
    const paint = (active: boolean): void => {
      chrome.clear()
      chrome.fillStyle(active ? COLORS.accentStrong : COLORS.surfaceRaised, 0.98)
        .fillRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
      chrome.lineStyle(2, active ? COLORS.gold : COLORS.accent, 0.92)
        .strokeRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
    }
    paint(false)
    const hit = this.scene.add.rectangle(x, y, Math.max(TOUCH_TARGET_MIN_PX, width), Math.max(TOUCH_TARGET_MIN_PX, height), 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onTap)
    const text = this.scene.add.text(x, y, label, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '11px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 8 },
    }).setOrigin(0.5)
    this.root.add([chrome, hit, text])
    return { hit, chrome, label: text, paint }
  }

  open(mode: StoryProfileMode, world: WorldState, company: CompanyState): void {
    this.mode = mode
    this.world = world
    this.company = company
    this.root.setVisible(true)
    this.render()
  }

  close(): void {
    this.root.setVisible(false)
  }

  isOpen(): boolean { return this.root.visible }

  private select(mode: StoryProfileMode): void {
    this.mode = mode
    this.render()
  }

  private render(): void {
    this.storyButton.paint(this.mode === 'story')
    this.profileButton.paint(this.mode === 'profile')
    const session = getOrCreateGameSession()
    if (this.mode === 'story') {
      const projection = projectStoryRuntime(session.missionResume)
      this.heading.setText(projection.heading)
      this.body.setText(projection.lines.join('\n\n'))
      return
    }
    if (!this.world || !this.company) {
      this.heading.setText('ACCOUNT / PROFILE · UNAVAILABLE')
      this.body.setText('Runtime player context is not available. No profile identity is fabricated.')
      return
    }
    const projection = projectSafeProfile({
      worldIdentity: session.worldIdentity,
      ownershipEconomy: session.ownershipEconomy,
      company: this.company,
      world: this.world,
      renderedWorldName: WORLD_CITY_NAME,
    })
    this.heading.setText(projection.heading)
    this.body.setText(projection.lines.join('\n'))
  }

  destroy(): void {
    this.root.destroy(true)
    this.world = undefined
    this.company = undefined
  }
}
