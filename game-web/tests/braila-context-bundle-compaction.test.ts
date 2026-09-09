import { describe, expect, it } from 'vitest'
import sourceContext from '../src/world/brailaContext.generated.json'
import { WORLD_CONTEXT_BUILDINGS, WORLD_SOURCE_CONTEXT_BUILDINGS } from '../src/world/worldLayout'

describe('Brăila context bundle compaction', () => {
  it('reconstructs every canonical context footprint without geometry loss before playable scaling', () => {
    const canonicalGeometry = sourceContext.buildings.map(({ x, y, width, height, points }) => ({
      x, y, width, height, points,
    }))

    expect(WORLD_SOURCE_CONTEXT_BUILDINGS.length).toBeGreaterThan(5000)
    expect(JSON.stringify(WORLD_SOURCE_CONTEXT_BUILDINGS)).toBe(JSON.stringify(canonicalGeometry))
    expect(WORLD_CONTEXT_BUILDINGS).toHaveLength(WORLD_SOURCE_CONTEXT_BUILDINGS.length)
  })
})
