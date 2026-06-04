"""
Conversation API Router — Multi-turn dialogue with RAG-enhanced AI.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.database import get_db
from app.models.conversation import Conversation, Message
from app.core.qigua import qigua_yao, qigua_number, qigua_time, qigua_from_lines
from app.core.paipan import paipan
from app.services.rag_service import interpret_with_rag_stream
from app.core.auth import get_current_user_id

router = APIRouter(prefix="/api/conversations", tags=["对话"])


# --- Request/Response Models ---

class CreateConversationRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=512)
    category: str = Field(default="综合决策")
    method: str = Field(default="yao")
    n1: int | None = None
    n2: int | None = None
    n3: int | None = None
    hexagram_index: int | None = None
    dong_yao: list[int] = Field(default_factory=list)
    day_gan: str = Field(default="甲")
    month_zhi: str = Field(default="子")
    day_zhi: str = Field(default="午")


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1024)


# --- Endpoints ---

@router.post("")
async def create_conversation(
    req: CreateConversationRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """创建新对话：起卦 + 排盘 + 返回对话ID。"""
    uid = uuid.UUID(user_id)

    qr = _generate_hexagram(req)
    paipan_result = paipan(qr, req.day_gan)

    conv = Conversation(
        user_id=uid,
        title=req.question[:40] or paipan_result.ben_gua["name"],
    )
    db.add(conv)
    await db.flush()

    paipan_summary = {
        "ben_gua": paipan_result.ben_gua,
        "bian_gua": paipan_result.bian_gua,
        "hu_gua": paipan_result.hu_gua,
        "zong_gua": paipan_result.zong_gua,
        "dong_yao": paipan_result.dong_yao,
        "shi_position": paipan_result.shi_position,
        "ying_position": paipan_result.ying_position,
        "palace": paipan_result.palace,
        "palace_element": paipan_result.palace_element,
        "lines": [
            {
                "position": l.position, "yao_type": l.yao_type,
                "changing": l.changing, "najia": f"{l.najia_gan}{l.najia_zhi}",
                "liuqin": l.liuqin, "liushou": l.liushou, "shiying": l.shiying,
            }
            for l in paipan_result.lines
        ],
    }

    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.question,
        metadata_={
            "type": "divination",
            "paipan": paipan_summary,
            "category": req.category,
        },
    )
    db.add(user_msg)
    conv.message_count = 1
    await db.commit()
    await db.refresh(conv)

    return {
        "conversation_id": str(conv.id),
        "title": conv.title,
        "paipan": paipan_summary,
        "ben_gua_name": paipan_result.ben_gua["name"],
    }


@router.post("/{conv_id}/stream")
async def stream_reply(
    conv_id: str,
    req: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """流式获取 AI 回复（RAG 增强 + 多轮上下文）。"""
    uid = uuid.UUID(user_id)

    result = await db.execute(
        select(Conversation).where(
            Conversation.id == uuid.UUID(conv_id),
            Conversation.user_id == uid,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")

    msg_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
        .limit(20)
    )
    history_msgs = msg_result.scalars().all()

    conversation_history = [
        {"role": m.role, "content": m.content}
        for m in history_msgs
    ]

    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.content,
    )
    db.add(user_msg)
    conv.message_count = len(history_msgs) + 1
    await db.commit()

    # Get paipan data from initial message
    paipan_data = None
    first_msg = history_msgs[0] if history_msgs else None
    if first_msg and first_msg.metadata_ and first_msg.metadata_.get("paipan"):
        paipan_data = first_msg.metadata_["paipan"]
    else:
        raise HTTPException(status_code=400, detail="对话缺少排盘数据")

    category = first_msg.metadata_.get("category", "综合决策") if first_msg and first_msg.metadata_ else "综合决策"

    # Reconstruct simple paipan from stored data
    class SimpleLine:
        def __init__(self, d):
            self.position = d["position"]
            self.yao_type = d["yao_type"]
            self.changing = d["changing"]
            self.najia_gan = d["najia"][0]
            self.najia_zhi = d["najia"][1]
            self.liuqin = d["liuqin"]
            self.liushou = d["liushou"]
            self.shiying = d["shiying"]

    class SimplePaipan:
        def __init__(self, d):
            self.ben_gua = d["ben_gua"]
            self.bian_gua = d.get("bian_gua")
            self.hu_gua = d.get("hu_gua")
            self.zong_gua = d.get("zong_gua")
            self.dong_yao = d.get("dong_yao", [])
            self.shi_position = d.get("shi_position", 0)
            self.ying_position = d.get("ying_position", 0)
            self.palace = d.get("palace", "乾")
            self.palace_element = d.get("palace_element", "金")
            self.lines = [SimpleLine(l) for l in d.get("lines", [])]

    simple_paipan = SimplePaipan(paipan_data)

    full_reply = []

    async def event_generator():
        nonlocal full_reply
        async for chunk in interpret_with_rag_stream(
            simple_paipan,  # type: ignore
            req.content,
            conversation_history=conversation_history,
            category=category,
        ):
            full_reply.append(chunk)
            yield {"data": chunk}

        full_text = "".join(full_reply)
        assistant_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=full_text,
        )
        from app.database import async_session
        async with async_session() as save_db:
            save_db.add(assistant_msg)
            conv_ref = await save_db.get(Conversation, conv.id)
            if conv_ref:
                conv_ref.message_count = conv.message_count + 1
            await save_db.commit()

    return EventSourceResponse(event_generator())


@router.get("")
async def list_conversations(
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取对话列表。"""
    uid = uuid.UUID(user_id)
    offset = (page - 1) * size
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == uid)
        .order_by(desc(Conversation.updated_at))
        .offset(offset)
        .limit(size)
    )
    convs = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "category": c.category,
            "message_count": c.message_count,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
        }
        for c in convs
    ]


@router.get("/{conv_id}/messages")
async def get_messages(
    conv_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取指定对话的所有消息。"""
    uid = uuid.UUID(user_id)
    result = await db.execute(
        select(Message)
        .where(
            Message.conversation_id == uuid.UUID(conv_id),
            Message.conversation.has(user_id=uid),
        )
        .order_by(Message.created_at)
    )
    msgs = result.scalars().all()
    return [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "metadata": m.metadata_,
            "created_at": m.created_at.isoformat(),
        }
        for m in msgs
    ]


@router.delete("/{conv_id}")
async def delete_conversation(
    conv_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """删除对话及其所有消息。"""
    uid = uuid.UUID(user_id)
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == uuid.UUID(conv_id),
            Conversation.user_id == uid,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    await db.delete(conv)
    await db.commit()
    return {"message": "已删除"}


def _generate_hexagram(req: CreateConversationRequest):
    if req.method == "yao":
        return qigua_yao()
    elif req.method == "number":
        if req.n1 is None or req.n2 is None or req.n3 is None:
            raise HTTPException(status_code=400, detail="数字起卦需要 n1, n2, n3")
        return qigua_number(req.n1, req.n2, req.n3)
    elif req.method == "time":
        return qigua_time()
    elif req.method == "manual":
        if req.hexagram_index is None:
            raise HTTPException(status_code=400, detail="手动起卦需要 hexagram_index")
        return qigua_from_lines(req.hexagram_index, req.dong_yao)
    else:
        raise HTTPException(status_code=400, detail=f"不支持的起卦方式: {req.method}")
