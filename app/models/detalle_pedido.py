from sqlalchemy import Integer, Numeric, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class DetallePedido(Base):
    __tablename__ = "detalles_pedido"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    pedido_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=False
    )

    producto_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False
    )

    nombre_producto: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    cantidad: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    precio_unitario: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    subtotal: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    pedido = relationship(
        "Pedido",
        back_populates="detalles"
    )

    producto = relationship("Producto")
