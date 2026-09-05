import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import { createInitialCompanyState, createInitialGameSettingsState, createInitialWorldState } from '../src/state/gameState'
import { performUrbanInteraction, getUrbanObjective } from '../src/systems/urbanInteractions'
import { purchaseVehicle } from '../src/systems/vehicleSystem'
import { decodeSave, restoreGameSessionFromSave, serializeGameSession } from '../src/persistence/saveSystem'
import { URBAN_HQ, URBAN_MERCHANT } from '../src/world/urbanWorld'
import type { EcosystemAsset } from '../src/types/ecosystemAsset'

describe('future optional ecosystem asset boundary', () => {
  it('keeps the declaration disconnected from all production gameplay and persistence', () => {
    const root = new URL('../src/', import.meta.url)
    const files = readdirSync(root, { recursive: true, encoding: 'utf8' })
      .filter(path => path.endsWith('.ts') && path !== 'types/ecosystemAsset.ts')
    expect(files.length).toBeGreaterThan(0)
    for (const path of files) {
      expect(readFileSync(new URL(path, root), 'utf8'), path).not.toMatch(/ecosystemAsset|EcosystemAsset/)
    }
  })

  it('completes core delivery, earns Company Money and buys transport without an asset or wallet', () => {
    let world = createInitialWorldState()
    let company = createInitialCompanyState()
    const interactAt = (point: { x: number; y: number }) => {
      const result = performUrbanInteraction({ ...world, player: { ...world.player, ...point } }, company)
      world = result.world
      company = result.company
      return result
    }
    interactAt(URBAN_MERCHANT)
    interactAt(URBAN_HQ)
    expect(world.activeOrder.status).toBe('Accepted')
    interactAt(getUrbanObjective(world).point)
    expect(world.player.carryingPackage).toBe(true)
    expect(interactAt(getUrbanObjective(world).point).settled).toBe(true)
    expect(company.money).toBe(BALANCING.ORDER_REWARD)
    expect(company.reputation).toBe(BALANCING.INITIAL_REPUTATION + BALANCING.REPUTATION_ON_SUCCESS)
    const purchase = purchaseVehicle(company, 'Bicycle')
    expect(purchase.purchased).toBe(true)
    expect(purchase.company.money).toBe(BALANCING.ORDER_REWARD - BALANCING.BICYCLE_COST)
    expect(purchase.company.vehicles.some(vehicle => vehicle.typeId === 'Bicycle')).toBe(true)
  })

  it('does not serialize speculative asset/wallet state or convert it to Company Money', () => {
    const asset: EcosystemAsset = {
      kind: 'optional-ecosystem-asset', assetId: 'future-placeholder', implementation: 'not-implemented',
      requiredForCoreGameplay: false, affectsGameplayPower: false, convertibleToCompanyMoney: false,
    }
    const session = {
      world: createInitialWorldState(), company: createInitialCompanyState(),
      settings: createInitialGameSettingsState(),
    }
    const raw = serializeGameSession(session)
    const withUnrecognizedExtension = { ...session, ecosystemAsset: asset, ecosystemWallet: { assets: [asset] } }
    expect(serializeGameSession(withUnrecognizedExtension)).toBe(raw)
    const decoded = decodeSave(JSON.stringify({
      ...JSON.parse(raw), ecosystemAsset: asset, ecosystemWallet: { assets: [asset] },
    }))
    expect(decoded.kind).toBe('valid')
    if (decoded.kind !== 'valid') throw new Error('Expected a valid ordinary save')
    expect(JSON.stringify(decoded.save)).not.toContain('ecosystem')
    const restored = restoreGameSessionFromSave(decoded.save)
    expect(restored.company.money).toBe(session.company.money)
    expect(restored).not.toHaveProperty('ecosystemWallet')
    expect(restored.company).toEqual(session.company)
  })
})
