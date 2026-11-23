from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import (
    asistente,
    estadisticas,
    movimientos,
    pedidos,
    productos,
    usuarios,
    ventas,
)

app = FastAPI(
    title="Sistema de Inventario",
    description=":)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://proyecto-final-jdavidcf.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(productos.router)
app.include_router(usuarios.router)
app.include_router(ventas.router)
app.include_router(movimientos.router)
app.include_router(estadisticas.router)
app.include_router(pedidos.router)
app.include_router(asistente.router)


@app.get("/")
def inicio():
    return {"mensaje": "Sistema de Inventario"}