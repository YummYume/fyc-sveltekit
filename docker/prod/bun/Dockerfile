FROM oven/bun:alpine AS builder

WORKDIR /home/bun/fyc-svelte-kit

COPY --from=node:20-alpine /usr/lib /usr/lib
COPY --from=node:20-alpine /usr/local/share /usr/local/share
COPY --from=node:20-alpine /usr/local/lib /usr/local/lib
COPY --from=node:20-alpine /usr/local/include /usr/local/include
COPY --from=node:20-alpine /usr/local/bin /usr/local/bin

COPY src ./src
COPY prisma ./prisma
COPY vite.config.ts package.json bun.lockb tsconfig.json svelte.config.js postcss.config.cjs tailwind.config.cjs .env .env.local ./

RUN bun install && \
    bun run prisma generate && \
    bun run check && \
    bun run build

FROM oven/bun:alpine

WORKDIR /home/bun/fyc-svelte-kit

COPY --from=node:20-alpine /usr/lib /usr/lib
COPY --from=node:20-alpine /usr/local/share /usr/local/share
COPY --from=node:20-alpine /usr/local/lib /usr/local/lib
COPY --from=node:20-alpine /usr/local/include /usr/local/include
COPY --from=node:20-alpine /usr/local/bin /usr/local/bin

COPY --from=builder --chown=bun:bun /home/bun/fyc-svelte-kit/build ./build
COPY --chown=bun:bun static ./static
COPY --chown=bun:bun prisma ./prisma
COPY --chown=bun:bun package.json bun.lockb .env .env.local ./

RUN bun install --production --frozen-lockfile && \
    bun run prisma generate

USER bun

ENV ORIGIN=https://ai.yam-yam.dev

CMD ["node", "build/index.js"]
