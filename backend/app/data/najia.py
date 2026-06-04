"""
纳甲 (Najia) system — heavenly stems assigned to hexagram lines.
This is the foundation of 装卦 (installing stems and branches).

Rules: Each of the 8 palaces follows a specific stem assignment pattern.
"""

# 纳甲：八宫卦每爻配天干地支
# 乾宫：乾卦配甲壬，内外卦皆从甲子起
# 格式: {宫名: {爻位(1-6, bottom to top): (天干, 地支)}}
# 地支顺序是固定的，按阳卦/阴卦不同

# 阳卦地支顺行（子寅辰午申戌 或 寅辰午申戌子 等，取决于起支）
# 阴卦地支逆行（丑亥酉未巳卯 等）

NAJIA_GAN = {
    # 乾宫（8卦）：内卦纳甲，外卦纳壬
    "乾": {1: "甲", 2: "甲", 3: "甲", 4: "壬", 5: "壬", 6: "壬"},
    # 震宫（8卦）：内卦纳庚
    "震": {1: "庚", 2: "庚", 3: "庚", 4: "庚", 5: "庚", 6: "庚"},
    # 坎宫（8卦）：内外皆纳戊
    "坎": {1: "戊", 2: "戊", 3: "戊", 4: "戊", 5: "戊", 6: "戊"},
    # 艮宫（8卦）：内外皆纳丙
    "艮": {1: "丙", 2: "丙", 3: "丙", 4: "丙", 5: "丙", 6: "丙"},
    # 坤宫（8卦）：内卦纳乙，外卦纳癸
    "坤": {1: "乙", 2: "乙", 3: "乙", 4: "癸", 5: "癸", 6: "癸"},
    # 巽宫（8卦）：内外皆纳辛
    "巽": {1: "辛", 2: "辛", 3: "辛", 4: "辛", 5: "辛", 6: "辛"},
    # 离宫（8卦）：内外皆纳己
    "离": {1: "己", 2: "己", 3: "己", 4: "己", 5: "己", 6: "己"},
    # 兑宫（8卦）：内外皆纳丁
    "兑": {1: "丁", 2: "丁", 3: "丁", 4: "丁", 5: "丁", 6: "丁"},
}

# 地支配卦 — by palace, for each line position
# 阳卦：初爻地支 = 子(乾), 子(坎), 寅(艮), 子(震)
# 阴卦：初爻地支 = 未(坤), 丑(巽), 卯(离), 巳(兑)

# For the 8 palaces, each hexagram within the palace follows the same najia pattern
# The pattern is determined by the palace (the upper trigram of the pure hexagram in that palace)

# Full najia per palace (地支 only, 天干 from above):
NAJIA_ZHI_PALACE = {
    # 阳卦四宫 — 顺行
    "乾": {1: "子", 2: "寅", 3: "辰", 4: "午", 5: "申", 6: "戌"},
    "坎": {1: "寅", 2: "辰", 3: "午", 4: "申", 5: "戌", 6: "子"},
    "艮": {1: "辰", 2: "午", 3: "申", 4: "戌", 5: "子", 6: "寅"},
    "震": {1: "子", 2: "寅", 3: "辰", 4: "午", 5: "申", 6: "戌"},
    # 阴卦四宫 — 逆行
    "坤": {1: "未", 2: "巳", 3: "卯", 4: "丑", 5: "亥", 6: "酉"},
    "巽": {1: "丑", 2: "亥", 3: "酉", 4: "未", 5: "巳", 6: "卯"},
    "离": {1: "卯", 2: "丑", 3: "亥", 4: "酉", 5: "未", 6: "巳"},
    "兑": {1: "巳", 2: "卯", 3: "丑", 4: "亥", 5: "酉", 6: "未"},
}

# 宫位归属: 每个六十四卦属于哪个宫
# Based on the 八宫卦 system (the leading hexagram approach)
# Each palace has 8 hexagrams, determined by changing lines from bottom up
HEXAGRAM_PALACE = {
    # 乾宫
    1: "乾", 44: "乾", 33: "乾", 10: "乾", 9: "乾", 13: "乾", 14: "乾", 43: "乾",
    # 坎宫
    29: "坎", 47: "坎", 39: "坎", 60: "坎", 3: "坎", 63: "坎", 59: "坎", 48: "坎",
    # 艮宫
    52: "艮", 18: "艮", 20: "艮", 41: "艮", 4: "艮", 22: "艮", 27: "艮", 26: "艮",
    # 震宫
    51: "震", 40: "震", 17: "震", 54: "震", 16: "震", 32: "震", 28: "震", 25: "震",
    # 坤宫
    2: "坤", 24: "坤", 15: "坤", 19: "坤", 11: "坤", 36: "坤", 46: "坤", 23: "坤",
    # 巽宫
    57: "巽", 48: "巽", 37: "巽", 61: "巽", 56: "巽", 50: "巽", 44: "巽", 42: "巽",
    # 离宫
    30: "离", 56: "离", 38: "离", 55: "离", 35: "离", 64: "离", 45: "离", 49: "离",
    # 兑宫
    58: "兑", 59: "兑", 31: "兑", 62: "兑", 54: "兑", 52: "兑", 48: "兑", 41: "兑",
}

# 世应 positions for each hexagram (世爻 position, 应爻 = 世爻 + 3, wrap around if > 6)
# For each 宫, the 世爻 positions of the 8 hexagrams follow a fixed pattern:
# 1st hexagram (纯卦): 世爻=6
# 2nd hexagram (一世): 世爻=1
# 3rd hexagram (二世): 世爻=2
# 4th hexagram (三世): 世爻=3
# 5th hexagram (四世): 世爻=4
# 6th hexagram (五世): 世爻=5
# 7th hexagram (游魂): 世爻=4
# 8th hexagram (归魂): 世爻=3

SHI_POSITION = {
    # 乾宫
    1: 6, 44: 1, 33: 2, 10: 3, 9: 4, 13: 5, 14: 4, 43: 3,
    # 坎宫
    29: 6, 47: 1, 39: 2, 60: 3, 3: 4, 63: 5, 59: 4, 48: 3,
    # 艮宫
    52: 6, 18: 1, 20: 2, 41: 3, 4: 4, 22: 5, 27: 4, 26: 3,
    # 震宫
    51: 6, 40: 1, 17: 2, 54: 3, 16: 4, 32: 5, 28: 4, 25: 3,
    # 坤宫
    2: 6, 24: 1, 15: 2, 19: 3, 11: 4, 36: 5, 46: 4, 23: 3,
    # 巽宫
    57: 6, 48: 1, 37: 2, 61: 3, 56: 4, 50: 5, 44: 4, 42: 3,
    # 离宫
    30: 6, 56: 1, 38: 2, 55: 3, 35: 4, 64: 5, 45: 4, 49: 3,
    # 兑宫
    58: 6, 59: 1, 31: 2, 62: 3, 54: 4, 52: 5, 48: 4, 41: 3,
}


def get_ying_position(shi_pos: int) -> int:
    """应爻 = 世爻 + 3, wrap around."""
    ying = shi_pos + 3
    return ying if ying <= 6 else ying - 6


def get_palace(hexagram_index: int) -> str:
    """Get the palace name for a given hexagram index (1-64)."""
    return HEXAGRAM_PALACE.get(hexagram_index, "乾")


def get_najia(hexagram_index: int) -> dict[int, dict[str, str]]:
    """
    Get full najia (天干 + 地支) for each line of a hexagram.
    Returns: {line_position: {gan: str, zhi: str}}
    """
    palace = get_palace(hexagram_index)
    gan_map = NAJIA_GAN[palace]
    zhi_map = NAJIA_ZHI_PALACE[palace]
    return {i: {"gan": gan_map[i], "zhi": zhi_map[i]} for i in range(1, 7)}


def get_shi_pos(hexagram_index: int) -> int:
    """Get 世爻 position for a hexagram."""
    return SHI_POSITION.get(hexagram_index, 6)
