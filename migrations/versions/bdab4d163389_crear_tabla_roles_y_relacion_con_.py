"""crear tabla roles y relacion con usuarios

Revision ID: bdab4d163389
Revises:
Create Date: 2026-11-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'bdab4d163389'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    
    op.create_table(
        'roles',
        sa.Column('nombre', sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint('nombre')
    )

    
    roles = sa.table(
        'roles',
        sa.column('nombre', sa.String(length=20))
    )

    op.bulk_insert(
        roles,
        [
            {'nombre': 'administrador'},
            {'nombre': 'empleado'},
            {'nombre': 'cliente'}
        ]
    )

    op.create_foreign_key(
        'fk_usuarios_rol_roles',
        'usuarios',
        'roles',
        ['rol'],
        ['nombre']
    )


def downgrade() -> None:

    op.drop_constraint(
        'fk_usuarios_rol_roles',
        'usuarios',
        type_='foreignkey'
    )

    op.drop_table('roles')
