import json
from importlib.resources import files
from typing import Any

from pydantic import BaseModel, ConfigDict
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from platinum_tracker_api.db import (
    create_database_engine,
    create_session_factory,
)
from platinum_tracker_api.models import Game, Guide


class GameFixture(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    platform: str | None = None
    edition: str | None = None
    cover_image_url: str | None = None


class GuideFixture(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    game_id: str
    title: str
    description: str | None = None
    source_url: str | None = None
    source_name: str | None = None


class InitialFixtures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    games: list[GameFixture]
    guides: list[GuideFixture]


def read_initial_fixtures() -> InitialFixtures:
    fixture_path = files("platinum_tracker_api").joinpath(
        "fixture_data",
        "initial.json",
    )
    payload: Any = json.loads(fixture_path.read_text(encoding="utf-8"))
    return InitialFixtures.model_validate(payload)


def load_initial_fixtures(session: Session) -> None:
    fixtures = read_initial_fixtures()

    for game_fixture in fixtures.games:
        game = session.get(Game, game_fixture.id)
        values = game_fixture.model_dump(exclude={"id"})
        if game is None:
            session.add(Game(id=game_fixture.id, **values))
        else:
            for field, value in values.items():
                setattr(game, field, value)

    session.flush()

    for guide_fixture in fixtures.guides:
        guide = session.get(Guide, guide_fixture.id)
        values = guide_fixture.model_dump(exclude={"id"})
        if guide is None:
            session.add(Guide(id=guide_fixture.id, **values))
        else:
            for field, value in values.items():
                setattr(guide, field, value)

    session.commit()


def load_fixtures_with_engine(engine: Engine) -> None:
    session_factory = create_session_factory(engine)
    with session_factory() as session:
        load_initial_fixtures(session)


def main() -> None:
    engine = create_database_engine()
    try:
        load_fixtures_with_engine(engine)
    finally:
        engine.dispose()

    print("Initial game and guide fixtures loaded.")
