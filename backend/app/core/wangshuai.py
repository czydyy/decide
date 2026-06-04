"""
旺衰 (Wang-Shuai) — Determine the Strength of Each Line.

Judged by the relationship between line's 地支 and:
1. 月建 (Month Branch) — 旺相休囚死
2. 日建 (Day Branch) — 生扶拱合
3. 动爻之间的生克冲合
"""
from dataclasses import dataclass

from app.core.paipan import PaipanResult, LineDetail, WUXING, SHENG_MAP, KE_MAP


# 月建旺衰表 (based on 五行):
# 同我=旺, 生我=相, 我生=休, 我克=囚, 克我=死
def _month_strength(line_element: str, month_element: str) -> str:
    if line_element == month_element:
        return "旺"
    if SHENG_MAP.get((month_element, line_element)):
        return "相"
    if SHENG_MAP.get((line_element, month_element)):
        return "休"
    if KE_MAP.get((line_element, month_element)):
        return "囚"
    if KE_MAP.get((month_element, line_element)):
        return "死"
    return "平"


# 日建关系
def _day_relation(line_zhi: str, day_zhi: str) -> str:
    """Determine day branch's effect on the line."""
    line_wx = WUXING.get(line_zhi, "土")
    day_wx = WUXING.get(day_zhi, "土")

    if SHENG_MAP.get((day_wx, line_wx)):
        return "日生"
    if SHENG_MAP.get((line_wx, day_wx)):
        return "日泄"
    if KE_MAP.get((day_wx, line_wx)):
        return "日克"
    if KE_MAP.get((line_wx, day_wx)):
        return "日耗"
    if day_zhi == line_zhi:
        return "日值"  # 临日建
    return "日平"


# 地支六合
DI_ZHI_HE = {
    frozenset({"子", "丑"}): "土",
    frozenset({"寅", "亥"}): "木",
    frozenset({"卯", "戌"}): "火",
    frozenset({"辰", "酉"}): "金",
    frozenset({"巳", "申"}): "水",
    frozenset({"午", "未"}): "土",
}

# 地支六冲
DI_ZHI_CHONG = {
    "子": "午", "午": "子",
    "丑": "未", "未": "丑",
    "寅": "申", "申": "寅",
    "卯": "酉", "酉": "卯",
    "辰": "戌", "戌": "辰",
    "巳": "亥", "亥": "巳",
}


@dataclass
class WangShuaiLine:
    position: int
    zhi: str
    element: str
    month_status: str  # 旺相休囚死
    day_status: str    # 日生/日克/日值/日平
    interactions: list[str]  # 与他爻的互动
    overall: str       # 综合旺衰


@dataclass
class WangShuaiResult:
    month_zhi: str
    day_zhi: str
    lines: list[WangShuaiLine]
    summary: str


def analyze_wangshuai(
    paipan: PaipanResult,
    month_zhi: str = "子",
    day_zhi: str = "午",
) -> WangShuaiResult:
    """
    Analyze 旺衰 for all lines given month and day branches.
    """
    month_element = WUXING.get(month_zhi, "水")
    lines = []

    # Collect line data for interaction analysis
    line_zhi_map = {line.position: line.najia_zhi for line in paipan.lines}
    changing_positions = {line.position for line in paipan.lines if line.changing}

    for line in paipan.lines:
        element = WUXING.get(line.najia_zhi, "土")
        month_status = _month_strength(element, month_element)
        day_status = _day_relation(line.najia_zhi, day_zhi)

        interactions = []

        # Check 冲/合 with day branch
        pair = frozenset({line.najia_zhi, day_zhi})
        if pair in DI_ZHI_HE:
            interactions.append(f"与日建{day_zhi}六合")
        if DI_ZHI_CHONG.get(line.najia_zhi) == day_zhi:
            interactions.append(f"被日建{day_zhi}冲")

        # Check interaction with other changing lines
        for chg_pos in changing_positions:
            if chg_pos != line.position:
                other_zhi = line_zhi_map.get(chg_pos, "")
                other_pair = frozenset({line.najia_zhi, other_zhi})
                if other_pair in DI_ZHI_HE:
                    interactions.append(f"与第{chg_pos}爻动爻六合")
                if DI_ZHI_CHONG.get(line.najia_zhi) == other_zhi:
                    interactions.append(f"被第{chg_pos}爻动爻冲")

        # Overall assessment
        strong = [status for status in [month_status, day_status]
                  if month_status in ("旺", "相") or day_status in ("日生", "日值")]
        if month_status in ("囚", "死") and day_status in ("日克",):
            overall = "衰弱"
        elif day_status == "日值" or month_status == "旺":
            overall = "旺盛"
        elif month_status in ("旺", "相") or day_status == "日生":
            overall = "偏旺"
        elif month_status in ("囚", "死") and day_status in ("日克", "日泄"):
            overall = "偏弱"
        else:
            overall = "中和"

        lines.append(WangShuaiLine(
            position=line.position,
            zhi=line.najia_zhi,
            element=element,
            month_status=month_status,
            day_status=day_status,
            interactions=interactions,
            overall=overall,
        ))

    summary_parts = []
    for l in lines:
        summary_parts.append(f"第{l.position}爻{l.zhi}：月{l.month_status} 日{l.day_status} → {l.overall}")

    return WangShuaiResult(
        month_zhi=month_zhi,
        day_zhi=day_zhi,
        lines=lines,
        summary="；".join(summary_parts),
    )
