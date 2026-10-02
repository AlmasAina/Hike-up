# syntax=docker/dockerfile:1.7
# ───────────────────────────────────────────── HIKE UP Web (Next.js) ──
# Build from the repository root:
#   docker build -f docker/web/Dockerfile \
#     --build-arg API_INTERNAL_URL=http://api:4000 \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://www.example.com -t hikeup-web .

# Override with --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:22.12-bookworm-slim to avoid Docker Hub rate limits
ARG NODE_IMAGE=node:22.12-bookworm-slim

FROM ${NODE_IMAGE} AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace @hikeup/web --workspace @hikeup/types --workspace @hikeup/ui --workspace @hikeup/config --include-workspace-root

FROM deps AS build
# Rewrites (browser → API proxy) and next/image hosts are fixed at build time.
ARG API_INTERNAL_URL=http://api:4000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG STORAGE_PUBLIC_BASE_URL=
ARG IMAGE_REMOTE_HOSTS=
ENV API_INTERNAL_URL=$API_INTERNAL_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    STORAGE_PUBLIC_BASE_URL=$STORAGE_PUBLIC_BASE_URL \
    IMAGE_REMOTE_HOSTS=$IMAGE_REMOTE_HOSTS \
    NEXT_TELEMETRY_DISABLED=1
COPY packages packages
COPY apps/web apps/web
RUN npm run build -w @hikeup/types -w @hikeup/ui && npm run build -w @hikeup/web

FROM base AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
