// ============================================================
// Hexagram Helper Utilities
// ============================================================

import { BINARY_TO_TRIGRAM, YAO_SYMBOLS } from "./constants"

/**
 * Convert 3-bit binary string to trigram name.
 */
export function trigramFromBinary(binary: string): string {
  return BINARY_TO_TRIGRAM[binary] ?? "乾"
}

/**
 * Get the display symbol for a yao line.
 */
export function yaoSymbol(yaoType: "yin" | "yang", changing: boolean): string {
  if (changing) {
    return yaoType === "yang" ? YAO_SYMBOLS.oldYang : YAO_SYMBOLS.oldYin
  }
  return yaoType === "yang" ? YAO_SYMBOLS.yang : YAO_SYMBOLS.yin
}

/**
 * Format hexagram name + symbol for display.
 */
export function formatHexagramName(name: string, symbol?: string): string {
  return symbol ? `${symbol} ${name}` : name
}

/**
 * Format dong yao list for display.
 */
export function formatDongYao(dongYao: number[]): string {
  if (!dongYao.length) return "无动爻（静卦）"
  return dongYao.map((d) => `第${d}爻`).join("、") + "动"
}
