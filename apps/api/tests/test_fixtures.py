from pathlib import Path

import pytest
from alembic.config import Config
from sqlalchemy import func, select

from alembic import command
from platinum_tracker_api.config import Settings
from platinum_tracker_api.db import (
    create_database_engine,
    create_session_factory,
)
from platinum_tracker_api.fixtures import (
    load_initial_fixtures,
    read_initial_fixtures,
)
from platinum_tracker_api.models import Game, Guide


def migrate_database(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Settings:
    monkeypatch.setenv("PLATINUM_TRACKER_PROJECT_ROOT", str(tmp_path))
    command.upgrade(Config(Path(__file__).parents[1] / "alembic.ini"), "head")
    return Settings(project_root=tmp_path)


def test_initial_fixture_file_is_valid() -> None:
    fixtures = read_initial_fixtures()

    assert len(fixtures.games) == 1
    assert len(fixtures.guides) == 1
    assert fixtures.guides[0].game_id == fixtures.games[0].id


def test_fixture_loader_is_idempotent(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = migrate_database(tmp_path, monkeypatch)
    engine = create_database_engine(settings)
    session_factory = create_session_factory(engine)

    with session_factory() as session:
        load_initial_fixtures(session)
        load_initial_fixtures(session)

        game_count = session.scalar(select(func.count()).select_from(Game))
        guide_count = session.scalar(select(func.count()).select_from(Guide))
        game = session.get(Game, "11111111-1111-4111-8111-111111111111")
        guide = session.get(Guide, "22222222-2222-4222-8222-222222222222")

        assert game_count == 1
        assert guide_count == 1
        assert game is not None
        assert guide is not None
        assert game.title == "Example Adventure"
        assert guide.game_id == game.id
        assert guide.game.title == game.title

    engine.dispose()
