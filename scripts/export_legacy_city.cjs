// Development-only inventory input for the map-inspired city builder.
const fs = require('node:fs')
const path = require('node:path')
const ts = require('../game-web/node_modules/typescript')
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename)
}
const layout = require('../game-web/src/world/legacyCityLayout.ts')
fs.writeFileSync(path.resolve(process.argv[2]), JSON.stringify({
  buildings: layout.WORLD_BUILDINGS, routes: layout.WORLD_ROUTE_POINTS,
  zones: layout.WORLD_ZONES,
}, null, 2) + '\n')
