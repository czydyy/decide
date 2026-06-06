// ============================================================
// Design Tokens — platform-neutral values
// ============================================================

export const colors = {
  // Warm mode
  warm: {
    start: "#ec5930",
    mid: "#dea749",
    end: "#f6bc4f",
  },

  // Clean mode
  clean: {
    bg: "#faf8f3",
    card: "#ffffff",
    border: "#ebe5d8",
  },

  // Shared
  ink: "#1a1410",
  inkSec: "#6b6058",
  inkDim: "#a09888",
  gold: "#d4a030",
  goldSoft: "rgba(212,160,48,0.15)",
  goldText: "#b8891e",
  accent: "#ec5930",
  accentHover: "#d1441e",
  danger: "#d43535",

  // Dark card (warm mode)
  darkCard: "rgba(20,16,12,0.78)",
  darkCardBorder: "rgba(255,255,255,0.07)",

  // Misc
  white: "#ffffff",
  chatUserBubble: "#f0e6d2",
  success: "#4caf50",
} as const

export const radii = {
  sm: "8px",
  md: "14px",
  lg: "20px",
  full: "9999px",
} as const

export const fonts = {
  sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  mono: '"SF Mono", "Cascadia Code", "Fira Code", monospace',
} as const

export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.08)",
  md: "0 4px 12px rgba(0,0,0,0.10)",
  lg: "0 8px 24px rgba(0,0,0,0.12)",
  cta: "0 4px 16px rgba(236,89,48,0.4)",
}

export const layout = {
  maxWidthForm: "480px",
  maxWidthChat: "680px",
  maxWidthContent: "1200px",
  sidebarWidth: "240px",
} as const

/** Divination method labels */
export const METHOD_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  yao: { label: "铜钱起卦", desc: "传统六爻，掷钱成卦", icon: "🪙" },
  number: { label: "数字起卦", desc: "随心取数，以数推象", icon: "🔢" },
  time: { label: "时间起卦", desc: "即刻推演，应时而动", icon: "🕐" },
  manual: { label: "手动排盘", desc: "指定卦序排盘", icon: "📖" },
}

/** Question category labels */
export const CATEGORIES = [
  "综合决策",
  "事业工作",
  "考试学业",
  "财运投资",
  "婚姻感情",
  "健康疾病",
  "子女教育",
  "家庭关系",
  "出行迁移",
  "官司纠纷",
  "人际关系",
] as const

/** Quick question chips */
export const QUICK_QUESTIONS = [
  "我该不该换工作？",
  "要不要买这套房子？",
  "这个时机创业合适吗？",
  "这次投资能成功吗？",
]
