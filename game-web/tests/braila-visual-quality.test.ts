import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  BRAILA_LABEL_RULES,
  brailaReservedScreenBoxes,
  isBrailaLabelVisibleAtLevel,
  selectBrailaScreenLabels,
  type BrailaScreenLabelCandidate,
} from '../src/world/brailaLabelPresentation'
import { WORLD_CITY_NAME } from '../src/world/worldLayout'

describe('Brăila player-facing semantic labels', () => {
  it('uses a distinct label vocabulary at city, district, area and hero scales', () => {
    expect(isBrailaLabelVisibleAtLevel('district', 'City')).toBe(true)
    expect(isBrailaLabelVisibleAtLevel('district', 'Hero')).toBe(false)
    expect(isBrailaLabelVisibleAtLevel('street', 'District')).toBe(true)
    expect(isBrailaLabelVisibleAtLevel('street', 'Area')).toBe(true)
    expect(isBrailaLabelVisibleAtLevel('landmark', 'District')).toBe(true)
    expect(isBrailaLabelVisibleAtLevel('landmark', 'Area')).toBe(true)
    expect(isBrailaLabelVisibleAtLevel('interaction', 'Area')).toBe(false)
    expect(isBrailaLabelVisibleAtLevel('interaction', 'Hero')).toBe(true)
    expect(isBrailaLabelVisibleAtLevel('address', 'Hero')).toBe(true)
    expect(BRAILA_LABEL_RULES.interaction.priority).toBeGreaterThan(BRAILA_LABEL_RULES.street.priority)
  })

  it.each([[640, 360], [740, 360], [800, 360], [915, 412], [1280, 720]])(
    'reserves fixed HUD surfaces before placing world labels at %ix%i', (width, height) => {
      const reserved = brailaReservedScreenBoxes(width, height)
      expect(reserved.length).toBeGreaterThanOrEqual(5)
      expect(reserved[0]).toMatchObject({ left: 0, top: 0, right: width })
      expect(reserved.every(box => box.left >= 0 && box.top >= 0 && box.right <= width && box.bottom <= height)).toBe(true)

      const viewport = { left: 0, top: 0, width, height }
      const candidates: BrailaScreenLabelCandidate[] = [
        { id: 'under-header', role: 'landmark', box: { left: width / 2 - 40, top: 8, right: width / 2 + 40, bottom: 30 } },
        { id: 'center', role: 'landmark', box: { left: width / 2 - 40, top: height / 2 - 10, right: width / 2 + 40, bottom: height / 2 + 10 } },
      ]
      expect(selectBrailaScreenLabels(candidates, 'Area', viewport, reserved)).toEqual(['center'])
    },
  )

  it('keeps the interaction cue and suppresses lower-priority HQ/shop/street/address collisions', () => {
    const viewport = { left: 0, top: 0, width: 900, height: 500 }
    const samePlace = { left: 410, top: 230, right: 490, bottom: 250 }
    const candidates: BrailaScreenLabelCandidate[] = [
      { id: 'street', role: 'street', box: samePlace },
      { id: 'address', role: 'address', box: samePlace },
      { id: 'storefront', role: 'storefront', box: samePlace },
      { id: 'enter-hq', role: 'interaction', box: samePlace },
    ]
    expect(selectBrailaScreenLabels(candidates, 'Hero', viewport)).toEqual(['enter-hq'])
  })

  it('allows separated labels while rejecting touching labels with presentation padding', () => {
    const viewport = { left: 0, top: 0, width: 900, height: 500 }
    const candidates: BrailaScreenLabelCandidate[] = [
      { id: 'hq', role: 'landmark', box: { left: 300, top: 180, right: 360, bottom: 202 } },
      { id: 'street-near-hq', role: 'street', box: { left: 363, top: 180, right: 450, bottom: 202 } },
      { id: 'street-clear', role: 'street', box: { left: 500, top: 180, right: 590, bottom: 202 } },
    ]
    expect(selectBrailaScreenLabels(candidates, 'Area', viewport)).toEqual(['hq', 'street-clear'])
  })

  it('allows a district-scale landmark while preserving collision priority', () => {
    const viewport = { left: 0, top: 0, width: 900, height: 500 }
    const samePlace = { left: 410, top: 230, right: 490, bottom: 250 }
    const candidates: BrailaScreenLabelCandidate[] = [
      { id: 'street', role: 'street', box: samePlace },
      { id: 'landmark', role: 'landmark', box: samePlace },
    ]
    expect(selectBrailaScreenLabels(candidates, 'District', viewport)).toEqual(['landmark'])
  })

  it('keeps the runtime city canonical as Brăila and does not reintroduce Cedar City', () => {
    expect(WORLD_CITY_NAME).toBe('Brăila')
    const source = [
      readFileSync(new URL('../src/world/urbanPresentation.ts', import.meta.url), 'utf8'),
      readFileSync(new URL('../src/world/brailaLabelPresentation.ts', import.meta.url), 'utf8'),
    ].join('\n')
    expect(source).not.toMatch(/Cedar City/i)
  })
})
