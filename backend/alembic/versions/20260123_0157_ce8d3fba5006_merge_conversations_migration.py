"""merge conversations migration

Revision ID: ce8d3fba5006
Revises: 2c8ba9830f31
Create Date: 2026-01-23 01:57:53.188733

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'ce8d3fba5006'
down_revision: Union[str, None] = '2c8ba9830f31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
