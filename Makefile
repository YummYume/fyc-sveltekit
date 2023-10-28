COMPOSE=docker compose
EXECSVELTEKIT=$(COMPOSE) exec svelte-kit

# Starting and stopping the project
start:
	$(COMPOSE) build --force-rm
	$(COMPOSE) up -d --remove-orphans --force-recreate
	make db

start-nocache:
	$(COMPOSE) build --force-rm --no-cache
	$(COMPOSE) up -d --remove-orphans --force-recreate
	make db

up:
	$(COMPOSE) up -d --remove-orphans

build:
	$(COMPOSE) build --force-rm --no-cache

restart:
	$(COMPOSE) restart

stop:
	$(COMPOSE) stop

down:
	$(COMPOSE) down

# SSH
ssh:
	$(EXECSVELTEKIT) bash

# Build
build-app:
	$(EXECSVELTEKIT) bun run build

preview-app:
	$(EXECSVELTEKIT) bun run preview

# Linting
lint:
	$(EXECSVELTEKIT) bun run lint

format:
	$(EXECSVELTEKIT) bun run format

# DB
db: schema

schema:
	$(EXECSVELTEKIT) bun run db/schema.ts

schema-drop:
	$(EXECSVELTEKIT) bun run db/schema.ts --clear-db
