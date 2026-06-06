// RN HTTP Adapter — fetch + SSE streaming for React Native
import type { HttpAdapter, RequestOptions } from "@liuyao/shared"

export function createRNHttpAdapter(
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
      } catch { /* ignore */ }
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
        if (!res.ok) throw new Error(`SSE failed: ${res.status}`)
        const text = await res.text()
        // Parse SSE format: split by double newline, extract "data:" lines
        const events = text.split("\n\n")
        for (const event of events) {
          const lines = event.split("\n")
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              onChunk(line.slice(6))
            }
          }
        }
        onDone()
      })
      .catch((err) => {
        if (
          err instanceof DOMException ||
          (err instanceof Error && err.name === "AbortError")
        ) {
          return
        }
        onError(err instanceof Error ? err : new Error(String(err)))
      })

    return controller
  }

  return { request, streamSSE }
}

function combineSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController()
  a.addEventListener("abort", () => controller.abort(a.reason), { once: true })
  b.addEventListener("abort", () => controller.abort(b.reason), { once: true })
  return controller.signal
}
