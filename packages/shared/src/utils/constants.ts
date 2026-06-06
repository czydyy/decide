// ============================================================
// Shared Constants
// ============================================================

/** Hexagram binary mappings (3-bit → trigram name) */
export const BINARY_TO_TRIGRAM: Record<string, string> = {
  "111": "乾",
  "000": "坤",
  "100": "震",
  "010": "坎",
  "001": "艮",
  "110": "巽",
  "101": "离",
  "011": "兑",
}

/** Yao display symbols */
export const YAO_SYMBOLS = {
  yang: "⚊",
  yin: "⚋",
  oldYang: "⚊⚋",
  oldYin: "⚋⚊",
} as const

/** Day stem → 六兽 starting position */
export const DAY_GAN_MAP: Record<string, number> = {
  "甲": 0, "乙": 0,
  "丙": 1, "丁": 1,
  "戊": 2, "己": 3,
  "庚": 4, "辛": 4,
  "壬": 5, "癸": 5,
}

/** 六兽 (Six Animals) in order */
export const LIU_SHOU = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"] as const

/** 六亲 (Six Relations) */
export const LIU_QIN = ["兄弟", "父母", "子孙", "妻财", "官鬼"] as const

/** Month zhi cycle */
export const MONTH_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const

/** Day zhi cycle (same as month) */
export const DAY_ZHI = MONTH_ZHI

/** Default divination parameters */
export const DEFAULTS = {
  day_gan: "甲",
  month_zhi: "子",
  day_zhi: "午",
  category: "综合决策",
} as const
