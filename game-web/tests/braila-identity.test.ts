import type Phaser from 'phaser'
import { describe, expect, it } from 'vitest'
import {
  BRAILA_ADDRESS_PLAQUES,
  BRAILA_DISTRICT_IDENTITY_PROFILES,
  drawBrailaDistrictIdentity,
} from '../src/world/brailaIdentity'
import { WORLD_BUILDINGS, WORLD_ROADS, WORLD_ZONES, WORLD_CITY_NAME } from '../src/world/worldLayout'

const graphicsRecorder = () => {
  const calls: { method: string; args: unknown[] }[] = []
  const chain = new Proxy({}, {
    get: (_target, method: string) => (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    },
  })
  return { graphics: chain as Phaser.GameObjects.Graphics, calls }
}

describe('Brăila visible district identity', () => {
  it('uses Brăila as the single playable city identity', () => {
    expect(WORLD_CITY_NAME).toBe('Brăila')
  })

  it('gives every gameplay district a unique bounded visual cue', () => {
    expect(BRAILA_DISTRICT_IDENTITY_PROFILES).toHaveLength(WORLD_ZONES.length)
    expect(new Set(BRAILA_DISTRICT_IDENTITY_PROFILES.map(profile => profile.zoneId))).toEqual(
      new Set(WORLD_ZONES.map(zone => zone.id)),
    )
    expect(new Set(BRAILA_DISTRICT_IDENTITY_PROFILES.map(profile => profile.cueKind)).size).toBe(6)
    const mock = graphicsRecorder()
    drawBrailaDistrictIdentity(mock.graphics)
    expect(mock.calls.length).toBeGreaterThan(45)
    expect(mock.calls.length).toBeLessThan(180)
  })

  it('keeps real sourced Brăila street names instead of inventing a parallel street map', () => {
    const named = WORLD_ROADS.filter(road => Boolean(road.name))
    expect(named.length).toBeGreaterThan(50)
    expect(named.some(road => road.name === 'Piața Traian')).toBe(true)
    expect(named.some(road => road.name === 'Bulevardul Independenței')).toBe(true)
  })

  it('keeps address plaques bounded and attached to physical buildings', () => {
    expect(BRAILA_ADDRESS_PLAQUES.length).toBeGreaterThanOrEqual(12)
    expect(BRAILA_ADDRESS_PLAQUES.length).toBeLessThanOrEqual(18)
    expect(BRAILA_ADDRESS_PLAQUES.find(plaque => plaque.buildingId === 'main-hq')?.number).toBe(1)
    expect(BRAILA_ADDRESS_PLAQUES.find(plaque => plaque.buildingId === 'business-1')?.number).toBe(10)
    for (const plaque of BRAILA_ADDRESS_PLAQUES) {
      const building = WORLD_BUILDINGS.find(candidate => candidate.id === plaque.buildingId)
      expect(building, plaque.buildingId).toBeDefined()
      expect(plaque.x).toBeGreaterThanOrEqual(building!.x - building!.width / 2)
      expect(plaque.x).toBeLessThanOrEqual(building!.x + building!.width / 2)
      expect(plaque.y).toBeGreaterThanOrEqual(building!.y - building!.height / 2)
      expect(plaque.y).toBeLessThanOrEqual(building!.y + building!.height / 2)
    }
  })
})
