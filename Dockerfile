# =========================================================================
# TWM 3.1 — Multi-Stage Production Dockerfile
# Standalone Next.js App Router + Native SQLite WAL + Boundary Scheduler
# =========================================================================

# -------------------------------------------------------------------------
# Stage 1: Dependency Installation
# -------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# -------------------------------------------------------------------------
# Stage 2: Application Build
# -------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment for Next.js build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# -------------------------------------------------------------------------
# Stage 3: Production Runner
# -------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add node user for secure non-root execution
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create persistent data and backups volume directory with proper permissions
RUN mkdir -p /app/data/backups && \
    chown -R nextjs:nodejs /app/data

# Copy build artifacts and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src/lib ./src/lib
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# Mountable volume for zero-loss SQLite WAL database & backups
VOLUME ["/app/data"]

CMD ["node", "server.js"]
