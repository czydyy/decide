"""
起卦 API Router — Hexagram generation endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.qigua import qigua_yao, qigua_number, qigua_time, qigua_from_lines
from app.core.paipan import PaipanResult, paipan
from app.core.biangua import compute_transforms
from app.data.hexagram_seed import HEXAGRAMS

router = APIRouter(prefix="/api/qigua", tags=["起卦"])


class NumberQiguaRequest(BaseModel):
    n1: int = Field(..., ge=1, description="第一个数字（上卦）")
    n2: int = Field(..., ge=1, description="第二个数字（下卦）")
    n3: int = Field(..., ge=1, description="第三个数字（动爻）")
    day_gan: str = Field(default="甲", description="日干（用于六兽）")


class ManualQiguaRequest(BaseModel):
    hexagram_index: int = Field(..., ge=1, le=64, description="卦序 1-64")
    dong_yao: list[int] = Field(default_factory=list, description="动爻位置")
    day_gan: str = Field(default="甲")


class PaipanRequest(BaseModel):
    method: str = Field(..., description="起卦方式")
    day_gan: str = Field(default="甲")
    # For number method
    n1: int | None = None
    n2: int | None = None
    n3: int | None = None
    # For manual method
    hexagram_index: int | None = None
    dong_yao: list[int] = Field(default_factory=list)


@router.post("/yao")
async def coin_toss():
    """铜钱摇卦：模拟三枚铜钱抛掷六次。"""
    result = qigua_yao()
    return {
        "method": result.method,
        "lines": [
            {
                "position": line["position"],
                "yao_str": line["yao_str"],
                "type": line["type"],
                "changing": line["changing"],
            }
            for line in result.lines
        ],
        "ben_gua_index": result.ben_gua_index,
        "ben_gua_name": HEXAGRAMS[result.ben_gua_index - 1]["name"],
        "ben_gua_symbol": HEXAGRAMS[result.ben_gua_index - 1]["symbol"],
        "dong_yao": result.dong_yao,
    }


@router.post("/number")
async def number_qigua(req: NumberQiguaRequest):
    """数字起卦：输入三个数字生成卦象。"""
    result = qigua_number(req.n1, req.n2, req.n3)
    return {
        "method": result.method,
        "lines": [
            {
                "position": line["position"],
                "yao_str": line["yao_str"],
                "type": line["type"],
                "changing": line["changing"],
            }
            for line in result.lines
        ],
        "ben_gua_index": result.ben_gua_index,
        "ben_gua_name": HEXAGRAMS[result.ben_gua_index - 1]["name"],
        "ben_gua_symbol": HEXAGRAMS[result.ben_gua_index - 1]["symbol"],
        "upper_gua": result.upper_gua,
        "lower_gua": result.lower_gua,
        "dong_yao": result.dong_yao,
    }


@router.post("/time")
async def time_qigua():
    """时间起卦：根据当前时间生成卦象。"""
    result = qigua_time()
    return {
        "method": result.method,
        "lines": [
            {
                "position": line["position"],
                "yao_str": line["yao_str"],
                "type": line["type"],
                "changing": line["changing"],
            }
            for line in result.lines
        ],
        "ben_gua_index": result.ben_gua_index,
        "ben_gua_name": HEXAGRAMS[result.ben_gua_index - 1]["name"],
        "ben_gua_symbol": HEXAGRAMS[result.ben_gua_index - 1]["symbol"],
        "dong_yao": result.dong_yao,
    }


@router.post("/manual")
async def manual_qigua(req: ManualQiguaRequest):
    """手动排盘：指定卦序和动爻。"""
    result = qigua_from_lines(req.hexagram_index, req.dong_yao)
    return {
        "method": result.method,
        "lines": [
            {
                "position": line["position"],
                "yao_str": line["yao_str"],
                "type": line["type"],
                "changing": line["changing"],
            }
            for line in result.lines
        ],
        "ben_gua_index": result.ben_gua_index,
        "ben_gua_name": HEXAGRAMS[result.ben_gua_index - 1]["name"],
        "ben_gua_symbol": HEXAGRAMS[result.ben_gua_index - 1]["symbol"],
        "dong_yao": result.dong_yao,
    }


@router.post("/paipan")
async def full_paipan(req: PaipanRequest):
    """完整排盘：起卦 + 排盘一步完成。"""
    # Generate hexagram
    if req.method == "yao":
        qr = qigua_yao()
    elif req.method == "number":
        if req.n1 is None or req.n2 is None or req.n3 is None:
            raise HTTPException(status_code=400, detail="数字起卦需要提供 n1, n2, n3")
        qr = qigua_number(req.n1, req.n2, req.n3)
    elif req.method == "time":
        qr = qigua_time()
    elif req.method == "manual":
        if req.hexagram_index is None:
            raise HTTPException(status_code=400, detail="手动起卦需要提供 hexagram_index")
        qr = qigua_from_lines(req.hexagram_index, req.dong_yao)
    else:
        raise HTTPException(status_code=400, detail=f"不支持的起卦方式: {req.method}")

    # Full paipan
    result = paipan(qr, req.day_gan)

    return _serialize_paipan(result)


def _serialize_paipan(result: PaipanResult) -> dict:
    """Serialize PaipanResult to JSON-compatible dict."""
    return {
        "ben_gua": result.ben_gua,
        "bian_gua": result.bian_gua,
        "hu_gua": result.hu_gua,
        "zong_gua": result.zong_gua,
        "dong_yao": result.dong_yao,
        "shi_position": result.shi_position,
        "ying_position": result.ying_position,
        "palace": result.palace,
        "palace_element": result.palace_element,
        "lines": [
            {
                "position": line.position,
                "yao_type": line.yao_type,
                "changing": line.changing,
                "najia": f"{line.najia_gan}{line.najia_zhi}",
                "liuqin": line.liuqin,
                "liushou": line.liushou,
                "shiying": line.shiying,
            }
            for line in result.lines
        ],
    }
