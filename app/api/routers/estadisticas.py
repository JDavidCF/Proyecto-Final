from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.database.connection import get_db
from app.models.producto import Producto
from app.models.venta import Venta
from app.models.usuario import Usuario
from app.core.dependencies import requerir_roles


router = APIRouter(
    prefix="/estadisticas",
    tags=["Estadisticas"]
)


# RESUMEN DEL INVENTARIO (SOLO ADMINISTRADOR)
@router.get("/resumen")
def resumen_inventario(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador")
    )
):

    total_productos = db.query(Producto).count()

    productos_stock_bajo = db.query(Producto).filter(
        Producto.stock > 0,
        Producto.stock <= 5
    ).count()

    productos_agotados = db.query(Producto).filter(
        Producto.stock == 0
    ).count()

    total_ventas = db.query(Venta).count()

    ingresos_totales = db.query(
        Venta.total
    ).all()

    ingresos = sum(
        venta[0] for venta in ingresos_totales
    )

    return {
        "total_productos": total_productos,
        "productos_stock_bajo": productos_stock_bajo,
        "productos_agotados": productos_agotados,
        "total_ventas": total_ventas,
        "ingresos_totales": ingresos
    }


# PRODUCTOS MAS VENDIDOS (SOLO ADMINISTRADOR)
@router.get("/productos-mas-vendidos")
def productos_mas_vendidos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador")
    )
):

    resultados = db.query(
        Producto.id,
        Producto.nombre,
        func.sum(Venta.cantidad).label("unidades_vendidas"),
        func.sum(Venta.total).label("ingresos_generados")
    ).join(
        Venta,
        Producto.id == Venta.producto_id
    ).group_by(
        Producto.id,
        Producto.nombre
    ).order_by(
        func.sum(Venta.cantidad).desc()
    ).all()

    return [
        {
            "producto_id": resultado.id,
            "nombre": resultado.nombre,
            "unidades_vendidas": resultado.unidades_vendidas,
            "ingresos_generados": float(resultado.ingresos_generados)
        }
        for resultado in resultados
    ]


# INGRESOS POR FECHA (SOLO ADMINISTRADOR)
@router.get("/ingresos-por-fecha")
def ingresos_por_fecha(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador")
    )
):

    resultados = db.query(
        cast(Venta.fecha, Date).label("fecha"),
        func.sum(Venta.total).label("ingresos")
    ).group_by(
        cast(Venta.fecha, Date)
    ).order_by(
        cast(Venta.fecha, Date).desc()
    ).all()

    return [
        {
            "fecha": str(resultado.fecha),
            "ingresos": float(resultado.ingresos)
        }
        for resultado in resultados
    ]


# PRODUCTOS CON STOCK BAJO (SOLO ADMINISTRADOR)
@router.get("/productos-stock-bajo")
def productos_stock_bajo(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador")
    )
):

    productos = db.query(Producto).filter(
        Producto.stock > 0,
        Producto.stock <= 10
    ).order_by(
        Producto.stock.asc()
    ).all()

    return [
        {
            "producto_id": producto.id,
            "nombre": producto.nombre,
            "stock": producto.stock,
            "categoria": producto.categoria
        }
        for producto in productos
    ]
