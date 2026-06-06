// ============================================================
// useDivination Hook — divination workflow state
// ============================================================

import { useState, useCallback } from "react"
import type { QiguaApi, InterpretApi, ConversationApi } from "../api"
import type { PaipanData, PaipanRequest } from "../types"

export interface UseDivinationReturn {
  /** Current paipan result */
  paipan: PaipanData | null
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Execute full paipan */
  doPaipan: (req: PaipanRequest) => Promise<PaipanData>
  /** Reset state */
  reset: () => void
}

export function useDivination(qiguaApi: QiguaApi): UseDivinationReturn {
  const [paipan, setPaipan] = useState<PaipanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doPaipan = useCallback(
    async (req: PaipanRequest): Promise<PaipanData> => {
      setLoading(true)
      setError(null)
      try {
        const result = await qiguaApi.fullPaipan(req)
        setPaipan(result)
        return result
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "起卦失败"
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [qiguaApi]
  )

  const reset = useCallback(() => {
    setPaipan(null)
    setError(null)
  }, [])

  return { paipan, loading, error, doPaipan, reset }
}
