
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.venta import Venta
from app.models.movimiento import Movimiento

from app.schemas.pedido import (
    PedidoCrear,
    PedidoRespuesta
)

from app.core.dependencies import (
    obtener_usuario_actual,
    requerir_roles
)


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


# CREAR PEDIDO (SOLO CLIENTES)
@router.post("/", response_model=PedidoRespuesta, status_code=201)
def crear_pedido(
    datos: PedidoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente"))
):
    productos_pedido = {}

    for detalle in datos.detalles:
        producto = db.query(Producto).filter(
            Producto.id == detalle.producto_id
        ).first()

        if producto is None or not producto.disponible:
            raise HTTPException(
                status_code=404,
                detail=f"Producto {detalle.producto_id} no disponible"
            )

        if detalle.producto_id not in productos_pedido:
            productos_pedido[detalle.producto_id] = {
                "producto": producto,
                "cantidad": 0
            }

        productos_pedido[detalle.producto_id]["cantidad"] += detalle.cantidad

    pedido = Pedido(
        usuario_id=usuario.id,
        estado="pendiente",
        total=0
    )

    total = Decimal("0.00")

    db.add(pedido)
    db.flush()

    for informacion in productos_pedido.values():
        producto = informacion["producto"]
        cantidad = informacion["cantidad"]

        precio = Decimal(str(producto.precio))
        subtotal = precio * cantidad

        detalle_pedido = DetallePedido(
            pedido_id=pedido.id,
            producto_id=producto.id,
            nombre_producto=producto.nombre,
            cantidad=cantidad,
            precio_unitario=precio,
            subtotal=subtotal
        )

        db.add(detalle_pedido)
        total += subtotal

    pedido.total = total

    db.commit()
    db.refresh(pedido)

    return pedido


# CONSULTAR PEDIDOS PROPIOS (SOLO CLIENTES)
@router.get("/mis-pedidos", response_model=list[PedidoRespuesta])
def mis_pedidos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente"))
):
    return db.query(Pedido).filter(
        Pedido.usuario_id == usuario.id
    ).order_by(Pedido.fecha.desc()).all()


# CONSULTAR TODOS LOS PEDIDOS (EMPLEADOS Y ADMINISTRADORES)
@router.get("/", response_model=list[PedidoRespuesta])
def listar_pedidos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):
    return db.query(Pedido).order_by(
        Pedido.fecha.desc()
    ).all()


# CONSULTAR UN PEDIDO
@router.get("/{pedido_id}", response_model=PedidoRespuesta)
def obtener_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    pedido = db.query(Pedido).filter(
        Pedido.id == pedido_id
    ).first()

    if pedido is None:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    if usuario.rol == "cliente" and pedido.usuario_id != usuario.id:
        raise HTTPException(
            status_code=403,
            detail="No puedes consultar pedidos de otros usuarios"
        )

    if usuario.rol not in ["cliente", "empleado", "administrador"]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para consultar pedidos"
        )

    return pedido


# CONFIRMAR PEDIDO (EMPLEADOS Y ADMINISTRADORES)
@router.patch("/{pedido_id}/confirmar")
def confirmar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):
    pedido = db.query(Pedido).filter(
        Pedido.id == pedido_id
    ).first()

    if pedido is None:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    if pedido.estado != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="El pedido ya fue procesado"
        )

    # Comprobar todo el stock antes de modificarlo
    productos = []

    for detalle in pedido.detalles:
        producto = db.query(Producto).filter(
            Producto.id == detalle.producto_id
        ).first()

        if producto is None or not producto.disponible:
            raise HTTPException(
                status_code=400,
                detail=f"El producto {detalle.nombre_producto} no está disponible"
            )

        if producto.stock < detalle.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {producto.nombre}"
            )

        productos.append((producto, detalle))

    # Registrar ventas y movimientos
    for producto, detalle in productos:
        stock_anterior = producto.stock
        producto.stock -= detalle.cantidad

        nueva_venta = Venta(
            producto_id=producto.id,
            usuario_id=pedido.usuario_id,
            cantidad=detalle.cantidad,
            precio_unitario=detalle.precio_unitario,
            total=detalle.subtotal
        )

        movimiento = Movimiento(
            producto_id=producto.id,
            usuario_id=usuario.id,
            tipo="salida",
            cantidad=detalle.cantidad,
            stock_anterior=stock_anterior,
            stock_nuevo=producto.stock
        )

        db.add(nueva_venta)
        db.add(movimiento)

    pedido.estado = "confirmado"

    db.commit()
    db.refresh(pedido)

    return {
        "mensaje": "Pedido confirmado correctamente",
        "pedido": pedido
    }


# RECHAZAR PEDIDO (EMPLEADOS Y ADMINISTRADORES)
@router.patch("/{pedido_id}/rechazar")
def rechazar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        requerir_roles("administrador", "empleado")
    )
):
    pedido = db.query(Pedido).filter(
        Pedido.id == pedido_id
    ).first()

    if pedido is None:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    if pedido.estado != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="El pedido ya fue procesado"
        )

    pedido.estado = "rechazado"

    db.commit()
    db.refresh(pedido)

    return {
        "mensaje": "Pedido rechazado correctamente",
        "pedido": pedido
    }
