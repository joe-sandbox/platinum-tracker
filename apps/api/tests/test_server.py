from unittest.mock import patch

from platinum_tracker_api.config import Settings
from platinum_tracker_api.server import main


def test_server_binds_to_configured_loopback_address() -> None:
    settings = Settings(api_host="::1", api_port=8123)

    with (
        patch(
            "platinum_tracker_api.server.get_settings",
            return_value=settings,
        ),
        patch("platinum_tracker_api.server.uvicorn.run") as run_server,
    ):
        main()

    run_server.assert_called_once_with(
        "platinum_tracker_api.main:app",
        host="::1",
        port=8123,
    )
