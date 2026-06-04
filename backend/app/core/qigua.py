"""
起卦 (Qigua) — Hexagram Generation Module.
Supports three methods: coin toss, number input, and time-based.
"""
import random
from datetime import datetime
from dataclasses import dataclass, field

from app.data.bagua import trigram_from_number, BAGUA_TO_HEXAGRAM, BAGUA


@dataclass
class QiguaResult:
    """Result of hexagram generation."""
    method: str  # "yao", "number", "time"
    lines: list[dict]  # Each line: {position: 1-6, value: 6/7/8/9, type: "yin"/"yang", changing: bool}
    upper_gua: str = ""
    lower_gua: str = ""
    ben_gua_index: int = 0  # 本卦卦序 (1-64)
    dong_yao: list[int] = field(default_factory=list)  # 动爻位置


def _line_type(value: int) -> str:
    """6=老阴, 7=少阳, 8=少阴, 9=老阳."""
    return "yang" if value in (7, 9) else "yin"


def _is_changing(value: int) -> bool:
    """老阴(6) and 老阳(9) are changing lines."""
    return value in (6, 9)


def _value_to_yao_str(value: int) -> str:
    """Convert numeric value to yao symbol for display."""
    if value == 6:
        return "老阴 ⚋⚊"
    elif value == 7:
        return "少阳 ⚊"
    elif value == 8:
        return "少阴 ⚋"
    elif value == 9:
        return "老阳 ⚊⚋"
    return str(value)


def qigua_yao() -> QiguaResult:
    """
    铜钱摇卦: Simulates tossing 3 coins 6 times (from bottom to top).
    3 heads (3 yang) = 9 老阳 (changing)
    2 heads (2 yang, 1 yin) = 8 少阴
    1 head (1 yang, 2 yin) = 7 少阳
    0 heads (3 yin) = 6 老阴 (changing)
    """
    lines = []
    dong_yao = []
    yao_lines = []  # binary: 1=yang, 0=yin

    for position in range(1, 7):
        # Simulate 3 coins, each heads(3)/tails(2)
        coin_sum = sum(random.choice([2, 3]) for _ in range(3))
        value = coin_sum  # 6=老阴, 7=少阳, 8=少阴, 9=老阳

        changing = _is_changing(value)
        if changing:
            dong_yao.append(position)

        line_type = _line_type(value)
        yao_lines.append(1 if line_type == "yang" else 0)

        lines.append({
            "position": position,
            "value": value,
            "yao_str": _value_to_yao_str(value),
            "type": line_type,
            "changing": changing,
        })

    # Determine upper and lower trigrams from lines
    upper_bin = "".join(str(b) for b in yao_lines[3:])  # lines 4,5,6
    lower_bin = "".join(str(b) for b in yao_lines[:3])   # lines 1,2,3

    upper_name = _trigram_from_binary(upper_bin)
    lower_name = _trigram_from_binary(lower_bin)

    gua_index = BAGUA_TO_HEXAGRAM.get((upper_name, lower_name), 1)

    return QiguaResult(
        method="yao",
        lines=lines,
        upper_gua=upper_name,
        lower_gua=lower_name,
        ben_gua_index=gua_index,
        dong_yao=dong_yao,
    )


def qigua_number(n1: int, n2: int, n3: int) -> QiguaResult:
    """
    数字起卦 (梅花易数):
    - n1 determines upper trigram (1-8 mapping)
    - n2 determines lower trigram (1-8 mapping)
    - n3 determines changing line (position 1-6)
    """
    upper_name, _ = trigram_from_number(n1)
    lower_name, _ = trigram_from_number(n2)
    dong_pos = ((n3 - 1) % 6) + 1

    gua_index = BAGUA_TO_HEXAGRAM.get((upper_name, lower_name), 1)

    # Build line representations
    upper_bin = BAGUA[upper_name]["binary"]
    lower_bin = BAGUA[lower_name]["binary"]

    lines = []
    lower_lines = [int(b) for b in lower_bin]  # positions 1-3
    upper_lines = [int(b) for b in upper_bin]  # positions 4-6

    for pos in range(1, 7):
        if pos <= 3:
            is_yang = lower_lines[pos - 1] == 1
        else:
            is_yang = upper_lines[pos - 4] == 1

        changing = (pos == dong_pos)
        if is_yang and changing:
            value = 9  # 老阳
        elif is_yang and not changing:
            value = 7  # 少阳
        elif not is_yang and changing:
            value = 6  # 老阴
        else:
            value = 8  # 少阴

        lines.append({
            "position": pos,
            "value": value,
            "yao_str": _value_to_yao_str(value),
            "type": _line_type(value),
            "changing": changing,
        })

    return QiguaResult(
        method="number",
        lines=lines,
        upper_gua=upper_name,
        lower_gua=lower_name,
        ben_gua_index=gua_index,
        dong_yao=[dong_pos],
    )


def qigua_time() -> QiguaResult:
    """
    时间起卦: Uses current date/time to derive numbers for trigrams.
    Valid only with lunardate library; falls back to gregorian-based calculation.
    """
    now = datetime.now()
    year = now.year
    month = now.month
    day = now.day
    hour = now.hour

    # 地支 hour: 子(23-1), 丑(1-3), 寅(3-5), ...
    dizhi_hour_map = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12]
    shichen = dizhi_hour_map[hour]

    # Upper trigram: (year + month + day) mod 8
    n1 = (year + month + day) % 8
    if n1 == 0:
        n1 = 8

    # Lower trigram: (year + month + day + shichen) mod 8
    n2 = (year + month + day + shichen) % 8
    if n2 == 0:
        n2 = 8

    # Changing line: (year + month + day + shichen) mod 6
    n3 = (year + month + day + shichen) % 6
    if n3 == 0:
        n3 = 6

    return qigua_number(n1, n2, n3)


def qigua_from_lines(hexagram_index: int, dong_yao: list[int]) -> QiguaResult:
    """
    手动排盘: Given a hexagram index and changing line positions,
    construct a QiguaResult.
    """
    from app.data.hexagram_seed import HEXAGRAMS
    from app.data.bagua import BAGUA

    hex_data = HEXAGRAMS[hexagram_index - 1]
    upper = hex_data["upper_gua"]
    lower = hex_data["lower_gua"]
    upper_bin = BAGUA[upper]["binary"]
    lower_bin = BAGUA[lower]["binary"]

    lines = []
    lower_lines = [int(b) for b in lower_bin]
    upper_lines = [int(b) for b in upper_bin]

    for pos in range(1, 7):
        if pos <= 3:
            is_yang = lower_lines[pos - 1] == 1
        else:
            is_yang = upper_lines[pos - 4] == 1

        changing = pos in dong_yao
        if is_yang and changing:
            value = 9
        elif is_yang and not changing:
            value = 7
        elif not is_yang and changing:
            value = 6
        else:
            value = 8

        lines.append({
            "position": pos,
            "value": value,
            "yao_str": _value_to_yao_str(value),
            "type": _line_type(value),
            "changing": changing,
        })

    return QiguaResult(
        method="manual",
        lines=lines,
        upper_gua=upper,
        lower_gua=lower,
        ben_gua_index=hexagram_index,
        dong_yao=dong_yao,
    )


def _trigram_from_binary(binary: str) -> str:
    """Convert 3-bit binary string to trigram name."""
    mapping = {
        "111": "乾", "000": "坤", "100": "震",
        "010": "坎", "001": "艮", "110": "巽",
        "101": "离", "011": "兑",
    }
    return mapping.get(binary, "乾")
