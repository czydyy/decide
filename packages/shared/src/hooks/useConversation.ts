// ============================================================
// useConversation Hook — conversation & chat management
// ============================================================

import { useState, useCallback, useRef } from "react"
import type { ConversationApi } from "../api"
import type { CreateConversationRequest, Message, PaipanSummary } from "../types"
import type { HttpAdapter } from "../api"
import { useSSEStream } from "./useSSEStream"

export interface UseConversationReturn {
  /** Conversation ID (set after creation) */
  conversationId: string | null
  /** Messages in the conversation */
  messages: Message[]
  /** Paipan summary from initial creation */
  paipan: PaipanSummary | null
  /** Is the AI currently streaming? */
  streaming: boolean
  /** Streaming text being built */
  streamingText: string
  /** Is the conversation being created? */
  loading: boolean
  /** Any error */
  error: string | null
  /** Create a new conversation and send initial message */
  createConversation: (req: CreateConversationRequest) => Promise<void>
  /** Send a follow-up message */
  sendMessage: (content: string) => void
  /** Abort current stream */
  abort: () => void
}

export function useConversation(
  conversationApi: ConversationApi,
  httpAdapter: HttpAdapter
): UseConversationReturn {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [paipan, setPaipan] = useState<PaipanSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sse = useSSEStream(httpAdapter)
  const msgIdCounter = useRef(0)

  const createConversation = useCallback(
    async (req: CreateConversationRequest) => {
      setLoading(true)
      setError(null)
      try {
        const res = await conversationApi.create(req)
        setConversationId(res.conversation_id)
        setPaipan(res.paipan)

        // Send initial message to kick off AI interpretation
        const userMsg: Message = {
          id: `user-${++msgIdCounter.current}`,
          role: "user",
          content: req.question,
        }
        setMessages([userMsg])

        // Start streaming the AI's initial response
        const assistantId = `assistant-${++msgIdCounter.current}`
        let assistantContent = ""

        conversationApi.streamMessage(
          res.conversation_id,
          { content: req.question },
          (chunk) => {
            assistantContent += chunk
          },
          () => {
            setMessages((prev) => [
              ...prev,
              {
                id: assistantId,
                role: "assistant",
                content: assistantContent,
              },
            ])
          },
          (err) => {
            setError(err.message)
          }
        )
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "创建对话失败"
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [conversationApi]
  )

  const sendMessage = useCallback(
    (content: string) => {
      if (!conversationId || !content.trim()) return

      const userMsg: Message = {
        id: `user-${++msgIdCounter.current}`,
        role: "user",
        content,
      }
      setMessages((prev) => [...prev, userMsg])

      const assistantId = `assistant-${++msgIdCounter.current}`
      let assistantContent = ""

      conversationApi.streamMessage(
        conversationId,
        { content },
        (chunk) => {
          assistantContent += chunk
        },
        () => {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: assistantContent,
            },
          ])
        },
        (err) => {
          setError(err.message)
        }
      )
    },
    [conversationId, conversationApi]
  )

  const abort = useCallback(() => {
    sse.abort()
  }, [sse])

  return {
    conversationId,
    messages,
    paipan,
    streaming: sse.streaming,
    streamingText: sse.content,
    loading,
    error,
    createConversation,
    sendMessage,
    abort,
  }
}
