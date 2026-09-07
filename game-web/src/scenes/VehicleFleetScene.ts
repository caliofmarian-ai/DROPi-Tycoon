import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { synchronizePlayerMovementSpeed } from '../systems/bicycleSystem'
import { getAudioController } from '../systems/audioSystem'
import {
  assignVehicleToEmployee,
  getAssignedVehicleForEmployee,
  getVehicleUsageState,
  unassignVehicleFromEmployee,
} from '../systems/employeeFleetSystem'
import { purchaseVehicle, reconcileLegacyBicycleOwnership } from '../systems/vehicleSystem'
import type { CompanyState, VehicleTypeId, WorldState } from '../types/game'
import { buildManagementCards, buildVehicleCardLayout } from '../ui/managementLayout'
import { buildFleetCards, buildManagementOverview, pageAfterResize, pageItems } from '../ui/managementViewModel'
import { bindManagementPaging, drawManagementFooter, drawManagementHeader } from '../ui/managementControls'
import { capabilityLevelFromLabel, COLORS, formatMoney, rectCenterX, rectCenterY } from '../ui/theme'
import { createThemedButton, drawCapabilityBar, drawPanel, drawVehicleGlyph, fitText } from '../ui/themeControls'

export class VehicleFleetScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private currentPage = 0
  private pageSize = 1
  private feedback = ''
  private readonly handleResize = (): void => {
    const nextSize = buildManagementCards(this.scale.width, this.scale.height).pageSize
    this.currentPage = pageAfterResize(this.currentPage, this.pageSize, nextSize)
    this.render()
  }

  constructor() { super('VehicleFleet') }

  create(): void {
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = reconcileLegacyBicycleOwnership(session.company)
    replaceGameSession(this.worldState, this.companyState)
    this.currentPage = 0
    this.feedback = ''
    this.render()
    bindManagementPaging(this, () => buildManagementCards(this.scale.width, this.scale.height).body,
      (delta) => this.changePage(delta))
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private render(): void {
    this.children.removeAll(true)
    const layout = buildManagementCards(this.scale.width, this.scale.height)
    this.pageSize = layout.pageSize
    const overview = buildManagementOverview(this.companyState)
    const paging = pageItems(buildFleetCards(this.companyState), this.currentPage, layout.pageSize)
    this.currentPage = paging.page
    drawManagementHeader(this, layout, 'Vehicle Fleet', this.companyState,
      this.feedback || `${overview.fleet} owned · Assign idle fleet to active couriers`)
    paging.items.forEach((vehicle, index) => {
      const card = layout.cards[index]
      const box = buildVehicleCardLayout(card)
      const ownedVehicle = this.companyState.vehicles.find((item) => item.typeId === vehicle.typeId) ?? null
      const usage = ownedVehicle
        ? getVehicleUsageState(this.companyState, this.worldState.urban?.activeTransport, ownedVehicle.vehicleId)
        : null
      const assignedEmployee = ownedVehicle?.assignedEmployeeId
        ? this.companyState.employees.find((employee) => employee.employeeId === ownedVehicle.assignedEmployeeId) ?? null
        : null
      const assignableCourier = this.companyState.employees.find((employee) =>
        employee.role === 'Courier' &&
        employee.status === 'Active' &&
        getAssignedVehicleForEmployee(this.companyState, employee.employeeId) === null,
      ) ?? null

      drawPanel(this, card, { tone: vehicle.owned ? 'success' : 'accent' })
      const art = this.add.graphics()
      art.fillStyle(COLORS.accentStrong, 0.18)
      art.fillRoundedRect(box.art.left, box.art.top, box.art.width, box.art.height, 10)
      art.fillStyle(COLORS.accent, 0.12)
      art.fillEllipse(rectCenterX(box.art), box.art.top + box.art.height - 9, box.art.width - 8, 11)
      drawVehicleGlyph(this, rectCenterX(box.art), rectCenterY(box.art), 2.1, vehicle.typeId,
        vehicle.typeId === 'DeliveryVan' ? 0xf4dfb4 : COLORS.accent)
      fitText(this, { ...box.identity, height: 30 }, vehicle.name, 19, COLORS.textPrimary, true)

      const ownershipLabel = !vehicle.owned
        ? 'Available to purchase'
        : usage === 'PlayerActive'
          ? '● Player active'
          : usage === 'EmployeeAssigned'
            ? `↗ Field work · ${assignedEmployee?.name ?? 'Courier'}`
            : '✓ Available company fleet'
      const ownershipColor = usage === 'EmployeeAssigned'
        ? COLORS.textGold
        : vehicle.owned ? COLORS.textSuccess : COLORS.textSecondary
      fitText(this, { ...box.identity, top: box.identity.top + 34, height: 20 }, ownershipLabel, 12, ownershipColor)

      box.capabilities.forEach((bounds, capability) => {
        const label = capability === 0 ? 'Speed' : 'Capacity'
        const value = capability === 0 ? vehicle.speedLabel : vehicle.capacityLabel
        fitText(this, { ...bounds, height: 19 }, `${label} · ${value}`, 13, COLORS.textSecondary)
        drawCapabilityBar(this, bounds.left, bounds.top + 24, bounds.width, 6,
          capabilityLevelFromLabel(value), capability === 0 ? 'accent' : 'gold')
      })
      fitText(this, { ...box.economics, width: box.economics.width * 0.68 },
        `Upkeep ${formatMoney(vehicle.maintenanceCostPerDay)}/day`, 12, COLORS.textSecondary)
      fitText(this, { ...box.economics, left: box.economics.left + box.economics.width * 0.68,
        width: box.economics.width * 0.32 }, formatMoney(vehicle.purchaseCost), 18, COLORS.textGold, true, 'right')

      if (!vehicle.owned) {
        createThemedButton(this, box.purchase,
          vehicle.affordable ? 'Buy vehicle' : 'Not enough cash',
          'success', () => this.purchase(vehicle.typeId), { fontSize: 17 }).setEnabled(vehicle.canPurchase)
      } else if (ownedVehicle && usage === 'EmployeeAssigned') {
        createThemedButton(this, box.purchase,
          `Release from ${assignedEmployee?.name ?? 'courier'}`,
          'gold', () => this.releaseAssignment(ownedVehicle.vehicleId), { fontSize: 15 })
      } else if (ownedVehicle && usage === 'Available' && assignableCourier) {
        createThemedButton(this, box.purchase,
          `Assign to ${assignableCourier.name}`,
          'success', () => this.assignToCourier(assignableCourier.employeeId, ownedVehicle.vehicleId), { fontSize: 15 })
      } else {
        const label = usage === 'PlayerActive'
          ? 'Player active · switch at Handoff'
          : 'Need an active unassigned Courier'
        createThemedButton(this, box.purchase, label, 'primary', () => undefined, { fontSize: 14 }).setEnabled(false)
      }
    })
    drawManagementFooter(this, layout, { label: 'Company', action: () => this.returnToCompany() },
      () => this.returnToMainMenu(), { ...paging, change: (delta) => this.changePage(delta) })
  }

  private changePage(delta: number): void {
    const next = pageItems(buildFleetCards(this.companyState), this.currentPage + delta, this.pageSize).page
    if (next === this.currentPage) return
    this.currentPage = next
    this.feedback = ''
    this.render()
  }

  private purchase(typeId: VehicleTypeId): void {
    const result = purchaseVehicle(this.companyState, typeId)
    this.feedback = result.message
    getAudioController().play(result.purchased ? 'purchase' : 'negative')
    if (result.purchased) {
      this.companyState = result.company
      this.worldState = synchronizePlayerMovementSpeed(this.worldState, this.companyState)
      const session = replaceGameSession(this.worldState, this.companyState)
      const storage = getBrowserSaveStorage()
      if (storage) {
        const autosave = autosaveIfApproved(storage, session, 'vehicle-purchased')
        if (!autosave.saved && autosave.reason === 'write-failed') this.feedback = 'Purchased · Local autosave failed'
      } else {
        this.feedback = 'Purchased · Local autosave unavailable'
      }
    }
    this.render()
  }

  private assignToCourier(employeeId: string, vehicleId: string): void {
    const result = assignVehicleToEmployee(
      this.companyState,
      this.worldState.urban?.activeTransport,
      employeeId,
      vehicleId,
    )
    this.feedback = result.message
    getAudioController().play(result.assigned ? 'positive' : 'negative')
    if (result.assigned) {
      this.companyState = result.company
      this.persistAssignmentChange()
    }
    this.render()
  }

  private releaseAssignment(vehicleId: string): void {
    const result = unassignVehicleFromEmployee(this.companyState, vehicleId)
    this.feedback = result.message
    getAudioController().play(result.unassigned ? 'positive' : 'negative')
    if (result.unassigned) {
      this.companyState = result.company
      this.persistAssignmentChange()
    }
    this.render()
  }

  private persistAssignmentChange(): void {
    const session = replaceGameSession(this.worldState, this.companyState)
    const storage = getBrowserSaveStorage()
    if (!storage) { this.feedback = `${this.feedback} · Local autosave unavailable`; return }
    const autosave = autosaveIfApproved(storage, session, 'employee-vehicle-assignment-changed')
    if (!autosave.saved && autosave.reason === 'write-failed') this.feedback = `${this.feedback} · Local autosave failed`
  }

  private returnToCompany(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('CompanyManagement')
  }

  private returnToMainMenu(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('MainMenu')
  }
}
