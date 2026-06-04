"""
八卦 (Eight Trigrams) fundamentals.
Each trigram has: name, symbol, element (五行), direction, nature, family member, body part.
"""
from enum import Enum


class Trigrams(str, Enum):
    QIAN = "乾"   # ☰ 天
    KUN = "坤"    # ☷ 地
    ZHEN = "震"   # ☳ 雷
    KAN = "坎"    # ☵ 水
    GEN = "艮"    # ☶ 山
    XUN = "巽"    # ☴ 风
    LI = "离"     # ☲ 火
    DUI = "兑"    # ☱ 泽


# 八卦取象
BAGUA = {
    "乾": {
        "element": "金", "nature": "天", "direction": "西北",
        "family": "父", "body": "首", "animal": "马",
        "binary": "111", "index": 1,
    },
    "坤": {
        "element": "土", "nature": "地", "direction": "西南",
        "family": "母", "body": "腹", "animal": "牛",
        "binary": "000", "index": 8,
    },
    "震": {
        "element": "木", "nature": "雷", "direction": "东",
        "family": "长男", "body": "足", "animal": "龙",
        "binary": "100", "index": 4,
    },
    "坎": {
        "element": "水", "nature": "水", "direction": "北",
        "family": "中男", "body": "耳", "animal": "豕",
        "binary": "010", "index": 6,
    },
    "艮": {
        "element": "土", "nature": "山", "direction": "东北",
        "family": "少男", "body": "手", "animal": "犬",
        "binary": "001", "index": 7,
    },
    "巽": {
        "element": "木", "nature": "风", "direction": "东南",
        "family": "长女", "body": "股", "animal": "鸡",
        "binary": "110", "index": 5,
    },
    "离": {
        "element": "火", "nature": "火", "direction": "南",
        "family": "中女", "body": "目", "animal": "雉",
        "binary": "101", "index": 3,
    },
    "兑": {
        "element": "金", "nature": "泽", "direction": "西",
        "family": "少女", "body": "口", "animal": "羊",
        "binary": "011", "index": 2,
    },
}

# 八卦组合成六十四卦 (upper_gua, lower_gua) -> 卦序
# 上下卦索引，按"乾兑离震巽坎艮坤"宫排
BAGUA_TO_HEXAGRAM = {
    ("乾", "乾"): 1, ("坤", "坤"): 2, ("坎", "震"): 3, ("艮", "坎"): 4,
    ("坎", "乾"): 5, ("乾", "坎"): 6, ("坤", "坎"): 7, ("坎", "坤"): 8,
    ("巽", "乾"): 9, ("乾", "兑"): 10, ("乾", "坤"): 11, ("坤", "乾"): 12,
    ("乾", "离"): 13, ("离", "乾"): 14, ("坤", "艮"): 15, ("震", "坤"): 16,
    ("兑", "震"): 17, ("艮", "巽"): 18, ("坤", "兑"): 19, ("巽", "坤"): 20,
    ("离", "震"): 21, ("艮", "离"): 22, ("艮", "坤"): 23, ("坤", "震"): 24,
    ("乾", "震"): 25, ("艮", "乾"): 26, ("震", "艮"): 27, ("兑", "巽"): 28,
    ("坎", "坎"): 29, ("离", "离"): 30, ("兑", "艮"): 31, ("震", "巽"): 32,
    ("乾", "艮"): 33, ("震", "乾"): 34, ("离", "坤"): 35, ("坤", "离"): 36,
    ("巽", "离"): 37, ("离", "兑"): 38, ("坎", "艮"): 39, ("震", "坎"): 40,
    ("艮", "兑"): 41, ("巽", "震"): 42, ("兑", "乾"): 43, ("乾", "巽"): 44,
    ("兑", "坤"): 45, ("震", "兑"): 46, ("兑", "坎"): 47, ("坎", "巽"): 48,
    ("兑", "离"): 49, ("离", "巽"): 50, ("震", "震"): 51, ("艮", "艮"): 52,
    ("巽", "艮"): 53, ("震", "兑"): 54, ("离", "艮"): 55, ("坤", "巽"): 56,
    ("兑", "兑"): 57, ("巽", "坎"): 58, ("坎", "兑"): 59, ("艮", "震"): 60,
    ("巽", "兑"): 61, ("震", "离"): 62, ("离", "坎"): 63, ("坎", "离"): 64,
}


def get_hexagram_index(upper: str, lower: str) -> int:
    """根据上下卦获取卦序 (1-64)."""
    return BAGUA_TO_HEXAGRAM.get((upper, lower), 0)


def trigram_from_number(n: int) -> tuple[str, str]:
    """
    数字起卦: 1=乾, 2=兑, 3=离, 4=震, 5=巽, 6=坎, 7=艮, 8=坤.
    Returns (卦名, element).
    """
    mapping = {1: "乾", 2: "兑", 3: "离", 4: "震", 5: "巽", 6: "坎", 7: "艮", 8: "坤"}
    name = mapping.get(((n - 1) % 8) + 1, "乾")
    return name, BAGUA[name]["element"]
