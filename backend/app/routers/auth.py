"""
用户认证 API Router.
"""
import re
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt
from pydantic import BaseModel, Field
import httpx

from app.database import get_db
from app.models.user import User
from app.config import get_settings
from app.core.auth import hash_password, verify_password, get_current_user_id

router = APIRouter(prefix="/api/auth", tags=["认证"])

PHONE_RE = re.compile(r"^1[3-9]\d{9}$")


# --- Request/Response Models ---

class RegisterRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=6, max_length=64)
    sms_code: str = Field(..., min_length=4, max_length=6)


class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=6, max_length=64)


class SendSmsRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11)


# --- Helpers ---

def _create_token(user_id: uuid.UUID, settings) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _user_response(user: User, token: str) -> dict:
    return {
        "id": str(user.id),
        "nickname": user.nickname,
        "avatar_url": user.avatar_url,
        "phone": user.phone,
        "token": token,
    }


def _validate_phone(phone: str):
    if not PHONE_RE.match(phone):
        raise HTTPException(status_code=400, detail="手机号格式不正确")


# --- Endpoints ---

@router.post("/send-sms")
async def send_sms(req: SendSmsRequest):
    """发送短信验证码。Dev 模式下直接返回成功，验证码为 000000。"""
    _validate_phone(req.phone)
    settings = get_settings()

    if not settings.SMS_API_KEY:
        return {"ok": True, "message": "dev mode — use 000000"}

    # Real SMS gateway (placeholder)
    raise HTTPException(status_code=500, detail="SMS service not configured")


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """手机号 + 密码 + 验证码注册。"""
    _validate_phone(req.phone)
    settings = get_settings()

    # Verify SMS code (dev: 000000)
    if not settings.SMS_API_KEY:
        if req.sms_code != "000000":
            raise HTTPException(status_code=400, detail="验证码错误（dev 模式请输入 000000）")
    # else: verify against Redis

    # Check uniqueness
    existing = await db.execute(select(User).where(User.phone == req.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="该手机号已注册")

    user = User(
        phone=req.phone,
        password_hash=hash_password(req.password),
        nickname=f"用户{req.phone[-4:]}",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = _create_token(user.id, settings)
    return _user_response(user, token)


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """手机号 + 密码登录。"""
    _validate_phone(req.phone)
    settings = get_settings()

    result = await db.execute(select(User).where(User.phone == req.phone))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="手机号或密码错误")

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="手机号或密码错误")

    token = _create_token(user.id, settings)
    return _user_response(user, token)


@router.post("/wechat-login")
async def wechat_login(code: str, db: AsyncSession = Depends(get_db)):
    """微信登录：用 code 换取 openid，创建/获取用户，返回 JWT。"""
    settings = get_settings()

    if not settings.WECHAT_APPID or not settings.WECHAT_SECRET:
        user = await _get_or_create_dev_user(db)
        token = _create_token(user.id, settings)
        return _user_response(user, token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.weixin.qq.com/sns/jscode2session",
            params={
                "appid": settings.WECHAT_APPID,
                "secret": settings.WECHAT_SECRET,
                "js_code": code,
                "grant_type": "authorization_code",
            },
        )
        data = resp.json()

    if "errcode" in data and data["errcode"] != 0:
        raise HTTPException(status_code=400, detail=f"微信登录失败: {data.get('errmsg', '')}")

    openid = data["openid"]
    user = await _get_or_create_user(db, openid)
    token = _create_token(user.id, settings)
    return _user_response(user, token)


@router.get("/profile")
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """获取当前用户信息。"""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return _user_response(user, "")


# --- Internal helpers ---

async def _get_or_create_dev_user(db: AsyncSession) -> User:
    dev_openid = "dev_user_00001"
    result = await db.execute(select(User).where(User.openid == dev_openid))
    user = result.scalar_one_or_none()
    if not user:
        user = User(openid=dev_openid, nickname="开发用户")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


async def _get_or_create_user(db: AsyncSession, openid: str) -> User:
    result = await db.execute(select(User).where(User.openid == openid))
    user = result.scalar_one_or_none()
    if not user:
        user = User(openid=openid, nickname=f"用户{openid[-6:]}")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
