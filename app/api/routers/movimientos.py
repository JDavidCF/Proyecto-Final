from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.movimiento import Movimiento
from app.models.usuario import Usuario
from app.models.producto import Producto

from app.schemas.movimiento import (
    MovimientoRespuesta,
    MovimientoEntrada,
    MovimientoAjuste
)

from app.core.dependencies import requerir_roles


router = APIRouter(
    prefix="/movimientos",
    tags=["Movimientos"]
)

@router.post("/entrada", response_model=MovimientoRespuesta, status_code=201)
def registrar_entrada(
    datos: MovimientoEntrada,
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

    stock_anterior = producto.stock

    producto.stock += datos.cantidad

    nuevo_movimiento = Movimiento(
        producto_id=producto.id,
        usuario_id=usuario.id,
        tipo="entrada",
        cantidad=datos.cantidad,
        stock_anterior=stock_anterior,
        stock_nuevo=producto.stock
    )

    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)

    return nuevo_movimiento


@router.post("/ajuste", response_model=MovimientoRespuesta, status_code=201)
def ajustar_inventario(
    datos: MovimientoAjuste,
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

    stock_anterior = producto.stock

    producto.stock = datos.stock_nuevo

    nuevo_movimiento = Movimiento(
        producto_id=producto.id,
        usuario_id=usuario.id,
        tipo="ajuste",
        cantidad=abs(datos.stock_nuevo - stock_anterior),
        stock_anterior=stock_anterior,
        stock_nuevo=producto.stock
    )

    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)

    return nuevo_movimiento


@router.get("/", response_model=list[MovimientoRespuesta])
def mostrar_movimientos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):

    movimientos = db.query(Movimiento).order_by(
        Movimiento.fecha.desc()
    ).all()

    return movimientos


@router.get("/producto/{producto_id}", response_model=list[MovimientoRespuesta])
def movimientos_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):

    movimientos = db.query(Movimiento).filter(
        Movimiento.producto_id == producto_id
    ).order_by(Movimiento.fecha.desc()).all()

    if not movimientos:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron movimientos para este producto"
        )

    return movimientos


@router.get("/usuario/{usuario_id}", response_model=list[MovimientoRespuesta])
def movimientos_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):

    movimientos = db.query(Movimiento).filter(
        Movimiento.usuario_id == usuario_id
    ).order_by(Movimiento.fecha.desc()).all()

    if not movimientos:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron movimientos para este usuario"
        )

    return movimientos
