import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { constructHQDepartment, getHQConstructionStatus } from '../systems/hqProgressionSystem'
import { CITY_COLORS, COLORS } from '../ui/theme'
import { BaseInteriorScene } from './BaseInteriorScene'

export class HQInteriorScene extends BaseInteriorScene {
  private maintenanceOverlay: Phaser.GameObjects.GameObject[] = []
  private maintenanceFeedback = ''

  constructor() {
    super('HQInterior', 'hq')
  }

  create(): void {
    super.create()
    this.drawMaintenanceProgression()
  }

  private track<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.maintenanceOverlay.push(object)
    return object
  }

  private clearMaintenanceOverlay(): void {
    this.maintenanceOverlay.forEach((object) => object.destroy())
    this.maintenanceOverlay = []
  }

  private drawMaintenanceProgression(): void {
    this.clearMaintenanceOverlay()
    const session = getOrCreateGameSession()
    const status = getHQConstructionStatus(session.company, 'Maintenance')
    const centerX = 580
    const centerY = 342
    const width = 264
    const height = 139

    const panel = this.track(this.add.rectangle(
      centerX,
      centerY,
      width,
      height,
      status.constructed ? 0xf1fbf4 : 0xf4f1e8,
      0.98,
    ).setDepth(12))
    panel.setStrokeStyle(3, status.constructed ? COLORS.success : 0xb18445, 0.96)

    this.track(this.add.text(462, 282, status.constructed ? 'MAINTENANCE WING' : 'MAINTENANCE CONSTRUCTION', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#123f5d',
    }).setDepth(13))

    if (status.constructed) {
      this.drawConstructedWorkshop()
      this.track(this.add.text(462, 302, 'Constructed · workshop foundation operational', {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#2f6b49',
      }).setDepth(13))
      this.track(this.add.text(580, 395, 'Future mechanic roles and advanced equipment unlock here.', {
        fontFamily: 'Arial, sans-serif', fontSize: '8px', color: '#47687b', align: 'center',
      }).setOrigin(0.5).setDepth(13))
      return
    }

    const requirement = status.missingCompanyLevels > 0
      ? `Requires Company Level ${status.department.minCompanyLevel}`
      : status.missingMoney > 0
        ? `Need $${status.missingMoney} more · Cost $${status.department.constructionCost}`
        : `Ready to build · Cost $${status.department.constructionCost}`

    this.track(this.add.text(580, 324, requirement, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#6b5738', align: 'center',
    }).setOrigin(0.5).setDepth(13))

    const button = this.track(this.add.rectangle(580, 361, 212, 38, status.canConstruct ? COLORS.successStrong : 0x65717b, 0.96)
      .setStrokeStyle(2, status.canConstruct ? 0x86efac : 0xa8b1b8, 0.96)
      .setDepth(13))
    const buttonLabel = status.canConstruct
      ? `BUILD MAINTENANCE · $${status.department.constructionCost}`
      : 'CONSTRUCTION LOCKED'
    this.track(this.add.text(580, 361, buttonLabel, {
      fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(14))

    if (status.canConstruct) {
      button.setInteractive({ useHandCursor: true })
      button.on('pointerdown', () => this.constructMaintenanceWing())
    }

    const feedback = this.maintenanceFeedback || 'Physical HQ expansion · department is not operational until built.'
    this.track(this.add.text(580, 395, feedback, {
      fontFamily: 'Arial, sans-serif', fontSize: '8px', color: '#6a7685', align: 'center',
      wordWrap: { width: 232 },
    }).setOrigin(0.5).setDepth(13))
  }

  private drawConstructedWorkshop(): void {
    const bench = this.track(this.add.rectangle(580, 354, 182, 22, 0x7e5e42, 0.98).setDepth(13))
    bench.setStrokeStyle(2, CITY_COLORS.trunk, 0.95)
    this.track(this.add.rectangle(520, 329, 54, 31, 0x26485d, 0.96).setDepth(14))
    this.track(this.add.rectangle(520, 329, 44, 21, CITY_COLORS.glass, 0.78).setDepth(15))
    this.track(this.add.rectangle(638, 329, 70, 31, 0xd9e3e7, 0.95).setStrokeStyle(2, 0x65717b).setDepth(14))
    ;[-23, 0, 23].forEach((offset) => {
      this.track(this.add.circle(638 + offset, 329, 5, offset === 0 ? COLORS.gold : COLORS.accentStrong, 0.95).setDepth(15))
    })
    this.track(this.add.text(580, 375, 'WORKBENCH · DIAGNOSTICS · TOOL RACK', {
      fontFamily: 'Arial, sans-serif', fontSize: '8px', fontStyle: 'bold', color: '#2f6b49',
    }).setOrigin(0.5).setDepth(15))
  }

  private constructMaintenanceWing(): void {
    const session = getOrCreateGameSession()
    const result = constructHQDepartment(session.company, 'Maintenance')
    this.maintenanceFeedback = result.message
    if (!result.constructed) {
      this.drawMaintenanceProgression()
      return
    }

    // Mutate the already-active CompanyState object so BaseInteriorScene's
    // private authoritative reference cannot overwrite this construction state
    // before the next scene refresh.
    Object.assign(session.company, result.company)
    session.company.hq = {
      constructedDepartments: [...result.company.hq.constructedDepartments],
    }
    const persistedSession = replaceGameSession(session.world, session.company)
    const storage = getBrowserSaveStorage()
    if (storage) {
      const autosave = autosaveIfApproved(storage, persistedSession, 'progression-changed')
      if (!autosave.saved && autosave.reason === 'write-failed') {
        this.maintenanceFeedback = `${result.message} · Local autosave failed`
      }
    } else {
      this.maintenanceFeedback = `${result.message} · Local autosave unavailable`
    }
    this.drawMaintenanceProgression()
  }
}
