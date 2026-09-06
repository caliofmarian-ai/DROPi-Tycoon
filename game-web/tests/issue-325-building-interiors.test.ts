import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  HQ_INTERIOR,
  MARKETPLACE_INTERIOR,
  isInteriorWalkable,
  moveInteriorPlayer,
  nearestInteriorInteraction,
} from '../src/world/interiorLocations'
import { isUrbanWalkable, URBAN_MARKETPLACE, URBAN_MARKETPLACE_BUILDING_ID } from '../src/world/urbanWorld'

const configSource = readFileSync(new URL('../src/config/gameConfig.ts', import.meta.url), 'utf8')
const worldSceneSource = readFileSync(new URL('../src/scenes/GameWorldScene.ts', import.meta.url), 'utf8')
const interiorSceneSource = readFileSync(new URL('../src/scenes/BaseInteriorScene.ts', import.meta.url), 'utf8')
const presentationSource = readFileSync(new URL('../src/world/urbanPresentation.ts', import.meta.url), 'utf8')

describe('#325 bounded dual-layer world model', () => {
  it('defines separate HQ and Marketplace interiors with walkable spawn and exit anchors', () => {
    expect(HQ_INTERIOR.id).toBe('hq')
    expect(MARKETPLACE_INTERIOR.id).toBe('marketplace')
    expect(isInteriorWalkable(HQ_INTERIOR, HQ_INTERIOR.spawn)).toBe(true)
    expect(isInteriorWalkable(MARKETPLACE_INTERIOR, MARKETPLACE_INTERIOR.spawn)).toBe(true)
    expect(HQ_INTERIOR.interactions.some(entry => entry.id === 'exit')).toBe(true)
    expect(MARKETPLACE_INTERIOR.interactions.some(entry => entry.id === 'exit')).toBe(true)
  })

  it('keeps interior movement inside bounds and prevents furniture/wall tunnelling', () => {
    const blocked = HQ_INTERIOR.obstacles[0]
    expect(isInteriorWalkable(HQ_INTERIOR, { x: blocked.x, y: blocked.y })).toBe(false)
    expect(moveInteriorPlayer(HQ_INTERIOR, { x: 20, y: 600 }, { x: -1, y: 0 }, 1)).toEqual({ x: 20, y: 600 })
    const moved = moveInteriorPlayer(HQ_INTERIOR, HQ_INTERIOR.spawn, { x: 1, y: 0 }, 0.1)
    expect(moved.x).toBeGreaterThan(HQ_INTERIOR.spawn.x)
    expect(moved.y).toBe(HQ_INTERIOR.spawn.y)
  })

  it('resolves the closest in-range interaction instead of firing remote zones', () => {
    const fleet = HQ_INTERIOR.interactions.find(entry => entry.id === 'fleet')!
    expect(nearestInteriorInteraction(HQ_INTERIOR, { x: fleet.x, y: fleet.y })?.id).toBe('fleet')
    expect(nearestInteriorInteraction(HQ_INTERIOR, { x: 600, y: 520 })).toBeUndefined()
  })

  it('places the exterior Marketplace entrance on reachable city pavement', () => {
    expect(URBAN_MARKETPLACE_BUILDING_ID).toBe('business-1')
    expect(isUrbanWalkable(URBAN_MARKETPLACE.x, URBAN_MARKETPLACE.y + 20)).toBe(true)
  })
})

describe('#325 scene and persistence integration', () => {
  it('registers both interiors and enters them by launching over the sleeping city scene', () => {
    expect(configSource).toContain('HQInteriorScene')
    expect(configSource).toContain('MarketplaceInteriorScene')
    expect(worldSceneSource).toContain("this.enterInterior('HQInterior')")
    expect(worldSceneSource).toContain("this.enterInterior('MarketplaceInterior')")
    expect(worldSceneSource).toContain('this.scene.launch(scene)')
    expect(worldSceneSource).toContain('this.scene.sleep()')
  })

  it('uses shared session state and autosave instead of creating a second economy', () => {
    expect(interiorSceneSource).toContain('getOrCreateGameSession()')
    expect(interiorSceneSource).toContain('replaceGameSession(this.worldState, this.companyState)')
    expect(interiorSceneSource).toContain('autosaveIfApproved')
    expect(interiorSceneSource).toContain('nextActiveTransport(this.companyState')
    expect(interiorSceneSource).toContain('performUrbanInteraction(this.worldState, this.companyState)')
  })

  it('keeps future online marketplace and DronePort capabilities visibly non-operational', () => {
    expect(interiorSceneSource).toContain('FUTURE / NOT YET IMPLEMENTED')
    expect(interiorSceneSource).toContain('FUTURE · NOT YET OPERATIONAL')
    expect(interiorSceneSource).toContain('No fake online trading is enabled yet')
  })

  it('moves purchased vehicle storage off the public street and marks both entrances', () => {
    expect(presentationSource).toContain('purchased vehicles live inside the physical HQ Fleet Bay')
    expect(presentationSource).toContain("'FLEET · INSIDE HQ'")
    expect(presentationSource).toContain("'ENTER HQ'")
    expect(presentationSource).toContain("'ENTER MARKETPLACE'")
    expect(presentationSource).toContain('return null')
  })
})
