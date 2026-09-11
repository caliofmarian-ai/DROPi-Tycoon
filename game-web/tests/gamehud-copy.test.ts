import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const hudSource = readFileSync(new URL('../src/ui/GameHUD.ts', import.meta.url), 'utf8')

describe('[DT-21][#695] compact HUD clarity', () => {
  it('uses an action-oriented one-line active-order presentation', () => {
    expect(hudSource).toContain('compactOrderStage(data.orderStatus)')
    expect(hudSource).toContain('compactLocationLabel(data.pickupLocation)')
    expect(hudSource).toContain('compactLocationLabel(data.destination)')
    expect(hudSource).toContain('compactMoneyLabel(data.reward)')
    expect(hudSource).not.toContain('compactOrderId')
    expect(hudSource).not.toContain("data.carryingPackage ? 'Carry' : 'Empty'")
    expect(hudSource).not.toContain('this.orderText.setText([')
  })

  it('uses readable company money and reputation labels in the existing compact panel', () => {
    expect(hudSource).toContain('`Co ${compactMoneyLabel(data.money)}\\nRep ${data.reputation}`')
    expect(hudSource).not.toContain('`M ${data.money} · R ${data.reputation}`')
  })

  it('maps canonical active-order states to immediate player cues', () => {
    expect(hudSource).toContain("case 'Available':")
    expect(hudSource).toContain("return 'Available'")
    expect(hudSource).toContain("case 'Accepted':")
    expect(hudSource).toContain("return 'Pickup'")
    expect(hudSource).toContain("case 'PickedUp':")
    expect(hudSource).toContain("return 'Carry'")
  })

  it('does not restore verbose or low-value persistent HUD labels', () => {
    expect(hudSource).not.toContain('`Order: ${data.orderId}`')
    expect(hudSource).not.toContain('`Status: ${data.orderStatus}`')
    expect(hudSource).not.toContain('`Destination: ${data.destination}`')
    expect(hudSource).not.toContain('Not carrying')
  })
})
