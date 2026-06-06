// ============================================================
// Web API Client — configured API singletons
// ============================================================

import {
  TokenManager,
  createQiguaApi,
  createInterpretApi,
  createHexagramApi,
  createHistoryApi,
  createAuthApi,
  createConversationApi,
} from "@liuyao/shared"
import type {
  QiguaApi,
  InterpretApi,
  HexagramApi,
  HistoryApi,
  AuthApi,
  ConversationApi,
} from "@liuyao/shared"
import { createWebHttpAdapter } from "./httpAdapter"
import { webStorage } from "./storage"

const BASE_URL = "" // Vite proxy handles /api → localhost:8000
const tokenManager = new TokenManager(webStorage)

// Update if backend is on a different host (production)
export function setBaseUrl(url: string) {
  ;(api as { _baseUrl: string })._baseUrl = url
}

// Recreate adapter with current token
function getAdapter() {
  return createWebHttpAdapter(BASE_URL, () => {
    // Synchronous token getter for the adapter
    // TokenManager.getToken is async, but we need sync for the adapter
    // Use a cached sync value
    return _cachedToken
  })
}

let _cachedToken: string | null = null

export function setCachedToken(token: string | null) {
  _cachedToken = token
}

// Initialize
tokenManager.getToken().then((t) => {
  _cachedToken = t
})

const adapter = getAdapter()

export const qiguaApi: QiguaApi = createQiguaApi(adapter)
export const interpretApi: InterpretApi = createInterpretApi(adapter)
export const hexagramApi: HexagramApi = createHexagramApi(adapter)
export const historyApi: HistoryApi = createHistoryApi(adapter)
export const authApi: AuthApi = createAuthApi(adapter)
export const conversationApi: ConversationApi = createConversationApi(adapter)
export { tokenManager, BASE_URL }
