// ============================================================
// API — barrel export
// ============================================================

export type { HttpAdapter, RequestOptions } from "./httpAdapter"

// Endpoint factory functions
export { createQiguaApi } from "./endpoints/qigua"
export type { QiguaApi } from "./endpoints/qigua"

export { createInterpretApi } from "./endpoints/interpret"
export type { InterpretApi, InterpretRequest, InterpretStreamResponse } from "./endpoints/interpret"

export { createHexagramApi } from "./endpoints/hexagram"
export type { HexagramApi, HexagramItem, HexagramDetail, BaguaInfo } from "./endpoints/hexagram"

export { createHistoryApi } from "./endpoints/history"
export type { HistoryApi, HistoryItem, HistoryDetail } from "./endpoints/history"

export { createAuthApi } from "./endpoints/auth"
export type { AuthApi } from "./endpoints/auth"

export { createConversationApi } from "./endpoints/conversation"
export type { ConversationApi } from "./endpoints/conversation"
