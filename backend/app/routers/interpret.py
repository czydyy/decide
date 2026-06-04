"""
AI 解读 API Router — AI interpretation endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.core.qigua import qigua_yao, qigua_number, qigua_time, qigua_from_lines
from app.core.paipan import paipan
from app.services.ai_service import interpret_stream

router = APIRouter(prefix="/api/interpret", tags=["AI解读"])


class InterpretRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=512, description="你的问题")
    category: str = Field(
        default="综合决策",
        description="问题分类：综合决策/事业工作/考试学业/财运投资/婚姻感情/健康疾病/子女教育/家庭关系/出行迁移/官司纠纷/人际关系"
    )
    method: str = Field(default="yao", description="起卦方式: yao/number/time/manual")
    day_gan: str = Field(default="甲", description="日干（用于六兽）")
    month_zhi: str = Field(default="子", description="月建（用于旺衰）")
    day_zhi: str = Field(default="午", description="日建（用于旺衰）")
    n1: int | None = None
    n2: int | None = None
    n3: int | None = None
    hexagram_index: int | None = None
    dong_yao: list[int] = Field(default_factory=list)


@router.post("/stream")
async def interpret_stream_endpoint(req: InterpretRequest):
    """AI 流式解读：生成排盘并流式返回 AI 解读结果。"""
    # Generate hexagram
    if req.method == "yao":
        qr = qigua_yao()
    elif req.method == "number":
        if req.n1 is None or req.n2 is None or req.n3 is None:
            raise HTTPException(status_code=400, detail="数字起卦需要 n1, n2, n3")
        qr = qigua_number(req.n1, req.n2, req.n3)
    elif req.method == "time":
        qr = qigua_time()
    elif req.method == "manual":
        if req.hexagram_index is None:
            raise HTTPException(status_code=400, detail="手动起卦需要 hexagram_index")
        qr = qigua_from_lines(req.hexagram_index, req.dong_yao)
    else:
        raise HTTPException(status_code=400, detail=f"不支持的起卦方式: {req.method}")

    # Full paipan
    paipan_result = paipan(qr, req.day_gan)

    async def event_generator():
        async for chunk in interpret_stream(
            paipan_result,
            req.question,
            req.month_zhi,
            req.day_zhi,
            req.category,
        ):
            yield {"data": chunk}

    return EventSourceResponse(event_generator())


class BatchInterpretRequest(InterpretRequest):
    """Non-streaming interpretation."""
    pass


@router.post("")
async def interpret_sync(req: InterpretRequest):
    """同步解读：返回完整的解读文本。"""
    if req.method == "yao":
        qr = qigua_yao()
    elif req.method == "number":
        if req.n1 is None or req.n2 is None or req.n3 is None:
            raise HTTPException(status_code=400, detail="数字起卦需要 n1, n2, n3")
        qr = qigua_number(req.n1, req.n2, req.n3)
    elif req.method == "time":
        qr = qigua_time()
    elif req.method == "manual":
        if req.hexagram_index is None:
            raise HTTPException(status_code=400)
        qr = qigua_from_lines(req.hexagram_index, req.dong_yao)
    else:
        raise HTTPException(status_code=400, detail=f"不支持的起卦方式: {req.method}")

    paipan_result = paipan(qr, req.day_gan)

    # Collect all chunks
    full_text = ""
    async for chunk in interpret_stream(
        paipan_result,
        req.question,
        req.month_zhi,
        req.day_zhi,
        req.category,
    ):
        full_text += chunk

    # Build paipan summary
    lines = [
        {
            "position": line.position,
            "yao_type": line.yao_type,
            "changing": line.changing,
            "najia": f"{line.najia_gan}{line.najia_zhi}",
            "liuqin": line.liuqin,
            "liushou": line.liushou,
            "shiying": line.shiying,
        }
        for line in paipan_result.lines
    ]

    return {
        "interpretation": full_text,
        "paipan": {
            "ben_gua": paipan_result.ben_gua,
            "bian_gua": paipan_result.bian_gua,
            "hu_gua": paipan_result.hu_gua,
            "zong_gua": paipan_result.zong_gua,
            "dong_yao": paipan_result.dong_yao,
            "shi_position": paipan_result.shi_position,
            "ying_position": paipan_result.ying_position,
            "palace": paipan_result.palace,
            "palace_element": paipan_result.palace_element,
            "lines": lines,
        },
    }
