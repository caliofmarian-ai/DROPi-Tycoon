export interface AnalogPoint { x: number; y: number }

export interface AnalogJoystickSample {
  vector: AnalogPoint
  knob: AnalogPoint
}

export const ANALOG_JOYSTICK_VISUAL_DIAMETER = 118
export const ANALOG_JOYSTICK_HIT_DIAMETER = 154
export const ANALOG_JOYSTICK_KNOB_RADIUS = 24
export const ANALOG_JOYSTICK_TRAVEL_RADIUS = 42
export const ANALOG_JOYSTICK_DEADZONE_RATIO = 0.08

const ZERO: Readonly<AnalogPoint> = Object.freeze({ x: 0, y: 0 })

/**
 * Convert a drag offset around a circular joystick into a continuous movement vector.
 * The returned knob offset is clamped to the visual travel radius; movement magnitude
 * is re-scaled after a deliberately small deadzone so slow thumb movement remains stable.
 */
export const sampleAnalogJoystick = (
  offsetX: number,
  offsetY: number,
  radius: number,
  deadzoneRatio = ANALOG_JOYSTICK_DEADZONE_RATIO,
): AnalogJoystickSample => {
  if (![offsetX, offsetY, radius, deadzoneRatio].every(Number.isFinite) || radius <= 0) {
    return { vector: { ...ZERO }, knob: { ...ZERO } }
  }
  const deadzone = Math.max(0, Math.min(0.8, deadzoneRatio))
  const distance = Math.hypot(offsetX, offsetY)
  if (distance === 0) return { vector: { ...ZERO }, knob: { ...ZERO } }

  const clampedDistance = Math.min(distance, radius)
  const nx = offsetX / distance
  const ny = offsetY / distance
  const knob = { x: nx * clampedDistance, y: ny * clampedDistance }
  const normalized = clampedDistance / radius
  if (normalized <= deadzone) return { vector: { ...ZERO }, knob }

  const magnitude = Math.min(1, (normalized - deadzone) / Math.max(0.001, 1 - deadzone))
  return {
    vector: { x: nx * magnitude, y: ny * magnitude },
    knob,
  }
}

/** Pointer-owned analog state shared by exterior and interior direct controls. */
export class AnalogJoystickInput {
  private pointerId: number | null = null
  private vector: AnalogPoint = { x: 0, y: 0 }
  private knob: AnalogPoint = { x: 0, y: 0 }

  begin(pointerId: number, offsetX: number, offsetY: number, radius: number): void {
    this.pointerId = pointerId
    this.apply(offsetX, offsetY, radius)
  }

  move(pointerId: number, offsetX: number, offsetY: number, radius: number): void {
    if (this.pointerId !== pointerId) return
    this.apply(offsetX, offsetY, radius)
  }

  release(pointerId?: number): void {
    if (pointerId !== undefined && this.pointerId !== pointerId) return
    this.clear()
  }

  clear(): void {
    this.pointerId = null
    this.vector = { x: 0, y: 0 }
    this.knob = { x: 0, y: 0 }
  }

  value(): AnalogPoint { return { ...this.vector } }
  knobOffset(): AnalogPoint { return { ...this.knob } }
  owns(pointerId: number): boolean { return this.pointerId === pointerId }

  private apply(offsetX: number, offsetY: number, radius: number): void {
    const sample = sampleAnalogJoystick(offsetX, offsetY, radius)
    this.vector = sample.vector
    this.knob = sample.knob
  }
}
