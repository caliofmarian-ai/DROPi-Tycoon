import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import type Phaser from 'phaser'
import { createThemedButton, fitText } from '../src/ui/themeControls'

vi.mock('phaser', () => ({
  default: { Geom: { Rectangle: class {
    static Contains = vi.fn()
    constructor(left: number, top: number, width: number, height: number) {
      Object.assign(this, { left, top, width, height })
    }
  } } },
}))

class MeasuredText {
  text: string
  style: { fontSize: string | number }
  width = 0
  height = 0
  x = 0
  y = 0
  alpha = 1

  constructor(value: string, style: { fontSize: string | number }) {
    this.text = value
    this.style = style
    this.measure()
  }

  private measure() {
    const size = parseFloat(String(this.style.fontSize))
    this.width = Array.from(this.text).length * size * 0.6
    this.height = this.text ? size * 1.2 : 0
  }

  setText(value: string) { this.text = value; this.measure(); return this }
  setFontSize(size: number) { this.style.fontSize = size; this.measure(); return this }
  setOrigin() { return this }
  setPosition(x: number, y: number) { this.x = x; this.y = y; return this }
  setAlpha(alpha: number) { this.alpha = alpha; return this }
}

const setup = () => {
  const graphics = Object.assign(new EventEmitter(), {
    clear: vi.fn(),
    fillStyle: vi.fn(),
    fillRoundedRect: vi.fn(),
    lineStyle: vi.fn(),
    strokeRoundedRect: vi.fn(),
    setInteractive: vi.fn(),
    disableInteractive: vi.fn(),
    setAlpha: vi.fn(),
  })
  const scene = {
    add: {
      graphics: () => graphics,
      text: (_x: number, _y: number, value: string, style: { fontSize: string }) => new MeasuredText(value, style),
    },
  } as unknown as Phaser.Scene
  return { scene, graphics }
}

describe('Measured themed controls', () => {
  it('keeps long saved names within a touch button, including after a label update', () => {
    const { scene } = setup()
    const rect = { left: 12, top: 100, width: 160, height: 48 }
    const button = createThemedButton(scene, rect, `Hire ${'LongSavedName'.repeat(8)}`, 'success', vi.fn())
    expect(button.label.width).toBeLessThanOrEqual(rect.width - 16)
    expect(button.label.height).toBeLessThanOrEqual(rect.height - 12)
    expect(button.label.text.endsWith('…')).toBe(true)
    button.setLabel('Hire Alex')
    expect(button.label.text).toBe('Hire Alex')
    expect(parseFloat(String(button.label.style.fontSize))).toBe(16)
  })

  it('stops input before a purchase, and disabled buttons cannot invoke it', () => {
    const { scene, graphics } = setup()
    const calls: string[] = []
    const button = createThemedButton(scene, { left: 12, top: 100, width: 160, height: 48 },
      'Buy vehicle', 'success', () => calls.push('purchase'))
    const event = { stopPropagation: () => calls.push('stop') }
    graphics.emit('pointerdown', { id: 1 }, 0, 0, event)
    expect(calls).toEqual(['stop', 'purchase'])
    button.setEnabled(false)
    graphics.emit('pointerdown', { id: 1 }, 0, 0, event)
    expect(calls).toEqual(['stop', 'purchase', 'stop'])
    expect(graphics.disableInteractive).toHaveBeenCalledOnce()
    button.setEnabled(true)
    graphics.emit('pointerdown', { id: 1 }, 0, 0, event)
    expect(calls).toEqual(['stop', 'purchase', 'stop', 'stop', 'purchase'])
  })

  it('fits long review copy without splitting a Unicode character or dropping below 12px', () => {
    const { scene } = setup()
    const rect = { left: 20, top: 40, width: 90, height: 20 }
    const text = fitText(scene, rect, '🚲'.repeat(50), 18)
    expect(text.width).toBeLessThanOrEqual(rect.width)
    expect(text.height).toBeLessThanOrEqual(rect.height)
    expect(text.text.endsWith('…')).toBe(true)
    expect(text.text.isWellFormed()).toBe(true)
    expect(parseFloat(String(text.style.fontSize))).toBe(12)
  })

  it('omits an unreadable miniature label instead of rendering an overflowing ellipsis', () => {
    const { scene } = setup()
    const text = fitText(scene, { left: 20, top: 40, width: 40, height: 6 }, 'DROPi HQ', 12)
    expect(text.text).toBe('')
  })
})
