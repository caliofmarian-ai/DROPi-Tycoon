import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const hudSource = readFileSync(new URL('../src/ui/GameHUD.ts', import.meta.url), 'utf8')

describe('M-008 compact HUD copy', () => {
  it('uses a concise three-line active-order presentation', () => {
    expect(hudSource).toContain('`${data.orderId} · ${data.orderStatus}`')
    expect(hudSource).toContain('`${data.pickupLocation} → ${data.destination}`')
    expect(hudSource).toContain('`Reward ${data.reward} · ${data.carryingPackage ? \'Carrying\' : \'Not carrying\'}`')
  })

  it('does not restore the six verbose order-label lines', () => {
    expect(hudSource).not.toContain('`Order: ${data.orderId}`')
    expect(hudSource).not.toContain('`Status: ${data.orderStatus}`')
    expect(hudSource).not.toContain('`Destination: ${data.destination}`')
  })
})
