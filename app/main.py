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
    title="StockNova API",
    description="""
# StockNova - Sistema de Gestión de Inventario

API REST desarrollada para administrar y controlar
las operaciones de inventario de manera eficiente.

## Funcionalidades principales

- **Productos:** gestión y administración del catálogo.
- **Usuarios:** registro, autenticación y gestión de roles.
- **Ventas:** registro y consulta de operaciones de venta.
- **Movimientos:** control de entradas y ajustes de inventario.
- **Pedidos:** creación y gestión de pedidos.
- **Estadísticas:** consultas y análisis de información.
- **Asistente IA:** asistencia inteligente integrada al sistema.

## Seguridad

La API implementa autenticación mediante JWT,
encriptación de contraseñas y control de acceso
basado en roles (administrador, empleado y cliente).

## Tecnologías

FastAPI, Python, SQLAlchemy y PostgreSQL.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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
    return {
        "mensaje": "Bienvenido a StockNova API",
        "version": "1.0.0",
        "documentacion": "/docs"
    }