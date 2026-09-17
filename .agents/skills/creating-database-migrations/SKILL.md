---
name: creating-database-migrations
description: Creates and applies a Drizzle Kit database migration in this NestJS skeleton. Use when adding, changing, or dropping a table or column, or when asked to update the database schema.
---

# Creating a database migration

This project uses [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
against MySQL, configured in `drizzle.config.ts` (`schema: './src/db/schemas'`,
`out: './src/db/migrations'`). See `AGENTS.md`'s "Known inconsistencies" #1
before assuming which Drizzle wiring to use in application code (repositories
use `OrmService` from `@config/orm/orm.interface`, not the older
`src/db/drizzle` client).

## Steps

1. Add or edit a schema file under `src/db/schemas/` using
   `drizzle-orm/mysql-core` builders. Reuse the shared `timestamps` helper
   from `@app/common` (`updatedAt`/`createdAt`/`deletedAt`) instead of
   redefining timestamp columns. Export the table from
   `src/db/schemas/index.ts`.

2. Generate a migration:

   ```sh
   make migrate-generate <name>
   ```

   This runs `yarn drizzle:generate --name=<name>` inside the `api` Docker
   container. Outside Docker, run `yarn drizzle:generate --name=<name>`
   directly. Review the generated `.sql` file under `src/db/migrations/`
   before relying on it; do not hand-edit an already-applied migration.

3. Apply it:

   ```sh
   make migrate-up
   ```

   (or `yarn drizzle:migrate` outside Docker.)

4. Note that migrations also run automatically at every application boot
   (`main.ts` calls `MigrationService.runMigrations()` before the server
   starts listening), so starting the app with `yarn start:dev` or
   `docker compose up` also applies any pending migration. The explicit
   commands above are for generating new migrations and for applying them
   without a full app boot.

5. Update anything that depends on the changed schema: repository queries
   in `src/api/**/xxx.repository.ts`, DTOs under
   `src/common/types/dto/<feature>/`, and seed data in `src/api/seed/`.

6. If the table backs a new resource, see the scaffolding-crud-resources
   skill for the rest of the wiring.

7. Run the verifying-changes-before-commit skill before treating the
   change as done.
