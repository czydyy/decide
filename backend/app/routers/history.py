"""
历史记录 API Router.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.divination import DivinationRecord
from app.core.auth import get_current_user_id

router = APIRouter(prefix="/api/history", tags=["历史记录"])


@router.get("")
async def list_history(
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取用户占卜历史记录。"""
    offset = (page - 1) * size
    result = await db.execute(
        select(DivinationRecord)
        .where(DivinationRecord.user_id == uuid.UUID(user_id))
        .order_by(desc(DivinationRecord.created_at))
        .offset(offset)
        .limit(size)
    )
    records = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "question": r.question,
            "method": r.method,
            "ben_gua_name": _ben_gua_name(r.ben_gua_id),
            "dong_yao": r.dong_yao,
            "ai_interpretation": r.ai_interpretation[:200] + "..." if r.ai_interpretation and len(r.ai_interpretation) > 200 else r.ai_interpretation,
            "is_favorite": r.is_favorite,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]


@router.get("/{record_id}")
async def get_detail(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取单条占卜记录详情。"""
    result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.id == uuid.UUID(record_id),
            DivinationRecord.user_id == uuid.UUID(user_id),
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    return {
        "id": str(record.id),
        "question": record.question,
        "method": record.method,
        "method_params": record.method_params,
        "ben_gua_id": record.ben_gua_id,
        "hu_gua_id": record.hu_gua_id,
        "bian_gua_id": record.bian_gua_id,
        "zong_gua_id": record.zong_gua_id,
        "dong_yao": record.dong_yao,
        "paipan_result": record.paipan_result,
        "ai_interpretation": record.ai_interpretation,
        "is_favorite": record.is_favorite,
        "created_at": record.created_at.isoformat(),
    }


@router.delete("/{record_id}")
async def delete_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """删除一条占卜记录。"""
    result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.id == uuid.UUID(record_id),
            DivinationRecord.user_id == uuid.UUID(user_id),
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    await db.delete(record)
    await db.commit()
    return {"message": "已删除"}


@router.post("/{record_id}/favorite")
async def toggle_favorite(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """收藏/取消收藏。"""
    result = await db.execute(
        select(DivinationRecord).where(
            DivinationRecord.id == uuid.UUID(record_id),
            DivinationRecord.user_id == uuid.UUID(user_id),
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    record.is_favorite = not record.is_favorite
    await db.commit()
    return {"is_favorite": record.is_favorite}


def _ben_gua_name(gua_id: int) -> str:
    from app.data.hexagram_seed import HEXAGRAMS
    try:
        return HEXAGRAMS[gua_id - 1]["name"]
    except (IndexError, TypeError):
        return "未知"
