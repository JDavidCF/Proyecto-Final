import os
from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash
import bcrypt

import jwt
from dotenv import load_dotenv


load_dotenv()

password_hash_legacy = PasswordHash.recommended()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30



def get_password_hash(password: str):
    password_bytes = password.encode("utf-8")

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str):

    password_bytes = password.encode("utf-8")


    if hashed_password.startswith(("$2a$", "$2b$", "$2y$")):

        return bcrypt.checkpw(
            password_bytes,
            hashed_password.encode("utf-8")
        )

  
    try:
        return password_hash_legacy.verify(
            password,
            hashed_password
        )
    except Exception:
        return False


def create_access_token(data: dict):
    datos = data.copy()

    expiracion = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    datos.update({"exp": expiracion})

    if not SECRET_KEY:
        raise RuntimeError("No se ha configurado JWT_SECRET_KEY")

    token = jwt.encode(
        datos,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token

def decode_access_token(token: str):
    if not SECRET_KEY:
        raise RuntimeError("No se ha configurado JWT_SECRET_KEY")

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except jwt.InvalidTokenError:
        return None