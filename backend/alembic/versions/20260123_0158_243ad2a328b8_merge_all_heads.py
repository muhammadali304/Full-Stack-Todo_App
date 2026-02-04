"""merge all heads

Revision ID: 243ad2a328b8
Revises: adcfcd41f998, ce8d3fba5006
Create Date: 2026-01-23 01:58:28.105677

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '243ad2a328b8'
down_revision: Union[str, None] = ('adcfcd41f998', 'ce8d3fba5006')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
