// RN API Client — configured API singletons
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
import { createRNHttpAdapter } from "./httpAdapter"
import { rnStorage } from "./storage"

// For Android emulator, localhost maps to 10.0.2.2
// For iOS simulator, localhost works fine
// For physical devices, use the machine's LAN IP
import { Platform } from "react-native"

const BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000",
  ios: "http://localhost:8000",
  default: "http://localhost:8000",
})

const tokenManager = new TokenManager(rnStorage)

let _cachedToken: string | null = null
export function setCachedToken(token: string | null) {
  _cachedToken = token
}

tokenManager.getToken().then((t) => {
  _cachedToken = t
})

const adapter = createRNHttpAdapter(BASE_URL, () => _cachedToken)

export const qiguaApi: QiguaApi = createQiguaApi(adapter)
export const interpretApi: InterpretApi = createInterpretApi(adapter)
export const hexagramApi: HexagramApi = createHexagramApi(adapter)
export const historyApi: HistoryApi = createHistoryApi(adapter)
export const authApi: AuthApi = createAuthApi(adapter)
export const conversationApi: ConversationApi = createConversationApi(adapter)
export { tokenManager, BASE_URL }
