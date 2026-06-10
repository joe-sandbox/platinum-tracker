import uvicorn

from platinum_tracker_api.config import get_settings


def main() -> None:
    settings = get_settings()
    uvicorn.run(
        "platinum_tracker_api.main:app",
        host=settings.api_host,
        port=settings.api_port,
    )
