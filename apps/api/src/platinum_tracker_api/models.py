from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from platinum_tracker_api.db import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class Game(Base):
    __tablename__ = "games"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    platform: Mapped[str | None] = mapped_column(String(100))
    edition: Mapped[str | None] = mapped_column(String(100))
    cover_image_url: Mapped[str | None] = mapped_column(String(2048))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    guides: Mapped[list["Guide"]] = relationship(
        back_populates="game",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Guide(Base):
    __tablename__ = "guides"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    game_id: Mapped[str] = mapped_column(
        ForeignKey("games.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text())
    source_url: Mapped[str | None] = mapped_column(String(2048))
    source_name: Mapped[str | None] = mapped_column(String(255))
    source_retrieved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    game: Mapped[Game] = relationship(back_populates="guides")
    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="guide",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    collectible_types: Mapped[list["CollectibleType"]] = relationship(
        back_populates="guide",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Chapter(Base):
    __tablename__ = "chapters"
    __table_args__ = (UniqueConstraint("guide_id", "position"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    guide_id: Mapped[str] = mapped_column(
        ForeignKey("guides.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text())
    position: Mapped[int] = mapped_column(Integer())

    guide: Mapped[Guide] = relationship(back_populates="chapters")
    sections: Mapped[list["Section"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (UniqueConstraint("chapter_id", "position"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    chapter_id: Mapped[str] = mapped_column(
        ForeignKey("chapters.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text())
    position: Mapped[int] = mapped_column(Integer())

    chapter: Mapped[Chapter] = relationship(back_populates="sections")
    collectibles: Mapped[list["Collectible"]] = relationship(
        back_populates="section",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class CollectibleType(Base):
    __tablename__ = "collectible_types"
    __table_args__ = (UniqueConstraint("guide_id", "position"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    guide_id: Mapped[str] = mapped_column(
        ForeignKey("guides.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255))
    color: Mapped[str | None] = mapped_column(String(50))
    icon: Mapped[str | None] = mapped_column(String(100))
    position: Mapped[int] = mapped_column(Integer())

    guide: Mapped[Guide] = relationship(back_populates="collectible_types")
    collectibles: Mapped[list["Collectible"]] = relationship(
        back_populates="collectible_type",
        passive_deletes=True,
    )


class Collectible(Base):
    __tablename__ = "collectibles"
    __table_args__ = (UniqueConstraint("section_id", "position"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    section_id: Mapped[str] = mapped_column(
        ForeignKey("sections.id", ondelete="CASCADE"),
        index=True,
    )
    collectible_type_id: Mapped[str] = mapped_column(
        ForeignKey("collectible_types.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text())
    position: Mapped[int] = mapped_column(Integer())
    source_url: Mapped[str | None] = mapped_column(String(2048))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    section: Mapped[Section] = relationship(back_populates="collectibles")
    collectible_type: Mapped[CollectibleType] = relationship(
        back_populates="collectibles"
    )
