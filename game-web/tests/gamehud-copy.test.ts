import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const hudSource = readFileSync(new URL('../src/ui/GameHUD.ts', import.meta.url), 'utf8')

describe('M-008 compact HUD copy', () => {
  it('uses an abbreviated two-line active-order presentation', () => {
    expect(hudSource).toContain('compactOrderId(data.orderId)')
    expect(hudSource).toContain('compactLocationLabel(data.pickupLocation)')
    expect(hudSource).toContain('compactLocationLabel(data.destination)')
    expect(hudSource).toContain("data.carryingPackage ? 'Carry' : 'Empty'")
  })

  it('uses a one-line compact company status', () => {
    expect(hudSource).toContain('`M ${data.money} · R ${data.reputation}`')
  })

  it('does not restore verbose order labels', () => {
    expect(hudSource).not.toContain('`Order: ${data.orderId}`')
    expect(hudSource).not.toContain('`Status: ${data.orderStatus}`')
    expect(hudSource).not.toContain('`Destination: ${data.destination}`')
    expect(hudSource).not.toContain('Not carrying')
  })
})
