// ============================================================
// Date Formatting Utility
// ============================================================

/**
 * Format an ISO date string to a human-readable Chinese format.
 * Example: "2025-01-15T10:30:00Z" → "2025年1月15日 10:30"
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    const h = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    return `${y}年${m}月${day}日 ${h}:${min}`
  } catch {
    return isoString
  }
}

/**
 * Relative time helper (simplified).
 */
export function relativeTime(isoString: string): string {
  try {
    const now = Date.now()
    const then = new Date(isoString).getTime()
    const diffMs = now - then
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "刚刚"
    if (diffMin < 60) return `${diffMin}分钟前`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}小时前`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 30) return `${diffDay}天前`
    return formatDate(isoString)
  } catch {
    return isoString
  }
}
