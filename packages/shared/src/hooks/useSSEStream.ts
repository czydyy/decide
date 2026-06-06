// ============================================================
// useSSEStream Hook — SSE streaming state management
// ============================================================

import { useState, useRef, useCallback } from "react"
import type { HttpAdapter } from "../api"

export interface UseSSEStreamReturn {
  /** Whether a stream is currently active */
  streaming: boolean
  /** Accumulated content so far */
  content: string
  /** Any error from the stream */
  error: string | null
  /** Start a new SSE stream */
  start: (path: string, body: unknown) => void
  /** Abort the current stream */
  abort: () => void
  /** Reset the stream state */
  reset: () => void
}

export function useSSEStream(httpAdapter: HttpAdapter): UseSSEStreamReturn {
  const [streaming, setStreaming] = useState(false)
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
  }, [])

  const reset = useCallback(() => {
    abort()
    setContent("")
    setError(null)
  }, [abort])

  const start = useCallback(
    (path: string, body: unknown) => {
      // Clean up previous stream
      abort()

      setStreaming(true)
      setContent("")
      setError(null)

      const controller = httpAdapter.streamSSE(
        path,
        body,
        (chunk) => {
          setContent((prev) => prev + chunk)
        },
        () => {
          setStreaming(false)
          abortRef.current = null
        },
        (err) => {
          setError(err.message)
          setStreaming(false)
          abortRef.current = null
        }
      )

      abortRef.current = controller
    },
    [httpAdapter, abort]
  )

  return { streaming, content, error, start, abort, reset }
}
