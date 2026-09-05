import { EventEmitter } from 'node:events'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type Phaser from 'phaser'
import { getBrowserSaveStorage } from '../src/persistence/browserSaveStorage'
import { inspectSaveSlot, writeSaveSlot, type SaveStorage } from '../src/persistence/saveSystem'
import { clearGameSession, peekGameSession, startNewGameSession } from '../src/state/gameSession'
import { EMPLOYEE_CANDIDATES } from '../src/systems/employeeSystem'
import { VEHICLE_CATALOG } from '../src/systems/vehicleSystem'
import { bindManagementPaging } from '../src/ui/managementControls'
import { buildMainMenuLayout } from '../src/ui/mobileViewport'
import { CompanyManagementScene } from '../src/scenes/CompanyManagementScene'
import { CustomerReviewsScene } from '../src/scenes/CustomerReviewsScene'
import { EmployeeManagementScene } from '../src/scenes/EmployeeManagementScene'
import { FinancialReportScene } from '../src/scenes/FinancialReportScene'
import { MainMenuScene } from '../src/scenes/MainMenuScene'
import { VehicleFleetScene } from '../src/scenes/VehicleFleetScene'

vi.mock('phaser', () => ({
  default: { Scene: class {}, Scale: { Events: { RESIZE: 'resize' } }, Scenes: { Events: { SHUTDOWN: 'shutdown' } } },
}))
vi.mock('../src/persistence/browserSaveStorage', () => ({ getBrowserSaveStorage: vi.fn(() => null) }))
vi.mock('../src/systems/audioSystem', () => ({ getAudioController: () => ({ play: vi.fn() }) }))

const invoke = (scene: object, name: string, ...args: unknown[]) => Reflect.get(scene, name).apply(scene, args)
const storage = (): SaveStorage => {
  const items = new Map<string, string>()
  return {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value) },
    removeItem: key => { items.delete(key) },
  }
}
const mount = <T extends Phaser.Scene>(scene: T) => Object.assign(scene, {
  render: vi.fn(),
  scale: Object.assign(new EventEmitter(), { width: 360, height: 640 }),
  events: new EventEmitter(),
  input: new EventEmitter(),
  time: { now: 0 },
  scene: { start: vi.fn() },
})

afterEach(() => {
  clearGameSession()
  vi.mocked(getBrowserSaveStorage).mockReturnValue(null)
})

describe('Management paging input', () => {
  const body = { left: 12, top: 112, width: 336, height: 456 }
  const setup = () => {
    const scene = mount(new CustomerReviewsScene())
    const change = vi.fn()
    bindManagementPaging(scene as unknown as Phaser.Scene, () => body, change)
    return { scene, change }
  }
  const pointer = (x: number, y: number, id = 0) => ({ x, y, id })

  it('pages deliberate horizontal and vertical swipes but not ordinary taps', () => {
    const { scene, change } = setup()
    scene.input.emit('pointerdown', pointer(200, 250))
    scene.input.emit('pointerup', pointer(195, 246))
    expect(change).not.toHaveBeenCalled()
    for (const [end, delta] of [
      [pointer(140, 250), 1], [pointer(260, 250), -1],
      [pointer(200, 190), 1], [pointer(200, 310), -1],
    ] as const) {
      scene.input.emit('pointerdown', pointer(200, 250))
      scene.input.emit('pointerup', end)
      expect(change).toHaveBeenLastCalledWith(delta)
    }
    expect(change).toHaveBeenCalledTimes(4)
  })

  it('does not page from footer taps, outside releases, another finger, or a rotation', () => {
    const { scene, change } = setup()
    scene.input.emit('pointerdown', pointer(200, 600))
    scene.input.emit('pointerup', pointer(200, 500))
    scene.input.emit('pointerdown', pointer(200, 250))
    scene.input.emit('pointerup', pointer(200, 50))
    scene.input.emit('pointerdown', pointer(200, 250))
    scene.input.emit('pointerup', pointer(200, 180, 1))
    scene.input.emit('pointerdown', pointer(200, 250))
    scene.scale.emit('resize')
    scene.input.emit('pointerup', pointer(200, 180))
    expect(change).not.toHaveBeenCalled()
  })

  it('limits trackpad momentum and ignores wheel events over the fixed navigation', () => {
    const { scene, change } = setup()
    scene.input.emit('wheel', pointer(100, 600), [], 0, 100)
    scene.input.emit('wheel', pointer(100, 250), [], 0, 1)
    expect(change).not.toHaveBeenCalled()
    scene.input.emit('wheel', pointer(100, 250), [], 0, 100)
    scene.time.now = 30
    scene.input.emit('wheel', pointer(100, 250), [], 0, 100)
    expect(change).toHaveBeenCalledTimes(1)
    scene.time.now = 200
    scene.input.emit('wheel', pointer(100, 250), [], -100, 0)
    expect(change).toHaveBeenLastCalledWith(-1)
    expect(change).toHaveBeenCalledTimes(2)
  })

  it('removes all paging listeners when the scene shuts down', () => {
    const { scene } = setup()
    scene.events.emit('shutdown')
    expect(scene.input.eventNames()).toEqual([])
    expect(scene.scale.eventNames()).toEqual([])
  })

  it.each([VehicleFleetScene, CustomerReviewsScene])('preserves visible content on %s resize', Scene => {
    const session = startNewGameSession()
    session.company.reviews = Array.from({ length: 4 }, (_, index) => ({
      orderId: `review-${index}`, rating: 5, message: 'Delivered.', sentiment: 'Positive', reputationImpact: 2,
    }))
    const scene = mount(new Scene())
    scene.create()
    Object.assign(scene, { currentPage: 1, pageSize: 2 })
    scene.scale.height = 568
    scene.scale.emit('resize')
    expect(Reflect.get(scene, 'currentPage')).toBe(2)
    expect(scene.render).toHaveBeenCalledTimes(2)
    expect(peekGameSession()?.company).toBe(session.company)
  })

  it('does not redraw or clear purchase feedback when scrolling beyond the last fleet page', () => {
    startNewGameSession()
    const scene = mount(new VehicleFleetScene())
    scene.create()
    Object.assign(scene, { currentPage: 1, pageSize: 2, feedback: 'Purchased' })
    invoke(scene, 'changePage', 1)
    expect(scene.render).toHaveBeenCalledTimes(1)
    expect(Reflect.get(scene, 'feedback')).toBe('Purchased')
  })
})

describe('Management actions preserve the active game and existing save contracts', () => {
  it.each(VEHICLE_CATALOG)('purchases $name once, persists its stable ID, and leaves mission progress intact', (vehicle) => {
    const session = startNewGameSession()
    session.company.money = vehicle.purchaseCost
    const world = structuredClone(session.world)
    const local = storage()
    vi.mocked(getBrowserSaveStorage).mockReturnValue(local)
    const scene = mount(new VehicleFleetScene())
    scene.create()
    invoke(scene, 'purchase', vehicle.typeId)
    expect(peekGameSession()?.company.money).toBe(0)
    expect(peekGameSession()?.company.vehicles).toHaveLength(1)
    expect(peekGameSession()?.company.vehicles[0].typeId).toBe(vehicle.typeId)
    expect(peekGameSession()?.world.activeOrder).toEqual(world.activeOrder)
    expect(inspectSaveSlot(local).kind).toBe('valid')
    invoke(scene, 'purchase', vehicle.typeId)
    expect(peekGameSession()?.company.vehicles).toHaveLength(1)
    expect(peekGameSession()?.company.money).toBe(0)
    scene.events.emit('shutdown')
    expect(scene.input.eventNames()).toEqual([])
    expect(scene.scale.eventNames()).toEqual([])
  })

  it('retains the Bicycle upgrade purchase, company level, and local-only save failure feedback', () => {
    const session = startNewGameSession()
    session.company.money = VEHICLE_CATALOG[0].purchaseCost
    session.company.level = 4
    const scene = mount(new CompanyManagementScene())
    scene.create()
    invoke(scene, 'purchaseSelectedUpgrade')
    expect(peekGameSession()?.company.purchasedUpgradeLevels.Bicycle).toBe(1)
    expect(peekGameSession()?.company.level).toBe(4)
    expect(Reflect.get(scene, 'feedback')).toContain('Local autosave unavailable')
    invoke(scene, 'returnToGameWorld')
    expect(scene.scene.start).toHaveBeenCalledWith('GameWorld')
  })

  it('hires then onboards the real candidate without re-charging or replacing mission state', () => {
    const session = startNewGameSession()
    const candidate = EMPLOYEE_CANDIDATES[0]
    session.company.money = candidate.hireCost
    const scene = mount(new EmployeeManagementScene())
    scene.create()
    invoke(scene, 'performPrimaryAction', candidate.employeeId)
    expect(peekGameSession()?.company.employees[0].status).toBe('Onboarding')
    invoke(scene, 'performPrimaryAction', candidate.employeeId)
    expect(peekGameSession()?.company.employees[0].status).toBe('Active')
    expect(peekGameSession()?.company.money).toBe(0)
    expect(peekGameSession()?.world).toBe(session.world)
  })

  it('closes an operating day through the real financial system and preserves the return path', () => {
    const session = startNewGameSession()
    session.company.money = 1000
    const scene = mount(new FinancialReportScene())
    scene.create()
    invoke(scene, 'closeNextOperatingDay')
    expect(peekGameSession()?.company.financials.lastProcessedDay).toBe(1)
    expect(peekGameSession()?.company.money).toBeLessThan(1000)
    expect(peekGameSession()?.world).toBe(session.world)
    invoke(scene, 'returnToCompany')
    expect(scene.scene.start).toHaveBeenCalledWith('CompanyManagement')
  })

  it.each([CustomerReviewsScene, VehicleFleetScene, EmployeeManagementScene, FinancialReportScene])(
    'keeps Company and MainMenu back paths for %s', Scene => {
      const session = startNewGameSession()
      const scene = mount(new Scene())
      scene.create()
      invoke(scene, 'returnToCompany')
      expect(scene.scene.start).toHaveBeenLastCalledWith('CompanyManagement')
      invoke(scene, 'returnToMainMenu')
      expect(scene.scene.start).toHaveBeenLastCalledWith('MainMenu')
      expect(peekGameSession()?.world).toBe(session.world)
      expect(peekGameSession()?.company).toBe(session.company)
    },
  )
})

describe('MainMenu hot return and cold save restoration', () => {
  it('offers Continue for unsaved in-memory progress and resumes it without reading an older save', () => {
    const session = startNewGameSession()
    session.company.money = 765
    session.world.activeOrder.status = 'PickedUp'
    const local = storage()
    const read = vi.spyOn(local, 'getItem')
    const scene = mount(new MainMenuScene())
    const createButton = vi.fn()
    Object.assign(scene, { saveStorage: local, saveSlot: { kind: 'missing' }, createButton })
    invoke(scene, 'createSaveAwareActions', buildMainMenuLayout(360, 640, 5, false))
    expect(createButton.mock.calls.map(call => call[2])).toContain('Continue Game')
    invoke(scene, 'continueGame')
    expect(scene.scene.start).toHaveBeenCalledWith('GameWorld')
    expect(peekGameSession()).toBe(session)
    expect(peekGameSession()?.company.money).toBe(765)
    expect(peekGameSession()?.world.activeOrder.status).toBe('PickedUp')
    expect(read).not.toHaveBeenCalled()
  })

  it('asks before replacing an unsaved active session even when storage is unavailable', () => {
    const session = startNewGameSession()
    const scene = mount(new MainMenuScene())
    const showConfirmation = vi.fn()
    Object.assign(scene, { saveStorage: null, saveSlot: { kind: 'unavailable' }, showConfirmation })
    invoke(scene, 'requestStartNewGame')
    expect(showConfirmation).toHaveBeenCalledWith(expect.stringContaining('in progress'), expect.any(Function))
    expect(peekGameSession()).toBe(session)
    expect(scene.scene.start).not.toHaveBeenCalled()
  })

  it('still restores persisted company data on a cold Continue', () => {
    const session = startNewGameSession()
    session.company.money = 432
    const local = storage()
    expect(writeSaveSlot(local, session).ok).toBe(true)
    clearGameSession()
    const scene = mount(new MainMenuScene())
    Object.assign(scene, { saveStorage: local })
    invoke(scene, 'continueGame')
    expect(peekGameSession()?.company.money).toBe(432)
    expect(scene.scene.start).toHaveBeenCalledWith('GameWorld')
  })
})
