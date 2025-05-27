include .env

APP=docker-compose run api

# generate the sql files inside the drizzle 
migrate-generate:
	${APP} yarn drizzle:generate


# migrate the sql files into database
migrate-up:
	${APP} yarn drizzle:migrate

