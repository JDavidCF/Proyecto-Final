from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.movimiento import Movimiento
from app.models.usuario import Usuario
from app.schemas.movimiento import MovimientoRespuesta
from app.core.dependencies import obtener_usuario_actual


router = APIRouter(
    prefix="/movimientos",
    tags=["Movimientos"]
)


# Consultar todos los movimientos
@router.get("/", response_model=list[MovimientoRespuesta])
def mostrar_movimientos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    movimientos = db.query(Movimiento).order_by(
        Movimiento.fecha.desc()
    ).all()

    return movimientos


# Consultar movimientos de un producto
@router.get("/producto/{producto_id}", response_model=list[MovimientoRespuesta])
def movimientos_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
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


# Consultar movimientos de un usuario
@router.get("/usuario/{usuario_id}", response_model=list[MovimientoRespuesta])
def movimientos_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
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
