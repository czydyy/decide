"""
变卦 (Biangua) — Transformed Hexagram Calculation.
Calculates 变卦 (changed hexagram), 互卦 (mutual hexagram), and 综卦 (inverted hexagram).
"""
from dataclasses import dataclass

from app.data.bagua import BAGUA, BAGUA_TO_HEXAGRAM


@dataclass
class HexagramTransform:
    ben_gua_index: int        # 本卦
    bian_gua_index: int | None  # 变卦 (when there are changing lines)
    hu_gua_index: int          # 互卦
    zong_gua_index: int        # 综卦


def _index_from_trigrams(upper: str, lower: str) -> int:
    return BAGUA_TO_HEXAGRAM.get((upper, lower), 1)


def compute_transforms(ben_gua_index: int, dong_yao: list[int]) -> HexagramTransform:
    """
    Given a base hexagram and a list of changing line positions,
    compute the 变卦, 互卦, and 综卦.
    """
    from app.data.hexagram_seed import HEXAGRAMS

    hex_data = HEXAGRAMS[ben_gua_index - 1]
    upper = hex_data["upper_gua"]
    lower = hex_data["lower_gua"]

    upper_bin = BAGUA[upper]["binary"]
    lower_bin = BAGUA[lower]["binary"]
    full_bin = lower_bin + upper_bin  # position 1-6

    # --- 变卦: flip changing lines ---
    if dong_yao:
        lines = list(full_bin)
        for pos in dong_yao:
            idx = pos - 1
            lines[idx] = "0" if lines[idx] == "1" else "1"
        new_full = "".join(lines)
        new_lower = new_full[:3]
        new_upper = new_full[3:]
        new_lower_name = _binary_to_trigram(new_lower)
        new_upper_name = _binary_to_trigram(new_upper)
        bian_gua_index = _index_from_trigrams(new_upper_name, new_lower_name)
    else:
        bian_gua_index = None  # No changing lines = no transformed hexagram

    # --- 互卦: lines 2,3,4 form lower trigram; lines 3,4,5 form upper trigram ---
    hu_lower_bin = full_bin[1:4]  # positions 2,3,4
    hu_upper_bin = full_bin[2:5]  # positions 3,4,5
    hu_lower = _binary_to_trigram(hu_lower_bin)
    hu_upper = _binary_to_trigram(hu_upper_bin)
    hu_gua_index = _index_from_trigrams(hu_upper, hu_lower)

    # --- 综卦: invert the entire hexagram (reverse line order) ---
    zong_full_bin = full_bin[::-1]
    zong_lower = _binary_to_trigram(zong_full_bin[:3])
    zong_upper = _binary_to_trigram(zong_full_bin[3:])
    zong_gua_index = _index_from_trigrams(zong_upper, zong_lower)

    return HexagramTransform(
        ben_gua_index=ben_gua_index,
        bian_gua_index=bian_gua_index,
        hu_gua_index=hu_gua_index,
        zong_gua_index=zong_gua_index,
    )


def _binary_to_trigram(binary: str) -> str:
    mapping = {
        "111": "乾", "000": "坤", "100": "震",
        "010": "坎", "001": "艮", "110": "巽",
        "101": "离", "011": "兑",
    }
    return mapping.get(binary, "乾")
