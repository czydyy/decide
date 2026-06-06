// ============================================================
// Web HTTP Adapter — fetch-based implementation of HttpAdapter
// ============================================================

import type { HttpAdapter, RequestOptions } from "@liuyao/shared"

export function createWebHttpAdapter(
  baseUrl: string,
  getToken: () => string | null
): HttpAdapter {
  async function request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!res.ok) {
      let detail = `HTTP ${res.status}`
      try {
        const err = await res.json()
        detail = err.detail ?? detail
      } catch {
        // ignore
      }
      throw new Error(detail)
    }

    return res.json() as Promise<T>
  }

  function streamSSE(
    path: string,
    body: unknown,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (err: Error) => void,
    signal?: AbortSignal
  ): AbortController {
    const controller = new AbortController()
    const combinedSignal = signal
      ? combineSignals(signal, controller.signal)
      : controller.signal

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    }

    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: combinedSignal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`SSE connection failed: ${res.status}`)
        }
        const reader = res.body?.getReader()
        if (!reader) {
          throw new Error("No readable stream")
        }

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              onChunk(data)
            }
          }
        }

        // Flush remaining buffer
        if (buffer.startsWith("data: ")) {
          onChunk(buffer.slice(6))
        }

        onDone()
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return // silent
        }
        onError(err instanceof Error ? err : new Error(String(err)))
      })

    return controller
  }

  return { request, streamSSE }
}

/** Combine two AbortSignals — aborts when either fires */
function combineSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController()
  a.addEventListener("abort", () => controller.abort(a.reason), { once: true })
  b.addEventListener("abort", () => controller.abort(b.reason), { once: true })
  return controller.signal
}
