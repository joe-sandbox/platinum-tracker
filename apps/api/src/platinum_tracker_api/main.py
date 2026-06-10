from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from platinum_tracker_api.config import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    active_settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        active_settings.ensure_storage_directories()
        yield

    application = FastAPI(
        title="Platinum Tracker API",
        version="0.1.0",
        lifespan=lifespan,
    )

    @application.get("/api/health", tags=["system"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()
