// ============================================================
// Environment Configuration
// ============================================================

const env = {
  /** API base URL — empty string in dev (Vite proxy handles /api) */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "",

  /** Whether to use the rule-based fallback instead of Claude API */
  USE_FALLBACK_INTERPRETATION: import.meta.env.VITE_USE_FALLBACK === "true",

  /** App environment */
  MODE: import.meta.env.MODE as "development" | "production",

  /** Is this a production build? */
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const

export default env
