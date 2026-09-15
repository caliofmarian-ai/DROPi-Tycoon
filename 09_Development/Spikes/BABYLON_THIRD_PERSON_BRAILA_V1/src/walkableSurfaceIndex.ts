/** Exact acceleration of the existing immutable walkable-AABB snapshot.
 * Not a new terrain, collision, geography or contact authority. Every query still
 * returns the highest inclusive surface or throws outside governed surfaces.
 */
export type WalkableSurfaceBounds = {
  min: { x: number; z: number }
  max: { x: number; y: number; z: number }
}
type Surface = { minX: number; maxX: number; minZ: number; maxZ: number; top: number }
const MAX_GRID_CELLS = 65_536
const MAX_BUILD_VISITS = 1_000_000
const outside = (): never => { throw new Error('Humanoid left governed walkable surfaces') }

export const createWalkableSurfaceIndex = (bounds: readonly WalkableSurfaceBounds[]): ((x: number, z: number) => number) => {
  // Preserve the old snapshot lifetime: no live mesh lookups and no cross-scene cache.
  const surfaces: Surface[] = bounds.map(b => {
    const s = { minX: b.min.x, maxX: b.max.x, minZ: b.min.z, maxZ: b.max.z, top: b.max.y }
    if (!Object.values(s).every(Number.isFinite) || s.minX > s.maxX || s.minZ > s.maxZ) throw new Error('Invalid walkable surface bounds')
    return s
  })
  const xs = [...new Set(surfaces.flatMap(s => [s.minX, s.maxX]))].sort((a, b) => a - b)
  const zs = [...new Set(surfaces.flatMap(s => [s.minZ, s.maxZ]))].sort((a, b) => a - b)
  // Even slots represent the exact boundary; odd slots represent open intervals.
  // Sampling only cell centres would incorrectly erase inclusive curb boundaries.
  const width = xs.length * 2 - 1, depth = zs.length * 2 - 1
  const cellCount = width * depth
  if (!surfaces.length || cellCount > MAX_GRID_CELLS || cellCount * surfaces.length > MAX_BUILD_VISITS) {
    // Bounded memory/construction cost. Retain the original exact scan, not an
    // approximate grid or a fabricated ground level, for unusually large inputs.
    return (x, z) => {
      if (!Number.isFinite(x) || !Number.isFinite(z)) return outside()
      let top = -Infinity
      for (const s of surfaces) if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) top = Math.max(top, s.top)
      return Number.isFinite(top) ? top : outside()
    }
  }
  const heights = new Float64Array(cellCount).fill(-Infinity)
  const xSlots = new Map(xs.map((x, i) => [x, i * 2])), zSlots = new Map(zs.map((z, i) => [z, i * 2]))
  for (const s of surfaces) {
    const x0 = xSlots.get(s.minX)!, x1 = xSlots.get(s.maxX)!
    const z0 = zSlots.get(s.minZ)!, z1 = zSlots.get(s.maxZ)!
    for (let iz = z0; iz <= z1; iz++) for (let ix = x0; ix <= x1; ix++) {
      const cell = iz * width + ix
      heights[cell] = Math.max(heights[cell]!, s.top)
    }
  }
  const locate = (cuts: readonly number[], value: number): number => {
    if (value < cuts[0]! || value > cuts[cuts.length - 1]!) return -1
    let lo = 0, hi = cuts.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (cuts[mid]! < value) lo = mid + 1
      else hi = mid
    }
    return cuts[lo] === value ? lo * 2 : lo * 2 - 1
  }
  // Shoe scans are spatially coherent. Cache one exact open cell or boundary,
  // never an approximate neighbourhood spanning two heights.
  let minX = NaN, maxX = NaN, minZ = NaN, maxZ = NaN, cachedTop = -Infinity
  const inSlot = (value: number, min: number, max: number): boolean => min === max ? value === min : value > min && value < max
  return (x, z) => {
    if (!Number.isFinite(x) || !Number.isFinite(z)) return outside()
    if (inSlot(x, minX, maxX) && inSlot(z, minZ, maxZ)) return Number.isFinite(cachedTop) ? cachedTop : outside()
    const ix = locate(xs, x), iz = locate(zs, z)
    if (ix < 0 || iz < 0) return outside()
    minX = xs[Math.floor(ix / 2)]!; maxX = xs[Math.ceil(ix / 2)]!
    minZ = zs[Math.floor(iz / 2)]!; maxZ = zs[Math.ceil(iz / 2)]!
    cachedTop = heights[iz * width + ix]!
    return Number.isFinite(cachedTop) ? cachedTop : outside()
  }
}
