from pydantic import BaseModel, Field, ConfigDict
from typing import Literal
from datetime import datetime


class DetallePedidoCrear(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)


class PedidoCrear(BaseModel):
    detalles: list[DetallePedidoCrear] = Field(min_length=1)


class DetallePedidoRespuesta(BaseModel):
    id: int
    producto_id: int
    nombre_producto: str
    cantidad: int
    precio_unitario: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


class PedidoRespuesta(BaseModel):
    id: int
    usuario_id: int
    fecha: datetime
    estado: str
    total: float
    detalles: list[DetallePedidoRespuesta]

    model_config = ConfigDict(from_attributes=True)


class PedidoCambiarEstado(BaseModel):
    estado: Literal["confirmado", "rechazado"]
