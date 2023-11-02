#!/usr/bin/env bash

# Exit gracefully
trap "exit" SIGINT
trap "exit" SIGTERM

echo "Installing dependencies"

bun install

echo "Syncing schema database"

bunx prisma db push --accept-data-loss

echo "Starting dev server"

bun run dev --host

