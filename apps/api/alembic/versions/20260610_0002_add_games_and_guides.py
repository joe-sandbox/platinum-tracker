"""Add games and guides.

Revision ID: 20260610_0002
Revises: 20260610_0001
Create Date: 2026-06-10
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260610_0002"
down_revision: str | Sequence[str] | None = "20260610_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "games",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("platform", sa.String(length=100), nullable=True),
        sa.Column("edition", sa.String(length=100), nullable=True),
        sa.Column("cover_image_url", sa.String(length=2048), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_games_title", "games", ["title"], unique=False)

    op.create_table(
        "guides",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("game_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("source_url", sa.String(length=2048), nullable=True),
        sa.Column("source_name", sa.String(length=255), nullable=True),
        sa.Column("source_retrieved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_guides_game_id", "guides", ["game_id"], unique=False)
    op.create_index("ix_guides_title", "guides", ["title"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_guides_title", table_name="guides")
    op.drop_index("ix_guides_game_id", table_name="guides")
    op.drop_table("guides")
    op.drop_index("ix_games_title", table_name="games")
    op.drop_table("games")
