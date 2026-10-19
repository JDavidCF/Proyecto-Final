from fastapi import FastAPI
from app.api.routers import productos

app = FastAPI(
    title="Sistema de Inventario"
)

app.include_router(productos.router)


@app.get("/")
def inicio():
    return {"mensaje": "Sistema de Inventario"}