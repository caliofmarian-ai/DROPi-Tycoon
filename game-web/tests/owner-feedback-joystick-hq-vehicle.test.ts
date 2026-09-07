import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  ANALOG_JOYSTICK_HIT_DIAMETER,
  ANALOG_JOYSTICK_KNOB_RADIUS,
  ANALOG_JOYSTICK_VISUAL_DIAMETER,
  AnalogJoystickInput,
  sampleAnalogJoystick,
} from '../src/ui/AnalogJoystick'
import { getCourierPose } from '../src/world/courierPose'

const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')
const interiorSource = readFileSync(new URL('../src/scenes/BaseInteriorScene.ts', import.meta.url), 'utf8')
const interiorLocationsSource = readFileSync(new URL('../src/world/interiorLocations.ts', import.meta.url), 'utf8')

describe('owner analog joystick decision', () => {
  it('returns smooth proportional 360-degree vectors with a small deadzone and clamped knob', () => {
    expect(sampleAnalogJoystick(0, 0, 40).vector).toEqual({ x: 0, y: 0 })
    expect(sampleAnalogJoystick(2, 1, 40).vector).toEqual({ x: 0, y: 0 })
    const diagonal = sampleAnalogJoystick(20, 20, 40)
    expect(diagonal.vector.x).toBeGreaterThan(0)
    expect(diagonal.vector.y).toBeGreaterThan(0)
    expect(diagonal.vector.x).toBeCloseTo(diagonal.vector.y)
    expect(Math.hypot(diagonal.vector.x, diagonal.vector.y)).toBeGreaterThan(0)
    expect(Math.hypot(diagonal.vector.x, diagonal.vector.y)).toBeLessThan(1)
    const clamped = sampleAnalogJoystick(100, 0, 40)
    expect(clamped.vector).toEqual({ x: 1, y: 0 })
    expect(clamped.knob).toEqual({ x: 40, y: 0 })
  })

  it('uses a larger blue thumb with a still-larger invisible Android-safe touch envelope', () => {
    expect(ANALOG_JOYSTICK_VISUAL_DIAMETER).toBeGreaterThanOrEqual(114)
    expect(ANALOG_JOYSTICK_KNOB_RADIUS).toBeGreaterThanOrEqual(22)
    expect(ANALOG_JOYSTICK_HIT_DIAMETER).toBeGreaterThan(ANALOG_JOYSTICK_VISUAL_DIAMETER)
  })

  it('owns one pointer and stops immediately only when that pointer releases', () => {
    const joystick = new AnalogJoystickInput()
    joystick.begin(7, 30, 0, 40)
    expect(joystick.value().x).toBeGreaterThan(0)
    joystick.release(8)
    expect(joystick.value().x).toBeGreaterThan(0)
    joystick.release(7)
    expect(joystick.value()).toEqual({ x: 0, y: 0 })
    expect(joystick.knobOffset()).toEqual({ x: 0, y: 0 })
  })

  it('uses the shared analog model outside and inside without pointer-out cancellation', () => {
    expect(hudSource).toContain('AnalogJoystickInput')
    expect(hudSource).toContain('private readonly pad = new AnalogJoystickInput()')
    expect(hudSource).toContain('ANALOG_JOYSTICK_HIT_DIAMETER')
    expect(hudSource).toContain("scene.input.on('pointermove', this.moveJoystickPointer)")
    expect(hudSource).not.toContain("hit.on('pointerout', this.releasePointer)")
    expect(interiorSource).toContain('AnalogJoystickInput')
    expect(interiorSource).toContain('private readonly joystick = new AnalogJoystickInput()')
    expect(interiorSource).toContain('ANALOG_JOYSTICK_HIT_DIAMETER')
    expect(interiorSource).toContain("this.input.on('pointermove', this.movePad)")
    expect(interiorSource).not.toContain("this.padHit.on('pointerout', this.releasePad)")
    expect(interiorSource).not.toContain('padDirection')
  })
})

describe('motorized vehicle rider semantics', () => {
  it('keeps bicycle feet animated but scooter and motorcycle feet fixed across animation frames', () => {
    expect(getCourierPose('Bicycle', 'right', 1).feet).not.toEqual(getCourierPose('Bicycle', 'right', 3).feet)
    expect(getCourierPose('ElectricScooter', 'right', 1).feet).toEqual(getCourierPose('ElectricScooter', 'right', 3).feet)
    expect(getCourierPose('Motorcycle', 'right', 1).feet).toEqual(getCourierPose('Motorcycle', 'right', 3).feet)
    expect(getCourierPose('ElectricScooter', 'right', 1).bob).toBe(0)
    expect(getCourierPose('Motorcycle', 'right', 1).bob).toBe(0)
  })

  it('keeps enclosed car/van driver hidden from bicycle-style rider animation', () => {
    expect(getCourierPose('Car', 'down').riderVisible).toBe(false)
    expect(getCourierPose('DeliveryVan', 'down').riderVisible).toBe(false)
  })
})

describe('HQ interior physical management and field staff semantics', () => {
  it('renders authoritative fleet while keeping active Couriers represented as field staff', () => {
    expect(interiorSource).toContain('this.drawOwnedFleet()')
    expect(interiorSource).toContain('this.companyState.vehicles.slice(0, 4)')
    expect(interiorSource).toContain('this.drawEmployees()')
    expect(interiorSource).toContain('this.companyState.employees.slice(0, 8)')
    expect(interiorSource).toContain('FIELD COURIERS')
    expect(interiorSource).toContain('OUTSIDE HQ · delivery role')
    expect(interiorSource).toContain('drawOnboardingCourier')
    expect(interiorSource).toContain('HIRING TERMINAL')
    expect(interiorSource).toContain('MAINTENANCE WING')
    expect(interiorSource).toContain('LOCKED · BUILD THROUGH PROGRESSION')
    expect(interiorSource).not.toContain('Dispatch terminal')
  })

  it('keeps Fleet and Employee rooms separated and reserves a department header band', () => {
    expect(interiorSource).toContain("this.zonePanel(65, 105, 335, 180, 'EMPLOYEE AREA'")
    expect(interiorSource).toContain("this.zonePanel(65, 310, 335, 305, 'FLEET BAY'")
    expect(interiorSource).toContain('Reserved header band prevents department names/subtitles')
    expect(interiorSource).not.toContain('interaction.label, {')
  })

  it('routes hiring, vehicle purchase and company management through physical HQ terminals', () => {
    expect(interiorLocationsSource).toContain("'Hiring & Staff Terminal'")
    expect(interiorLocationsSource).toContain("'Fleet Purchase Terminal'")
    expect(interiorLocationsSource).toContain("'Operations & Dispatch Console'")
    expect(interiorLocationsSource).not.toContain("'HQ Management Terminal'")
    expect(interiorLocationsSource).toContain("'Vehicle Handoff'")
    expect(interiorSource).toContain("this.openHQManagement('EmployeeManagement')")
    expect(interiorSource).toContain("this.openHQManagement('VehicleFleet')")
    expect(interiorSource).toContain("this.openHQManagement('CompanyManagement')")
    expect(interiorSource).toContain("case 'fleet-handoff':")
  })
})