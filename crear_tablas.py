from app.database.base import Base
from app.database.connection import engine

from app.models.producto import Producto
from app.models.usuario import Usuario

Base.metadata.create_all(bind=engine)

print("Tablas creadas correctamente.")