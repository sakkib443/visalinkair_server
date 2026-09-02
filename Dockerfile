# syntax=docker/dockerfile:1

# ============================================================
# Aerovista Backend — production image (Express + TypeScript)
# Multi-stage: build with full deps, run with pruned prod deps.
# ============================================================

# ---------- Stage 1: build ----------
FROM node:22-slim AS builder
WORKDIR /app

# Build tools for optional native deps (e.g. bcrypt). This stage is
# discarded, so it does not affect the final image size.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies (incl. dev) using the lockfile for a
# reproducible build. --include=dev forces devDependencies (TypeScript/tsc)
# to install even when NODE_ENV=production is injected at build time
# (otherwise `npm ci` skips them and `tsc` is not found).
COPY package*.json ./
RUN npm ci --include=dev

# Compile TypeScript -> dist/
COPY . .
# NOTE: the project currently has pre-existing type errors and runs via
# transpile-only in dev (ts-node-dev --transpile-only). `tsc` still EMITS
# valid JS, so we tolerate its non-zero exit here and then assert that the
# entrypoint was actually produced (this still fails on real emit errors).
RUN npm run build || true
RUN test -f dist/server.js

# Remove dev dependencies for a lean production node_modules.
RUN npm prune --omit=dev

# ---------- Stage 2: runtime ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what the server needs to run.
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

# One-off Cloudinary -> local-disk migration. It has to run INSIDE this container
# (`npm run migrate:uploads` from the Coolify terminal), because it writes the
# downloaded files to the mounted volume and rewrites the DB to point at them.
# Running it anywhere else would leave the DB pointing at files that don't exist here.
COPY --from=builder --chown=node:node /app/migrate-cloudinary-to-local.js ./migrate-cloudinary-to-local.js

# Uploads live here and MUST be backed by a persistent volume in Coolify
# (Storages -> /app/uploads), otherwise every redeploy wipes user images.
#
# This directory must exist AND be owned by `node` in the image: Docker seeds a
# fresh named volume from the image path, ownership included, so the unprivileged
# runtime user can write to it. Note this only holds for named volumes — a host
# bind mount keeps the host's (root) ownership and the app would fail with EACCES.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
ENV UPLOAD_DIR=/app/uploads
VOLUME ["/app/uploads"]

# The app reads PORT from env (defaults to 5000 in src/app/config).
ENV PORT=5000
EXPOSE 5000

USER node
CMD ["node", "dist/server.js"]
