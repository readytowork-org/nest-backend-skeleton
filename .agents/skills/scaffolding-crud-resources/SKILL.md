---
name: scaffolding-crud-resources
description: Scaffolds a new API resource (DTOs, Drizzle schema, module, controller, service, repository) in this NestJS skeleton and wires it into the app. Use when adding a new resource, entity, or endpoint group under src/api/.
---

# Scaffolding a CRUD resource

Full architecture, conventions, and known inconsistencies live in
`AGENTS.md` at the repo root. Read it first if this session has not already
loaded it, especially the "Known inconsistencies" section before touching
routing or the database layer.

Copy this checklist and check items off as you go:

```
- [ ] 1. Add DTOs under src/common/types/dto/<feature>/
- [ ] 2. Add a Drizzle schema under src/db/schemas/
- [ ] 3. Generate and apply a migration
- [ ] 4. Create module, controller, service, repository
- [ ] 5. Register the module in its parent
- [ ] 6. Add Swagger decorators
- [ ] 7. Pick a real route path (do not copy @Controller(''))
- [ ] 8. Add tests
- [ ] 9. Run the verifying-changes-before-commit skill
```

**Step 1: DTOs**

Add request, response, query, and (if the entity has sensitive fields like
a password) a "safe" DTO under `src/common/types/dto/<feature>/`, plus a
barrel `index.ts`. Follow `src/common/types/dto/staff/` as the template.
Use `class-validator` decorators and `@ApiProperty()`.

**Step 2: Schema**

Add a Drizzle schema file under `src/db/schemas/`. `scripts/schema.sh` (run
via `make schema`) scaffolds a minimal `mysqlTable` using the shared
`timestamps` helper from `@app/common`. Export the new table from
`src/db/schemas/index.ts`.

**Step 3: Migration**

Use the creating-database-migrations skill, or run
`make migrate-generate <name>` then `make migrate-up`.

**Step 4: Module, controller, service, repository**

Follow `src/api/admin/staffs/` exactly:

- `xxx.module.ts`: import `DrizzleModule` from `@app/config` (not
  `@app/db`) and any needed service modules (for example
  `PaginationModule`); provide the repository and service; declare the
  controller; export the service.
- `xxx.repository.ts`: constructor-inject `OrmService` from
  `@config/orm/orm.interface`, query via `this.orm.db`.
- `xxx.service.ts`: business logic, throwing typed exceptions from
  `src/common/exception/http-exception.ts` (add a new one there if needed).
- `xxx.controller.ts`: guard with `@UseGuards(JwtAuthGuard, RolesGuard)`
  and `@Roles(...)` unless the route is `@Public()`. Build responses with
  `SuccessResponseMessage`/`SuccessResponseWithData`/`SuccessResponseWithCount`
  from `src/common/api_response/success_response.ts`.

**Step 5: Register the module**

Add the new module to its parent module's `imports` (for example a new
admin sub-resource into `AdminModule`).

**Step 6: Swagger**

Every controller method needs `@ApiOperation` and `@ApiResponse`; the
module needs `@ApiTags` on the controller and `@ApiBearerAuth('BearerAuth')`
if it requires auth.

**Step 7: Route path**

`AGENTS.md`'s "Known inconsistencies" #2 explains that `admin.routes.ts`'s
`adminChildRoutes` is not wired to anything, so `@Controller('')` resolves
directly under `/api/v1/` with no resource prefix. Give your controller an
explicit, non-colliding path, for example `@Controller('admin/products')`.

**Step 8: Tests**

See the verifying-changes-before-commit skill's testing notes; there is no
existing unit-test example to copy from yet, so use `@nestjs/testing` and
mock `OrmService` at the repository boundary.

**Step 9: Verify**

Use the verifying-changes-before-commit skill before treating the resource
as done.
