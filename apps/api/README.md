# Platinum Tracker API

FastAPI backend for Platinum Tracker.

## Development

```bash
uv sync
uv run alembic upgrade head
uv run fastapi dev src/platinum_tracker_api/main.py
```

## Tests

```bash
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

Create a migration after changing SQLAlchemy models:

```bash
uv run alembic revision --autogenerate -m "describe the change"
```
