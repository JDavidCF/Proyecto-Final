
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.producto import Producto
from app.schemas.producto import ProductoCrear, ProductoRespuesta

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("/", response_model=list[ProductoRespuesta])
def mostrar_productos(db: Session = Depends(get_db)):
    return db.query(Producto).all()


@router.post("/", response_model=ProductoRespuesta, status_code=201)
def crear_producto(
    datos: ProductoCrear,
    db: Session = Depends(get_db)
):
    existente = db.query(Producto).filter(
        Producto.codigo == datos.codigo
    ).first()

    if existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un producto con ese codigo"
        )

    nuevo_producto = Producto(**datos.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return nuevo_producto


@router.get(
    "/categoria/{categoria}",
    response_model=list[ProductoRespuesta]
)
def consultar_por_categoria(
    categoria: str,
    db: Session = Depends(get_db)
):
    return db.query(Producto).filter(
        Producto.categoria.ilike(categoria)
    ).all()


@router.get("/{producto_id}", response_model=ProductoRespuesta)
def consultar_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.id == producto_id
    ).first()

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return producto


@router.put("/{producto_id}", response_model=ProductoRespuesta)
def actualizar_producto(
    producto_id: int,
    datos: ProductoCrear,
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.id == producto_id
    ).first()

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    existente = db.query(Producto).filter(
        Producto.codigo == datos.codigo,
        Producto.id != producto_id
    ).first()

    if existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe otro producto con ese codigo"
        )

    for campo, valor in datos.model_dump().items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)

    return producto


@router.delete("/{producto_id}")
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.id == producto_id
    ).first()

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    db.delete(producto)
    db.commit()

    return {
        "mensaje": "Producto eliminado correctamente",
        "producto_id": producto_id
    }
=======
@router.get("/{producto_id}")
def consultar_producto(producto_id: int):
    return {"mensaje": "Consultar producto"}


@router.get("/{codigo}")
def consultar_producto(codigo: str):
    return {
        "mensaje": "Producto consultado correctamente",
        "codigo": codigo

@router.get("/categoria/{categoria}")
def consultar_por_categoria(categoria: str):
    return {
        "mensaje": "Productos consultados por categoria",
        "categoria": categoria,
        "productos": []
    }
