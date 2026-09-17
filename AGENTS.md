# Agent Guide

This file follows [AGENTS.md](https://agents.md), an open, tool-agnostic
format for giving AI coding agents project context. It is read by agents
including OpenAI Codex, Cursor, Windsurf, Aider, GitHub Copilot, Google
Gemini CLI / Jules, Devin, Zed, and others. This repo does not ship a
`CLAUDE.md`, so a Claude Code session does not auto-load this file at
startup; read it yourself at the start of a session, or ask the user to
point you at it.

It captures the conventions that are not obvious from a single file, plus a
few real inconsistencies already in this codebase that are easy to copy by
accident. Read this before making changes. If something here turns out to
be wrong or stale, fix it as part of your change.

## What this project is

A NestJS 11 REST API skeleton: Drizzle ORM against MySQL, Passport
(JWT + Google OAuth), class-validator DTOs, Swagger via `@nestjs/swagger`,
Winston logging, Google Cloud Storage for file uploads, and Gmail API +
Handlebars for email. Package manager: Yarn. TypeScript, CommonJS output.

## Documentation map

`README.md` and `docs/DEVELOPMENT_GUIDE.md` are largely copy-pasted NestJS
boilerplate and are **out of date**: they describe a `src/modules/`
structure (`auth/`, `users/`, `todos/`) that does not exist, mention
PostgreSQL even though the app uses MySQL, and reference a `yarn seed`
script and a `yarn type-check` script that are not defined in
`package.json`. Treat this file (`AGENTS.md`) as authoritative for actual
structure and commands; fix the other docs opportunistically rather than
trusting them.

| File                          | Covers                                                              |
|--------------------------------|----------------------------------------------------------------------|
| `README.md`                   | Human-facing intro (partially stale, see above).                    |
| `docs/DEVELOPMENT_GUIDE.md`   | Largely duplicates `README.md` (partially stale, see above).         |
| `AGENTS.md` (this file)       | Agent-facing guide: real architecture, conventions, commands.        |
| `MEMORY.md`                   | Running log of progress, decisions, and next steps. Update it as you work; read it first to pick up where a previous session left off. |
| `.agents/skills/*/SKILL.md`   | Canonical skill definitions. Four repo-specific workflow skills wrapping sections below: `scaffolding-crud-resources`, `creating-database-migrations`, `adding-environment-variables`, `verifying-changes-before-commit`. Plus `nestjs-best-practices`: a vendored, third-party general NestJS reference (see its `VENDORED.md`), not specific to this repo. `.claude/skills` and `.codex/skills` are symlinks to this directory; edit skills only under `.agents/skills/`. |

If you add a new documentation file, list it here too.

## Repository layout

| Path                        | Purpose                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| `src/api/`                  | Feature HTTP modules: `admin/` (with `staffs/` sub-resource), `auth/`, `healthz/`, `seed/`. |
| `src/services/`             | Cross-cutting injectable services: `auth/` (guards, decorators, Passport strategies), `email/`, `pagination/`, `storage/` (Google Cloud Storage). |
| `src/common/`               | `api_response/` (response envelope helpers), `constants/`, `database/` (column helpers), `exception/` (typed exceptions), `filters/` (global exception filter), `middleware/`, `types/` (`dto/`, `enum/`, `type/`). |
| `src/config/`               | `env/` (validated env vars), `config-loader/` (standalone loader for the `drizzle-kit` CLI), `interceptors/` (DB transaction interceptor), `logger/` (Winston), `orm/` (the `OrmService` abstraction and the Drizzle wiring actually used by feature modules; see "Known inconsistencies"). |
| `src/db/`                   | `schemas/` (Drizzle table schemas), `migrations/` (generated SQL + Atlas-style meta), `drizzle/` (an older, separate Drizzle wiring used only to run migrations at boot; see "Known inconsistencies"). |
| `src/utils/`                | Small helpers: bcrypt, file, OTP, JWT/token, timestamps.               |
| `src/assets/templates/`     | Handlebars email templates.                                             |
| `docker/`, `docker-compose.yml` | Local MySQL + API + Adminer setup.                                  |
| `scripts/schema.sh`         | Scaffolds a new Drizzle schema file (see "Adding a new resource").      |
| `scripts/cleanup.sh`        | Leftover from an earlier reorg; deletes files under `src/auth`, `src/todos`, `src/prisma`, none of which exist anymore. Do not run it. |
| `test/`                     | Jest e2e config and the default `app.e2e-spec.ts` (see "Known inconsistencies": it currently fails). |

## Path aliases

Defined in `tsconfig.json` `compilerOptions.paths`:

- `@app/*` → `src/*` (the one actually used everywhere).
- `@common/*` → `src/common/*` and `@config/*` → `src/config/*` (also used).
- `@modules/*` → `src/modules/*` and `@core/*` → `src/core/*` are declared
  but **stale**: neither directory exists. Do not use them; if you see an
  import using them, it is a bug.

## The feature module pattern

Follow `src/api/admin/staffs/` as the reference implementation:

- `xxx.module.ts`: imports `DrizzleModule` from `@app/config` (not from
  `@app/db`, see "Known inconsistencies") plus any service modules it
  needs (for example `PaginationModule`); provides the repository and
  service; declares the controller; exports the service for other modules
  to inject.
- `xxx.controller.ts`: gin-style thin controller. Guard admin/staff routes
  with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(USER_ROLE...)`.
  Mark unauthenticated routes with `@Public()`. Document with
  `@ApiTags`, `@ApiBearerAuth('BearerAuth')`, `@ApiOperation`, `@ApiResponse`.
- `xxx.service.ts`: business logic; throws the typed exceptions from
  `src/common/exception/http-exception.ts` (see "Errors" below), never
  raw `gin.H`-style ad hoc objects.
- `xxx.repository.ts`: constructor-injects `OrmService` from
  `@config/orm/orm.interface` (not `DrizzleService` or the raw
  `DRIZZLE_CLIENT` token) and runs Drizzle queries via `this.orm.db`.
  Inject `PaginationService` (`@app/services/pagination/pagination.service`)
  for list endpoints.

DTOs are **not** colocated with the module. They live centrally under
`src/common/types/dto/<feature>/`, split by purpose (request, response,
query, and a "safe" DTO with sensitive fields like `password` excluded),
plus a barrel `index.ts`. Enums live under `src/common/types/enum/`, plain
types under `src/common/types/type/`. Follow `src/common/types/dto/staff/`
as the pattern for a new feature.

A new module is registered by importing it into its parent module (for
example `StaffModule` into `AdminModule`, or a new admin module into
`AdminModule`'s `imports`).

## Errors and responses

- **Success**: build responses with `SuccessResponseMessage`,
  `SuccessResponseWithData<T>`, or `SuccessResponseWithCount<T>` from
  `src/common/api_response/success_response.ts`.
- **Errors**: throw one of the typed exceptions in
  `src/common/exception/http-exception.ts` (`BadRequestException`,
  `EmailAlreadyExistsException`, `ExpiredTokenException`, etc.), or add a
  new one there if the situation is not covered. Every one of them carries
  an `ApiErrorCode` (`src/common/constants/api-error-code.constant.ts`) and
  an `HttpErrorType` (`src/common/constants/api_status.enum.ts`). Do not
  throw raw NestJS `HttpException` subclasses or build ad hoc error JSON in
  a controller or service.
- The single `GlobalExceptionFilter` (`src/common/filters/global-exception.filter.ts`,
  registered once in `main.ts`) formats every thrown error, including raw
  MySQL driver errors it pattern-matches by message, into one consistent
  JSON envelope. You should not need to touch it when adding a feature.
- Validation: DTOs use `class-validator` decorators. The global
  `ValidationPipe` in `main.ts` has `whitelist: true` and
  `forbidNonWhitelisted: true`, so any request body property not declared
  on the DTO is rejected automatically; you do not need to check for
  unknown fields yourself.

## Auth

- Passport strategies live in `src/services/auth/strategies/`: `jwt.strategy.ts`
  (active, used by `JwtAuthGuard`) and `google.strategy.ts` (active, but see
  below). `full_metal_token.strategy.ts` is a standalone AES-256-GCM token
  decoder, not registered as a Passport strategy anywhere; treat it as
  unused/experimental unless you wire it up yourself.
- `@Public()` skips the JWT guard for a route; `@Roles(...)` restricts a
  route to specific `USER_ROLE`s via `RolesGuard`; `@CurrentUser()` reads
  the authenticated user off the request.
- Only the staff/admin login and refresh-token flow
  (`AuthService.staffLogin` / `refreshToken`) is fully implemented. The
  Google OAuth callback (`AuthService.validateOrCreateOAuthStaff`) is a
  stub that returns hardcoded demo tokens; do not assume Google login is
  production-ready.

## Known inconsistencies

Read this before touching the database layer, admin routing, or tests; all
four are real, verified quirks in the current code, not hypotheticals.

1. **Two parallel Drizzle wirings.** `src/db/drizzle/` is the original
   setup: it is imported by `app.module.ts` and by `main.ts` (for
   `MigrationService`, which runs migrations at every boot). It does not
   implement `OrmService` and has no query logging.
   `src/config/orm/drizzle/` is the one actually used by feature modules
   (`staff.repository.ts`, `auth.module.ts`, `TransactionInterceptor`): it
   provides `OrmService` (with query logging and the schema bound) and is
   re-exported from `@app/config`. **New repositories should depend on
   `OrmService` from `@config/orm/orm.interface` and new modules should
   import `DrizzleModule` from `@app/config`**, matching `staff.module.ts`.
   Do not import from `src/db/drizzle` in new feature code; it exists only
   to run migrations at bootstrap.
2. **`admin.routes.ts` is not wired up.** `src/api/admin/admin.routes.ts`
   exports `adminChildRoutes`, apparently intended to prefix admin
   sub-resources (for example `staffs`) under a shared path via Nest's
   `RouterModule`. Nothing imports `RouterModule` anywhere in `src/`, so
   this array has no effect. `StaffController` is `@Controller('')`, so
   its routes currently resolve directly under the global version prefix
   (`/api/v1/...`) with no `/admin` or `/staffs` segment. If you add
   another admin sub-resource, either wire `RouterModule.forRoutes(adminChildRoutes)`
   into `AdminModule` and update `adminChildRoutes`, or give your
   controller an explicit path (for example `@Controller('admin/products')`);
   do not copy `@Controller('')` verbatim, or routes will collide with
   staff's.
3. **The default e2e test is broken.** `test/app.e2e-spec.ts` is untouched
   Nest CLI boilerplate: it expects `GET /` to return `200 Hello World!`,
   but `AppController` has no route handlers at all and the app has global
   URI versioning (`api/v1` prefix), so the request 404s. Do not treat it
   as a working example; write new `*.spec.ts`/`*.e2e-spec.ts` files
   against real feature modules instead, and fix or remove this one if you
   touch it.
4. **`scripts/cleanup.sh`** deletes files under `src/auth`, `src/todos`,
   and `src/prisma`, none of which exist in the current tree. It is a
   leftover from an earlier reorganization; do not run it.

## Adding a new resource

Claude Code users: the `scaffolding-crud-resources` skill runs this as a
guided checklist.

1. Add DTOs under `src/common/types/dto/<feature>/` (request, response,
   query, and a "safe" variant if the entity has sensitive fields),
   following `src/common/types/dto/staff/`.
2. Add a Drizzle schema in `src/db/schemas/`, using `scripts/schema.sh` as
   a starting point (it generates a minimal `mysqlTable` with the shared
   `timestamps` helper from `@app/common`), then export it from
   `src/db/schemas/index.ts`.
3. Generate and run the migration (see "Database migrations" below).
4. Create `xxx.module.ts`, `xxx.controller.ts`, `xxx.service.ts`,
   `xxx.repository.ts` following the feature module pattern above.
   Import `DrizzleModule` from `@app/config`, inject `OrmService` in the
   repository.
5. Register the new module in its parent module's `imports`.
6. Add Swagger decorators to every controller method.
7. Be deliberate about the route path (see "Known inconsistencies" #2)
   instead of copying `@Controller('')`.
8. Add tests; see "Testing" below.

## Database migrations

Claude Code users: the `creating-database-migrations` skill runs this as a
guided checklist.

1. Add or change a schema file under `src/db/schemas/` (Drizzle,
   `mysql-core` builders, MySQL dialect per `drizzle.config.ts`).
2. Generate a migration: `make migrate-generate <name>` (wraps
   `yarn drizzle:generate --name=<name>` inside the `api` Docker
   container), or `yarn drizzle:generate --name=<name>` directly if
   running outside Docker. Review the generated SQL under
   `src/db/migrations/` before relying on it.
3. Apply it: `make migrate-up` (wraps `yarn drizzle:migrate`), or
   `yarn drizzle:migrate` directly.
4. Migrations also run automatically at every application boot
   (`main.ts` calls `MigrationService.runMigrations()`), so a fresh
   `yarn start:dev` or container start will pick up new migration files
   without a manual step, in addition to the explicit commands above.

## Commands

Reflects `package.json` and `makefile` as they actually are today; do not
trust `README.md`'s command list (see "Documentation map").

| Command                       | What it does                                                        |
|---------------------------------|------------------------------------------------------------------------|
| `yarn start:dev`               | Hot-reload dev server (`nest start --watch`).                       |
| `yarn start:debug`             | Dev server with the debugger attached.                              |
| `yarn build` / `yarn start`    | Compile with `nest build`, then run the compiled output.            |
| `yarn lint`                    | ESLint with `--fix` over `src`, `test` (and `appacs`, `libs`, which do not exist; harmless). |
| `yarn format`                  | Prettier over `src/**/*.ts` and `test/**/*.ts`.                     |
| `yarn test` / `test:watch` / `test:cov` | Jest unit tests (rootDir `src`, matches `*.spec.ts`).       |
| `yarn test:e2e`                | Jest e2e tests via `test/jest-e2e.json`.                             |
| `yarn drizzle:generate --name=<n>` | Generate a Drizzle migration from schema changes.               |
| `yarn drizzle:migrate`         | Apply pending migrations.                                            |
| `make start`                   | Starts `database`/`adminer` via Docker, waits for the DB, then `yarn start:dev`. |
| `make install`                 | `yarn install` inside the `api` Docker container.                   |
| `make migrate-generate <name>` / `make migrate-create <name>` | Both run `yarn drizzle:generate --name=<name>` inside Docker (identical; a naming duplicate in the `makefile`). |
| `make migrate-up`              | Runs `yarn drizzle:migrate` inside Docker.                           |
| `make schema`                  | Runs `scripts/schema.sh` to scaffold a new schema file.              |
| `docker compose up`            | Runs `api`, `database` (MySQL 8), and `adminer`.                     |

There is no `yarn type-check` or `yarn seed` script, despite `README.md`
mentioning them: type-check via `yarn build` (which runs through `tsc`),
and seeding runs automatically at boot (`SeedingService.runAllSeeds()` in
`main.ts`), not as a standalone command.

## Adding an environment variable

Claude Code users: the `adding-environment-variables` skill runs this as a
guided checklist.

Every env var must be added in two places or it is silently unvalidated:

1. `.env.example`, documented, with a placeholder value.
2. A decorated property on `EnvironmentVariables` in
   `src/config/env/env.validation.ts` (using `class-validator` decorators
   such as `@IsString()`/`@IsNotEmpty()`/`@IsOptional()`). This file reads
   `.env` directly via `dotenv.parse` at import time and validates
   synchronously; a missing required var throws at startup.

Use the resulting value via the exported `envVars` singleton
(`import { envVars } from '@app/config/env/env.validation'`) everywhere in
application code. Do not use NestJS's injected `ConfigService.get(...)` for
this; despite `ConfigModule.forRoot({ isGlobal: true })` being registered,
the codebase consistently reads config through `envVars`. The separate
`config-loader` (`src/config/config-loader/index.ts`) is only for
`drizzle.config.ts`, which runs outside the Nest runtime as a plain CLI
script; do not use it from application code.

## Testing

Claude Code users: the `verifying-changes-before-commit` skill runs the
checklist below before a change is considered done.

There is essentially no existing test coverage to model new tests on: no
`*.spec.ts` files exist under `src/`, and the one e2e test is broken (see
"Known inconsistencies" #3). When adding tests:

- Unit tests: `<file>.spec.ts` next to the code, using `@nestjs/testing`'s
  `Test.createTestingModule` and Jest (already configured in
  `package.json`'s `jest` block, `rootDir: src`).
- e2e tests: under `test/`, registered in `test/jest-e2e.json`.
- Mock `OrmService` at the repository boundary rather than hitting a real
  database.

## Before you finish a change

1. `yarn lint`.
2. `yarn build` (this is also the closest thing to a type-check).
3. `yarn test` (and `yarn test:e2e` if you touched routing or auth).
4. If you changed a schema, make sure a migration exists and applies
   cleanly (see "Database migrations").
5. If you changed documented, user-facing behavior, consider fixing the
   relevant part of `README.md` or `docs/DEVELOPMENT_GUIDE.md` while
   you're there, since both are known to be stale (see "Documentation
   map"). Do not use em dashes in new documentation content.
