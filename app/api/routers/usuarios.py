from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.rol import Rol
from app.models.usuario import Usuario

from app.schemas.usuario import (
    UsuarioCrear,
    UsuarioRespuesta,
    UsuarioLogin,
    UsuarioCambiarRol
)

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token
)

from app.core.dependencies import (
    obtener_usuario_actual,
    requerir_roles
)


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)




@router.post(
    "/registro",
    response_model=UsuarioRespuesta,
    status_code=201
)
def registrar_usuario(
    datos: UsuarioCrear,
    db: Session = Depends(get_db)
):

    existente = db.query(Usuario).filter(
        Usuario.email == datos.email
    ).first()

    if existente:
        raise HTTPException(
            status_code=400,
            detail="El correo ya esta registrado"
        )

    password_hash = get_password_hash(datos.password)

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        password_hash=password_hash,
        rol="cliente"
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario



@router.post("/login")
def iniciar_sesion(
    datos: UsuarioLogin,
    db: Session = Depends(get_db)
):

    usuario = db.query(Usuario).filter(
        Usuario.email == datos.email
    ).first()

    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    contraseña_valida = verify_password(
        datos.password,
        usuario.password_hash
    )

    if not contraseña_valida:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=403,
            detail="El usuario esta desactivado"
        )

    token = create_access_token(
        {"sub": str(usuario.id)}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": usuario.rol
    }



@router.get("/me", response_model=UsuarioRespuesta)
def mi_perfil(
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    return usuario




@router.get("/", response_model=list[UsuarioRespuesta])
def listar_usuarios(
    db: Session = Depends(get_db),
    administrador: Usuario = Depends(
        requerir_roles("administrador")
    )
):

    usuarios = db.query(Usuario).all()

    return usuarios


@router.patch("/{usuario_id}/rol", response_model=UsuarioRespuesta)
def cambiar_rol(
    usuario_id: int,
    datos: UsuarioCambiarRol,
    db: Session = Depends(get_db),
    administrador: Usuario = Depends(
        requerir_roles("administrador")
    )
):

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if usuario.activo and usuario.rol == "administrador" and datos.rol != "administrador":

        administradores = db.query(Usuario).filter(
            Usuario.rol == "administrador",
            Usuario.activo == True
        ).count()

        if administradores <= 1:
            raise HTTPException(
                status_code=400,
                detail="No puedes quitar el rol al ultimo administrador activo"
            )

    usuario.rol = datos.rol

    db.commit()
    db.refresh(usuario)

    return usuario