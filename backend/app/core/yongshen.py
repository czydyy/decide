"""
用神 (Yongshen) — Determine the Key Line for Divination.

用神 selection depends on the user's question category:
- 父母爻: 长辈、文书、考试、房屋、车辆
- 官鬼爻: 事业、功名、官运、疾病、丈夫
- 兄弟爻: 手足朋友、竞争、破财
- 妻财爻: 财运、妻子、物质
- 子孙爻: 子女、宠物、快乐、消灾
"""
from dataclasses import dataclass, field

from app.core.paipan import PaipanResult, LineDetail


CATEGORY_YONGSHEN_MAP = {
    "事业工作": "官鬼",
    "考试学业": "父母",
    "财运投资": "妻财",
    "婚姻感情": "官鬼",  # 女测婚用官鬼，男测婚用妻财
    "健康疾病": "官鬼",
    "子女教育": "子孙",
    "家庭关系": "父母",
    "出行迁移": "父母",
    "官司纠纷": "官鬼",
    "人际关系": "兄弟",
    "综合决策": None,  # 综合看世爻
}


@dataclass
class YongshenResult:
    category: str
    target_liuqin: str | None
    candidate_lines: list[dict]
    recommended_line: dict | None
    analysis: str


def analyze_yongshen(paipan: PaipanResult, question: str, category: str = "综合决策") -> YongshenResult:
    """
    Analyze which line is the 用神 based on the question category.
    Returns a detailed analysis.
    """
    target_liuqin = CATEGORY_YONGSHEN_MAP.get(category)

    # Find candidate lines matching the target 六亲
    candidates = []
    for line in paipan.lines:
        if target_liuqin is None or line.liuqin == target_liuqin:
            candidates.append({
                "position": line.position,
                "liuqin": line.liuqin,
                "najia_zhi": line.najia_zhi,
                "liushou": line.liushou,
                "shiying": line.shiying,
                "changing": line.changing,
                "yao_type": line.yao_type,
            })

    # If no specific target, use 世爻
    recommended = None
    if target_liuqin is None:
        for c in candidates:
            if c["shiying"] == "世":
                recommended = c
                break

    # Otherwise, prefer the matching line that is closest to 世爻
    if recommended is None and candidates:
        # Prefer candidate that is 世 or 应
        for c in candidates:
            if c["shiying"] in ("世", "应"):
                recommended = c
                break
        if recommended is None:
            recommended = candidates[0]

    # Build analysis text
    if target_liuqin:
        analysis = (
            f"问{category}，取{target_liuqin}为用神。"
            f"共找到 {len(candidates)} 个{target_liuqin}爻。"
        )
        if recommended:
            analysis += (
                f"推荐取第{recommended['position']}爻（"
                f"{recommended['najia_zhi']}{recommended['liuqin']}）为主用神。"
            )
    else:
        analysis = "综合决策，以世爻为核心观察。"
        if recommended:
            analysis += f"世爻在第{recommended['position']}爻。"

    return YongshenResult(
        category=category,
        target_liuqin=target_liuqin,
        candidate_lines=candidates,
        recommended_line=recommended,
        analysis=analysis,
    )
