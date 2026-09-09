import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const verifier = new URL('../scripts/verify-third-party-release.mjs', import.meta.url)
const provenance = JSON.parse(
  readFileSync(new URL('../public/legal/runtime-provenance.json', import.meta.url), 'utf8'),
) as {
  commercialReleaseReady: boolean
  blockingReviewIds: string[]
}
const commercialEvidence = JSON.parse(
  readFileSync(new URL('../public/legal/commercial-release-evidence.json', import.meta.url), 'utf8'),
) as {
  commercialReleaseReady: boolean
  blockingReviewIds: string[]
  mobileReleaseDependencyClosure: {
    status: string
    lockfilePresentAtAudit: boolean
    lockfileGitBlobSha?: string
    declaredDirectProductionDependencies: Record<string, string>
  }
  mobileBrandingAssets: Array<{
    path: string
    declaredSha256: string
    status: string
    blocker: string
  }>
  noticePlacement: {
    androidBundleRequirement: string[]
  }
}
const mobilePackage = JSON.parse(
  readFileSync(new URL('../../game-mobile/package.json', import.meta.url), 'utf8'),
) as { dependencies?: Record<string, string> }
const mobileLockfile = new URL('../../game-mobile/package-lock.json', import.meta.url)
const mobilePrepare = readFileSync(
  new URL('../../game-mobile/scripts/prepare-bundled-runtime.mjs', import.meta.url),
  'utf8',
)

describe('ISSUE-565 — third-party release evidence gate', () => {
  it('keeps dependency evidence, notices, runtime assets, mobile branding and data provenance internally consistent', () => {
    const output = execFileSync(process.execPath, [verifier.pathname], { encoding: 'utf8' })
    expect(output).toContain('Third-party inventory/notices/provenance consistency PASSED')
  })

  it('truthfully records that the canonical Android lockfile exists while release-path dependency review remains blocked', () => {
    expect(existsSync(mobileLockfile)).toBe(true)
    expect(commercialEvidence.mobileReleaseDependencyClosure.status).toBe('LOCKFILE_PRESENT_REVIEW_PENDING')
    expect(commercialEvidence.mobileReleaseDependencyClosure.lockfilePresentAtAudit).toBe(true)
    expect(commercialEvidence.mobileReleaseDependencyClosure.lockfileGitBlobSha).toMatch(/^[a-f0-9]{40}$/)
    expect(commercialEvidence.mobileReleaseDependencyClosure.declaredDirectProductionDependencies)
      .toEqual(mobilePackage.dependencies)
    expect(commercialEvidence.blockingReviewIds).toContain('mobile-release-dependency-license-closure')
  })

  it('registers the three shipped mobile branding sources without pretending they are commercially cleared', () => {
    expect(commercialEvidence.mobileBrandingAssets.map((entry) => entry.path)).toEqual(
      expect.arrayContaining([
        'game-mobile/assets/branding/dropi-tycoon-logo.png',
        'game-mobile/assets/branding/dropi-tycoon-app-icon.png',
        'game-mobile/assets/branding/dropi-tycoon-splash.jpg',
      ]),
    )
    for (const entry of commercialEvidence.mobileBrandingAssets) {
      expect(entry.declaredSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(entry.status).toBe('REVIEW_REQUIRED')
      expect(entry.blocker).toBe('branding-chain-of-title-and-trademark')
      expect(existsSync(new URL(`../../${entry.path}`, import.meta.url))).toBe(true)
    }
  })

  it('makes all user-accessible legal evidence files mandatory in the production Android bundle', () => {
    expect(commercialEvidence.noticePlacement.androidBundleRequirement).toEqual(
      expect.arrayContaining([
        'legal/third-party-notices.html',
        'legal/dependency-license-inventory.json',
        'legal/runtime-provenance.json',
        'legal/commercial-release-evidence.json',
      ]),
    )
    for (const path of commercialEvidence.noticePlacement.androidBundleRequirement) {
      expect(mobilePrepare).toContain(`'${path}'`)
    }
  })

  it('truthfully blocks commercial release while external provenance/legal review items remain open', () => {
    expect(provenance.commercialReleaseReady).toBe(false)
    expect(provenance.blockingReviewIds).toEqual(
      expect.arrayContaining([
        'generated-orders-icon-chain-of-title',
        'branding-chain-of-title-and-trademark',
        'osm-commercial-distribution-characterization',
      ]),
    )
    expect(commercialEvidence.commercialReleaseReady).toBe(false)
    expect(commercialEvidence.blockingReviewIds).toEqual(
      expect.arrayContaining([
        'generated-orders-icon-chain-of-title',
        'branding-chain-of-title-and-trademark',
        'osm-commercial-distribution-characterization',
        'mobile-release-dependency-license-closure',
      ]),
    )

    const result = spawnSync(process.execPath, [verifier.pathname, '--commercial-release'], {
      encoding: 'utf8',
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('commercial runtime provenance gate is blocked')
    expect(result.stderr).toContain('commercial IP/evidence gate is blocked')
  })
})
