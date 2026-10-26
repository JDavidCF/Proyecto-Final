
from sqlalchemy import String, Integer, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    codigo: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    categoria: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    precio: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    stock: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    marca: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    disponible: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
