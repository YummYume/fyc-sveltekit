COMPOSE=docker compose
COMPOSEPROD=docker compose -f compose.prod.yml --env-file .env.local
EXECSVELTEKIT=$(COMPOSE) exec svelte-kit

# Starting and stopping the project
start: build up-recreate db

start-nocache: build-no-chache up-recreate db

up-recreate:
	$(COMPOSE) up -d --remove-orphans --force-recreate

up:
	$(COMPOSE) up -d --remove-orphans

build:
	$(COMPOSE) build --force-rm

build-no-chache:
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
db: db-migrate

db-push:
	$(EXECSVELTEKIT) bunx prisma db push

db-reset:
	$(EXECSVELTEKIT) bunx prisma migrate reset

db-deploy:
	$(EXECSVELTEKIT) bunx prisma migrate deploy

db-migrate:
	$(EXECSVELTEKIT) bunx prisma migrate dev

db-create-migration:
	$(EXECSVELTEKIT) bunx prisma migrate dev --name $(name) --create-only

# Logs
logs:
	$(COMPOSE) logs

# Prod
fetch:
	git fetch --all && git checkout master && git reset --hard origin/master

deploy:
	$(COMPOSEPROD) stop
	$(COMPOSEPROD) build --force-rm
	$(COMPOSEPROD) up -d --remove-orphans --force-recreate
	$(COMPOSEPROD) exec svelte-kit bunx prisma migrate deploy

logs-prod:
	$(COMPOSEPROD) logs
