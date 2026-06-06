// ============================================================
// @liuyao/shared — barrel export
// ============================================================

// Types
export type * from "./types"

// API
export type { HttpAdapter, RequestOptions } from "./api"
export {
  createQiguaApi,
  createInterpretApi,
  createHexagramApi,
  createHistoryApi,
  createAuthApi,
  createConversationApi,
} from "./api"
export type {
  QiguaApi,
  InterpretApi,
  HexagramApi,
  HistoryApi,
  AuthApi,
  ConversationApi,
  InterpretRequest,
  InterpretStreamResponse,
  HexagramItem,
  HexagramDetail,
  BaguaInfo,
  HistoryItem,
  HistoryDetail,
} from "./api"

// Auth
export { TokenManager } from "./auth"
export type { StorageAdapter } from "./auth"

// Hooks
export {
  useAuth,
  useSSEStream,
  useDivination,
  useHistory,
  useConversation,
} from "./hooks"
export type {
  UseAuthReturn,
  UseSSEStreamReturn,
  UseDivinationReturn,
  UseHistoryReturn,
  UseConversationReturn,
} from "./hooks"

// Design
export {
  colors,
  radii,
  fonts,
  shadows,
  layout,
  METHOD_LABELS,
  CATEGORIES,
  QUICK_QUESTIONS,
} from "./design"

// 3D (placeholder)
export { THREE_CONFIG, COIN_PARAMS, HEXAGRAM_RING_PARAMS, TAIJI_PARAMS } from "./three"

// Utils
export {
  BINARY_TO_TRIGRAM,
  YAO_SYMBOLS,
  DAY_GAN_MAP,
  LIU_SHOU,
  LIU_QIN,
  MONTH_ZHI,
  DEFAULTS,
  trigramFromBinary,
  yaoSymbol,
  formatHexagramName,
  formatDongYao,
  formatDate,
  relativeTime,
} from "./utils"
