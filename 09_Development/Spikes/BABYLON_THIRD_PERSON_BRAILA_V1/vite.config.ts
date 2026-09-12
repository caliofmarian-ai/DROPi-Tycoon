import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  resolve: {
    alias: [
      {
        find: /^@babylonjs\/core$/,
        replacement: fileURLToPath(new URL('./src/babylonFacade.ts', import.meta.url)),
      },
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  },
})
