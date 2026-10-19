from fastapi import APIRouter

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("/")
def mostrar_productos():
    return {"mensaje": "Lista de productos"}


@router.post("/")
def crear_producto():
    return {"mensaje": "Crear producto"}


@router.get("/{producto_id}")
def consultar_producto(producto_id: int):
    return {"mensaje": "Consultar producto"}

@router.get("/categoria/{categoria}")
def consultar_por_categoria(categoria: str):
    return {
        "mensaje": "Productos consultados por categoria",
        "categoria": categoria,
        "productos": []
    }