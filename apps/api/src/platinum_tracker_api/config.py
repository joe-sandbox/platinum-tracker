from pathlib import Path

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


def default_project_root() -> Path:
    return Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="PLATINUM_TRACKER_",
        env_file=".env",
        extra="ignore",
    )

    project_root: Path = default_project_root()
    data_dir: Path | None = None
    media_dir: Path | None = None
    source_dir: Path | None = None
    database_path: Path | None = None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def resolved_data_dir(self) -> Path:
        return (self.data_dir or self.project_root / "data").resolve()

    @computed_field  # type: ignore[prop-decorator]
    @property
    def resolved_media_dir(self) -> Path:
        return (self.media_dir or self.project_root / "media").resolve()

    @computed_field  # type: ignore[prop-decorator]
    @property
    def resolved_source_dir(self) -> Path:
        return (self.source_dir or self.project_root / "imports").resolve()

    @computed_field  # type: ignore[prop-decorator]
    @property
    def resolved_database_path(self) -> Path:
        return (
            self.database_path or self.resolved_data_dir / "platinum-tracker.db"
        ).resolve()

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.resolved_database_path.as_posix()}"

    def ensure_storage_directories(self) -> None:
        for directory in (
            self.resolved_data_dir,
            self.resolved_media_dir,
            self.resolved_source_dir,
            self.resolved_database_path.parent,
        ):
            directory.mkdir(parents=True, exist_ok=True)


def get_settings() -> Settings:
    return Settings()
