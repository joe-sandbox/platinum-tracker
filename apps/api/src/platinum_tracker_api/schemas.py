from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class GameWrite(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    platform: str | None = Field(default=None, max_length=100)
    edition: str | None = Field(default=None, max_length=100)
    cover_image_url: HttpUrl | None = None

    @field_validator("title", "platform", "edition", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None


class GameRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    platform: str | None
    edition: str | None
    cover_image_url: str | None
    created_at: datetime
    updated_at: datetime


class GuideWrite(BaseModel):
    game_id: str = Field(min_length=36, max_length=36)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    source_url: HttpUrl | None = None
    source_name: str | None = Field(default=None, max_length=255)

    @field_validator("game_id", "title", "description", "source_name", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None


class GuideRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    game_id: str
    title: str
    description: str | None
    source_url: str | None
    source_name: str | None
    source_retrieved_at: datetime | None
    created_at: datetime
    updated_at: datetime
