from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Rol(Base):
    __tablename__ = "roles"

    nombre: Mapped[str] = mapped_column(
        String(20),
        primary_key=True
    )

    usuarios = relationship(
        "Usuario",
        back_populates="rol_relacion"
    )
