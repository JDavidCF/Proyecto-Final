from app.database.base import Base
from app.database.connection import engine

from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.venta import Venta
from app.models.movimiento import Movimiento
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido

Base.metadata.create_all(bind=engine)

print("Tablas creadas correctamente.")
