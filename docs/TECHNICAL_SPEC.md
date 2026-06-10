# Technical Specification

## Document Control

- Owner: [TODO]
- Status: Draft
- Last updated: 2026-06-10

## Constraints

- Expected users and traffic: One local user initially; at most about 10 users
  if the application is later exposed to a trusted household network.
- Budget: Hobby project with minimal operating cost.
- Hosting preference: Localhost on the user's computer; Docker may be added
  later.
- Required browser support: [TODO]
- Privacy or compliance requirements: [TODO]
- Existing accounts, domains, or services: [TODO]

## Stack

| Area | Choice | Reason |
| --- | --- | --- |
| API language | Python 3.13 | Strong parsing ecosystem |
| Python package manager | uv | Fast, reproducible dependency management |
| API framework | FastAPI | Typed async API and OpenAPI generation |
| Python formatting and linting | Ruff | Fast unified formatter and linter |
| Python type checking | mypy | Static type checking for API code |
| JavaScript runtime | Node.js 24 LTS | Supported frontend runtime |
| JavaScript package manager | pnpm | Efficient, reproducible installs |
| Frontend language | TypeScript | Safer API and UI contracts |
| Frontend framework | React 19 with Vite | Focused SPA toolchain |
| Components | shadcn/ui | Accessible, locally owned components |
| Styling | Tailwind CSS | Required by the selected component approach |
| Frontend formatting | Prettier | Consistent formatting |
| Frontend linting | ESLint | TypeScript and React lint rules |
| Database | SQLite | Zero-service local deployment with transactions and SQL |
| Authentication | None in v1 | Single-user localhost deployment |
| API validation | Pydantic | Native FastAPI integration |
| ORM and migrations | SQLAlchemy 2 + Alembic | Explicit persistence and migrations |
| API testing | pytest | Python ecosystem standard |
| UI testing | Vitest + Testing Library | Component and behavior tests |
| End-to-end testing | Playwright | Browser workflow coverage |
| Image and source storage | Local filesystem | Local-first and no cloud cost |
| Hosting | Local processes | Docker is a later packaging option |
| Analytics / monitoring | Local structured logs | No external service needed |

## Architecture

Use a monorepo with independently deployable API and frontend applications:

```text
React SPA
  |
  v
FastAPI JSON API
  |-- SQLite database
  |-- local image and source directories
  `-- in-process import jobs with observable progress

External public guide URL
  |
  `-- restricted fetcher -> source parser -> reviewable import draft
```

Proposed repository layout:

```text
apps/
|-- api/
`-- web/
packages/
`-- api-client/       generated TypeScript client [TODO: confirm]
docs/
```

## Persistence and Synchronization

- Source of truth for games and guides: API database.
- Source of truth for player progress: API database.
- Default database path: `data/platinum-tracker.db`.
- Default uploaded image path: `media/`.
- Default retained import source path: `imports/`.
- All storage paths are configurable through `PLATINUM_TRACKER_*` environment
  variables.
- Offline write behavior: The application is local; writes require the local
  API process to be running.
- Multi-device synchronization: Not supported in v1.
- Conflict resolution: Last successful local write wins.
- Backup and restore: Copy or archive the SQLite database, media directory, and
  retained source directory together while writes are paused.

## API

Yes. The API owns validation, persistence, imports, and progress calculations.

For each endpoint or server action, define:

| Operation | Input | Output | Authorization | Errors |
| --- | --- | --- | --- | --- |
| Games CRUD | Game payload | Game | Local only | 400, 404, 409 |
| Guides CRUD | Guide payload | Guide | Local only | 400, 404 |
| Guide tree | Nested content | Guide tree | Local only | 400, 404 |
| Progress update | Status and note | Progress | Local only | 400, 404 |
| Import preview | Paste or URL | Import job/draft | Local only | 400, 413, 422, 429 |
| Import status | Import job ID | Stage and progress | Local only | 404 |
| Import commit | Reviewed draft | Live guide | Local only | 400, 409, 422 |

## Security and Privacy

- Data collected from users: Locally entered guide content, progress, images,
  source URLs, and retained import source snapshots.
- Data retention and deletion: Retained locally until explicitly deleted.
- Authentication and session strategy: None in v1.
- Authorization boundaries: Bind to loopback by default. Exposing the server
  to a LAN or internet is unsupported until authentication is added.
- API bind enforcement: `PLATINUM_TRACKER_API_HOST` must be a literal loopback
  IP address. The default is `127.0.0.1`; wildcard, LAN, and hostname values
  fail configuration validation.
- Rate limiting or abuse controls: Required for URL imports even on localhost.
- Dependency and secret scanning: [TODO]

Do not store more personal data than the product requires.

## Performance

- Target initial load: [TODO]
- Target interaction latency: [TODO]
- Expected dataset size: Small enough for one installation, potentially many
  guides and images; SQLite remains appropriate.
- Caching strategy: Browser HTTP caching for local media; no distributed cache.
- Image and asset strategy: Images are copied to a configurable local media
  directory. No guide-level count limit; enforce safe per-file limits.

## Accessibility and Compatibility

- Accessibility target: [TODO: recommended WCAG 2.2 AA]
- Browsers and minimum versions: [TODO]
- Responsive viewport range: [TODO]
- Automated accessibility checks: [TODO]

## Testing Strategy

Every frontend or backend feature change must add or update unit tests covering
the new or changed behavior. A feature is not complete when its required tests
are missing or failing.

| Test Level | Scope | Tool | Required In CI |
| --- | --- | --- | --- |
| Unit | Domain rules and parsers | pytest / Vitest | Yes |
| Component | Interactive UI states | Testing Library | Yes |
| Integration | Persistence, imports, and API | pytest | Yes |
| End-to-end | Core player workflows | Playwright | Yes |
| Accessibility | Automated and manual checks | [TODO] | [TODO] |

## Delivery

- Environments: Local development and local production-style run.
- CI provider and required checks: No hosted CI. A repository-local
  `scripts/ci.sh` runs formatting checks, linting, type checking, unit and
  integration tests, production builds, and end-to-end tests.
- Deployment process: Run the API and frontend locally; Docker packaging later.
- Database migration process: Alembic migrations during explicit upgrades.
- Rollback process: Restore a matched database and media/source backup.
- Error reporting: Structured local logs with import job diagnostics.
- Uptime monitoring: Not required for localhost v1.

## Local Commands

Keep this section and `AGENTS.md` synchronized.

```text
Install API:       cd apps/api && uv sync
Install frontend:  pnpm install
Migrate database:  cd apps/api && uv run alembic upgrade head
Develop API:       cd apps/api && uv run platinum-tracker-api
Develop frontend:  pnpm --dir apps/web dev
Lint API:          cd apps/api && uv run ruff check .
Lint frontend:     pnpm --dir apps/web lint
Typecheck API:     cd apps/api && uv run mypy
Typecheck frontend: pnpm --dir apps/web typecheck
Test API:          cd apps/api && uv run pytest
Test frontend:     pnpm --dir apps/web test
Build frontend:    pnpm --dir apps/web build
Complete CI:       [TODO: scripts/ci.sh]
```

## Architecture Decisions

Record consequential decisions below or create individual ADR files.

| Date | Decision | Rationale | Consequences |
| --- | --- | --- | --- |
| 2026-06-10 | FastAPI API | Python is preferred and parsing is central | Separate API deployment |
| 2026-06-10 | React, TypeScript, shadcn/ui | Preferred UI stack | Tailwind and SPA build |
| 2026-06-10 | Review imports before commit | Parsers can be incomplete or wrong | Requires draft storage and UI |
| 2026-06-10 | SQLite database | Local single-user deployment | Simple backups; unsuitable for many concurrent writers |
| 2026-06-10 | Local media and source storage | No cloud dependency or cost | Backups must include filesystem data |
| 2026-06-10 | No authentication in v1 | Loopback-only personal tool | Must not be exposed to untrusted networks |
| 2026-06-10 | Reject non-loopback bind hosts | Prevent accidental unauthenticated network exposure | LAN access requires a future authenticated mode |
| 2026-06-10 | In-process deterministic imports | Low scale and simple operation | API restart interrupts active imports |
| 2026-06-10 | Ruff and mypy | Consistent Python style and static checks | Both run in local CI |
| 2026-06-10 | Local CI script | No hosted CI is wanted | Quality checks depend on running `scripts/ci.sh` |
