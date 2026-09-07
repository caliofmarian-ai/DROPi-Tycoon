import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPostgresAuthorityRegistry } from './postgres-authority.mjs'
import {
  createSessionAuthorityRegistry,
  handleSessionAuthorityRequest,
} from './session-authority.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = normalize(join(__dirname, '..', 'dist'))
const port = Number.parseInt(process.env.PORT ?? '3000', 10) || 3000
const host = '0.0.0.0'
const authorityStore = String(process.env.DROPI_AUTHORITY_STORE ?? 'session').trim().toLowerCase()

const createAuthorityRegistry = async () => {
  if (authorityStore === 'session') return createSessionAuthorityRegistry()
  if (authorityStore === 'postgres') {
    return createPostgresAuthorityRegistry({ databaseUrl: process.env.DATABASE_URL })
  }
  throw new Error(`Unsupported DROPI_AUTHORITY_STORE value: ${authorityStore}`)
}

const authorityRegistry = await createAuthorityRegistry()

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
}

if (!existsSync(join(distDir, 'index.html'))) {
  console.error('dist/index.html not found. Run "npm run build" before "npm run start".')
  await authorityRegistry.close?.().catch(() => {})
  process.exit(1)
}

const sendFile = async (filePath, response) => {
  try {
    const fileStat = await stat(filePath)

    if (!fileStat.isFile()) {
      response.writeHead(404)
      response.end('Not found')
      return
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
}

const server = createServer(async (request, response) => {
  if (await handleSessionAuthorityRequest(request, response, authorityRegistry)) return

  const requestUrl = request.url ?? '/'
  const safePath = normalize(requestUrl.split('?')[0]).replace(/^(\.\.[/\\])+/, '')
  const candidatePath = normalize(join(distDir, safePath))

  if (!candidatePath.startsWith(distDir)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  if (safePath !== '/' && extname(safePath)) {
    await sendFile(candidatePath, response)
    return
  }

  const directHtmlPath = safePath === '/' ? join(distDir, 'index.html') : `${candidatePath}.html`

  if (safePath !== '/' && existsSync(directHtmlPath)) {
    await sendFile(directHtmlPath, response)
    return
  }

  await sendFile(join(distDir, 'index.html'), response)
})

let shuttingDown = false
const shutdown = async signal => {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`Received ${signal}; shutting down DROPi Tycoon runtime.`)
  await new Promise(resolve => server.close(resolve))
  await authorityRegistry.close?.().catch(error => console.error('Authority repository close failed.', error))
}

process.once('SIGTERM', () => {
  void shutdown('SIGTERM')
})
process.once('SIGINT', () => {
  void shutdown('SIGINT')
})

server.listen(port, host, () => {
  console.log(`DROPi Tycoon web runtime listening on http://${host}:${port}`)
  if (authorityRegistry.persistent) {
    console.log('PostgreSQL authority prototype enabled at /api/authority/* (durable public-profile scope; production authentication not configured).')
  } else {
    console.log('Session authority prototype enabled at /api/authority/* (non-durable, unauthenticated public-profile scope only).')
  }
})
