import type { UrbanFacing } from './urbanWorld'

/** Presentation only. Owning fleet art never equips or unlocks a vehicle. */
export type CourierState = 'Walking' | 'Bicycle' | 'ElectricScooter' | 'Motorcycle' | 'Car' | 'DeliveryVan'
export type CourierFrame = 0 | 1 | 2 | 3
export const COURIER_DIRECTIONS: readonly UrbanFacing[] = ['down', 'left', 'right', 'up']
export const COURIER_STATES: readonly CourierState[] = [
  'Walking', 'Bicycle', 'ElectricScooter', 'Motorcycle', 'Car', 'DeliveryVan',
]
export interface PosePoint { readonly x: number; readonly y: number }
export interface CourierPose {
  readonly state: CourierState
  readonly facing: UrbanFacing
  readonly frame: CourierFrame
  readonly carrying: boolean
  readonly atlasFrame: number
  readonly projection: 'front' | 'back' | 'profile'
  readonly wheelAxis: 'x' | 'y' | null
  readonly wheels: readonly PosePoint[]
  readonly head: PosePoint
  readonly feet: readonly [PosePoint, PosePoint]
  readonly hands: readonly [PosePoint, PosePoint]
  readonly backpack: PosePoint
  readonly cargo: PosePoint
  readonly faceVisible: boolean
  readonly backpackVisible: boolean
  readonly riderVisible: boolean
  readonly bodyWidth: number
  readonly bodyLength: number
  readonly bob: number
}

const point = (x: number, y: number): PosePoint => Object.freeze({ x, y })
const makePose = (
  state: CourierState, facing: UrbanFacing, frame: CourierFrame, carrying: boolean,
): CourierPose => {
  const profile = facing === 'left' || facing === 'right'
  const sign = facing === 'left' || facing === 'up' ? -1 : 1
  const walking = state === 'Walking'
  const enclosed = state === 'Car' || state === 'DeliveryVan'
  const stride = [0, 1, 0, -1][frame]
  const bob = !enclosed && frame % 2 ? walking ? -1.5 : -0.5 : 0
  const wheelbase = state === 'ElectricScooter' ? 16 : state === 'Motorcycle' ? 23 : 21
  const wheels = walking ? [] : enclosed
    ? (profile
      ? [point(-24, -1), point(24, -1)]
      : [point(-17, -27), point(17, -27), point(-17, 1), point(17, 1)])
    : (profile
      ? [point(-wheelbase, -3), point(wheelbase, -3)]
      : [point(0, -wheelbase - 4), point(0, wheelbase - 4)])
  return Object.freeze({
    state, facing, frame, carrying,
    atlasFrame: (carrying ? 16 : 0) + COURIER_DIRECTIONS.indexOf(facing) * 4 + frame,
    projection: profile ? 'profile' : facing === 'up' ? 'back' : 'front',
    wheelAxis: walking ? null : profile ? 'x' : 'y',
    wheels: Object.freeze(wheels),
    head: point(profile ? sign * (walking ? 2 : 7) : 0, (walking ? -39 : -45) + bob),
    feet: Object.freeze([
      point(profile ? walking ? -stride * 7 : sign * 5 + stride * 5 : walking ? -5 : -8,
        walking ? -2 + (profile ? 0 : stride * 3) : -3 - stride * 5),
      point(profile ? walking ? stride * 7 : sign * 5 - stride * 5 : walking ? 5 : 8,
        walking ? -2 - (profile ? 0 : stride * 3) : -3 + stride * 5),
    ]) as readonly [PosePoint, PosePoint],
    hands: Object.freeze([
      point(profile ? sign * (walking ? 5 : 18) + (walking ? stride * 3 : 0) : -14,
        walking ? -9 + bob + stride * 3 : profile ? -26 : facing === 'up' ? -29 : -7),
      point(profile ? sign * (walking ? 5 : 18) - (walking ? stride * 3 : 0) : 14,
        walking ? -9 + bob - stride * 3 : profile ? -26 : facing === 'up' ? -29 : -7),
    ]) as readonly [PosePoint, PosePoint],
    backpack: point(profile ? -sign * (walking ? 11 : 12) : 0, (walking ? -25 : -27) + bob),
    cargo: point(profile ? -sign * (walking ? 11 : 25) : walking || facing === 'up' ? 0 : -17,
      walking ? -25 + bob : facing === 'up' ? 12 : -25),
    faceVisible: facing !== 'up' && !enclosed,
    backpackVisible: facing !== 'down' && !enclosed,
    riderVisible: !enclosed,
    bodyWidth: enclosed ? (state === 'DeliveryVan' ? 40 : 34) : profile ? 15 : 21,
    bodyLength: enclosed ? (state === 'DeliveryVan' ? 78 : 65) : 28,
    bob,
  })
}

// Immutable bounded lookup: neither animation ticks nor render calls allocate poses.
const poses = new Map<CourierState, readonly CourierPose[]>(COURIER_STATES.map(state => [
  state,
  COURIER_DIRECTIONS.flatMap(facing => [false, true].flatMap(carrying =>
    ([0, 1, 2, 3] as const).map(frame => makePose(state, facing, frame, carrying)))),
]))

export const getCourierPose = (
  state: CourierState, facing: UrbanFacing, frame: CourierFrame = 0, carrying = false,
): CourierPose => poses.get(state)![COURIER_DIRECTIONS.indexOf(facing) * 8 + (carrying ? 4 : 0) + frame]

export const courierAnimationFrame = (elapsed: number, moving: boolean): CourierFrame =>
  moving && Number.isFinite(elapsed) ? Math.floor(Math.max(0, elapsed) / 115) % 4 as CourierFrame : 0
