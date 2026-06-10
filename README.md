# Platinum Tracker

A website for building game guides and tracking the collectibles needed to
unlock platinum trophies.

## Project Status

Planning. The core domain and initial stack are defined; remaining decisions
are marked `[TODO]`.

## Start Here

Complete the documents in this order:

1. [Product specification](docs/PRODUCT_SPEC.md)
2. [UX specification](docs/UX_SPEC.md)
3. [Data model](docs/DATA_MODEL.md)
4. [Import specification](docs/IMPORT_SPEC.md)
5. [Technical specification](docs/TECHNICAL_SPEC.md)
6. [Implementation plan](docs/IMPLEMENTATION_PLAN.md)

Repository guidance for coding agents is in [AGENTS.md](AGENTS.md).

## Development

Prerequisites:

- Python 3.13
- `uv`
- Node.js 24 LTS
- `pnpm` 10

Install dependencies:

```bash
(cd apps/api && uv sync)
pnpm install
(cd apps/web && pnpm exec playwright install chromium)
```

Initialize or update the local SQLite database:

```bash
cd apps/api
uv run alembic upgrade head
```

Run the API:

```bash
cd apps/api
uv run platinum-tracker-api
```

Run the frontend in another terminal:

```bash
pnpm --dir apps/web dev
```

The API health endpoint is `http://127.0.0.1:8000/api/health`. The frontend
development server is `http://127.0.0.1:5173`.

Local data is stored in the ignored `data/`, `media/`, and `imports/`
directories at the repository root.

The unauthenticated API accepts only literal loopback bind addresses and
defaults to `127.0.0.1`.
