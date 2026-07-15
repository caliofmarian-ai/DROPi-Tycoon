import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = normalize(join(__dirname, '..', 'dist'))
const port = Number.parseInt(process.env.PORT ?? '3000', 10) || 3000
const host = '0.0.0.0'

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

server.listen(port, host, () => {
  console.log(`DROPi Tycoon web runtime listening on http://${host}:${port}`)
})
