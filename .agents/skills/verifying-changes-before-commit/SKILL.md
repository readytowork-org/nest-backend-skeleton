---
name: verifying-changes-before-commit
description: Runs this NestJS skeleton's lint, build, and test checks before a change is considered done. Use before finishing any code change, opening a PR, or when asked to verify or double-check a change.
---

# Verifying changes before commit

Copy this checklist and check items off as you go:

```
- [ ] 1. yarn lint
- [ ] 2. yarn build
- [ ] 3. yarn test (and yarn test:e2e if routing/auth changed)
- [ ] 4. Migration exists and applies cleanly, if the schema changed
- [ ] 5. Docs touched, if user-facing behavior changed
```

**Step 1-3: Lint, build, test**

```sh
yarn lint
yarn build
yarn test
```

There is no dedicated `type-check` script; `yarn build` runs through `tsc`
and is the closest equivalent. Run `yarn test:e2e` as well if the change
touches routing, guards, or auth. Note: `test/app.e2e-spec.ts` (the default
Nest CLI boilerplate) currently fails on its own (see `AGENTS.md`'s "Known
inconsistencies" #3); a failure there alone does not mean your change broke
something, but do not add new assertions to it as if it were passing.

**Step 4: Migrations**

If you changed a Drizzle schema, confirm a migration was generated under
`src/db/migrations/` and applies cleanly (`make migrate-up` or
`yarn drizzle:migrate`). See the creating-database-migrations skill.

**Step 5: Documentation**

If the change alters documented, user-facing behavior, update the relevant
part of `AGENTS.md`. `README.md` and `docs/DEVELOPMENT_GUIDE.md` are known
to already be stale in several places (see `AGENTS.md`'s "Documentation
map"); fixing a bit of that opportunistically is welcome but not required
for every change.
