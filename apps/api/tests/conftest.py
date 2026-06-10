from collections.abc import Generator
from pathlib import Path

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from alembic import command
from platinum_tracker_api.config import Settings
from platinum_tracker_api.db import (
    create_database_engine,
    create_session_factory,
    get_session,
)
from platinum_tracker_api.main import create_app


@pytest.fixture
def migrated_engine(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> Generator[Engine]:
    monkeypatch.setenv("PLATINUM_TRACKER_PROJECT_ROOT", str(tmp_path))
    command.upgrade(Config(Path(__file__).parents[1] / "alembic.ini"), "head")
    engine = create_database_engine(Settings(project_root=tmp_path))
    yield engine
    engine.dispose()


@pytest.fixture
def api_client(migrated_engine: Engine) -> Generator[TestClient]:
    session_factory = create_session_factory(migrated_engine)
    app = create_app()

    def override_session() -> Generator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_session

    with TestClient(app) as client:
        yield client
