from pathlib import Path

from sqlalchemy import text

from platinum_tracker_api.config import Settings
from platinum_tracker_api.db import create_database_engine


def test_sqlite_engine_connects_and_enables_foreign_keys(tmp_path: Path) -> None:
    settings = Settings(project_root=tmp_path)
    engine = create_database_engine(settings)

    with engine.connect() as connection:
        foreign_keys_enabled = connection.execute(
            text("PRAGMA foreign_keys")
        ).scalar_one()
        database_version = connection.execute(
            text("SELECT sqlite_version()")
        ).scalar_one()

    engine.dispose()

    assert foreign_keys_enabled == 1
    assert isinstance(database_version, str)
    assert settings.resolved_database_path.is_file()
