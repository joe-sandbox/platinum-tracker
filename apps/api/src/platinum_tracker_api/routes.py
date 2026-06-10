from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from platinum_tracker_api.db import get_session
from platinum_tracker_api.models import (
    Chapter,
    Collectible,
    CollectibleType,
    Game,
    Guide,
    Section,
)
from platinum_tracker_api.schemas import (
    ChapterRead,
    ChapterWrite,
    CollectibleRead,
    CollectibleTypeRead,
    CollectibleTypeWrite,
    CollectibleWrite,
    GameRead,
    GameWrite,
    GuideRead,
    GuideWrite,
    SectionRead,
    SectionWrite,
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


def require_chapter(session: Session, chapter_id: str) -> Chapter:
    chapter = session.get(Chapter, chapter_id)
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


def require_section(session: Session, section_id: str) -> Section:
    section = session.get(Section, section_id)
    if section is None:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


def require_collectible_type(
    session: Session,
    collectible_type_id: str,
) -> CollectibleType:
    collectible_type = session.get(CollectibleType, collectible_type_id)
    if collectible_type is None:
        raise HTTPException(status_code=404, detail="Collectible type not found")
    return collectible_type


def require_collectible(session: Session, collectible_id: str) -> Collectible:
    collectible = session.get(Collectible, collectible_id)
    if collectible is None:
        raise HTTPException(status_code=404, detail="Collectible not found")
    return collectible


def next_position(
    session: Session,
    model: type[Chapter] | type[Section] | type[CollectibleType] | type[Collectible],
    parent_field: str,
    parent_id: str,
) -> int:
    column = getattr(model, parent_field)
    maximum = session.scalar(
        select(func.max(model.position)).where(column == parent_id)
    )
    return (maximum or 0) + 1


def section_guide_id(section: Section) -> str:
    return section.chapter.guide_id


def validate_collectible_parents(
    session: Session,
    section_id: str,
    collectible_type_id: str,
) -> tuple[Section, CollectibleType]:
    section = require_section(session, section_id)
    collectible_type = require_collectible_type(session, collectible_type_id)
    if section_guide_id(section) != collectible_type.guide_id:
        raise HTTPException(
            status_code=422,
            detail="Section and collectible type must belong to the same guide",
        )
    return section, collectible_type


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


@router.get("/chapters", response_model=list[ChapterRead], tags=["chapters"])
def list_chapters(guide_id: str, session: SessionDependency) -> list[Chapter]:
    require_guide(session, guide_id)
    statement = (
        select(Chapter)
        .where(Chapter.guide_id == guide_id)
        .order_by(Chapter.position, Chapter.id)
    )
    return list(session.scalars(statement))


@router.post(
    "/chapters",
    response_model=ChapterRead,
    status_code=status.HTTP_201_CREATED,
    tags=["chapters"],
)
def create_chapter(payload: ChapterWrite, session: SessionDependency) -> Chapter:
    require_guide(session, payload.guide_id)
    chapter = Chapter(
        id=str(uuid4()),
        position=next_position(session, Chapter, "guide_id", payload.guide_id),
        **payload.model_dump(),
    )
    session.add(chapter)
    session.commit()
    session.refresh(chapter)
    return chapter


@router.get(
    "/chapters/{chapter_id}",
    response_model=ChapterRead,
    tags=["chapters"],
)
def get_chapter(chapter_id: str, session: SessionDependency) -> Chapter:
    return require_chapter(session, chapter_id)


@router.put("/chapters/{chapter_id}", response_model=ChapterRead, tags=["chapters"])
def update_chapter(
    chapter_id: str,
    payload: ChapterWrite,
    session: SessionDependency,
) -> Chapter:
    chapter = require_chapter(session, chapter_id)
    require_guide(session, payload.guide_id)
    if chapter.guide_id != payload.guide_id:
        chapter.position = next_position(session, Chapter, "guide_id", payload.guide_id)
    for field, value in payload.model_dump().items():
        setattr(chapter, field, value)
    session.commit()
    session.refresh(chapter)
    return chapter


@router.delete(
    "/chapters/{chapter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["chapters"],
)
def delete_chapter(chapter_id: str, session: SessionDependency) -> Response:
    session.delete(require_chapter(session, chapter_id))
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/sections", response_model=list[SectionRead], tags=["sections"])
def list_sections(chapter_id: str, session: SessionDependency) -> list[Section]:
    require_chapter(session, chapter_id)
    statement = (
        select(Section)
        .where(Section.chapter_id == chapter_id)
        .order_by(Section.position, Section.id)
    )
    return list(session.scalars(statement))


@router.post(
    "/sections",
    response_model=SectionRead,
    status_code=status.HTTP_201_CREATED,
    tags=["sections"],
)
def create_section(payload: SectionWrite, session: SessionDependency) -> Section:
    require_chapter(session, payload.chapter_id)
    section = Section(
        id=str(uuid4()),
        position=next_position(session, Section, "chapter_id", payload.chapter_id),
        **payload.model_dump(),
    )
    session.add(section)
    session.commit()
    session.refresh(section)
    return section


@router.get(
    "/sections/{section_id}",
    response_model=SectionRead,
    tags=["sections"],
)
def get_section(section_id: str, session: SessionDependency) -> Section:
    return require_section(session, section_id)


@router.put("/sections/{section_id}", response_model=SectionRead, tags=["sections"])
def update_section(
    section_id: str,
    payload: SectionWrite,
    session: SessionDependency,
) -> Section:
    section = require_section(session, section_id)
    require_chapter(session, payload.chapter_id)
    if section.chapter_id != payload.chapter_id:
        section.position = next_position(
            session, Section, "chapter_id", payload.chapter_id
        )
    for field, value in payload.model_dump().items():
        setattr(section, field, value)
    session.commit()
    session.refresh(section)
    return section


@router.delete(
    "/sections/{section_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["sections"],
)
def delete_section(section_id: str, session: SessionDependency) -> Response:
    session.delete(require_section(session, section_id))
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/collectible-types",
    response_model=list[CollectibleTypeRead],
    tags=["collectible-types"],
)
def list_collectible_types(
    guide_id: str,
    session: SessionDependency,
) -> list[CollectibleType]:
    require_guide(session, guide_id)
    statement = (
        select(CollectibleType)
        .where(CollectibleType.guide_id == guide_id)
        .order_by(CollectibleType.position, CollectibleType.id)
    )
    return list(session.scalars(statement))


@router.post(
    "/collectible-types",
    response_model=CollectibleTypeRead,
    status_code=status.HTTP_201_CREATED,
    tags=["collectible-types"],
)
def create_collectible_type(
    payload: CollectibleTypeWrite,
    session: SessionDependency,
) -> CollectibleType:
    require_guide(session, payload.guide_id)
    collectible_type = CollectibleType(
        id=str(uuid4()),
        position=next_position(
            session,
            CollectibleType,
            "guide_id",
            payload.guide_id,
        ),
        **payload.model_dump(),
    )
    session.add(collectible_type)
    session.commit()
    session.refresh(collectible_type)
    return collectible_type


@router.get(
    "/collectible-types/{collectible_type_id}",
    response_model=CollectibleTypeRead,
    tags=["collectible-types"],
)
def get_collectible_type(
    collectible_type_id: str,
    session: SessionDependency,
) -> CollectibleType:
    return require_collectible_type(session, collectible_type_id)


@router.put(
    "/collectible-types/{collectible_type_id}",
    response_model=CollectibleTypeRead,
    tags=["collectible-types"],
)
def update_collectible_type(
    collectible_type_id: str,
    payload: CollectibleTypeWrite,
    session: SessionDependency,
) -> CollectibleType:
    collectible_type = require_collectible_type(session, collectible_type_id)
    require_guide(session, payload.guide_id)
    if collectible_type.guide_id != payload.guide_id:
        has_collectibles = session.scalar(
            select(Collectible.id).where(
                Collectible.collectible_type_id == collectible_type_id
            )
        )
        if has_collectibles:
            raise HTTPException(
                status_code=409,
                detail="Cannot move a collectible type that is in use",
            )
        collectible_type.position = next_position(
            session,
            CollectibleType,
            "guide_id",
            payload.guide_id,
        )
    for field, value in payload.model_dump().items():
        setattr(collectible_type, field, value)
    session.commit()
    session.refresh(collectible_type)
    return collectible_type


@router.delete(
    "/collectible-types/{collectible_type_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["collectible-types"],
)
def delete_collectible_type(
    collectible_type_id: str,
    session: SessionDependency,
) -> Response:
    collectible_type = require_collectible_type(session, collectible_type_id)
    has_collectibles = session.scalar(
        select(Collectible.id).where(
            Collectible.collectible_type_id == collectible_type_id
        )
    )
    if has_collectibles:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a collectible type that is in use",
        )
    session.delete(collectible_type)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/collectibles",
    response_model=list[CollectibleRead],
    tags=["collectibles"],
)
def list_collectibles(
    section_id: str,
    session: SessionDependency,
) -> list[Collectible]:
    require_section(session, section_id)
    statement = (
        select(Collectible)
        .where(Collectible.section_id == section_id)
        .order_by(Collectible.position, Collectible.id)
    )
    return list(session.scalars(statement))


@router.post(
    "/collectibles",
    response_model=CollectibleRead,
    status_code=status.HTTP_201_CREATED,
    tags=["collectibles"],
)
def create_collectible(
    payload: CollectibleWrite,
    session: SessionDependency,
) -> Collectible:
    validate_collectible_parents(
        session,
        payload.section_id,
        payload.collectible_type_id,
    )
    collectible = Collectible(
        id=str(uuid4()),
        position=next_position(
            session,
            Collectible,
            "section_id",
            payload.section_id,
        ),
        **payload.model_dump(mode="json"),
    )
    session.add(collectible)
    session.commit()
    session.refresh(collectible)
    return collectible


@router.get(
    "/collectibles/{collectible_id}",
    response_model=CollectibleRead,
    tags=["collectibles"],
)
def get_collectible(
    collectible_id: str,
    session: SessionDependency,
) -> Collectible:
    return require_collectible(session, collectible_id)


@router.put(
    "/collectibles/{collectible_id}",
    response_model=CollectibleRead,
    tags=["collectibles"],
)
def update_collectible(
    collectible_id: str,
    payload: CollectibleWrite,
    session: SessionDependency,
) -> Collectible:
    collectible = require_collectible(session, collectible_id)
    validate_collectible_parents(
        session,
        payload.section_id,
        payload.collectible_type_id,
    )
    if collectible.section_id != payload.section_id:
        collectible.position = next_position(
            session,
            Collectible,
            "section_id",
            payload.section_id,
        )
    for field, value in payload.model_dump(mode="json").items():
        setattr(collectible, field, value)
    session.commit()
    session.refresh(collectible)
    return collectible


@router.delete(
    "/collectibles/{collectible_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["collectibles"],
)
def delete_collectible(
    collectible_id: str,
    session: SessionDependency,
) -> Response:
    session.delete(require_collectible(session, collectible_id))
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
