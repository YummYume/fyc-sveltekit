FROM oven/bun:latest

WORKDIR /home/bun/fyc-svelte-kit

COPY --from=node:20 /usr/local/bin/node /usr/local/bin/node

USER bun

ENTRYPOINT [ "./bun.sh" ]
