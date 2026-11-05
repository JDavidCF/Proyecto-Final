from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

class MovimientoEntrada(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)


class MovimientoRespuesta(BaseModel):
    id: int
    producto_id: int
    usuario_id: int
    tipo: str
    cantidad: int
    stock_anterior: int
    stock_nuevo: int
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)

class MovimientoAjuste(BaseModel):
    producto_id: int = Field(gt=0)
    stock_nuevo: int = Field(ge=0)