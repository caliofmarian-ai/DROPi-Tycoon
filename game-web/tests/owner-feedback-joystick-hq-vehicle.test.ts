import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AnalogJoystickInput, sampleAnalogJoystick } from '../src/ui/AnalogJoystick'
import { getCourierPose } from '../src/world/courierPose'

const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')
const interiorSource = readFileSync(new URL('../src/scenes/BaseInteriorScene.ts', import.meta.url), 'utf8')

describe('owner analog joystick decision', () => {
  it('returns smooth proportional 360-degree vectors with a deadzone and clamped knob', () => {
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

  it('owns one pointer and stops immediately when that pointer releases', () => {
    const joystick = new AnalogJoystickInput()
    joystick.begin(7, 30, 0, 40)
    expect(joystick.value().x).toBeGreaterThan(0)
    joystick.release(8)
    expect(joystick.value().x).toBeGreaterThan(0)
    joystick.release(7)
    expect(joystick.value()).toEqual({ x: 0, y: 0 })
    expect(joystick.knobOffset()).toEqual({ x: 0, y: 0 })
  })

  it('uses the shared analog model outside and inside while preserving native Rectangle hit targets', () => {
    expect(hudSource).toContain("import { AnalogJoystickInput } from './AnalogJoystick'")
    expect(hudSource).toContain('private readonly pad = new AnalogJoystickInput()')
    expect(hudSource).toContain('this.pad.begin(pointer.id')
    expect(hudSource).toContain('this.pad.move(pointer.id')
    expect(hudSource).toContain('this.scene.add.rectangle(x + center, y + center, extent, extent, 0xffffff, 0.001)')
    expect(interiorSource).toContain("import { AnalogJoystickInput } from '../ui/AnalogJoystick'")
    expect(interiorSource).toContain('private readonly joystick = new AnalogJoystickInput()')
    expect(interiorSource).toContain('this.add.rectangle(0, 0, JOYSTICK_EXTENT, JOYSTICK_EXTENT, 0xffffff, 0.001)')
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

describe('HQ interior visible ownership and staff materialization', () => {
  it('renders authoritative fleet and employees instead of text-only departments', () => {
    expect(interiorSource).toContain('this.drawOwnedFleet()')
    expect(interiorSource).toContain('this.companyState.vehicles.slice(0, 4)')
    expect(interiorSource).toContain('this.drawEmployees()')
    expect(interiorSource).toContain('this.companyState.employees.slice(0, 6)')
    expect(interiorSource).toContain('Dispatch terminal')
    expect(interiorSource).toContain('Parcel staging')
    expect(interiorSource).toContain('MAINTENANCE WING')
    expect(interiorSource).toContain('LOCKED · BUILD THROUGH PROGRESSION')
  })

  it('keeps Fleet and Employee areas as separate non-overlapping room definitions', () => {
    expect(interiorSource).toContain("this.zonePanel(65, 105, 335, 145, 'EMPLOYEE AREA'")
    expect(interiorSource).toContain("this.zonePanel(65, 285, 335, 330, 'FLEET BAY'")
  })
})
