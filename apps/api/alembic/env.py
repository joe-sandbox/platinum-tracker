from logging.config import fileConfig

from alembic import context
from platinum_tracker_api.config import get_settings
from platinum_tracker_api.db import Base, create_database_engine
from platinum_tracker_api.models import (
    Chapter,
    Collectible,
    CollectibleType,
    Game,
    Guide,
    Section,
)

_models = (Game, Guide, Chapter, Section, CollectibleType, Collectible)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()
settings.ensure_storage_directories()
config.set_main_option("sqlalchemy.url", settings.database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_database_engine(settings)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
