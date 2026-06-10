from pathlib import Path

import pytest
from pydantic import ValidationError

from platinum_tracker_api.config import Settings


def test_settings_create_local_storage_directories(tmp_path: Path) -> None:
    settings = Settings(project_root=tmp_path)

    settings.ensure_storage_directories()

    assert settings.resolved_data_dir.is_dir()
    assert settings.resolved_media_dir.is_dir()
    assert settings.resolved_source_dir.is_dir()
    assert settings.resolved_database_path.parent.is_dir()
    assert settings.database_url == (
        f"sqlite:///{tmp_path.as_posix()}/data/platinum-tracker.db"
    )


def test_explicit_storage_paths_override_project_defaults(tmp_path: Path) -> None:
    settings = Settings(
        project_root=tmp_path,
        data_dir=tmp_path / "custom-data",
        media_dir=tmp_path / "custom-media",
        source_dir=tmp_path / "custom-sources",
        database_path=tmp_path / "database" / "tracker.db",
    )

    settings.ensure_storage_directories()

    assert settings.resolved_data_dir == tmp_path / "custom-data"
    assert settings.resolved_media_dir == tmp_path / "custom-media"
    assert settings.resolved_source_dir == tmp_path / "custom-sources"
    assert settings.resolved_database_path == tmp_path / "database" / "tracker.db"


def test_api_defaults_to_ipv4_loopback() -> None:
    settings = Settings()

    assert settings.api_host == "127.0.0.1"
    assert settings.api_port == 8000


def test_environment_variables_override_local_defaults(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("PLATINUM_TRACKER_PROJECT_ROOT", str(tmp_path))
    monkeypatch.setenv("PLATINUM_TRACKER_API_HOST", "::1")
    monkeypatch.setenv("PLATINUM_TRACKER_API_PORT", "8123")

    settings = Settings()

    assert settings.project_root == tmp_path
    assert settings.api_host == "::1"
    assert settings.api_port == 8123


@pytest.mark.parametrize("host", ["127.0.0.2", "::1"])
def test_api_accepts_loopback_addresses(host: str) -> None:
    settings = Settings(api_host=host)

    assert settings.api_host == host


@pytest.mark.parametrize("host", ["0.0.0.0", "192.168.1.10", "::", "localhost"])
def test_api_rejects_non_literal_or_non_loopback_hosts(host: str) -> None:
    with pytest.raises(ValidationError, match="loopback"):
        Settings(api_host=host)
