from typing import Literal


from pydantic import BaseModel, ConfigDict, Field, EmailStr


class UsuarioCrear(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)


class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: str
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class UsuarioCambiarRol(BaseModel):
    rol: Literal["administrador", "empleado", "cliente"]
    activo: bool
    model_config = ConfigDict(from_attributes=True)
