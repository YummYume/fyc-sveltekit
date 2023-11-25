FROM oven/bun:alpine AS builder

WORKDIR /home/bun/fyc-svelte-kit

COPY --from=node:20-alpine /usr/lib /usr/lib
COPY --from=node:20-alpine /usr/local/share /usr/local/share
COPY --from=node:20-alpine /usr/local/lib /usr/local/lib
COPY --from=node:20-alpine /usr/local/include /usr/local/include
COPY --from=node:20-alpine /usr/local/bin /usr/local/bin

COPY src prisma ./
COPY vite.config.js ./
COPY package.json ./
COPY bun.lockb ./
COPY tsconfig.json ./
COPY svelte.config.js ./
COPY postcss.config.cjs ./
COPY .env ./
COPY .env.local ./

RUN bun install && \
    bun build

FROM oven/bun:alpine

WORKDIR /home/bun/fyc-svelte-kit

COPY --from=node:20-alpine /usr/lib /usr/lib
COPY --from=node:20-alpine /usr/local/share /usr/local/share
COPY --from=node:20-alpine /usr/local/lib /usr/local/lib
COPY --from=node:20-alpine /usr/local/include /usr/local/include
COPY --from=node:20-alpine /usr/local/bin /usr/local/bin

COPY --from=builder --chown=bun:bun /home/bun/fyc-svelte-kit/build ./
COPY --chown=bun:bun static ./

RUN bun install --production --frozen-lockfile

USER bun

CMD ["bun", "build/index.js"]
