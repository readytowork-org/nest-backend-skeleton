include .env
export

APP=docker compose run api

migrate-create:
#  command: make migrate <migration_name>
	@name=$(word 2, $(MAKECMDGOALS)); \
	if [ -z "$$name" ]; then \
		echo "❌ Usage: make migrate <migration_name>"; \
		exit 1; \
	fi; \
	echo "🚀 Generating migration: $$name"; \
	${APP} yarn drizzle:generate --name=$$name


# migrate the sql files into database
migrate-generate:
	@name=$(word 2, $(MAKECMDGOALS)); \
	if [ -z "$$name" ]; then \
		echo "❌ Usage: make migrate-generate <migration_name>"; \
		exit 1; \
	fi; \
	echo "🚀 Generating migration: $$name"; \
	${APP} yarn drizzle:generate --name=$$name

# migrate the sql files into database
migrate-up:
	${APP} yarn drizzle:migrate

schema:
	bash scripts/schema.sh

install:
	docker-compose exec api yarn install

start:
	docker-compose up -d database adminer
	@echo "Waiting for database to be ready..."
	@while ! nc -z ${DB_HOST} ${DB_PORT}; do \
		sleep 1; \
		printf "."; \
	done
	@echo "\nDatabase is ready!🚀"
	yarn start:dev