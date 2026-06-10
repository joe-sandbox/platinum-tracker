# AGENTS.md

## Project Purpose

Platinum Tracker lets users create structured game guides and record
collectibles needed to earn platinum trophies.

The project is currently in the planning stage. Treat the files in `docs/` as
the source of truth. Entries marked `[TODO]` are undecided and must not be
silently assumed.

## Before Making Changes

1. Read `README.md` and the relevant files in `docs/`.
2. Check `git status` and preserve changes made by the user.
3. Identify unresolved decisions that affect the requested work.
4. Prefer the smallest implementation that satisfies the documented scope.

If an unresolved decision materially changes behavior, data ownership, cost,
or architecture, ask for clarification or document the assumption before
implementing it.

## Product Principles

- Make progress fast to record and easy to understand.
- Design mobile-first because players may use the tracker while playing.
- Never lose or silently overwrite progress.
- Keep collectible data separate from a player's progress.
- Preserve the guide hierarchy: game, guide, chapter, section, collectible.
- Show clear totals at guide, chapter, section, type, and item levels.
- Support keyboard navigation and accessible names, focus states, and contrast.
- Do not reproduce copyrighted guide text or artwork without permission.
- Record the source and last verification date for imported game data.
- Never publish imported content until the user has reviewed the parsed draft.

## Engineering Guidelines

- Follow the selected stack and conventions in `docs/TECHNICAL_SPEC.md`.
- Keep domain rules out of presentation components.
- Validate data at system boundaries.
- Use stable IDs; do not use display names as identifiers.
- Store dates in UTC and format them for the user at display time.
- Include loading, empty, error, and success states for user-facing workflows.
- Add tests in proportion to risk, especially for progress calculations,
  imports, persistence, authentication, and migrations.
- Every frontend or backend feature change must include corresponding unit
  tests for its new or changed behavior.
- Treat pasted HTML and imported URLs as untrusted input.
- Keep source-specific import parsers behind a common importer interface.
- Avoid adding dependencies unless they provide clear value over existing
  code or platform APIs.

## Data Safety

- Treat progress changes and account deletion as user-owned data operations.
- Require confirmation for destructive actions.
- Back up or export user data before risky migrations when applicable.
- Never commit credentials, tokens, private user data, or production exports.
- Use environment variables for secrets and maintain a safe `.env.example`.
- Keep SQLite, uploaded media, and retained import sources out of version
  control.
- Bind the unauthenticated API to loopback; do not expose it to a network.
- Treat database, media, and retained sources as one backup unit.

## Verification

Before considering a change complete:

1. Run Ruff, mypy, ESLint, Prettier checks, and relevant tests.
2. Exercise the changed user flow at mobile and desktop widths when UI changes.
3. Verify progress totals and completion percentages at boundary values.
4. Update specifications when behavior or architecture changes.

The complete local verification entry point will be `scripts/ci.sh`; do not add
GitHub Actions unless the project requirements change.

```text
Install API:       cd apps/api && uv sync
Install frontend:  pnpm install
Migrate database:  cd apps/api && uv run alembic upgrade head
Develop API:       cd apps/api && uv run platinum-tracker-api
Develop frontend:  pnpm --dir apps/web dev
Format API:        cd apps/api && uv run ruff format .
Check API format:  cd apps/api && uv run ruff format --check .
Format frontend:   pnpm --dir apps/web format
Check web format:  pnpm --dir apps/web format:check
Lint API:          cd apps/api && uv run ruff check .
Lint frontend:     pnpm --dir apps/web lint
Typecheck API:     cd apps/api && uv run mypy
Typecheck frontend: pnpm --dir apps/web typecheck
Test API:          cd apps/api && uv run pytest
Test frontend:     pnpm --dir apps/web test:unit
Test end-to-end:   pnpm --dir apps/web test:e2e
Build frontend:    pnpm --dir apps/web build
Complete CI:       [TODO: scripts/ci.sh]
```

## Definition of Done

- The documented acceptance criteria pass.
- New or changed frontend and backend behavior has corresponding unit tests.
- Relevant automated tests pass.
- Error and empty states are handled.
- Accessibility was considered and checked.
- No secrets or unrelated changes are included.
- Documentation reflects the implemented behavior.
