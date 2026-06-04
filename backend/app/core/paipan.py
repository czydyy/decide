"""
排盘 (Paipan) — Complete Divination Board Assembly.
Combines all data into a structured paipan result including:
- 本卦、变卦、互卦、综卦
- 装卦：纳甲、六亲、六兽、世应
"""
from dataclasses import dataclass, field

from app.core.qigua import QiguaResult
from app.core.biangua import compute_transforms
from app.data.najia import get_najia, get_shi_pos, get_ying_position, get_palace
from app.data.hexagram_seed import HEXAGRAMS
from app.data.bagua import BAGUA


# 六亲 (Six Relations) generation:
# Each line's relation is determined by comparing its 地支's 五行 to the palace element.
# Palace element + line element → 六亲
# 同=兄弟, 生我=父母, 我生=子孙, 克我=官鬼, 我克=妻财

# 五行生克:
# 木生火→火生土→土生金→金生水→水生木
# 木克土→土克水→水克火→火克金→金克木

WUXING = {
    "子": "水", "丑": "土", "寅": "木", "卯": "木",
    "辰": "土", "巳": "火", "午": "火", "未": "土",
    "申": "金", "酉": "金", "戌": "土", "亥": "水",
}

# 生克关系判定
SHENG_MAP = {
    ("水", "木"): True, ("木", "火"): True, ("火", "土"): True,
    ("土", "金"): True, ("金", "水"): True,
}
KE_MAP = {
    ("水", "火"): True, ("火", "金"): True, ("金", "木"): True,
    ("木", "土"): True, ("土", "水"): True,
}


# 六兽 (Six Animals) — assigned by day stem on the starting line
LIU_SHOU = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"]

# 六兽起始规则 (by day stem):
# 甲乙日: 起青龙
# 丙丁日: 起朱雀
# 戊日:   起勾陈
# 己日:   起螣蛇
# 庚辛日: 起白虎
# 壬癸日: 起玄武


@dataclass
class LineDetail:
    """Detail for one line position."""
    position: int
    yao_type: str  # "yang" / "yin"
    changing: bool
    najia_gan: str
    najia_zhi: str
    liuqin: str  # 六亲
    liushou: str  # 六兽
    shiying: str = ""  # "世", "应", or ""


@dataclass
class PaipanResult:
    """Complete 排盘 result."""
    ben_gua: dict
    bian_gua: dict | None = None
    hu_gua: dict | None = None
    zong_gua: dict | None = None
    dong_yao: list[int] = field(default_factory=list)
    lines: list[LineDetail] = field(default_factory=list)
    shi_position: int = 0
    ying_position: int = 0
    palace: str = ""
    palace_element: str = ""
    yong_shen_candidates: list[dict] = field(default_factory=list)


def _wuxing(zhi: str) -> str:
    return WUXING.get(zhi, "土")


def _liuqin(palace_element: str, line_zhi: str) -> str:
    """Determine 六亲 for a line based on palace element and line's zhi element."""
    line_element = _wuxing(line_zhi)
    if palace_element == line_element:
        return "兄弟"
    if SHENG_MAP.get((palace_element, line_element)):
        return "子孙"
    if SHENG_MAP.get((line_element, palace_element)):
        return "父母"
    if KE_MAP.get((palace_element, line_element)):
        return "妻财"
    if KE_MAP.get((line_element, palace_element)):
        return "官鬼"
    return "兄弟"


def _liushou_start(day_gan: str) -> int:
    """Get 六兽起始 index for a given day stem."""
    mapping = {"甲": 0, "乙": 0, "丙": 1, "丁": 1, "戊": 2, "己": 3,
               "庚": 4, "辛": 4, "壬": 5, "癸": 5}
    return mapping.get(day_gan, 0)


def paipan(qigua: QiguaResult, day_gan: str = "甲") -> PaipanResult:
    """
    Assemble the complete 排盘 from a 起卦 result.
    day_gan: the heavenly stem of the divination day for 六兽 assignment.
    """
    hex_data = HEXAGRAMS[qigua.ben_gua_index - 1]
    palace = get_palace(qigua.ben_gua_index)
    palace_element = BAGUA[palace]["element"]
    najia = get_najia(qigua.ben_gua_index)
    shi_pos = get_shi_pos(qigua.ben_gua_index)
    ying_pos = get_ying_position(shi_pos)

    # Compute transforms
    transforms = compute_transforms(qigua.ben_gua_index, qigua.dong_yao)

    # 六兽 starting index
    ls_start = _liushou_start(day_gan)

    # Build line details
    lines = []
    for pos in range(1, 7):
        line_info = qigua.lines[pos - 1]
        najia_data = najia[pos]
        zhi = najia_data["zhi"]
        gan = najia_data["gan"]
        liuqin = _liuqin(palace_element, zhi)

        # 六兽: starts from 初爻, cycles from ls_start
        ls_index = (ls_start + (pos - 1)) % 6
        liushou = LIU_SHOU[ls_index]

        shiying = ""
        if pos == shi_pos:
            shiying = "世"
        elif pos == ying_pos:
            shiying = "应"

        lines.append(LineDetail(
            position=pos,
            yao_type=line_info["type"],
            changing=line_info["changing"],
            najia_gan=gan,
            najia_zhi=zhi,
            liuqin=liuqin,
            liushou=liushou,
            shiying=shiying,
        ))

    # Gather hexagram details
    def _hex_detail(index: int | None) -> dict | None:
        if index is None:
            return None
        d = HEXAGRAMS[index - 1]
        return {
            "index": d["gua_index"],
            "name": d["name"],
            "symbol": d["symbol"],
            "upper_gua": d["upper_gua"],
            "lower_gua": d["lower_gua"],
            "gua_ci": d["gua_ci"],
            "interpretation": d["interpretation"],
        }

    return PaipanResult(
        ben_gua=_hex_detail(qigua.ben_gua_index),
        bian_gua=_hex_detail(transforms.bian_gua_index),
        hu_gua=_hex_detail(transforms.hu_gua_index),
        zong_gua=_hex_detail(transforms.zong_gua_index),
        dong_yao=qigua.dong_yao,
        lines=lines,
        shi_position=shi_pos,
        ying_position=ying_pos,
        palace=palace,
        palace_element=palace_element,
    )


def format_paipan_for_ai(result: PaipanResult, question: str | None = None) -> str:
    """Format the paipan result into a structured prompt for AI interpretation."""
    lines = []
    lines.append(f"【起卦问题】{question or '未提供'}")
    lines.append(f"【本卦】{result.ben_gua['name']} {result.ben_gua['symbol']}")
    lines.append(f"【卦辞】{result.ben_gua['gua_ci']}")

    if result.bian_gua:
        lines.append(f"【变卦】{result.bian_gua['name']} {result.bian_gua['symbol']}")
    if result.hu_gua:
        lines.append(f"【互卦】{result.hu_gua['name']} {result.hu_gua['symbol']}")
    if result.zong_gua:
        lines.append(f"【综卦】{result.zong_gua['name']} {result.zong_gua['symbol']}")

    lines.append(f"【动爻】{', '.join(f'第{d}爻' for d in result.dong_yao) if result.dong_yao else '无动爻（静卦）'}")
    lines.append(f"【宫位】{result.palace}宫（{result.palace_element}）")
    lines.append(f"【世应】世爻在第{result.shi_position}爻，应爻在第{result.ying_position}爻")
    lines.append("")

    lines.append("【六爻详情】")
    for line in result.lines:
        yao_symbol = "⚊" if line.yao_type == "yang" else "⚋"
        changing_mark = "○动" if line.changing else " " * 3
        lines.append(
            f"第{line.position}爻 {yao_symbol} {changing_mark} "
            f"{line.najia_gan}{line.najia_zhi} "
            f"{line.liuqin} {line.liushou} {line.shiying}"
        )

    return "\n".join(lines)
