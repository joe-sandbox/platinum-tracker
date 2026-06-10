import sqlite3
from pathlib import Path

import pytest
from alembic.config import Config

from alembic import command


def test_alembic_upgrade_creates_current_schema(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("PLATINUM_TRACKER_PROJECT_ROOT", str(tmp_path))
    config = Config(Path(__file__).parents[1] / "alembic.ini")

    command.upgrade(config, "head")

    database_path = tmp_path / "data" / "platinum-tracker.db"
    with sqlite3.connect(database_path) as connection:
        revision = connection.execute(
            "SELECT version_num FROM alembic_version"
        ).fetchone()

    assert revision == ("20260610_0001",)
    assert (tmp_path / "media").is_dir()
    assert (tmp_path / "imports").is_dir()
