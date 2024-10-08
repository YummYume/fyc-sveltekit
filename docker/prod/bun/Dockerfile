FROM oven/bun:alpine AS builder

WORKDIR /home/bun/fyc-svelte-kit

ARG ORIGIN=https://cook.yam-yam.dev
ARG PORT=3000
ARG PROTOCOL_HEADER=x-forwarded-proto
ARG HOST_HEADER=x-forwarded-host
ARG ADDRESS_HEADER=True-Client-IP
ARG PUBLIC_ENV=production
ARG OPENAI_API_KEY
ARG DATABASE_URL

ENV ORIGIN=${ORIGIN}
ENV PORT=${PORT}
ENV PROTOCOL_HEADER=${PROTOCOL_HEADER}
ENV HOST_HEADER=${HOST_HEADER}
ENV ADDRESS_HEADER=${ADDRESS_HEADER}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV PUBLIC_ENV=${PUBLIC_ENV}

COPY --from=node:20-alpine /usr/lib /usr/lib
COPY --from=node:20-alpine /usr/local/share /usr/local/share
COPY --from=node:20-alpine /usr/local/lib /usr/local/lib
COPY --from=node:20-alpine /usr/local/include /usr/local/include
COPY --from=node:20-alpine /usr/local/bin /usr/local/bin

COPY src ./src
COPY prisma ./prisma
COPY vite.config.ts package.json bun.lockb tsconfig.json svelte.config.js postcss.config.cjs tailwind.config.cjs ./

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
COPY --chown=bun:bun package.json bun.lockb ./

RUN bun install --production --frozen-lockfile && \
    bun run prisma generate

USER bun

CMD ["node", "build"]
