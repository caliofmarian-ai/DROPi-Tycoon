import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const gameWebRoot = fileURLToPath(new URL('../', import.meta.url))

describe('large-city presentation performance budget', () => {
  it('keeps governed streamed-sector and chunk budgets within the Android guardrail', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-large-city-presentation-budget.mjs'],
      {
        cwd: gameWebRoot,
        encoding: 'utf8',
      },
    )

    expect(output).toContain('streamed-sector hard ceiling: 5')
    expect(output).toContain('chunks-per-sector hard ceiling: 10')
    expect(output).toContain('Large-city presentation performance guard: PASS')
  })
})
