// ============================================================
// Interpret API — typed endpoint functions
// ============================================================

import type { HttpAdapter } from "../httpAdapter"
import type { PaipanData } from "../../types"

export interface InterpretRequest {
  question: string
  category?: string
  method?: string
  day_gan?: string
  month_zhi?: string
  day_zhi?: string
  n1?: number | null
  n2?: number | null
  n3?: number | null
  hexagram_index?: number | null
  dong_yao?: number[]
}

export interface InterpretStreamResponse {
  interpretation: string
  paipan: PaipanData
}

export function createInterpretApi(client: HttpAdapter) {
  return {
    /** SSE stream AI interpretation */
    stream(
      req: InterpretRequest,
      onChunk: (chunk: string) => void,
      onDone: () => void,
      onError: (err: Error) => void,
      signal?: AbortSignal
    ) {
      return client.streamSSE(
        "/api/interpret/stream",
        req,
        onChunk,
        onDone,
        onError,
        signal
      )
    },

    /** Non-streaming AI interpretation */
    interpret: (req: InterpretRequest) =>
      client.request<InterpretStreamResponse>("/api/interpret", {
        method: "POST",
        body: req,
      }),
  }
}

export type InterpretApi = ReturnType<typeof createInterpretApi>
