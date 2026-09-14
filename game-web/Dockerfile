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
# Railway supplies configured variables and Git/deployment metadata as Docker
# build arguments. Vite reads only the explicitly public values below at build
# time. The commit SHA and deployment UUID are non-secret correlation metadata.
# Never declare SENTRY_AUTH_TOKEN here or expose it through a VITE_ variable.
ARG VITE_SENTRY_DSN
ARG RAILWAY_GIT_COMMIT_SHA
ARG RAILWAY_DEPLOYMENT_ID
ENV VITE_SENTRY_RELEASE=$RAILWAY_GIT_COMMIT_SHA
ENV VITE_SENTRY_DIST=$RAILWAY_DEPLOYMENT_ID
RUN npm run build

# ---- Production stage ----
# The Node server can have runtime package imports (for example `postgres`).
# Install only production dependencies so the image cannot pass build while
# crashing at startup because a server dependency exists only in the builder.
FROM node:22.12.0-alpine3.21 AS production

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server/server.mjs"]
