import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const inventoryPath = fileURLToPath(
  new URL('../../08_Assets/Production/asset-inventory.v1.json', import.meta.url),
)
const verifierPath = fileURLToPath(
  new URL('../../08_Assets/Production/Tools/verify_asset_inventory.mjs', import.meta.url),
)

const tempDirs: string[] = []

function loadInventory(): any {
  return JSON.parse(readFileSync(inventoryPath, 'utf8'))
}

function runVerifier(fixturePath = inventoryPath) {
  return spawnSync(
    process.execPath,
    [verifierPath, '--repo-root', repoRoot, '--inventory', fixturePath],
    { encoding: 'utf8' },
  )
}

function writeFixture(inventory: any) {
  const dir = mkdtempSync(join(tmpdir(), 'dropi-dt19-assets-'))
  tempDirs.push(dir)
  const path = join(dir, 'asset-inventory.json')
  writeFileSync(path, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')
  return path
}

afterEach(() => {
  while (tempDirs.length > 0) rmSync(tempDirs.pop()!, { recursive: true, force: true })
})

describe('ISSUE-414 — DT-19 asset inventory and dedup authority', () => {
  it('verifies current canonical families, candidate inventory, runtime lineage and declared exact reuse', () => {
    const result = runVerifier()

    expect(result.status, result.stderr).toBe(0)
    const summary = JSON.parse(result.stdout.trim())
    expect(summary.ok).toBe(true)
    expect(summary.families).toBeGreaterThanOrEqual(11)
    expect(summary.inventoriedArtifacts).toBeGreaterThanOrEqual(63)
    expect(summary.runtimeArtifacts).toBe(13)
    expect(summary.declaredReuseSets).toBeGreaterThanOrEqual(2)
  })

  it('fails closed when an exact duplicate is no longer declared as intentional reuse', () => {
    const inventory = loadInventory()
    const mobileLogo = inventory.runtimeArtifacts.find(
      (asset: any) => asset.assetId === 'runtime-mobile-brand-logo',
    )
    delete mobileLogo.reuseGroup

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('must share one declared reuseGroup')
    expect(result.stderr).toContain('dropi-tycoon-logo.png')
  })

  it('fails closed when a lifecycle state is promoted without every preceding gate', () => {
    const inventory = loadInventory()
    const ordersIcon = inventory.runtimeArtifacts.find(
      (asset: any) => asset.assetId === 'runtime-orders-icon',
    )
    ordersIcon.lifecycleState = 'ANDROID_VERIFIED'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('missing lifecycle evidence for ANDROID_VERIFIED')
  })

  it('fails closed when the registry claims a runtime asset that is not present', () => {
    const inventory = loadInventory()
    inventory.runtimeArtifacts[0].path = 'game-web/public/assets/production/not-present.webp'

    const result = runVerifier(writeFixture(inventory))

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('references missing file')
  })
})
