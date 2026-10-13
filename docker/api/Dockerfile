# syntax=docker/dockerfile:1.7
# ───────────────────────────────────────────── HIKE UP API (NestJS) ──
# Build from the repository root:  docker build -f docker/api/Dockerfile -t hikeup-api .

# Override with --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:22.12-bookworm-slim to avoid Docker Hub rate limits
ARG NODE_IMAGE=node:22.12-bookworm-slim

FROM ${NODE_IMAGE} AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies for the workspaces the API needs (better layer caching).
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
COPY database/package.json database/
COPY apps/api/package.json apps/api/
RUN npm ci --workspace @hikeup/api --workspace @hikeup/database --workspace @hikeup/types --workspace @hikeup/ui --workspace @hikeup/config --include-workspace-root

FROM deps AS build
COPY packages packages
COPY database database
COPY apps/api apps/api
RUN npm run build -w @hikeup/types -w @hikeup/ui \
 && npm run generate -w @hikeup/database \
 && npm run build -w @hikeup/api \
 && npm prune --omit=dev --workspace @hikeup/api --workspace @hikeup/database --workspace @hikeup/types --workspace @hikeup/ui --include-workspace-root

FROM base AS runtime
ENV NODE_ENV=production \
    PORT=4000 \
    UPLOAD_DIR=/app/uploads
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/packages/types/package.json /app/packages/types/package.json
COPY --from=build --chown=node:node /app/packages/types/dist /app/packages/types/dist
COPY --from=build --chown=node:node /app/packages/ui/package.json /app/packages/ui/package.json
COPY --from=build --chown=node:node /app/packages/ui/dist /app/packages/ui/dist
COPY --from=build --chown=node:node /app/database ./database
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json
# Packages npm could not hoist (e.g. sanitize-html, pinned to a different version) live here.
COPY --from=build --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node docker/api/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && mkdir -p /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "apps/api/dist/main.js"]
