
from pydantic import BaseModel, ConfigDict, Field


class ProductoCrear(BaseModel):
    codigo: str = Field(min_length=1, max_length=50)
    nombre: str = Field(min_length=1, max_length=100)
    categoria: str = Field(min_length=1, max_length=100)
    precio: float = Field(gt=0)
    stock: int = Field(ge=0)
    marca: str = Field(min_length=1, max_length=100)
    disponible: bool = True


class ProductoRespuesta(ProductoCrear):
    id: int

    model_config = ConfigDict(from_attributes=True)
