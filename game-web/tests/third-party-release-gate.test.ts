import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const verifier = new URL('../scripts/verify-third-party-release.mjs', import.meta.url)
const provenance = JSON.parse(
  readFileSync(new URL('../public/legal/runtime-provenance.json', import.meta.url), 'utf8'),
) as {
  commercialReleaseReady: boolean
  blockingReviewIds: string[]
}

describe('ISSUE-565 — third-party release evidence gate', () => {
  it('keeps the dependency inventory, notices, runtime assets and data provenance internally consistent', () => {
    const output = execFileSync(process.execPath, [verifier.pathname], { encoding: 'utf8' })
    expect(output).toContain('Third-party inventory/notices/provenance consistency PASSED')
  })

  it('truthfully blocks commercial release while professional/provenance review items remain open', () => {
    expect(provenance.commercialReleaseReady).toBe(false)
    expect(provenance.blockingReviewIds).toEqual(
      expect.arrayContaining([
        'generated-orders-icon-chain-of-title',
        'branding-chain-of-title-and-trademark',
        'osm-commercial-distribution-characterization',
      ]),
    )

    const result = spawnSync(process.execPath, [verifier.pathname, '--commercial-release'], {
      encoding: 'utf8',
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('commercial release gate is blocked')
  })
})
