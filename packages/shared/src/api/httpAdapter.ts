// ============================================================
// HttpAdapter — platform-agnostic HTTP + SSE interface
// ============================================================

/** Platform-agnostic HTTP adapter. Each platform provides its own implementation. */
export interface HttpAdapter {
  /**
   * Make a JSON request.
   * Returns parsed JSON response as type T.
   * Throws on non-2xx responses.
   */
  request<T = unknown>(
    path: string,
    options?: RequestOptions
  ): Promise<T>

  /**
   * Open a Server-Sent Events stream.
   * Calls `onChunk` with each `data:` payload.
   * Calls `onDone` when the stream ends normally.
   * Calls `onError` on connection/parse errors.
   * Returns an abort function to cancel the stream.
   */
  streamSSE(
    path: string,
    body: unknown,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (err: Error) => void,
    signal?: AbortSignal
  ): AbortController
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: unknown
  headers?: Record<string, string>
}
