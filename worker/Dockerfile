FROM cgr.dev/chainguard/wolfi-base AS base
RUN apk add --no-cache nodejs-22 npm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g turbo@2.6.1 pnpm@9.5.0

# Pruner stage - extract worker workspace
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=worker --docker

# Builder stage - install deps and build
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN turbo run build --filter=worker...

# Runner stage - production image
FROM cgr.dev/chainguard/wolfi-base AS runner
RUN apk add --no-cache nodejs-22 npm
WORKDIR /app

ARG NEXT_PUBLIC_BUILD_ID
ENV BUILD_ID=$NEXT_PUBLIC_BUILD_ID

ENV NODE_ENV=production
ENV DOCKER_BUILD=0
ENV PORT=3030

ARG UID=1001
ARG GID=1001
RUN addgroup --system --gid ${GID} expressjs
RUN adduser --system --uid ${UID} expressjs
USER expressjs
COPY --from=builder --chown=expressjs:expressjs /app .
COPY --chown=expressjs:expressjs ./worker/entrypoint.sh ./worker/entrypoint.sh
RUN chmod +x ./worker/entrypoint.sh

EXPOSE 3030

ENTRYPOINT ["./worker/entrypoint.sh"]
CMD ["node", "worker/dist/index.js"]
