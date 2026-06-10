# Implementation Plan

## Planning Inputs

Do not finalize this plan until the product, UX, data, and technical
specifications have enough detail to estimate the first release.

- Scope approved by: [TODO]
- Technical approach approved by: [TODO]
- Target date: [TODO]
- Available time per week: [TODO]

## Milestone 0: Foundation

- [x] Resolve first-release questions in the specifications.
- [x] Select the stack and record the reasons.
- [x] Scaffold FastAPI and React/TypeScript applications.
- [x] Add shadcn/ui and Tailwind CSS.
- [x] Configure SQLite, Alembic, and local media/source directories.
- [x] Bind the API to loopback by default; do not add authentication in v1.
- [x] Add formatting, linting, type checking, and tests.
- [x] Add `scripts/ci.sh` to run all required checks locally; do not configure
  GitHub Actions.
- [x] Create a safe `.env.example` if environment variables are used.
- [x] Add initial game and guide fixtures.

Exit criteria: Both applications install and build, the database migrates and
loads fixtures, and `./scripts/ci.sh` passes.

## Milestone 1: Guide Content

- [x] Build the application shell and navigation.
- [x] Implement game and guide CRUD.
- [ ] Implement chapters, sections, collectible types, and collectibles.
- [ ] Implement ordering within each hierarchy level.
- [ ] Add multiple collectible images.
- [ ] Add coordinated local backup and restore for database, media, and sources.
- [ ] Build the guide outline and editor.
- [ ] Add search, filtering, and sorting.
- [ ] Add loading, empty, and error states.
- [ ] Verify responsive and keyboard behavior.

Exit criteria: A user can manually create and browse a complete structured
guide.

## Milestone 2: Progress Tracking

- [ ] Implement the progress store.
- [ ] Support `collected`, `not_found`, and `missing` statuses.
- [ ] Calculate guide, chapter, section, and type progress.
- [ ] Restore progress after refresh.
- [ ] Handle failed writes without presenting false success.
- [ ] Add reset and export behavior defined by the product specification.

Exit criteria: [TODO]

## Milestone 3: Guide Imports

- [ ] Define and version the import-draft schema.
- [ ] Implement pasted-content parsing.
- [ ] Implement the first PowerPyx parser against saved test fixtures.
- [ ] Retain original pasted and fetched source snapshots unchanged.
- [ ] Expose import stage and progress updates to the frontend.
- [ ] Add restricted URL fetching with SSRF and size protections.
- [ ] Build the import preview and correction workflow.
- [ ] Commit confirmed drafts atomically.
- [ ] Add parser regression, security, and failure-path tests.

Exit criteria: A supported source can produce a reviewed guide without
partially modifying live data when parsing or persistence fails.

## Milestone 4: Release Readiness

- [ ] Test supported browsers and viewport sizes.
- [ ] Complete automated and manual accessibility checks.
- [ ] Verify the full game dataset and record its source.
- [ ] Test backup, migration, and recovery behavior.
- [ ] Add privacy and attribution pages if required.
- [ ] Configure monitoring and error reporting.
- [ ] Run production smoke tests.

Exit criteria: [TODO]

## Backlog

| Priority | Item | User Value | Dependencies | Estimate |
| --- | --- | --- | --- | --- |
| [TODO] | [TODO] | [TODO] | [TODO] | [TODO] |

## Release Checklist

- [ ] All must-have acceptance criteria pass.
- [ ] Every frontend and backend feature has corresponding unit tests.
- [ ] Required CI checks pass.
- [ ] No known critical or high-severity defects remain.
- [ ] Production configuration contains no development secrets or test data.
- [ ] Data import and progress calculations were verified.
- [ ] Rollback steps were tested or documented.
- [ ] Specifications match released behavior.
