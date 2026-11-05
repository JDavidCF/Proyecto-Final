from fastapi import FastAPI
from app.api.routers import productos, usuarios, ventas, movimientos, estadisticas, pedidos


app = FastAPI(
    title="Sistema de Inventario"
)

app.include_router(productos.router)
app.include_router(usuarios.router)
app.include_router(ventas.router)
app.include_router(movimientos.router)
app.include_router(estadisticas.router)
app.include_router(pedidos.router)


@app.get("/")
def inicio():
    return {"mensaje": "Sistema de Inventario"}