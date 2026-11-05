from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.usuario import Usuario
from app.core.security import decode_access_token


security = HTTPBearer(auto_error=False)


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    if credenciales is None:
        raise HTTPException(
            status_code=401,
            detail="No has iniciado sesion"
        )

    token = credenciales.credentials

    datos = decode_access_token(token)

    if datos is None:
        raise HTTPException(
            status_code=401,
            detail="Token invalido o expirado"
        )

    usuario_id = datos.get("sub")

    if usuario_id is None:
        raise HTTPException(
            status_code=401,
            detail="Token invalido"
        )

    try:
        usuario_id = int(usuario_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Token invalido"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if usuario is None or not usuario.activo:
        raise HTTPException(
            status_code=401,
            detail="Usuario no valido"
        )

    return usuario

def requerir_roles(*roles_permitidos):

    def verificar_rol(
        usuario: Usuario = Depends(obtener_usuario_actual)
    ):
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para realizar esta accion"
            )

        return usuario

    return verificar_rol