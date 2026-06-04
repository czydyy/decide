"""
卦象 API Router — Hexagram lookup endpoints.
"""
from fastapi import APIRouter, HTTPException

from app.data.hexagram_seed import HEXAGRAMS
from app.data.bagua import BAGUA, BAGUA_TO_HEXAGRAM

router = APIRouter(prefix="/api/hexagrams", tags=["卦象"])


@router.get("")
async def list_hexagrams():
    """获取全部 64 卦列表。"""
    return [
        {
            "index": h["gua_index"],
            "name": h["name"],
            "symbol": h["symbol"],
            "upper_gua": h["upper_gua"],
            "lower_gua": h["lower_gua"],
            "gua_ci": h["gua_ci"][:50] + "..." if len(h["gua_ci"]) > 50 else h["gua_ci"],
        }
        for h in HEXAGRAMS
    ]


@router.get("/{gua_index}")
async def get_hexagram(gua_index: int):
    """获取指定卦象的详细信息。"""
    if gua_index < 1 or gua_index > 64:
        raise HTTPException(status_code=404, detail="卦序需在 1-64 之间")
    h = HEXAGRAMS[gua_index - 1]
    return {
        "index": h["gua_index"],
        "name": h["name"],
        "symbol": h["symbol"],
        "upper_gua": h["upper_gua"],
        "lower_gua": h["lower_gua"],
        "gua_ci": h["gua_ci"],
        "yao_ci": h["yao_ci"],
        "tuan_ci": h["tuan_ci"],
        "xiang_ci": h["xiang_ci"],
        "yao_xiang": h["yao_xiang"],
        "interpretation": h["interpretation"],
    }


@router.get("/search/{name}")
async def search_hexagram(name: str):
    """按名称搜索卦象。"""
    results = [
        {
            "index": h["gua_index"],
            "name": h["name"],
            "symbol": h["symbol"],
            "gua_ci": h["gua_ci"],
        }
        for h in HEXAGRAMS
        if name in h["name"] or name == h["upper_gua"] or name == h["lower_gua"]
    ]
    return results


@router.get("/bagua/info")
async def get_bagua_info():
    """获取八卦基本信息。"""
    return {
        name: {
            "element": info["element"],
            "nature": info["nature"],
            "direction": info["direction"],
            "family": info["family"],
            "body": info["body"],
            "binary": info["binary"],
        }
        for name, info in BAGUA.items()
    }
