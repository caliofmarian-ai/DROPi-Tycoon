# ---- Build stage ----
# Node 22.12.0 is the minimum required by @rolldown/binding-linux-x64-gnu (^20.19.0 || >=22.12.0).
# Pinning the exact minor-version image prevents Nixpacks-style "Node 22 → 22.11.0" regressions.
FROM node:22.12.0-alpine3.21 AS builder

WORKDIR /app

# Install dependencies from the committed lockfile (reproducible build).
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build the application.
COPY . .
RUN npm run build

# ---- Production stage ----
# server/server.mjs uses only Node built-ins, so no node_modules are needed at runtime.
FROM node:22.12.0-alpine3.21 AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server/server.mjs"]
