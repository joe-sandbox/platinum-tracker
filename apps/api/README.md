# Platinum Tracker API

FastAPI backend for Platinum Tracker.

## Development

```bash
uv sync
uv run alembic upgrade head
uv run platinum-tracker-load-fixtures
uv run platinum-tracker-api
```

The server binds to `127.0.0.1:8000` by default and has no authentication in
v1. `PLATINUM_TRACKER_API_HOST` accepts only literal loopback addresses such as
`127.0.0.1` or `::1`; wildcard, LAN, and hostname values are rejected. The port
can be changed with `PLATINUM_TRACKER_API_PORT`.

The API loads optional overrides from `.env` at the repository root. Start
from the safe template:

```bash
cp ../../.env.example ../../.env
```

The application does not require secrets in v1.

## Quality Checks

```bash
uv run ruff format .
uv run ruff format --check .
uv run ruff check .
uv run mypy
uv run pytest
```

## Local Storage

The application creates these ignored directories at the repository root:

- `data/` for `platinum-tracker.db`
- `media/` for uploaded and imported images
- `imports/` for retained source snapshots

Override the root with `PLATINUM_TRACKER_PROJECT_ROOT`, or override individual
paths with `PLATINUM_TRACKER_DATA_DIR`, `PLATINUM_TRACKER_MEDIA_DIR`,
`PLATINUM_TRACKER_SOURCE_DIR`, and `PLATINUM_TRACKER_DATABASE_PATH`.

Create or update the SQLite schema:

```bash
uv run alembic upgrade head
```

Load the idempotent starter game and guide:

```bash
uv run platinum-tracker-load-fixtures
```

The fixture uses stable UUIDs, so rerunning the command updates the starter
records without creating duplicates.

Create a migration after changing SQLAlchemy models:

```bash
uv run alembic revision --autogenerate -m "describe the change"
```
