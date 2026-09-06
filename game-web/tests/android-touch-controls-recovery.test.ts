import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { UrbanDPadInput } from '../src/ui/UrbanHUD'

const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')

describe('Android touch controls recovery', () => {
  it('uses native Rectangle hit targets instead of custom Graphics hit testing for HUD controls', () => {
    expect(hudSource).toContain('button: Phaser.GameObjects.Rectangle')
    expect(hudSource).toContain('const hitWidth = interactive ? Math.max(44, width) : width')
    expect(hudSource).toContain('const hitHeight = interactive ? Math.max(44, height) : height')
    expect(hudSource).toContain('this.scene.add.rectangle(x, y, hitWidth, hitHeight, 0xffffff, 0.001)')
    expect(hudSource).toContain('this.scene.add.rectangle(x + center, y + center, extent, extent, 0xffffff, 0.001)')
    expect(hudSource).toContain('if (interactive) button.setInteractive({ useHandCursor: true })')
    expect(hudSource).toContain("hit.on('pointermove'")
    expect(hudSource).toContain("hit.on('pointerout', this.releasePointer)")
    expect(hudSource).toContain("hit.on('pointerup', this.releasePointer)")
    expect(hudSource).toContain('chrome.clear().fillStyle')
    expect(hudSource).not.toContain('button.setInteractive(\n      { x: -width / 2, y: -height / 2, width, height }')
  })

  it('keeps D-pad pointer ownership and releases only the matching finger/direction', () => {
    const pad = new UrbanDPadInput()
    pad.press(1, 'right')
    pad.press(2, 'up')
    expect(pad.value()).toEqual({ x: 1, y: -1 })

    pad.release(1, 'left')
    expect(pad.value()).toEqual({ x: 1, y: -1 })

    pad.release(1, 'right')
    expect(pad.value()).toEqual({ x: 0, y: -1 })

    pad.release(2)
    expect(pad.value()).toEqual({ x: 0, y: 0 })
  })

  it('keeps menu and transport visibility synchronized across chrome, hit target and label', () => {
    expect(hudSource).toContain('chrome.setVisible(visible)')
    expect(hudSource).toContain('button.setVisible(visible)')
    expect(hudSource).toContain('text.setVisible(visible)')
    expect(hudSource).toContain('control.setEnabled(this.open)')
    expect(hudSource).toContain('this.transportControl.setEnabled(canSwitch)')
  })
})
