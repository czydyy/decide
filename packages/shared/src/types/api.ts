// ============================================================
// API generic types
// ============================================================

/** Generic API error */
export interface ApiError {
  detail: string
  status_code?: number
}

/** Paginated response wrapper (used by history, conversations) */
export interface PaginatedResponse<T> {
  items: T[]
  total?: number
  page?: number
  size?: number
}

/** SSE stream event */
export interface SSEEvent {
  data: string
}
