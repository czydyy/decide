// ============================================================
// Conversation API — typed endpoint functions
// ============================================================

import type { HttpAdapter } from "../httpAdapter"
import type {
  CreateConversationRequest,
  CreateConversationResponse,
  ConversationItem,
  Message,
  StreamMessageRequest,
} from "../../types"

export function createConversationApi(client: HttpAdapter) {
  return {
    /** Create a new conversation (with divination) */
    create: (req: CreateConversationRequest) =>
      client.request<CreateConversationResponse>("/api/conversations", {
        method: "POST",
        body: req,
      }),

    /** List conversations (paginated) */
    list: (page = 1, size = 20) =>
      client.request<ConversationItem[]>(`/api/conversations?page=${page}&size=${size}`),

    /** Get messages for a conversation */
    getMessages: (convId: string) =>
      client.request<Message[]>(`/api/conversations/${convId}/messages`),

    /** Delete a conversation */
    delete: (convId: string) =>
      client.request<{ message: string }>(`/api/conversations/${convId}`, {
        method: "DELETE",
      }),

    /** SSE stream: send a message and receive AI reply */
    streamMessage(
      convId: string,
      req: StreamMessageRequest,
      onChunk: (chunk: string) => void,
      onDone: () => void,
      onError: (err: Error) => void,
      signal?: AbortSignal
    ) {
      return client.streamSSE(
        `/api/conversations/${convId}/stream`,
        req,
        onChunk,
        onDone,
        onError,
        signal
      )
    },
  }
}

export type ConversationApi = ReturnType<typeof createConversationApi>
