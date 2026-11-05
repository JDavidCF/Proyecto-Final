from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VentaCrear(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)


class VentaRespuesta(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    total: float
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)