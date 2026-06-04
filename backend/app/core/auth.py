"""
Auth utilities: password hashing, JWT dependency.
"""
from fastapi import Header, HTTPException
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def get_current_user_id(authorization: str = Header(None)) -> str:
    """Extract user ID from JWT Bearer token.

    Falls back to dev user for backward compatibility.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return "00000000-0000-0000-0000-000000000001"

    token = authorization.replace("Bearer ", "")
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
