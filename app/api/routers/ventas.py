
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.producto import Producto
from app.models.venta import Venta
from app.models.usuario import Usuario
from app.schemas.venta import VentaCrear, VentaRespuesta
from app.core.dependencies import requerir_roles

from app.models.movimiento import Movimiento


router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"]
)


@router.post("/", response_model=VentaRespuesta, status_code=201)
def registrar_venta(
    datos: VentaCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):

    producto = db.query(Producto).filter(
        Producto.id == datos.producto_id
    ).first()

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    if not producto.disponible:
        raise HTTPException(
            status_code=400,
            detail="El producto no esta disponible"
        )

    if producto.stock < datos.cantidad:
        raise HTTPException(
            status_code=400,
            detail="No hay suficiente stock"
        )

    precio = producto.precio
    total = precio * datos.cantidad

    stock_anterior = producto.stock

    nueva_venta = Venta(
        producto_id=producto.id,
        usuario_id=usuario.id,
        cantidad=datos.cantidad,
        precio_unitario=precio,
        total=total
    )

    producto.stock -= datos.cantidad

    nuevo_movimiento = Movimiento(
        producto_id=producto.id,
        usuario_id=usuario.id,
        tipo="salida",
        cantidad=datos.cantidad,
        stock_anterior=stock_anterior,
        stock_nuevo=producto.stock
    )

    db.add(nuevo_movimiento)
    db.add(nueva_venta)

    db.commit()
    db.refresh(nueva_venta)

    return nueva_venta


@router.get("/", response_model=list[VentaRespuesta])
def mostrar_ventas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):

    ventas = db.query(Venta).order_by(
        Venta.fecha.desc()
    ).all()

    return ventas


@router.get("/{venta_id}", response_model=VentaRespuesta)
def consultar_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):

    venta = db.query(Venta).filter(
        Venta.id == venta_id
    ).first()

    if venta is None:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada"
        )

    return venta
