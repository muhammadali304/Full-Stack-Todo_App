"""merge conversations migration with main branch

Revision ID: 62d146c63b5c
Revises: 243ad2a328b8, 25eb4c10c772
Create Date: 2026-01-23 02:17:31.002248

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '62d146c63b5c'
down_revision: Union[str, None] = ('243ad2a328b8', '25eb4c10c772')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This is a merge migration, no database changes needed
    pass


def downgrade() -> None:
    # This is a merge migration, no database changes needed
    pass
