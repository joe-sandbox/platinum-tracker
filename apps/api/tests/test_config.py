from pathlib import Path

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
