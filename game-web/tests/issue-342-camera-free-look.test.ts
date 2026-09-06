import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { UrbanCameraPan, cameraScrollFromDrag } from '../src/ui/UrbanCameraPan'

const gameWorldSource = readFileSync(new URL('../src/scenes/GameWorldScene.ts', import.meta.url), 'utf8')
const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')

describe('#342 one-finger free-look camera pan', () => {
  it('waits for a threshold before activating and preserves pointer ownership', () => {
    const pan = new UrbanCameraPan()
    pan.begin(3, { x: 100, y: 100 })
    expect(pan.move(3, { x: 104, y: 102 }, 8)).toBeNull()
    expect(pan.isActive()).toBe(false)
    expect(pan.move(4, { x: 150, y: 150 }, 8)).toBeNull()
    expect(pan.owns(3)).toBe(true)
    const activated = pan.move(3, { x: 114, y: 102 }, 8)
    expect(activated).toEqual({ x: 10, y: 0, activated: true })
    expect(pan.isActive()).toBe(true)
    pan.release(4)
    expect(pan.owns(3)).toBe(true)
    pan.release(3)
    expect(pan.isActive()).toBe(false)
  })

  it('converts screen drag to bounded world scroll at the current zoom', () => {
    const world = { width: 2000, height: 1200 }
    const viewport = { width: 800, height: 400 }
    expect(cameraScrollFromDrag({ x: 500, y: 300 }, { x: 100, y: 0 }, 1, viewport, world))
      .toEqual({ x: 400, y: 300 })
    expect(cameraScrollFromDrag({ x: 500, y: 300 }, { x: -100, y: -50 }, 2, viewport, world))
      .toEqual({ x: 550, y: 325 })
    expect(cameraScrollFromDrag({ x: 2, y: 2 }, { x: 1000, y: 1000 }, 1, viewport, world))
      .toEqual({ x: 0, y: 0 })
    expect(cameraScrollFromDrag({ x: 1500, y: 900 }, { x: -1000, y: -1000 }, 1, viewport, world))
      .toEqual({ x: 1200, y: 800 })
  })

  it('stops camera follow during free-look and exposes an explicit recenter control', () => {
    expect(gameWorldSource).toContain('this.cameras.main.stopFollow()')
    expect(gameWorldSource).toContain('cameraScrollFromDrag(')
    expect(gameWorldSource).toContain('private recenterCamera(')
    expect(gameWorldSource).toContain('this.cameras.main.startFollow(this.playerVisual.container')
    expect(gameWorldSource).toContain('isUrbanHUDPoint(this.scale.width, this.scale.height, pointer.x, pointer.y)')
    expect(hudSource).toContain("'⌖', callbacks.recenter")
    expect(hudSource).not.toContain("['Company', callbacks.company]")
  })
})
