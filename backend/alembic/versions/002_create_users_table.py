"""Create users table and add user_id foreign key to tasks

Revision ID: 002_create_users
Revises: 001_initial
Create Date: 2026-01-11 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_create_users'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create users table and establish user-task relationship.

    Changes:
    1. Create users table with authentication fields
    2. Add foreign key constraint from tasks.user_id to users.id
    3. Make tasks.user_id NOT NULL (requires empty tasks table or manual data migration)
    4. Create indexes for efficient queries

    Table: users
    - id: UUID primary key (auto-generated)
    - email: VARCHAR(255), unique, indexed (case-insensitive)
    - username: VARCHAR(30), unique, indexed (case-sensitive)
    - password_hash: VARCHAR(255), required (bcrypt hash)
    - created_at: TIMESTAMP, auto-generated
    - updated_at: TIMESTAMP, auto-generated

    Indexes:
    - Unique index on LOWER(email) for case-insensitive email lookups
    - Unique index on username for case-sensitive username lookups
    - Index on tasks.user_id for filtering user's tasks
    - Composite index on (user_id, created_at DESC) for efficient sorting

    Note: This migration will FAIL if there are existing tasks with NULL user_id.
    Either delete existing tasks or manually assign them to a user before running this migration.
    """
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=30), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint(
            "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'",
            name='check_email_format'
        ),
        sa.CheckConstraint(
            "username ~* '^[a-zA-Z0-9_]{3,30}$'",
            name='check_username_format'
        )
    )

    # Create unique index on email (case-insensitive)
    op.create_index(
        'idx_users_email',
        'users',
        [sa.text('LOWER(email)')],
        unique=True
    )

    # Create unique index on username (case-sensitive)
    op.create_index('idx_users_username', 'users', ['username'], unique=True)

    # Delete any existing tasks with NULL user_id (development environment)
    # This is necessary because we're making user_id NOT NULL
    op.execute("DELETE FROM tasks WHERE user_id IS NULL")

    # Make tasks.user_id NOT NULL
    op.alter_column('tasks', 'user_id', nullable=False)

    # Add foreign key constraint from tasks.user_id to users.id
    op.create_foreign_key(
        'fk_tasks_user_id',
        'tasks',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )

    # Drop the old created_at index (we'll replace it with a composite index)
    op.drop_index('idx_tasks_created_at', table_name='tasks')

    # Create composite index on (user_id, created_at DESC) for efficient user task queries
    op.create_index(
        'idx_tasks_user_created',
        'tasks',
        [sa.text('user_id'), sa.text('created_at DESC')],
        unique=False
    )


def downgrade() -> None:
    """
    Rollback users table creation and user-task relationship.

    Rollback procedure:
    1. Drop composite index on tasks (user_id, created_at)
    2. Recreate original created_at index
    3. Drop foreign key constraint from tasks.user_id
    4. Make tasks.user_id nullable again
    5. Drop indexes on users table
    6. Drop users table

    Note: This will permanently delete all user data and orphan all tasks.
    """
    # Drop composite index on tasks
    op.drop_index('idx_tasks_user_created', table_name='tasks')

    # Recreate original created_at index
    op.create_index('idx_tasks_created_at', 'tasks', [sa.text('created_at DESC')], unique=False)

    # Drop foreign key constraint
    op.drop_constraint('fk_tasks_user_id', 'tasks', type_='foreignkey')

    # Make tasks.user_id nullable again
    op.alter_column('tasks', 'user_id', nullable=True)

    # Drop indexes on users table
    op.drop_index('idx_users_username', table_name='users')
    op.drop_index('idx_users_email', table_name='users')

    # Drop users table
    op.drop_table('users')
