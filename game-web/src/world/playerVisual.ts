import type Phaser from 'phaser'
import type { UrbanFacing } from './urbanWorld'
import { courierAnimationFrame, getCourierPose, type CourierFrame, type CourierState } from './courierPose'
import { COURIER_ANCHOR, COURIER_CELL, ensureCourierAtlas } from './courierArt'

export type PlayerVisualState = CourierState

export interface PlayerVisual {
  container: Phaser.GameObjects.Container
  setState: (state: PlayerVisualState) => void
  /** Booleans remain accepted for legacy callers. */
  setFacing: (facing: UrbanFacing | boolean) => void
  setMoving: (moving: boolean) => void
  setCarrying: (carrying: boolean) => void
  update: (delta: number) => void
  destroy: () => void
}

export const createPlayerVisual = (scene: Phaser.Scene, x: number, y: number): PlayerVisual => {
  const container = scene.add.container(x, y)
  let state: CourierState = 'Walking'
  let facing: UrbanFacing = 'down'
  let frame: CourierFrame = 0
  let carrying = false
  let moving = false
  let elapsed = 0
  const image = scene.add.image(0, 0, ensureCourierAtlas(scene, state), 0)
    .setOrigin(COURIER_ANCHOR.x / COURIER_CELL, COURIER_ANCHOR.y / COURIER_CELL)
  container.add(image)

  const show = (): void => {
    const pose = getCourierPose(state, facing, frame, carrying)
    image.setFrame(pose.atlasFrame)
  }
  return {
    container,
    setState: next => {
      if (state === next) return
      state = next
      frame = 0
      elapsed = 0
      image.setTexture(ensureCourierAtlas(scene, state))
      show()
    },
    setFacing: next => {
      const direction = typeof next === 'boolean' ? next ? 'left' : 'right' : next
      if (direction === facing) return
      facing = direction
      show()
    },
    setMoving: next => {
      if (moving === next) return
      moving = next
      if (!moving) {
        elapsed = 0
        frame = 0
        show()
      }
    },
    setCarrying: next => {
      if (carrying === next) return
      carrying = next
      show()
    },
    update: delta => {
      if (!moving || !Number.isFinite(delta) || delta <= 0) return
      elapsed = (elapsed + Math.min(delta, 100)) % 460
      const nextFrame = courierAnimationFrame(elapsed, moving)
      if (nextFrame === frame) return
      frame = nextFrame
      show()
    },
    destroy: () => container.destroy(true),
  }
}
