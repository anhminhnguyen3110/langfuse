# Base image with Wolfi and Node.js 22
FROM cgr.dev/chainguard/wolfi-base AS base
RUN apk add --no-cache nodejs-22 npm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g turbo@2.6.1 pnpm@9.5.0

# Pruner stage - extract web workspace
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=web --docker

# Builder stage - install deps and build
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

RUN pnpm install --frozen-lockfile

ENV DOCKER_BUILD=1

ARG NEXT_PUBLIC_BUILD_ID
ENV NEXT_PUBLIC_BUILD_ID=$NEXT_PUBLIC_BUILD_ID

COPY --from=pruner /app/out/full/ .

RUN rm -f ./web/src/middleware.ts

ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_MANUAL_SIG_HANDLE true
# set the CI flag to true to get CI specific logs
ENV CI true

# Build with reduced memory usage - skip linting/typecheck via DOCKER_BUILD=1 in next.config.mjs
RUN NODE_OPTIONS='--max-old-space-size-percentage=75' turbo run build --filter=web...

# Runner stage - production image
FROM cgr.dev/chainguard/wolfi-base AS runner
RUN apk add --no-cache nodejs-22 npm
WORKDIR /app

ARG NEXT_PUBLIC_BUILD_ID
ENV BUILD_ID=$NEXT_PUBLIC_BUILD_ID

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=0
ENV NEXT_MANUAL_SIG_HANDLE=true
ENV PORT=3000

ARG UID=1001
ARG GID=1001
RUN addgroup --system --gid ${GID} nodejs
RUN adduser --system --uid ${UID} nextjs

RUN npm install -g --no-package-lock --no-save prisma@6.17.1

# Copy pre-downloaded golang-migrate binary (offline build)
COPY ./web/binaries/migrate /usr/bin/migrate
RUN chmod +x /usr/bin/migrate

COPY --from=builder --chown=nextjs:nodejs /app/web/next.config.mjs .
COPY --from=builder --chown=nextjs:nodejs /app/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/static ./web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/public ./web/public

COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/prisma ./packages/shared/prisma
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/clickhouse ./packages/shared/clickhouse

COPY --chown=nextjs:nodejs ./web/entrypoint.sh ./web/entrypoint.sh
COPY --chown=nextjs:nodejs ./packages/shared/scripts/cleanup.sql ./packages/shared/scripts/cleanup.sql
RUN chmod +x ./web/entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./web/entrypoint.sh"]
CMD ["node", "./web/server.js", "--keepAliveTimeout", "110000"]
