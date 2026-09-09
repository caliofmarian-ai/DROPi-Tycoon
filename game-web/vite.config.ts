import { readFileSync, readdirSync } from 'node:fs'
import { defineConfig } from 'vitest/config'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

type BrailaContextSource = {
  buildings: Array<{
    x: number
    y: number
    width: number
    height: number
    points: Array<{ x: number; y: number }>
  }>
}

const brailaContext = JSON.parse(
  readFileSync(new URL('./src/world/brailaContext.generated.json', import.meta.url), 'utf8'),
) as BrailaContextSource

// The canonical generated context remains untouched. The browser only needs geometry, so encode
// that geometry as tuples before Vite injects it. This removes repeated JSON property names from
// shipped JavaScript while worldLayout reconstructs the exact object shape consumed by gameplay.
const compactBrailaContextBuildings = brailaContext.buildings.map(building => [
  building.x,
  building.y,
  building.width,
  building.height,
  building.points.flatMap(point => [point.x, point.y]),
])

export default defineConfig({
  define: {
    __DROPITYCOON_VERSION__: JSON.stringify(packageJson.version),
    __BRAILA_CONTEXT_BUILDINGS__: JSON.stringify(compactBrailaContextBuildings),
    // Country rollout writes data files; the map discovers their metadata at build time.
    // Only the selected country is fetched in the browser.
    __REGIONAL_CATALOGS__: JSON.stringify(readdirSync(new URL('./public/data/', import.meta.url))
      .filter(name => name.endsWith('-regional-localities-v1.json'))
      .map(name => ({ countryId: JSON.parse(readFileSync(new URL(`./public/data/${name}`, import.meta.url), 'utf8')).country.geometryId,
        url: `data/${name}` }))),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
