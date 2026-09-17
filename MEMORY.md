# Memory

A log of durable progress, decisions, and next steps for this repo, meant
for both humans and AI agents picking up work here. Read it before
starting a session.

Update it only for milestones: a notable decision, a completed body of
work, or an open item worth remembering, not a line for every edit in a
session. If in doubt, don't add an entry; `git log` already covers routine
changes.

## Next steps / open items

- `README.md` and `docs/DEVELOPMENT_GUIDE.md` are known stale (see
  `AGENTS.md`'s "Documentation map"); not yet fixed.
- The four "Known inconsistencies" in `AGENTS.md` (two Drizzle wirings,
  unused `adminChildRoutes`, broken default e2e test, dead
  `scripts/cleanup.sh`) are documented but not yet cleaned up.

## Decisions

- **2026-09-17**: Skills are authored once under `.agents/skills/` and
  exposed to individual agents via symlinks (`.claude/skills`,
  `.codex/skills`), instead of duplicating SKILL.md files per tool. One
  source of truth, no drift between what Claude Code and Codex see.
  Caveat: needs `core.symlinks` support on checkout, so `.claude/skills`
  and `.codex/skills` can check out broken on Windows without it.
- **2026-09-17**: Vendored a third-party community skill,
  `nestjs-best-practices` (github.com/Kadajett/agent-nestjs-skills), under
  `.agents/skills/`, alongside the 4 repo-specific workflow skills, rather
  than replacing them. Rationale: it covers general NestJS best practices
  well; the repo-specific skills know this codebase's actual files and
  quirks, which a generic skill can't. See its `VENDORED.md` for
  provenance/license; don't hand-edit it in place.
- **2026-09-17**: This repo intentionally has no `CLAUDE.md`, so Claude
  Code does not auto-load `AGENTS.md` at session start here (an agent
  needs to read it itself). Skills still work regardless, via the
  `.claude/skills` symlink.
- **2026-09-17**: New documentation in this repo avoids em dashes; existing
  docs are not reformatted to remove them.

## Progress log

- **2026-09-17**: Cloned from `readytowork-org/nest-backend-skeleton`
  (sibling of `go-gin-skeleton`, same conventions applied for consistency).
  Added `AGENTS.md`, written from reading the actual source rather than
  `README.md`/`docs/DEVELOPMENT_GUIDE.md`, which turned out to be stale
  boilerplate. Added four repo-specific Claude Code skills plus one
  vendored community skill (`nestjs-best-practices`) under
  `.agents/skills/`, exposed via `.claude/skills` and `.codex/skills`
  symlinks. No application code or existing documentation was modified;
  nothing has been pushed.
