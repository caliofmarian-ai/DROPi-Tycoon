import { readFileSync, readdirSync } from 'node:fs'
import { defineConfig } from 'vitest/config'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

export default defineConfig({
  define: {
    __DROPITYCOON_VERSION__: JSON.stringify(packageJson.version),
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
