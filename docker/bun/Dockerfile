FROM oven/bun:alpine

WORKDIR /home/bun/fyc-svelte-kit

RUN apk add --update && apk add bash

COPY --from=node:20-alpine /usr/lib /usr/lib
COPY --from=node:20-alpine /usr/local/share /usr/local/share
COPY --from=node:20-alpine /usr/local/lib /usr/local/lib
COPY --from=node:20-alpine /usr/local/include /usr/local/include
COPY --from=node:20-alpine /usr/local/bin /usr/local/bin

USER bun

ENTRYPOINT [ "./bun.sh" ]
