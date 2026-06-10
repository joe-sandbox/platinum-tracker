"""Add guide content hierarchy.

Revision ID: 20260610_0003
Revises: 20260610_0002
Create Date: 2026-06-10
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260610_0003"
down_revision: str | Sequence[str] | None = "20260610_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "chapters",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("guide_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["guide_id"], ["guides.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("guide_id", "position"),
    )
    op.create_index("ix_chapters_guide_id", "chapters", ["guide_id"])

    op.create_table(
        "sections",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("chapter_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["chapter_id"],
            ["chapters.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chapter_id", "position"),
    )
    op.create_index("ix_sections_chapter_id", "sections", ["chapter_id"])

    op.create_table(
        "collectible_types",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("guide_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("color", sa.String(length=50), nullable=True),
        sa.Column("icon", sa.String(length=100), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["guide_id"], ["guides.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("guide_id", "position"),
    )
    op.create_index(
        "ix_collectible_types_guide_id",
        "collectible_types",
        ["guide_id"],
    )

    op.create_table(
        "collectibles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("section_id", sa.String(length=36), nullable=False),
        sa.Column("collectible_type_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("source_url", sa.String(length=2048), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["collectible_type_id"],
            ["collectible_types.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["section_id"],
            ["sections.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("section_id", "position"),
    )
    op.create_index(
        "ix_collectibles_collectible_type_id",
        "collectibles",
        ["collectible_type_id"],
    )
    op.create_index("ix_collectibles_section_id", "collectibles", ["section_id"])


def downgrade() -> None:
    op.drop_index("ix_collectibles_section_id", table_name="collectibles")
    op.drop_index(
        "ix_collectibles_collectible_type_id",
        table_name="collectibles",
    )
    op.drop_table("collectibles")
    op.drop_index(
        "ix_collectible_types_guide_id",
        table_name="collectible_types",
    )
    op.drop_table("collectible_types")
    op.drop_index("ix_sections_chapter_id", table_name="sections")
    op.drop_table("sections")
    op.drop_index("ix_chapters_guide_id", table_name="chapters")
    op.drop_table("chapters")
