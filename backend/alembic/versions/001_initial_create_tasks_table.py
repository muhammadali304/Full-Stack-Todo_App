"""Create tasks table

Revision ID: 001_initial
Revises:
Create Date: 2026-01-11 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create tasks table with all fields, constraints, and indexes.

    Table: tasks
    - id: UUID primary key (auto-generated)
    - title: VARCHAR(200), required, non-empty
    - description: TEXT, optional, max 2000 chars
    - completed: BOOLEAN, default false
    - user_id: UUID, nullable, indexed (for future multi-user support)
    - created_at: TIMESTAMP, auto-generated on insert
    - updated_at: TIMESTAMP, auto-generated on insert/update

    Indexes:
    - Primary key on id (automatic)
    - Index on user_id (for future multi-user queries)
    - Index on created_at DESC (for ordering by newest first)
    """
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("LENGTH(TRIM(title)) >= 1 AND LENGTH(title) <= 200", name='check_title_length'),
        sa.CheckConstraint("description IS NULL OR LENGTH(description) <= 2000", name='check_description_length')
    )

    # Create index on user_id for future multi-user queries
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'], unique=False)

    # Create index on created_at DESC for ordering by newest first
    op.create_index('idx_tasks_created_at', 'tasks', [sa.text('created_at DESC')], unique=False)


def downgrade() -> None:
    """
    Drop tasks table and all associated indexes.

    Rollback procedure:
    1. Drop indexes (idx_tasks_created_at, idx_tasks_user_id)
    2. Drop tasks table

    Note: This will permanently delete all task data.
    """
    # Drop indexes first
    op.drop_index('idx_tasks_created_at', table_name='tasks')
    op.drop_index('idx_tasks_user_id', table_name='tasks')

    # Drop tasks table
    op.drop_table('tasks')
