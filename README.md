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
```

Run the API:

```bash
cd apps/api
uv run fastapi dev src/platinum_tracker_api/main.py
```

Run the frontend in another terminal:

```bash
pnpm --dir apps/web dev
```

The API health endpoint is `http://127.0.0.1:8000/api/health`. The frontend
development server is `http://127.0.0.1:5173`.
