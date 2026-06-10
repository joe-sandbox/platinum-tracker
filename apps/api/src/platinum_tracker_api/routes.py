from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from platinum_tracker_api.db import get_session
from platinum_tracker_api.models import Game, Guide
from platinum_tracker_api.schemas import (
    GameRead,
    GameWrite,
    GuideRead,
    GuideWrite,
)

SessionDependency = Annotated[Session, Depends(get_session)]

router = APIRouter(prefix="/api")


def require_game(session: Session, game_id: str) -> Game:
    game = session.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


def require_guide(session: Session, guide_id: str) -> Guide:
    guide = session.get(Guide, guide_id)
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    return guide


@router.get("/games", response_model=list[GameRead], tags=["games"])
def list_games(session: SessionDependency) -> list[Game]:
    return list(session.scalars(select(Game).order_by(Game.title, Game.id)))


@router.post(
    "/games",
    response_model=GameRead,
    status_code=status.HTTP_201_CREATED,
    tags=["games"],
)
def create_game(payload: GameWrite, session: SessionDependency) -> Game:
    game = Game(
        id=str(uuid4()),
        **payload.model_dump(mode="json"),
    )
    session.add(game)
    session.commit()
    session.refresh(game)
    return game


@router.get("/games/{game_id}", response_model=GameRead, tags=["games"])
def get_game(game_id: str, session: SessionDependency) -> Game:
    return require_game(session, game_id)


@router.put("/games/{game_id}", response_model=GameRead, tags=["games"])
def update_game(
    game_id: str,
    payload: GameWrite,
    session: SessionDependency,
) -> Game:
    game = require_game(session, game_id)
    for field, value in payload.model_dump(mode="json").items():
        setattr(game, field, value)
    session.commit()
    session.refresh(game)
    return game


@router.delete(
    "/games/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["games"],
)
def delete_game(game_id: str, session: SessionDependency) -> Response:
    game = require_game(session, game_id)
    session.delete(game)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/guides", response_model=list[GuideRead], tags=["guides"])
def list_guides(
    session: SessionDependency,
    game_id: str | None = None,
) -> list[Guide]:
    statement = select(Guide)
    if game_id is not None:
        require_game(session, game_id)
        statement = statement.where(Guide.game_id == game_id)
    return list(session.scalars(statement.order_by(Guide.title, Guide.id)))


@router.post(
    "/guides",
    response_model=GuideRead,
    status_code=status.HTTP_201_CREATED,
    tags=["guides"],
)
def create_guide(payload: GuideWrite, session: SessionDependency) -> Guide:
    require_game(session, payload.game_id)
    guide = Guide(
        id=str(uuid4()),
        **payload.model_dump(mode="json"),
    )
    session.add(guide)
    session.commit()
    session.refresh(guide)
    return guide


@router.get("/guides/{guide_id}", response_model=GuideRead, tags=["guides"])
def get_guide(guide_id: str, session: SessionDependency) -> Guide:
    return require_guide(session, guide_id)


@router.put("/guides/{guide_id}", response_model=GuideRead, tags=["guides"])
def update_guide(
    guide_id: str,
    payload: GuideWrite,
    session: SessionDependency,
) -> Guide:
    guide = require_guide(session, guide_id)
    require_game(session, payload.game_id)
    for field, value in payload.model_dump(mode="json").items():
        setattr(guide, field, value)
    session.commit()
    session.refresh(guide)
    return guide


@router.delete(
    "/guides/{guide_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["guides"],
)
def delete_guide(guide_id: str, session: SessionDependency) -> Response:
    guide = require_guide(session, guide_id)
    session.delete(guide)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
