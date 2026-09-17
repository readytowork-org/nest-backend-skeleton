# Vendored skill

This skill's content (`SKILL.md` and `rules/*.md`) is copied verbatim from
a third-party, community-authored source, not written for this repo. It
covers general NestJS best practices (architecture, dependency injection,
error handling, security, performance, testing, database/ORM patterns,
API design, microservices, DevOps); code examples in it may use a
different ORM (TypeORM-style) than this repo's actual Drizzle/`OrmService`
setup. Treat it as general framework guidance, and defer to `AGENTS.md`
for anything specific to this codebase.

- Source: https://github.com/Kadajett/agent-nestjs-skills
- Path: `skills/nestjs-best-practices/`
- Author: Kadajett
- Version vendored: 1.2.0 (per `SKILL.md` frontmatter)
- License: MIT, as declared in the upstream `SKILL.md` frontmatter (the
  upstream repo has no separate `LICENSE` file at the time of vendoring)
- Vendored: 2026-09-17

Do not hand-edit `SKILL.md` or `rules/*.md` in place; if a correction is
needed, either fix it upstream and re-vendor, or note the deviation here
instead of silently diverging from the source.
